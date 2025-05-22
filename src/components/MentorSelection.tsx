import React, { useEffect, useState } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { CircleIcon, ArrowRightIcon, Plus, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

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
  const { mentors, userMentors, setSelectedMentor, setCurrentStep, createCustomMentor } = useMentor();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Custom mentor form state
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    icon: '🧠',
    color: '#3f88c5',
    customPrompt: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'technology': return 'from-violet-500 to-purple-700';
      case 'business': return 'from-emerald-500 to-teal-700';
      case 'creative': return 'from-pink-500 to-rose-700';
      case 'language': return 'from-blue-500 to-indigo-700';
      case 'education': return 'from-amber-500 to-orange-700';
      case 'custom': return 'from-lime-500 to-lime-700';
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
  
  const handleCreateMentor = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a custom mentor",
        variant: "destructive",
      });
      return;
    }
    
    if (!formState.name || !formState.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and description for your mentor",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newMentor = await createCustomMentor(formState);
      
      if (newMentor) {
        setShowCreateDialog(false);
        // Reset form
        setFormState({
          name: '',
          description: '',
          icon: '🧠',
          color: '#3f88c5',
          customPrompt: '',
        });
        
        // Select the newly created mentor
        setSelectedMentor(newMentor);
        setCurrentStep('customize');
      }
    } catch (error) {
      console.error("Error creating mentor:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Use fetched templates if available, otherwise use context templates
  const displayMentors = mentorTemplates || mentors;
  
  // Common emoji options for mentor icons
  const commonEmojis = ['🧠', '👨‍🏫', '👩‍🏫', '🤖', '📚', '💼', '📊', '🎨', '🔬', '💻', '🌍', '🏋️‍♂️', '🧘‍♀️', '👨‍💻', '👩‍💼'];

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p className="mt-2 text-zinc-400">Loading mentor templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create custom mentor button */}
      {user && (
        <div className="flex justify-end">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-lime-500 hover:bg-lime-600 text-black">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Custom Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Your Custom Mentor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Mentor Name</Label>
                  <Input 
                    id="name" 
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                    placeholder="Give your mentor a name"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formState.description}
                    onChange={(e) => setFormState({...formState, description: e.target.value})}
                    placeholder="Describe what this mentor specializes in..."
                    className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {commonEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant={formState.icon === emoji ? "default" : "outline"}
                        className="h-10 w-10 p-0 text-lg"
                        onClick={() => setFormState({...formState, icon: emoji})}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Custom System Prompt (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    value={formState.customPrompt}
                    onChange={(e) => setFormState({...formState, customPrompt: e.target.value})}
                    placeholder="Provide a custom system prompt for more control over your mentor's behavior..."
                    className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                  />
                  <p className="text-xs text-zinc-400">Leave blank to use the default prompt based on name and description.</p>
                </div>
              </div>
              <div className="flex justify-between">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleCreateMentor}
                  disabled={isCreating || !formState.name || !formState.description}
                  className="bg-lime-500 hover:bg-lime-600 text-black"
                >
                  {isCreating ? "Creating..." : "Create Mentor"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* User created mentors section */}
      {user && userMentors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Custom Mentors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userMentors.map((mentor) => (
              <Card 
                key={mentor.id} 
                className="bg-zinc-900 border-zinc-800 hover:border-lime-500 transition-all cursor-pointer"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{mentor.icon}</span>
                        <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                      </div>
                      <span className="px-2 py-0.5 text-xs rounded-md bg-lime-950 text-lime-500">
                        custom
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2">{mentor.description}</p>
                  </div>
                  
                  <div className="mt-auto pt-3">
                    <Button 
                      onClick={() => handleUseTemplate(mentor.id)}
                      className="w-full bg-lime-500 hover:bg-lime-600 text-black text-sm font-medium flex items-center justify-center gap-1.5 py-1.5 h-auto"
                    >
                      Use Mentor
                      <ArrowRightIcon size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Template mentors */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Mentor Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayMentors.map((mentor) => (
            <Card 
              key={mentor.id} 
              className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{mentor.icon}</span>
                      <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                    </div>
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
      </div>
    </div>
  );
};

export default MentorSelection;
