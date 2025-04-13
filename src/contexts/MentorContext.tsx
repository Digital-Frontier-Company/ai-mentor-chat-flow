
import React, { createContext, useContext, useState } from 'react';

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
  setCurrentStep: (step: 'select' | 'customize' | 'chat') => void;
  setSelectedMentor: (mentor: MentorType) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setIsTyping: (isTyping: boolean) => void;
  resetChat: () => void;
}

export const MentorContext = createContext<MentorContextType | null>(null);

export const MentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'customize' | 'chat'>('select');
  const [selectedMentor, setSelectedMentor] = useState<MentorType | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    name: '',
    goal: '',
    experience: 'Beginner'
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep('select');
    setSelectedMentor(null);
    setUserPreferences({
      name: '',
      goal: '',
      experience: 'Beginner'
    });
  };

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
        setCurrentStep,
        setSelectedMentor,
        setUserPreferences,
        addMessage,
        setIsTyping,
        resetChat,
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
