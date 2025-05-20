
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/logo';

const EmailVerification = () => {
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
            <div className="h-16 w-16 bg-lime-500/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-lime-500" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a verification email. Please check your inbox and verify your email address to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-zinc-400">
            <CheckCircle className="h-5 w-5 text-lime-500" />
            <span>It might take a few minutes to arrive</span>
          </div>
          
          <div className="border-t border-zinc-800 pt-4 mt-4">
            <p className="text-sm text-zinc-400">Didn't receive an email?</p>
            <Link to="/auth">
              <Button variant="link" className="text-lime-500 hover:text-lime-400 p-0">
                Try a different email address
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
