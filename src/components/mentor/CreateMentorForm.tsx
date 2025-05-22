
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateMentorFormProps {
  onCreateMentor: (formData: MentorFormData) => Promise<any>;
}

export interface MentorFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  customPrompt: string;
}

const CreateMentorForm: React.FC<CreateMentorFormProps> = ({ onCreateMentor }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formState, setFormState] = useState<MentorFormData>({
    name: '',
    description: '',
    icon: '🧠',
    color: '#3f88c5',
    customPrompt: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  
  // Common emoji options for mentor icons
  const commonEmojis = ['🧠', '👨‍🏫', '👩‍🏫', '🤖', '📚', '💼', '📊', '🎨', '🔬', '💻', '🌍', '🏋️‍♂️', '🧘‍♀️', '👨‍💻', '👩‍💼'];

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
      const newMentor = await onCreateMentor(formState);
      
      if (newMentor) {
        setShowDialog(false);
        // Reset form
        setFormState({
          name: '',
          description: '',
          icon: '🧠',
          color: '#3f88c5',
          customPrompt: '',
        });
      }
    } catch (error) {
      console.error("Error creating mentor:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
  );
};

export default CreateMentorForm;
