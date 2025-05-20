import React, { useState, useEffect } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { getWelcomeMessage } from '@/utils/openaiApi';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MentorTemplateDetails {
  default_mentor_name: string;
  system_prompt_base: string;
}

const CustomizationForm: React.FC = () => {
  const { 
    selectedMentor, 
    userPreferences, 
    setUserPreferences, 
    setCurrentStep, 
    addMessage 
  } = useMentor();
  
  const [errors, setErrors] = useState({
    name: false,
    goal: false,
  });

  // Fetch full template details if we're working with a database template
  const { data: templateDetails } = useQuery({
    queryKey: ['templateDetails', selectedMentor?.id],
    queryFn: async () => {
      if (!selectedMentor) return null;
      
      const { data, error } = await supabase
        .from('mentor_templates')
        .select('default_mentor_name, system_prompt_base')
        .eq('template_id', selectedMentor.id)
        .single();
      
      if (error) throw error;
      return data as MentorTemplateDetails;
    },
    enabled: !!selectedMentor?.id,
  });

  // Pre-fill mentor name from template if available
  useEffect(() => {
    if (templateDetails?.default_mentor_name && !userPreferences.mentorName) {
      setUserPreferences({
        ...userPreferences,
        mentorName: templateDetails.default_mentor_name
      });
    }
  }, [templateDetails]);

  const handleBack = () => {
    setCurrentStep('select');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {
      name: !userPreferences.name.trim(),
      goal: !userPreferences.goal.trim(),
    };
    
    setErrors(newErrors);
    
    if (newErrors.name || newErrors.goal) {
      return;
    }
    
    if (selectedMentor) {
      // Add welcome message from the mentor
      const welcomeMessage = getWelcomeMessage(selectedMentor, userPreferences);
      addMessage(welcomeMessage, 'assistant');
      
      // Go to chat
      setCurrentStep('chat');
    }
  };

  if (!selectedMentor) return null;

  // Handle experience level change with proper type checking
  const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'Beginner' | 'Intermediate' | 'Advanced';
    setUserPreferences({ ...userPreferences, experience: value });
  };

  // Get gradient color based on category
  const getGradient = (category?: string) => {
    if (!category) return 'from-mentor-blue to-purple-600';
    
    switch (category.toLowerCase()) {
      case 'technology': return 'from-violet-500 to-purple-700';
      case 'business': return 'from-emerald-500 to-teal-700';
      case 'creative': return 'from-pink-500 to-rose-700';
      case 'language': return 'from-blue-500 to-indigo-700';
      case 'education': return 'from-amber-500 to-orange-700';
      default: return 'from-mentor-blue to-purple-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to selection
      </Button>
      
      <Card className="w-full">
        <div className={`w-full h-2 bg-gradient-to-r ${getGradient(selectedMentor.category)}`}></div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedMentor.icon}</span>
            <CardTitle>Customize Your {selectedMentor.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="mentorName" className="text-sm font-medium">
                What would you like to name your mentor?
              </label>
              <Input
                id="mentorName"
                placeholder={templateDetails?.default_mentor_name || "Enter a name for your mentor"}
                value={userPreferences.mentorName || ''}
                onChange={(e) => setUserPreferences({ ...userPreferences, mentorName: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-zinc-400 text-xs">
                This is what you'll call your mentor during conversations.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                What's your name?
              </label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userPreferences.name}
                onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
                className={`bg-zinc-800 border-zinc-700 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-xs">Please enter your name</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="goal" className="text-sm font-medium">
                What's your primary goal?
              </label>
              <Textarea
                id="goal"
                placeholder="Describe what you want to achieve with this mentor"
                value={userPreferences.goal}
                onChange={(e) => setUserPreferences({ ...userPreferences, goal: e.target.value })}
                className={`bg-zinc-800 border-zinc-700 ${errors.goal ? "border-red-500" : ""}`}
                rows={3}
              />
              {errors.goal && <p className="text-red-500 text-xs">Please describe your goal</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="experience" className="text-sm font-medium">
                What's your experience level?
              </label>
              <select
                id="experience"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2"
                value={userPreferences.experience}
                onChange={handleExperienceChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              className={`w-full mt-6 bg-gradient-to-r ${getGradient(selectedMentor.category)} hover:opacity-90 text-white`}
            >
              Start Chatting
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationForm;
