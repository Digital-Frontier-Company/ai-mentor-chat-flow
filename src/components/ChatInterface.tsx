
import React, { useState, useRef, useEffect } from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { getMentorResponse } from '@/utils/openaiApi';

const ChatInterface: React.FC = () => {
  const { 
    selectedMentor, 
    userPreferences, 
    messages, 
    addMessage, 
    isTyping, 
    setIsTyping, 
    setCurrentStep, 
    resetChat 
  } = useMentor();
  
  const [userInput, setUserInput] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping || !selectedMentor) return;
    
    // Add user message
    addMessage(userInput.trim(), 'user');
    
    // Clear input
    setUserInput('');
    
    // Set typing state
    setIsTyping(true);
    setCurrentResponse('');

    // Get and stream response
    const stopStreaming = await getMentorResponse(
      userInput.trim(),
      messages,
      userPreferences,
      selectedMentor,
      (text) => {
        setCurrentResponse(text);
      },
      () => {
        // When streaming complete
        addMessage(currentResponse, 'assistant');
        setCurrentResponse('');
        setIsTyping(false);
      }
    );

    // Cleanup function
    return () => {
      if (stopStreaming) stopStreaming();
    };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
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
