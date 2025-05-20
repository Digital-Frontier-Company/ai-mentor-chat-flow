
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
    // Get supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials are not defined");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract request data
    const { 
      name, 
      description, 
      templateId = null,
      color = "#3f88c5", 
      customPrompt = null, 
      userId = null,
      icon = "🧠"
    } = await req.json();
    
    if (!name || !description) {
      throw new Error("Name and description are required");
    }
    
    let systemPrompt = "";
    
    // If a templateId is provided, fetch the template
    if (templateId) {
      const { data: template, error: templateError } = await supabase
        .from("mentor_templates")
        .select("system_prompt_base")
        .eq("template_id", templateId)
        .single();
        
      if (templateError) {
        throw new Error(`Error fetching template: ${templateError.message}`);
      }
      
      if (template) {
        systemPrompt = template.system_prompt_base;
      }
    }
    
    // If a custom prompt is provided, use that (overrides template)
    if (customPrompt) {
      systemPrompt = customPrompt;
    }
    
    // Ensure we have a system prompt
    if (!systemPrompt) {
      systemPrompt = `You are ${name}, a mentor with the following description: ${description}. Your goal is to help users by providing guidance, answering questions, and offering advice in your area of expertise.`;
    }
    
    // Create the mentor in the database
    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .insert({
        name,
        description,
        color,
        system_prompt: systemPrompt,
        user_id: userId,
        icon
      })
      .select()
      .single();
    
    if (mentorError) {
      throw new Error(`Error creating mentor: ${mentorError.message}`);
    }
    
    // Return the created mentor
    return new Response(
      JSON.stringify({ 
        mentor, 
        message: "Mentor created successfully" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201 
      }
    );
    
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
