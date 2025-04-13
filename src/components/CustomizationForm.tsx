
import React, { useState } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { getWelcomeMessage } from '@/utils/openaiApi';

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
        <div className={`w-full h-2 bg-gradient-to-r ${selectedMentor.gradient}`}></div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedMentor.icon}</span>
            <CardTitle>Customize Your {selectedMentor.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                What's your name?
              </label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userPreferences.name}
                onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
                className={errors.name ? "border-red-500" : ""}
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
                className={errors.goal ? "border-red-500" : ""}
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
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={userPreferences.experience}
                onChange={(e) => setUserPreferences({ ...userPreferences, experience: e.target.value })}
              >
                <option value="">Select your experience level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <Button type="submit" className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              Start Chatting
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomizationForm;
