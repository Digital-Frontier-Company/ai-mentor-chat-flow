
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
    
    if (!mentorId || !messages || !Array.isArray(messages)) {
      throw new Error("Mentor ID and messages array are required");
    }
    
    // Determine if this is a template mentor or custom mentor
    let mentorType = "custom";
    let mentor;
    
    // First try to get the mentor from the mentors table
    const { data: customMentor, error: customMentorError } = await supabase
      .from("mentors")
      .select("name, description")
      .eq("id", mentorId)
      .single();
    
    if (customMentorError) {
      if (!customMentorError.message.includes("No rows found")) {
        console.error("Error fetching custom mentor:", customMentorError);
      }
      
      // If not found in mentors table, check mentor_templates
      mentorType = "template";
      const { data: templateMentor, error: templateMentorError } = await supabase
        .from("mentor_templates")
        .select("display_name, description_for_user")
        .eq("template_id", mentorId)
        .single();
      
      if (templateMentorError) {
        throw new Error(`Error fetching mentor template: ${templateMentorError.message}`);
      }
      
      if (!templateMentor) {
        throw new Error(`Mentor template not found for ID: ${mentorId}`);
      }
      
      mentor = {
        name: templateMentor.display_name,
        description: templateMentor.description_for_user,
      };
    } else {
      mentor = customMentor;
    }
    
    if (!mentor) {
      throw new Error("Mentor not found");
    }
    
    let sessionId = chatSessionId;
    
    // If no chat session provided, create a new one
    if (!sessionId) {
      try {
        const { data: session, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            mentor_id: mentorId,
            mentor_type: mentorType,
            user_id: userId,
            name: `Chat with ${mentor.name}`, // Default name based on mentor
          })
          .select()
          .single();
        
        if (sessionError) {
          throw new Error(`Error creating chat session: ${sessionError.message}`);
        }
        
        sessionId = session.id;
        console.log("Created new chat session for user:", userId);
      } catch (error) {
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
        throw new Error(`Error fetching message history: ${historyError.message}`);
      }
      
      // Add message history in correct order (oldest first)
      conversationHistory = [
        ...messageHistory.reverse().map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        ...messages  // Add current message(s)
      ];
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
        throw new Error(`Error saving user message: ${userMsgError.message}`);
      }
    } catch (error) {
      console.error(`Error saving user message: ${error.message}`);
      // Continue anyway to try to get a response
    }
    
    // Build system prompt
    const systemPrompt = 
      `You are ${mentor.name}, a mentor with the following expertise: ${mentor.description}. Your goal is to help users by providing guidance, answering questions, and offering advice in your area of expertise.`;
    
    // Build the conversation history
    const conversations = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];

    // Create response headers with session ID
    const responseHeaders = { 
      ...corsHeaders
    };
    
    if (sessionId) {
      responseHeaders["X-Chat-Session-Id"] = sessionId;
    }

    // If stream is true, use streaming response
    if (stream) {
      // Create a streaming request to OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using the specified model
          messages: conversations,
          temperature: 0.7,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }
      
      // Process the response in a background task
      const fullResponse = { content: "" };
      const decoder = new TextDecoder();

      // Use EdgeRuntime to process the stream in the background
      EdgeRuntime.waitUntil((async () => {
        const reader = response.body?.getReader();
        if (!reader) return;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split('\n')
              .filter(line => line.trim().startsWith('data: '));

            for (const line of lines) {
              const data = line.replace(/^data: /, '').trim();
              
              if (data === '[DONE]') continue;
              
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content || '';
                
                if (content) {
                  fullResponse.content += content;
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }

          // After collecting the full response, save it to the database
          if (fullResponse.content) {
            try {
              const { error: saveError } = await supabase
                .from("chat_messages")
                .insert({
                  chat_session_id: sessionId,
                  user_id: userId,
                  role: "assistant",
                  content: fullResponse.content,
                });
                
              if (saveError) {
                console.error(`Error saving assistant message: ${saveError.message}`);
              } else {
                console.log("Successfully saved assistant message to database");
              }
            } catch (error) {
              console.error(`Error saving assistant message: ${error.message}`);
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
        }
      })());

      // Return the streaming response with session ID
      return new Response(response.body, {
        headers: { 
          ...responseHeaders, 
          "Content-Type": "text/event-stream"
        },
      });
    } else {
      // Non-streaming response for compatibility
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: conversations,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;
      
      // Save the assistant message
      try {
        const { error: assistantMsgError } = await supabase
          .from("chat_messages")
          .insert({
            chat_session_id: sessionId,
            user_id: userId,
            role: "assistant",
            content: assistantResponse,
          });
        
        if (assistantMsgError) {
          throw new Error(`Error saving assistant message: ${assistantMsgError.message}`);
        }
      } catch (error) {
        throw new Error(`Error saving assistant message: ${error.message}`);
      }

      // Return the response with session ID
      return new Response(
        JSON.stringify({ 
          response: assistantResponse, 
          sessionId,
        }),
        {
          headers: { ...responseHeaders, "Content-Type": "application/json" },
        }
      );
    }
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
