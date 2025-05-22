
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
  const { currentStep, setCurrentStep } = useMentor();
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

  // Display user dashboard if at selection step
  if (currentStep === 'select') {
    return (
      <div className="container py-8 max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Mentor Dashboard</h1>
          <p className="text-zinc-400">Create or select a mentor to start learning with personalized guidance.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full h-16 w-16 mb-4"
                onClick={() => setCurrentStep('select')}
              >
                <span className="text-2xl">+</span>
              </Button>
              <h3 className="text-xl font-medium mb-2">Create New Mentor</h3>
              <p className="text-zinc-400 text-center">Design a custom AI mentor tailored to your learning needs</p>
            </CardContent>
          </Card>
          
          {/* Render either mentor selection or chat history */}
          <div className="lg:col-span-3">
            {user ? (
              <ChatSessionsList onNewChat={handleNewChat} />
            ) : (
              renderCurrentStep()
            )}
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
