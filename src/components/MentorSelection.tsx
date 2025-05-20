
import React, { useEffect } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { CircleIcon, ArrowRightIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface MentorTemplate {
  id: string;
  template_id: string;
  display_name: string;
  description_for_user: string;
  category: string;
  default_mentor_name: string;
  icon: string;
  expertise: string;
  learningPath: { name: string }[];
}

const MentorSelection: React.FC = () => {
  const { mentors, setSelectedMentor, setCurrentStep } = useMentor();
  const location = useLocation();
  
  // Get template_id from URL if present
  const searchParams = new URLSearchParams(location.search);
  const preSelectedTemplateId = searchParams.get('template');

  // Fetch mentor templates from the database
  const { data: mentorTemplates, isLoading } = useQuery({
    queryKey: ['mentorTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_templates')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data to match our existing format
      return data.map((template: any) => ({
        id: template.template_id,
        name: template.display_name,
        icon: template.icon,
        description: template.description_for_user,
        gradient: getCategoryGradient(template.category),
        category: template.category,
        expertise: template.default_mentor_name,
        learningPath: generateLearningPath(template.category),
      }));
    },
  });

  // Select template from URL param if present
  useEffect(() => {
    if (preSelectedTemplateId && mentorTemplates) {
      const template = mentorTemplates.find(t => t.id === preSelectedTemplateId);
      if (template) {
        handleUseTemplate(template.id);
      }
    }
  }, [preSelectedTemplateId, mentorTemplates]);

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'technology': return 'from-violet-500 to-purple-700';
      case 'business': return 'from-emerald-500 to-teal-700';
      case 'creative': return 'from-pink-500 to-rose-700';
      case 'language': return 'from-blue-500 to-indigo-700';
      case 'education': return 'from-amber-500 to-orange-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  // Generate sample learning paths based on category
  const generateLearningPath = (category: string) => {
    const paths: Record<string, Array<{name: string}>> = {
      'technology': [
        { name: 'Programming Basics' },
        { name: 'Data Structures' },
        { name: 'Algorithms' },
        { name: 'Object-Oriented Programming' },
        { name: 'File Handling' },
        { name: 'Error Handling' },
        { name: 'Modules & Packages' },
        { name: 'Project Development' },
      ],
      'business': [
        { name: 'Goal Setting' },
        { name: 'Time Management' },
        { name: 'Habit Formation' },
        { name: 'Task Prioritization' },
        { name: 'Focus Techniques' },
        { name: 'Progress Tracking' },
        { name: 'Accountability Systems' },
        { name: 'Continuous Improvement' },
      ],
      'creative': [
        { name: 'Creative Foundations' },
        { name: 'Story Structure' },
        { name: 'Character Development' },
        { name: 'Scene Building' },
        { name: 'Dialog Techniques' },
        { name: 'Plot Development' },
        { name: 'Editing Skills' },
        { name: 'Publishing Guidance' },
      ],
      'language': [
        { name: 'Basic Vocabulary' },
        { name: 'Common Phrases' },
        { name: 'Grammar Fundamentals' },
        { name: 'Conversation Practice' },
        { name: 'Listening Skills' },
        { name: 'Reading Comprehension' },
        { name: 'Cultural Context' },
        { name: 'Advanced Expression' },
      ],
      'education': [
        { name: 'Key Events & Figures' },
        { name: 'Historical Context' },
        { name: 'Cultural Developments' },
        { name: 'Political Systems' },
        { name: 'Economic Factors' },
        { name: 'Social Movements' },
        { name: 'Technological Advances' },
        { name: 'Historical Analysis' },
      ],
    };
    
    return paths[category] || paths['technology'];
  };

  const handleUseTemplate = (mentorId: string) => {
    // Use either templates from context or fetched templates
    const templatesSource = mentorTemplates || mentors;
    const mentor = templatesSource.find(m => m.id === mentorId);
    
    if (mentor) {
      setSelectedMentor(mentor);
      setCurrentStep('customize');
    }
  };

  const displayMentors = mentorTemplates || mentors;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in px-4">
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-500 text-2xl">⬚</span>
          <h1 className="text-3xl font-bold text-white">Choose a Template</h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-2 text-zinc-400">Loading mentor templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {displayMentors.map((mentor) => (
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
                        mentor.category === 'technology' ? 'bg-violet-950 text-violet-500' : 
                        mentor.category === 'creative' ? 'bg-rose-950 text-rose-500' :
                        mentor.category === 'language' ? 'bg-blue-950 text-blue-500' :
                        'bg-amber-950 text-amber-500'
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
        )}
        
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
