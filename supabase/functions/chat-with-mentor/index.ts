
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Maximum number of messages to include in history
const MAX_MESSAGE_HISTORY = 10;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined");
    }

    // Get supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not defined");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract request data
    const { 
      mentorId, 
      messages, 
      chatSessionId, 
      userId,
      stream = true 
    } = await req.json();
    
    console.log("Received request:", { mentorId, userId, chatSessionId, messagesCount: messages?.length });
    
    if (!mentorId || !messages || !Array.isArray(messages)) {
      throw new Error("Mentor ID and messages array are required");
    }
    
    // Determine mentor type and get system prompt
    let systemPrompt = "";
    let mentorName = "AI Mentor";
    let mentorType = "template";
    let actualMentorId = mentorId; // This will be the actual UUID for the session
    
    // Check if mentorId looks like a UUID (custom mentor) or template ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mentorId);
    
    if (isUUID) {
      // This is a custom mentor - query mentors table
      mentorType = "custom";
      console.log("Fetching custom mentor:", mentorId);
      
      const { data: customMentor, error: customMentorError } = await supabase
        .from("mentors")
        .select("id, name, description")
        .eq("id", mentorId)
        .single();
      
      if (customMentorError || !customMentor) {
        console.error("Error fetching custom mentor:", customMentorError);
        throw new Error(`Custom mentor not found for ID: ${mentorId}`);
      }
      
      systemPrompt = `You are ${customMentor.name}, a mentor with the following expertise: ${customMentor.description}. Your goal is to help users by providing guidance, answering questions, and offering advice in your area of expertise.`;
      mentorName = customMentor.name;
      actualMentorId = customMentor.id; // Use the UUID from database
      console.log("Using custom mentor:", mentorName);
    } else {
      // This is a template mentor - query mentor_templates table
      console.log("Fetching template mentor:", mentorId);
      
      const { data: templateMentor, error: templateMentorError } = await supabase
        .from("mentor_templates")
        .select("id, display_name, default_mentor_name, system_prompt_base, template_id")
        .eq("template_id", mentorId)
        .single();
      
      if (templateMentorError || !templateMentor) {
        console.error("Error fetching mentor template:", templateMentorError);
        throw new Error(`Mentor template not found for ID: ${mentorId}`);
      }
      
      systemPrompt = templateMentor.system_prompt_base;
      mentorName = templateMentor.display_name || templateMentor.default_mentor_name;
      actualMentorId = templateMentor.id; // Use the UUID from database, not template_id
      console.log("Using template mentor:", mentorName, "with UUID:", actualMentorId);
    }
    
    if (!systemPrompt) {
      throw new Error("System prompt not found for mentor");
    }
    
    let sessionId = chatSessionId;
    
    // If no chat session provided, create a new one
    if (!sessionId) {
      try {
        const { data: session, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            mentor_id: actualMentorId, // Use the actual UUID
            mentor_type: mentorType,
            user_id: userId,
            name: `Chat with ${mentorName}`,
          })
          .select()
          .single();
        
        if (sessionError) {
          console.error("Error creating chat session:", sessionError);
          throw new Error(`Error creating chat session: ${sessionError.message}`);
        }
        
        sessionId = session.id;
        console.log("Created new chat session:", sessionId);
      } catch (error) {
        console.error("Error creating chat session:", error);
        throw new Error(`Error creating chat session: ${error.message}`);
      }
    }
    
    // Get recent message history if not provided in the request
    let conversationHistory = messages;
    if (messages.length <= 1) {
      const { data: messageHistory, error: historyError } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("chat_session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(MAX_MESSAGE_HISTORY);
      
      if (historyError) {
        console.error("Error fetching message history:", historyError);
      } else {
        // Add message history in correct order (oldest first)
        conversationHistory = [
          ...messageHistory.reverse().map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          ...messages  // Add current message(s)
        ];
      }
    }
    
    // Extract the user's latest message
    const userMessage = messages[messages.length - 1]?.content || "";
    
    // Save the user message
    try {
      const { error: userMsgError } = await supabase
        .from("chat_messages")
        .insert({
          chat_session_id: sessionId,
          user_id: userId,
          role: "user",
          content: userMessage,
        });
      
      if (userMsgError) {
        console.error("Error saving user message:", userMsgError);
      }
    } catch (error) {
      console.error("Error saving user message:", error);
    }
    
    // Build the conversation history with the detailed system prompt
    const conversations = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];

    console.log("Using system prompt for", mentorName);
    console.log("System prompt preview:", systemPrompt.substring(0, 200) + "...");
    console.log("Conversation length:", conversations.length);

    // Create response headers with session ID
    const responseHeaders = { 
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    };
    
    if (sessionId) {
      responseHeaders["X-Chat-Session-Id"] = sessionId;
    }

    console.log("Starting OpenAI streaming request...");
    
    // Create a streaming request to OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: conversations,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }
    
    console.log("OpenAI streaming response received, setting up stream processing...");
    
    // Create a readable stream to handle the response
    let fullResponse = "";
    
    const responseStream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          controller.close();
          return;
        }
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log("Stream completed, saving response. Length:", fullResponse.length);
              
              // Save the complete response to database
              if (fullResponse && sessionId) {
                try {
                  const { error: saveError } = await supabase
                    .from("chat_messages")
                    .insert({
                      chat_session_id: sessionId,
                      user_id: userId,
                      role: "assistant",
                      content: fullResponse,
                    });
                    
                  if (saveError) {
                    console.error("Error saving assistant message:", saveError);
                  } else {
                    console.log("Successfully saved assistant message to database");
                  }
                } catch (error) {
                  console.error("Error saving assistant message:", error);
                }
              }
              
              // Send final done message
              controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }
            
            // Decode the chunk and process the events
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split('\n')
              .filter(line => line.trim().startsWith('data: '));

            for (const line of lines) {
              const data = line.replace(/^data: /, '').trim();
              
              if (data === '[DONE]') {
                continue;
              }
              
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  fullResponse += content;
                }
                
                // Forward the chunk to the client
                controller.enqueue(new TextEncoder().encode(line + '\n\n'));
              } catch (e) {
                console.error('Error parsing SSE data:', e, 'Data:', data);
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
          controller.error(error);
        }
      }
    });

    // Return the streaming response with session ID
    return new Response(responseStream, {
      headers: responseHeaders,
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
