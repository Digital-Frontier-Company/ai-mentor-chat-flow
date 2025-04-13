
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import MentorSelection from './MentorSelection';
import CustomizationForm from './CustomizationForm';
import ChatInterface from './ChatInterface';

const MentorApp: React.FC = () => {
  const { currentStep } = useMentor();

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

  return (
    <div className="container py-8">
      {renderCurrentStep()}
    </div>
  );
};

export default MentorApp;
