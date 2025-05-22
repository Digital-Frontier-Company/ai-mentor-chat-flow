import React, { useEffect } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { CircleIcon, ArrowRightIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Get template_id from URL if present
  const searchParams = new URLSearchParams(location.search);
  const preSelectedTemplateId = searchParams.get('template');

  // Fetch mentor templates from the database
  const { data: mentorTemplates, isLoading, error } = useQuery({
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

  // Show error if templates fail to load
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading templates",
        description: "Failed to load mentor templates. Please try refreshing the page.",
        variant: "destructive",
      });
      console.error("Error loading mentor templates:", error);
    }
  }, [error, toast]);

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
    try {
      // Use either templates from context or fetched templates
      const templatesSource = mentorTemplates || mentors;
      const mentor = templatesSource.find(m => m.id === mentorId);
      
      if (mentor) {
        console.log("Selected mentor template:", mentor);
        setSelectedMentor(mentor);
        setCurrentStep('customize');
      } else {
        toast({
          title: "Template not found",
          description: "The selected template could not be found. Please try another one.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error selecting mentor template:", error);
      toast({
        title: "Error",
        description: "Failed to select mentor template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayMentors = mentorTemplates || mentors;

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p className="mt-2 text-zinc-400">Loading mentor templates...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {displayMentors.map((mentor) => (
        <Card 
          key={mentor.id} 
          className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
        >
          <div className="p-4 flex flex-col h-full">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-md ${
                  mentor.category === 'business' ? 'bg-emerald-950 text-emerald-500' :
                  mentor.category === 'technology' ? 'bg-violet-950 text-violet-500' : 
                  mentor.category === 'creative' ? 'bg-rose-950 text-rose-500' :
                  mentor.category === 'language' ? 'bg-blue-950 text-blue-500' :
                  'bg-amber-950 text-amber-500'
                }`}>
                  {mentor.category}
                </span>
              </div>
              <p className="text-gray-400 text-xs line-clamp-2">{mentor.description}</p>
            </div>
            
            <div className="mt-auto pt-3">
              <Button 
                onClick={() => handleUseTemplate(mentor.id)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-medium flex items-center justify-center gap-1.5 py-1.5 h-auto"
              >
                Use Template
                <ArrowRightIcon size={14} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MentorSelection;
