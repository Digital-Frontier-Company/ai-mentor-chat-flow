
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  priceId: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    description: 'Perfect for individuals just starting their learning journey',
    features: [
      'Create up to 3 mentors', 
      'Access to fundamental templates', 
      'Basic conversation history', 
      '100 messages per day', 
      'Email support'
    ],
    priceId: 'price_basic' // Replace with your actual Stripe Price ID
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    interval: 'month',
    description: 'For serious learners who want to maximize their potential',
    features: [
      'Create up to 10 mentors', 
      'Access to all templates', 
      'Extended conversation history', 
      'Unlimited messages', 
      'Priority email support', 
      'Custom mentor fine-tuning'
    ],
    priceId: 'price_pro', // Replace with your actual Stripe Price ID
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    interval: 'month',
    description: 'For organizations that want to provide mentorship at scale',
    features: [
      'Unlimited mentors', 
      'Access to all templates and premium content', 
      'Unlimited conversation history', 
      'Unlimited messages', 
      'Priority 24/7 support', 
      'Advanced mentor customization', 
      'Team management features', 
      'Usage analytics'
    ],
    priceId: 'price_enterprise' // Replace with your actual Stripe Price ID
  }
];

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      // If user is not logged in, redirect to auth page
      toast.error('Please sign in first to subscribe');
      navigate('/auth', {
        state: {
          returnTo: '/pricing'
        }
      });
      return;
    }

    try {
      setLoading(plan.id);

      // Call the create-checkout edge function to create a checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: plan.priceId,
          userId: user.id,
          returnUrl: `${window.location.origin}/settings`
        }
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black bg-[url('/lovable-uploads/6f58afdf-7a45-4bd1-b5e8-53d7f1ce9cc7.png')] bg-cover bg-center bg-no-repeat bg-blend-overlay relative overflow-hidden">
      {/* Star field effect */}
      <div className="absolute inset-0 opacity-70">
        <div className="stars absolute inset-0"></div>
      </div>
      
      <div className="container max-w-6xl mx-auto py-16 px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Choose Your <span className="text-lime-400">Learning Path</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto text-zinc-300">
            Select the plan that matches your learning goals and unlock the power of personalized AI mentorship.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map(plan => (
            <Card key={plan.id} className={`backdrop-blur-lg bg-zinc-900/40 border-zinc-700 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-lime-500/10 ${plan.popular ? 'ring-2 ring-lime-500 shadow-lg shadow-lime-500/20' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-lime-500 text-zinc-900 text-xs font-bold px-3 py-1">
                    MOST POPULAR
                  </div>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl text-gray-50">{plan.name}</CardTitle>
                <CardDescription className="text-zinc-400">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <p className="text-4xl font-bold text-slate-50">${plan.price}</p>
                  <p className="text-zinc-400">per {plan.interval}</p>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-lime-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-50">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular 
                    ? 'bg-gradient-to-r from-lime-600 to-cyan-400 text-zinc-900 hover:from-lime-700 hover:to-cyan-500' 
                    : 'bg-zinc-800 hover:bg-zinc-700'}`} 
                  onClick={() => handleSubscribe(plan)} 
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? 'Processing...' : user ? 'Subscribe Now' : 'Sign Up & Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="flex items-start p-4 rounded-lg bg-zinc-900/40 backdrop-blur-sm border border-zinc-700/50">
            <AlertCircle className="h-5 w-5 text-lime-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-2 text-white">100% Satisfaction Guarantee</h3>
              <p className="text-zinc-300">
                Not satisfied with your subscription? Contact us within 14 days of your initial purchase and we'll provide a full refund - no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { opacity: 0.2; }
        }
        
        .stars {
          background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)), 
                            radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)), 
                            radial-gradient(1px 1px at 90px 40px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 200px 60px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 260px 170px, #fff, rgba(0,0,0,0)),
                            radial-gradient(3px 3px at 300px 30px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 340px 80px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 380px 130px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 420px 40px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 480px 100px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 520px 60px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 600px 300px;
          animation: twinkle 10s ease-in-out infinite alternate;
        }
        `}
      </style>
    </div>
  );
};

export default Pricing;
