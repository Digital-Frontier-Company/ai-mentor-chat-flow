
import React, { useState, useRef, useEffect } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { getMentorResponse } from '@/utils/openaiApi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getWelcomeMessage } from '@/utils/openaiApi';

const ChatInterface: React.FC = () => {
  const { 
    selectedMentor, 
    userPreferences, 
    messages, 
    addMessage, 
    isTyping, 
    setIsTyping, 
    setCurrentStep, 
    resetChat,
    chatSessionId,
    setChatSessionId,
    loadChatSession,
    refreshUserSessions
  } = useMentor();
  
  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [streamCleanup, setStreamCleanup] = useState<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  // Initialize chat session if not already done
  useEffect(() => {
    const initializeChat = async () => {
      if (!user || !selectedMentor) {
        console.log("Missing user or mentor, cannot initialize chat");
        return;
      }

      console.log("Chat initialization - Session ID:", chatSessionId, "Messages:", messages.length);

      if (!chatSessionId) {
        if (messages.length > 0) {
          try {
            console.log("Creating new chat session for existing messages");
            
            // Create a new chat session
            const { data: session, error } = await supabase
              .from('chat_sessions')
              .insert({
                mentor_id: selectedMentor.id,
                user_id: user.id,
                name: `Chat with ${selectedMentor.name}`
              })
              .select()
              .single();
            
            if (error) {
              console.error("Error creating chat session:", error);
              throw error;
            }
            
            console.log('Created new chat session:', session);
            setChatSessionId(session.id);
            
            // Add existing welcome message to the database
            const welcomeMessage = messages.find(msg => msg.role === 'assistant');
            if (welcomeMessage) {
              console.log("Saving welcome message to database...");
              const { error: msgError } = await supabase
                .from('chat_messages')
                .insert({
                  chat_session_id: session.id,
                  user_id: user.id,
                  role: 'assistant',
                  content: welcomeMessage.content
                });
              
              if (msgError) {
                console.error("Error saving welcome message:", msgError);
              } else {
                console.log("Welcome message saved to database");
              }
            }
          } catch (error) {
            console.error('Error creating chat session:', error);
            toast({
              title: "Warning",
              description: "Your chat will not be saved. You can continue, but progress won't be preserved.",
              variant: "destructive",
            });
          }
        } else {
          // No messages yet, add welcome message
          console.log("Adding welcome message for new chat");
          const welcomeMessage = getWelcomeMessage(selectedMentor, userPreferences);
          addMessage(welcomeMessage, 'assistant');
        }
      } else {
        // Already have a session ID, make sure messages are loaded
        console.log("Chat session exists:", chatSessionId);
        if (messages.length === 0) {
          const success = await loadChatSession(chatSessionId);
          if (!success) {
            console.error("Failed to load existing chat session");
            toast({
              title: "Error",
              description: "Failed to load chat history.",
              variant: "destructive",
            });
          } else {
            console.log("Successfully loaded chat session");
          }
        }
      }
    };
    
    initializeChat();
    
    // Cleanup function for any active streams when component unmounts
    return () => {
      if (streamCleanup) {
        streamCleanup();
      }
    };
  }, [user, selectedMentor, chatSessionId]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping || !selectedMentor) return;
    
    // Add user message
    addMessage(userInput.trim(), 'user');
    
    // Clear input
    setUserInput('');
    
    // Set typing state
    setIsTyping(true);
    setCurrentResponse('');
    
    // Cancel any existing stream
    if (streamCleanup) {
      streamCleanup();
      setStreamCleanup(null);
    }

    // Store the accumulated response text
    let accumulatedResponse = '';

    try {
      console.log("Sending message with session ID:", chatSessionId);
      console.log("Message content:", userInput.trim());
      
      // Get and stream response
      const cleanup = await getMentorResponse(
        userInput.trim(),
        messages,
        userPreferences,
        selectedMentor,
        (text) => {
          // Update both state and our local variable
          accumulatedResponse = text;
          setCurrentResponse(text);
        },
        (sessionId) => {
          // When streaming complete
          console.log("Stream complete, session ID:", sessionId);
          console.log("Final accumulated response length:", accumulatedResponse.length);
          
          // Use the accumulated response instead of state
          if (accumulatedResponse.trim()) {
            console.log("Saving assistant response to state:", accumulatedResponse.substring(0, 50) + "...");
            addMessage(accumulatedResponse, 'assistant');
          } else {
            console.warn("No response content to save");
          }
          
          // Update the chat session ID if it was returned
          if (sessionId && (!chatSessionId || sessionId !== chatSessionId)) {
            console.log("Setting chat session ID:", sessionId);
            setChatSessionId(sessionId);
            // Refresh user sessions list
            refreshUserSessions();
          }
          
          setCurrentResponse('');
          setIsTyping(false);
          setStreamCleanup(null);
        },
        chatSessionId
      );
      
      // Store the cleanup function
      setStreamCleanup(() => cleanup);
    } catch (error) {
      console.error('Error getting mentor response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the mentor. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    // Cancel any active streams before resetting
    if (streamCleanup) {
      streamCleanup();
    }
    
    if (window.confirm('This will reset your chat. Are you sure?')) {
      resetChat();
    }
  };

  if (!selectedMentor) return null;

  return (
    <div className="flex flex-col h-[85vh] animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft size={16} className="mr-2" /> New Session
        </Button>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{selectedMentor.icon}</span>
          <span className="font-semibold">{selectedMentor.name}</span>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className={`w-full h-2 bg-gradient-to-r ${selectedMentor.gradient}`}></div>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : `bg-muted`
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                {currentResponse || (
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-300"></div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] resize-none"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!userInput.trim() || isTyping}
              className={`h-[60px] ${selectedMentor.gradient ? `bg-gradient-to-r ${selectedMentor.gradient}` : ''} hover:opacity-90`}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
