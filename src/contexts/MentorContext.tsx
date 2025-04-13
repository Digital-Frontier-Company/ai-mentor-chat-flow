
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types for our mentors
export type MentorType = {
  id: string;
  name: string;
  icon: string;
  description: string;
  gradient: string;
  systemPrompt: string;
};

// Define the user preferences type
export type UserPreferences = {
  name: string;
  goal: string;
  experience: string;
};

// Define the type for our messages
export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
};

// Define the type for our context
type MentorContextType = {
  mentors: MentorType[];
  selectedMentor: MentorType | null;
  userPreferences: UserPreferences;
  messages: Message[];
  isTyping: boolean;
  currentStep: 'select' | 'customize' | 'chat';
  setSelectedMentor: (mentor: MentorType) => void;
  setUserPreferences: (preferences: UserPreferences) => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setIsTyping: (isTyping: boolean) => void;
  setCurrentStep: (step: 'select' | 'customize' | 'chat') => void;
  resetChat: () => void;
};

// Create the context with a default value
const MentorContext = createContext<MentorContextType | undefined>(undefined);

// Define the props for our provider
type MentorProviderProps = {
  children: ReactNode;
};

// Define our default mentors
const defaultMentors: MentorType[] = [
  {
    id: 'marketing',
    name: 'Digital Marketing Mentor',
    icon: '📱',
    description: 'Expert guidance on digital marketing strategies, SEO, content marketing, and social media campaigns.',
    gradient: 'from-mentor-blue to-mentor-purple',
    systemPrompt: 'You are an expert Digital Marketing Mentor with extensive experience in SEO, content marketing, social media, and digital advertising. Your goal is to help the user improve their marketing strategies and achieve better results.'
  },
  {
    id: 'fitness',
    name: 'Fitness Coach',
    icon: '💪',
    description: 'Personalized workout plans, nutrition advice, and motivation to help you reach your fitness goals.',
    gradient: 'from-mentor-teal to-mentor-blue',
    systemPrompt: 'You are a professional Fitness Coach with expertise in strength training, cardio, nutrition, and holistic fitness. Your goal is to help the user achieve their fitness goals through personalized advice and motivation.'
  },
  {
    id: 'career',
    name: 'Career Advisor',
    icon: '💼',
    description: 'Strategic guidance on career development, job searching, resume building, and interview preparation.',
    gradient: 'from-mentor-purple to-mentor-pink',
    systemPrompt: 'You are an experienced Career Advisor with deep knowledge of various industries, job markets, resume writing, interview techniques, and career development. Your goal is to help the user advance in their career path.'
  },
  {
    id: 'finance',
    name: 'Financial Advisor',
    icon: '💰',
    description: 'Expert advice on personal finance, investments, budgeting, and financial planning for your future.',
    gradient: 'from-emerald-500 to-teal-700',
    systemPrompt: 'You are a knowledgeable Financial Advisor with expertise in personal finance, investments, budgeting, and financial planning. Your goal is to help the user make informed financial decisions and improve their financial well-being.'
  }
];

// Create the provider component
export const MentorProvider = ({ children }: MentorProviderProps) => {
  const [mentors] = useState<MentorType[]>(defaultMentors);
  const [selectedMentor, setSelectedMentor] = useState<MentorType | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    name: '',
    goal: '',
    experience: ''
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'customize' | 'chat'>('select');

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep('select');
    setSelectedMentor(null);
    setUserPreferences({
      name: '',
      goal: '',
      experience: ''
    });
  };

  const value = {
    mentors,
    selectedMentor,
    userPreferences,
    messages,
    isTyping,
    currentStep,
    setSelectedMentor,
    setUserPreferences,
    addMessage,
    setIsTyping,
    setCurrentStep,
    resetChat
  };

  return <MentorContext.Provider value={value}>{children}</MentorContext.Provider>;
};

// Create a hook to use the context
export const useMentor = () => {
  const context = useContext(MentorContext);
  if (context === undefined) {
    throw new Error('useMentor must be used within a MentorProvider');
  }
  return context;
};
