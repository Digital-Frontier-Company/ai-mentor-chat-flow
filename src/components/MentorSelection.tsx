import React, { useEffect } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Import refactored components
import MentorTemplateList from './mentor/MentorTemplateList';
import UserMentorList from './mentor/UserMentorList';
import CreateMentorForm from './mentor/CreateMentorForm';
import LoadingState from './mentor/LoadingState';
import { getCategoryGradient, generateLearningPath } from './mentor/MentorUtils';

const MentorSelection: React.FC = () => {
  const { mentors, userMentors, setSelectedMentor, setCurrentStep, createCustomMentor } = useMentor();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get template_id from URL if present
  const searchParams = new URLSearchParams(location.search);
  const preSelectedTemplateId = searchParams.get('template');

  // Fetch mentor templates from the database
  const { data: mentorTemplates, isLoading, error } = useQuery({
    queryKey: ['mentorTemplates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_templates')
        .select('*')
        .order('category');
      
      if (error) throw error;
      
      console.log("Fetched mentor templates:", data);
      
      // Transform the data to match our existing format
      return data.map((template: any) => ({
        id: template.template_id,
        name: template.display_name || template.default_mentor_name,
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

  const handleUseTemplate = (mentorId: string) => {
    try {
      // Use either templates from context or fetched templates
      const templatesSource = mentorTemplates || mentors;
      
      // Check if this is a user-created mentor
      const userMentor = userMentors.find(m => m.id === mentorId);
      
      if (userMentor) {
        console.log("Selected user-created mentor:", userMentor);
        setSelectedMentor(userMentor);
        setCurrentStep('customize');
        return;
      }
      
      // Otherwise check template mentors
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
  
  // Handler for creating a new mentor
  const handleCreateMentor = async (formData: any) => {
    try {
      const newMentor = await createCustomMentor(formData);
      
      if (newMentor) {
        // Select the newly created mentor
        setSelectedMentor(newMentor);
        setCurrentStep('customize');
        return newMentor;
      }
    } catch (error) {
      console.error("Error creating mentor:", error);
      toast({
        title: "Error",
        description: "Failed to create custom mentor. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Use fetched templates if available, otherwise use context templates
  const displayMentors = mentorTemplates || mentors;
  
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Create custom mentor button - only show if user is logged in */}
      {user && (
        <CreateMentorForm onCreateMentor={handleCreateMentor} />
      )}

      {/* User created mentors section */}
      {user && userMentors.length > 0 && (
        <UserMentorList mentors={userMentors} onSelect={handleUseTemplate} />
      )}

      {/* Template mentors */}
      <MentorTemplateList mentors={displayMentors} onSelect={handleUseTemplate} />
    </div>
  );
};

export default MentorSelection;
