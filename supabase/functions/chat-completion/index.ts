
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
      stream = true 
    } = body;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Mentor ID and messages array are required");
    }
    
    // Get mentor information
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("name, description, system_prompt")
      .eq("id", mentorId)
      .single();
    
    if (mentorError && !mentorError.message.includes("No rows found")) {
      console.error("Error fetching mentor:", mentorError);
    }

    // If mentor not found in mentors table, check mentor_templates table
    let mentorPrompt = "";
    if (!mentor) {
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
      }
    } else {
      mentorPrompt = mentor.system_prompt || 
        `You are ${mentor.name}. ${mentor.description}`;
    }

    if (!mentorPrompt) {
      mentorPrompt = "You are a helpful AI assistant.";
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

      // Return the streaming response directly
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/event-stream"
        },
      });
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

      // Return the AI response
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
