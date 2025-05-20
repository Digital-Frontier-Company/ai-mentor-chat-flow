
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.6.0";

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No stripe signature found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the event
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.client_reference_id) {
    console.error("Missing customer or client_reference_id in session");
    return;
  }

  try {
    // Get subscription info if available
    let subscriptionData = null;
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);
      
      subscriptionData = {
        subscription_id: subscription.id,
        subscription_tier: product.name,
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      };
    }

    // Update or insert subscriber record
    const { data, error } = await supabase
      .from("subscribers")
      .upsert({
        user_id: session.client_reference_id,
        email: session.customer_details?.email || "",
        stripe_customer_id: session.customer as string,
        subscribed: true,
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id"
      });

    if (error) {
      throw error;
    }

    console.log("Successfully processed checkout session:", session.id);
  } catch (error) {
    console.error("Error handling checkout session:", error);
    throw error;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    // Get customer info
    const customerId = subscription.customer as string;
    
    // Get product info
    const product = await stripe.products.retrieve(
      subscription.items.data[0].price.product as string
    );

    // Find user with this customer ID
    const { data: subscribers, error: findError } = await supabase
      .from("subscribers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (findError) {
      throw findError;
    }

    if (!subscribers) {
      console.error(`No user found with Stripe customer ID: ${customerId}`);
      return;
    }

    // Update subscription information
    const subscriptionStatus = subscription.status === "active" || 
                               subscription.status === "trialing";
    
    const { error: updateError } = await supabase
      .from("subscribers")
      .update({
        subscribed: subscriptionStatus,
        subscription_tier: product.name,
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully updated subscription status to ${subscriptionStatus} for customer: ${customerId}`);
  } catch (error) {
    console.error("Error handling subscription change:", error);
    throw error;
  }
}
