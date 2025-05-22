import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MentorType {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradient: string;
  category: string;
  expertise: string;
  learningPath: Array<{
    name: string;
  }>;
}

export interface UserPreferences {
  name: string;
  goal: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  mentorName?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MentorContextType {
  currentStep: 'select' | 'customize' | 'chat';
  mentors: MentorType[];
  selectedMentor: MentorType | null;
  userPreferences: UserPreferences;
  messages: Message[];
  isTyping: boolean;
  chatSessionId: string | null;
  setCurrentStep: (step: 'select' | 'customize' | 'chat') => void;
  setSelectedMentor: (mentor: MentorType) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setIsTyping: (isTyping: boolean) => void;
  resetChat: () => void;
  loadChatSession: (sessionId: string) => Promise<boolean>;
  userSessions: Array<{id: string, name: string, mentor_id: string}>;
  refreshUserSessions: () => Promise<void>;
  setChatSessionId: (id: string | null) => void;
}

export const MentorContext = createContext<MentorContextType | null>(null);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'customize' | 'chat'>('select');
  const [selectedMentor, setSelectedMentor] = useState<MentorType | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    name: '',
    goal: '',
    experience: 'Beginner',
    mentorName: ''
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [userSessions, setUserSessions] = useState<Array<{id: string, name: string, mentor_id: string}>>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user sessions on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshUserSessions();
    }
  }, [user]);

  // Refresh the user's chat sessions
  const refreshUserSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, name, mentor_id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setUserSessions(data || []);
    } catch (error) {
      console.error('Error loading user sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load your previous chat sessions",
        variant: "destructive",
      });
    }
  };

  // Load a specific chat session
  const loadChatSession = async (sessionId: string) => {
    if (!user) return false;
    
    try {
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*, mentors(*)')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      // Get messages for this session
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      // Get the mentor template
      const { data: mentorTemplate, error: mentorError } = await supabase
        .from('mentor_templates')
        .select('*')
        .eq('template_id', sessionData.mentor_id)
        .single();
      
      if (mentorError && !mentorError.message.includes("No rows found")) {
        throw mentorError;
      }
      
      // Format the mentor
      const mentor: MentorType = mentorTemplate ? {
        id: mentorTemplate.template_id,
        name: mentorTemplate.display_name,
        icon: mentorTemplate.icon,
        description: mentorTemplate.description_for_user,
        gradient: getCategoryGradient(mentorTemplate.category),
        category: mentorTemplate.category,
        expertise: mentorTemplate.default_mentor_name,
        learningPath: generateLearningPath(mentorTemplate.category),
      } : {
        id: sessionData.mentor_id,
        name: 'Custom Mentor',
        icon: '🤖',
        description: 'A custom mentor',
        gradient: 'from-mentor-blue to-purple-600',
        category: 'custom',
        expertise: 'Custom Expertise',
        learningPath: [],
      };
      
      // Format messages
      const formattedMessages = messagesData ? messagesData.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })) : [];
      
      // Update state
      setSelectedMentor(mentor);
      setMessages(formattedMessages);
      setChatSessionId(sessionId);
      setCurrentStep('chat');
      
      return true;
    } catch (error) {
      console.error('Error loading chat session:', error);
      toast({
        title: "Error",
        description: "Failed to load the chat session",
        variant: "destructive",
      });
      return false;
    }
  };

  const addMessage = async (content: string, role: 'user' | 'assistant') => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content
    };

    // Add to local state
    setMessages(prev => [...prev, newMessage]);

    // If authenticated, save to database
    if (user && chatSessionId) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            chat_session_id: chatSessionId,
            user_id: user.id,
            role,
            content
          });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving message:', error);
        toast({
          title: "Warning",
          description: "Message saved locally but failed to sync to cloud",
          variant: "default",
        });
      }
    }
  };

  const resetChat = async () => {
    setMessages([]);
    setCurrentStep('select');
    setSelectedMentor(null);
    setChatSessionId(null);
    setUserPreferences({
      name: '',
      goal: '',
      experience: 'Beginner',
      mentorName: ''
    });
  };

  // Helper function for mentor templates
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

  // Fallback mentor templates (used while loading from database)
  const mentors: MentorType[] = [
    {
      id: 'business-strategy',
      name: 'Business Strategy Coach',
      icon: '💼',
      description: 'Develop your business acumen with guidance on strategy, planning, and execution from an experienced mentor.',
      gradient: 'from-mentor-blue to-purple-600',
      category: 'business',
      expertise: 'Business Strategy',
      learningPath: [
        { name: 'Business Model Analysis' },
        { name: 'Market Research' },
        { name: 'Competitive Analysis' },
        { name: 'Strategic Planning' },
        { name: 'Financial Planning' },
        { name: 'Operations Management' },
        { name: 'Growth Strategy' },
        { name: 'Risk Management' },
      ],
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing Mentor',
      icon: '📊',
      description: 'Learn digital marketing strategies from an expert mentor. Master SEO, social media, content marketing, and paid advertising.',
      gradient: 'from-mentor-teal to-emerald-500',
      category: 'business',
      expertise: 'Digital Marketing',
      learningPath: [
        { name: 'Digital Marketing Fundamentals' },
        { name: 'SEO Optimization' },
        { name: 'Social Media Strategy' },
        { name: 'Content Marketing' },
        { name: 'Email Marketing' },
        { name: 'Paid Advertising' },
        { name: 'Analytics and Reporting' },
        { name: 'Marketing Automation' },
      ],
    },
    {
      id: 'data-science',
      name: 'Data Science Expert',
      icon: '📈',
      description: 'Learn data science from fundamentals to advanced topics with hands-on guidance and practical examples.',
      gradient: 'from-mentor-purple to-pink-500',
      category: 'technology',
      expertise: 'Data Science',
      learningPath: [
        { name: 'Statistics Fundamentals' },
        { name: 'Python Programming' },
        { name: 'Data Analysis' },
        { name: 'Machine Learning Basics' },
        { name: 'Data Visualization' },
        { name: 'Advanced ML Algorithms' },
        { name: 'Big Data Technologies' },
        { name: 'Project Implementation' },
      ],
    },
  ];

  return (
    <MentorContext.Provider
      value={{
        currentStep,
        mentors,
        selectedMentor,
        userPreferences,
        messages,
        isTyping,
        chatSessionId,
        setCurrentStep,
        setSelectedMentor,
        setUserPreferences,
        addMessage,
        setIsTyping,
        resetChat,
        loadChatSession,
        userSessions,
        refreshUserSessions,
        setChatSessionId,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};

export const useMentor = () => {
  const context = useContext(MentorContext);
  if (!context) {
    throw new Error('useMentor must be used within a MentorProvider');
  }
  return context;
};
