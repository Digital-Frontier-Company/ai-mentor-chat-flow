
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/logo';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if we have a token in the URL
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (token && type === 'signup') {
        setIsProcessing(true);
        
        try {
          // Verify the email
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });
          
          if (error) {
            throw error;
          }
          
          setVerificationStatus('success');
          toast({
            title: "Email verified",
            description: "Your email has been verified successfully.",
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          
        } catch (error: any) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          toast({
            title: "Verification failed",
            description: error.message || "Failed to verify your email.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    handleEmailConfirmation();
  }, [location.search, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 py-12 px-4">
      <div className="mb-8">
        <Link to="/">
          <Logo size="lg" />
        </Link>
      </div>
      
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
              verificationStatus === 'success' ? 'bg-green-500/20' : 
              verificationStatus === 'error' ? 'bg-red-500/20' : 'bg-lime-500/20'
            }`}>
              {verificationStatus === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : verificationStatus === 'error' ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <Mail className="h-8 w-8 text-lime-500" />
              )}
            </div>
          </div>
          
          {isProcessing ? (
            <CardTitle className="text-xl font-bold">Verifying your email...</CardTitle>
          ) : verificationStatus === 'success' ? (
            <CardTitle className="text-xl font-bold">Email Verified!</CardTitle>
          ) : verificationStatus === 'error' ? (
            <CardTitle className="text-xl font-bold">Verification Failed</CardTitle>
          ) : (
            <CardTitle className="text-xl font-bold">Check Your Email</CardTitle>
          )}
          
          <CardDescription>
            {isProcessing ? (
              "Please wait while we verify your email address..."
            ) : verificationStatus === 'success' ? (
              "Your email has been verified successfully. You'll be redirected to login..."
            ) : verificationStatus === 'error' ? (
              "We couldn't verify your email. The link may have expired or is invalid."
            ) : (
              "We've sent you a verification email. Please check your inbox and verify your email address to continue."
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {verificationStatus === 'pending' && (
            <div className="flex items-center justify-center space-x-2 text-zinc-400">
              <CheckCircle className="h-5 w-5 text-lime-500" />
              <span>It might take a few minutes to arrive</span>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <p className="text-sm text-zinc-400 mb-2">Try these solutions:</p>
              <ul className="text-left text-sm list-disc pl-5 space-y-1 text-zinc-400">
                <li>Check if you clicked the correct link from your email</li>
                <li>The verification link might have expired</li>
                <li>Try signing up again with the same email</li>
              </ul>
            </div>
          )}
          
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <p className="text-sm text-zinc-400">
              {verificationStatus === 'success' ? "You'll be redirected shortly..." : "Need help?"}
            </p>
            <Link to="/auth">
              <Button variant="link" className="text-lime-500 hover:text-lime-400 p-0">
                {verificationStatus === 'success' ? "Go to login now" : "Try a different email address"}
              </Button>
            </Link>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link to="/">
            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
              Back to Home Page
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailVerification;
