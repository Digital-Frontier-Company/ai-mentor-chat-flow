
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { CircleIcon, ArrowRightIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

const MentorSelection: React.FC = () => {
  const { mentors, selectedMentor, setSelectedMentor, setCurrentStep } = useMentor();

  const handleUseTemplate = (mentorId: string) => {
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor) {
      setSelectedMentor(mentor);
      setCurrentStep('customize');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in px-4">
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-500 text-2xl">⬚</span>
          <h1 className="text-3xl font-bold text-white">Choose a Template</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {mentors.map((mentor) => (
            <Card 
              key={mentor.id} 
              className="bg-zinc-900 border-zinc-800 overflow-hidden text-left"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-white">{mentor.name}</h2>
                    <span className={`px-2 py-1 text-xs rounded-md ${
                      mentor.category === 'business' ? 'bg-emerald-950 text-emerald-500' :
                      mentor.category === 'technology' ? 'bg-violet-950 text-violet-500' : 'bg-blue-950 text-blue-500'
                    }`}>
                      {mentor.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{mentor.description}</p>
                </div>
                
                <div className="mt-4">
                  <div className="mb-2">
                    <span className="text-emerald-500 text-sm font-medium">Expertise:</span>
                    <span className="text-white text-sm ml-2">{mentor.expertise}</span>
                  </div>
                  
                  <div>
                    <span className="text-emerald-500 text-sm font-medium mb-2 block">Learning Path:</span>
                    <ul className="space-y-1.5">
                      {mentor.learningPath.slice(0, 8).map((path, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CircleIcon className="h-3 w-3 text-emerald-500" />
                          <span className="text-gray-300 text-sm">{path.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <Button 
                    onClick={() => handleUseTemplate(mentor.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-medium flex items-center justify-center gap-2"
                  >
                    Use Template
                    <ArrowRightIcon size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-8">
          <Button 
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            onClick={() => {/* Handle custom mentor creation */}}
          >
            Create Custom Mentor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MentorSelection;
