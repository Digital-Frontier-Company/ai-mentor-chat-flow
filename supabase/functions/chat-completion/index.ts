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
      throw new Error("Messages array is required");
    }
    
    // Get mentor information - check if it's a template ID or UUID
    let mentorPrompt = "";
    let mentorName = "";
    let mentorType = "template";
    let sessionMentorId = mentorId;
    
    // First try to detect if this looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(mentorId);
    
    if (isUuid) {
      // Try custom mentors table first
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .select("name, description, avatar_url")
        .eq("id", mentorId)
        .single();
      
      if (!mentorError && mentor) {
        mentorPrompt = `You are ${mentor.name}. ${mentor.description}`;
        mentorName = mentor.name;
        mentorType = "custom";
      }
    }
    
    // If not found in custom mentors or not a UUID, check mentor_templates
    if (!mentorPrompt) {
      const { data: template, error: templateError } = await supabase
        .from("mentor_templates")
        .select("*")
        .eq("template_id", mentorId)
        .single();
      
      if (!templateError && template) {
        mentorPrompt = template.system_prompt_base || 
          `You are a ${template.display_name}. ${template.description_for_user}`;
        mentorName = template.display_name;
        mentorType = "template";
        // For templates, we'll use the template_id as a string in a special way
        sessionMentorId = mentorId; // Keep the string ID for templates
      }
    }

    if (!mentorPrompt) {
      mentorPrompt = "You are a helpful AI assistant.";
      mentorName = "AI Assistant";
    }
    
    // Manage chat session ID - handle template IDs differently
    let sessionId = chatSessionId;
    
    if (!sessionId && userId) {
      // Create a new session - handle template vs custom mentor differently
      console.log("Creating new chat session for user:", userId);
      try {
        let sessionData;
        
        if (mentorType === "template") {
          // For templates, store the string ID in a text field or create a mapping
          // Since the DB expects UUID, we'll create a workaround
          // Skip database session creation for templates for now
          console.log("Skipping database session creation for template mentor");
          sessionId = `template_${mentorId}_${Date.now()}`;
        } else {
          // For custom mentors with UUID
          const { data: session, error: sessionError } = await supabase
            .from("chat_sessions")
            .insert({
              mentor_id: sessionMentorId,
              mentor_type: mentorType,
              user_id: userId,
              name: `Chat with ${mentorName || 'Mentor'}`
            })
            .select()
            .single();
          
          if (sessionError) throw sessionError;
          
          console.log("Created new chat session:", session.id);
          sessionId = session.id;
        }
      } catch (error) {
        console.error("Error creating chat session:", error);
        // Continue anyway to try to get a response
        sessionId = `fallback_${Date.now()}`;
      }
    }
    
    // Save the user's message if we have a proper session ID (not template)
    if (sessionId && userId && messages.length > 0 && !sessionId.startsWith('template_') && !sessionId.startsWith('fallback_')) {
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

      // Use a promise to handle the background processing
      const backgroundTask = (async () => {
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

          // After collecting the full response, save it to the database (only for proper sessions)
          if (fullResponse.content && sessionId && userId && !sessionId.startsWith('template_') && !sessionId.startsWith('fallback_')) {
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
      })();

      // Start the background task
      backgroundTask.catch(console.error);

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

      // Save the assistant's response if we have a proper session ID
      if (sessionId && userId && !sessionId.startsWith('template_') && !sessionId.startsWith('fallback_')) {
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
