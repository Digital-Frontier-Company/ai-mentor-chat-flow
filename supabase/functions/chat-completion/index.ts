
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not defined");
    }

    // Create supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { 
      messages, 
      userPreferences, 
      mentorId, 
      userId,
      chatSessionId,
      stream = true 
    } = body;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Mentor ID and messages array are required");
    }
    
    // Get mentor information - first try custom mentors table
    let mentorPrompt = "";
    let mentorName = "";
    let mentorType = "custom";
    
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("name, description, avatar_url")
      .eq("id", mentorId)
      .single();
    
    // If not found in mentors table, check mentor_templates
    if (mentorError && mentorError.message.includes("No rows found")) {
      mentorType = "template";
      const { data: template, error: templateError } = await supabase
        .from("mentor_templates")
        .select("*")
        .eq("template_id", mentorId)
        .single();
      
      if (templateError) {
        if (!templateError.message.includes("No rows found")) {
          console.error("Error fetching mentor template:", templateError);
        }
      } else if (template) {
        mentorPrompt = template.system_prompt_base || 
          `You are a ${template.display_name}. ${template.description_for_user}`;
        mentorName = template.display_name;
      }
    } else if (mentor) {
      mentorPrompt = `You are ${mentor.name}. ${mentor.description}`;
      mentorName = mentor.name;
    }

    if (!mentorPrompt) {
      mentorPrompt = "You are a helpful AI assistant.";
    }
    
    // Manage chat session ID
    let sessionId = chatSessionId;
    
    if (!sessionId && userId) {
      // Create a new session if one wasn't provided
      console.log("Creating new chat session for user:", userId);
      try {
        const { data: session, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            mentor_id: mentorId,
            mentor_type: mentorType,  // Store whether this is a template or custom mentor
            user_id: userId,
            name: `Chat with ${mentorName || 'Mentor'}`
          })
          .select()
          .single();
        
        if (sessionError) throw sessionError;
        
        console.log("Created new chat session:", session.id);
        sessionId = session.id;
      } catch (error) {
        console.error("Error creating chat session:", error);
        // Continue anyway to try to get a response
      }
    }
    
    // Save the user's message if we have a session and a user
    if (sessionId && userId && messages.length > 0) {
      const userMessage = messages[messages.length - 1];
      if (userMessage.role === 'user') {
        try {
          console.log("Saving user message to session:", sessionId);
          const { error: messageError } = await supabase
            .from("chat_messages")
            .insert({
              chat_session_id: sessionId,
              user_id: userId,
              role: 'user',
              content: userMessage.content
            });
          
          if (messageError) throw messageError;
        } catch (error) {
          console.error("Error saving user message:", error);
          // Continue anyway to try to get a response
        }
      }
    }

    // Build system message
    const systemMessage = {
      role: "system",
      content: mentorPrompt
    };

    if (userPreferences) {
      systemMessage.content += `\n\nUser Information:\n- Name: ${userPreferences.name || "User"}\n- Goal: ${userPreferences.goal || "Learning"}\n- Experience Level: ${userPreferences.experience || "Beginner"}\n\nProvide personalized, specific advice and maintain a supportive, encouraging tone.`;
    }

    // Format messages for OpenAI
    const formattedMessages = [systemMessage, ...messages];

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
          model: "gpt-4o-mini",
          messages: formattedMessages,
          temperature: 0.7,
          stream: true, // Enable streaming
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error from OpenAI API: ${errorText}`);
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
          if (fullResponse.content && sessionId && userId) {
            console.log("Saving assistant response to database for session:", sessionId);
            try {
              const { error: assistantMsgError } = await supabase
                .from("chat_messages")
                .insert({
                  chat_session_id: sessionId,
                  user_id: userId,
                  role: "assistant",
                  content: fullResponse.content,
                });
              
              if (assistantMsgError) throw assistantMsgError;
              console.log("Assistant response saved successfully");
            } catch (error) {
              console.error("Error saving assistant message:", error);
            }
          }
        } catch (error) {
          console.error('Error processing stream:', error);
        }
      })());

      // Add session ID to response headers so frontend can keep track of it
      const responseHeaders = { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-Chat-Session-Id": sessionId || ""
      };

      // Return the streaming response directly
      return new Response(response.body, { headers: responseHeaders });
    } else {
      // Non-streaming response (legacy support)
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const assistantResponse = data.choices[0].message.content;

      // Save the assistant's response if we have a session and a user
      if (sessionId && userId) {
        try {
          const { error: assistantMsgError } = await supabase
            .from("chat_messages")
            .insert({
              chat_session_id: sessionId,
              user_id: userId,
              role: "assistant",
              content: assistantResponse,
            });
          
          if (assistantMsgError) throw assistantMsgError;
        } catch (error) {
          console.error("Error saving assistant message:", error);
        }
      }

      // Return the AI response
      return new Response(
        JSON.stringify({ 
          response: assistantResponse, 
          sessionId 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
