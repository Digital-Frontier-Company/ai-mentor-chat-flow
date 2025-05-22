
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import MentorSelection from './MentorSelection';
import CustomizationForm from './CustomizationForm';
import ChatInterface from './ChatInterface';
import ChatSessionsList from './ChatSessionsList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const MentorApp: React.FC = () => {
  const { currentStep, setCurrentStep, selectedMentor } = useMentor();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleNewChat = () => {
    setCurrentStep('select');
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select':
        return <MentorSelection />;
      case 'customize':
        return <CustomizationForm />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <MentorSelection />;
    }
  };

  // Display dashboard if at selection step
  if (currentStep === 'select') {
    return (
      <div className="container py-8 max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Mentor Dashboard</h1>
          <p className="text-zinc-400">Create or select a mentor to start learning with personalized guidance.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat history section - 4 columns on larger screens */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xl font-semibold mb-3">Your Chat Sessions</h2>
            {user ? (
              <ChatSessionsList onNewChat={handleNewChat} />
            ) : (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 text-center">
                  <p className="text-zinc-400">Sign in to see your chat history</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Mentor templates section - 8 columns on larger screens */}
          <div className="lg:col-span-8">
            <h2 className="text-xl font-semibold mb-3">Choose a Mentor Template</h2>
            <MentorSelection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-full">
      {renderCurrentStep()}
    </div>
  );
};

export default MentorApp;
