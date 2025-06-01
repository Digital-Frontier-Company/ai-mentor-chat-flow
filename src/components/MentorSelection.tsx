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

const MentorSelection: React.FC = () => {
  const { 
    mentors, 
    userMentors, 
    setSelectedMentor, 
    setCurrentStep, 
    createCustomMentor,
    refreshMentorTemplates 
  } = useMentor();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get template_id from URL if present
  const searchParams = new URLSearchParams(location.search);
  const preSelectedTemplateId = searchParams.get('template');

  // Use the context's mentors instead of fetching separately
  // But also provide a way to refresh them
  const { isLoading, error } = useQuery({
    queryKey: ['mentorTemplatesRefresh'],
    queryFn: async () => {
      await refreshMentorTemplates();
      return mentors;
    },
    enabled: mentors.length === 0, // Only fetch if we don't have mentors loaded
  });

  // Select template from URL param if present
  useEffect(() => {
    if (preSelectedTemplateId && mentors.length > 0) {
      const template = mentors.find(t => t.id === preSelectedTemplateId);
      if (template) {
        handleUseTemplate(template.id);
      }
    }
  }, [preSelectedTemplateId, mentors]);

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
      console.log("Selecting mentor with ID:", mentorId);
      console.log("Available mentors:", mentors.map(m => ({ id: m.id, name: m.name })));
      console.log("Available user mentors:", userMentors.map(m => ({ id: m.id, name: m.name })));
      
      // Check if this is a user-created mentor
      const userMentor = userMentors.find(m => m.id === mentorId);
      
      if (userMentor) {
        console.log("Selected user-created mentor:", userMentor);
        setSelectedMentor(userMentor);
        setCurrentStep('customize');
        return;
      }
      
      // Otherwise check template mentors
      const mentor = mentors.find(m => m.id === mentorId);
      
      if (mentor) {
        console.log("Selected mentor template:", mentor);
        setSelectedMentor(mentor);
        setCurrentStep('customize');
      } else {
        console.error("Mentor not found with ID:", mentorId);
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

  if (isLoading && mentors.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-zinc-500 p-2 bg-zinc-900 rounded">
          Templates loaded: {mentors.length} | User mentors: {userMentors.length}
        </div>
      )}

      {/* Create custom mentor button - only show if user is logged in */}
      {user && (
        <CreateMentorForm onCreateMentor={handleCreateMentor} />
      )}

      {/* User created mentors section */}
      {user && userMentors.length > 0 && (
        <UserMentorList mentors={userMentors} onSelect={handleUseTemplate} />
      )}

      {/* Template mentors */}
      <MentorTemplateList mentors={mentors} onSelect={handleUseTemplate} />
      
      {/* Show message if no mentors are available */}
      {mentors.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-zinc-400 mb-4">No mentor templates available at the moment.</p>
          <button 
            onClick={() => refreshMentorTemplates()}
            className="text-lime-400 hover:text-lime-300 underline"
          >
            Try refreshing templates
          </button>
        </div>
      )}
    </div>
  );
};

export default MentorSelection;
