
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import MentorCard from './MentorCard';
import { Button } from '@/components/ui/button';

const MentorSelection: React.FC = () => {
  const { mentors, selectedMentor, setSelectedMentor, setCurrentStep } = useMentor();

  const handleContinue = () => {
    if (selectedMentor) {
      setCurrentStep('customize');
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="max-w-3xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Choose Your AI Mentor</h1>
        <p className="text-center text-muted-foreground mb-8">
          Select the type of mentor that aligns with your goals and needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              selected={selectedMentor?.id === mentor.id}
              onClick={() => setSelectedMentor(mentor)}
            />
          ))}
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedMentor}
            className={`px-6 py-5 ${selectedMentor ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700' : ''}`}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorSelection;
