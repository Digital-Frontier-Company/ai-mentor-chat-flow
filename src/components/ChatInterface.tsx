
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { useMentor } from '@/contexts/MentorContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

const ChatInterface: React.FC = () => {
  const {
    selectedMentor,
    setCurrentStep,
  } = useMentor();

  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, send, isLoading } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim();
    setInput('');

    try {
      await send(messageToSend);
      
      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedMentor) {
    return <div>No mentor selected</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep('select')}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="text-2xl">{selectedMentor.icon}</div>
          <div>
            <h1 className="text-xl font-semibold">{selectedMentor.name}</h1>
            <p className="text-sm text-zinc-400">{selectedMentor.expertise}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">{selectedMentor.icon}</div>
            <h2 className="text-xl font-semibold mb-2">Chat with {selectedMentor.name}</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              {selectedMentor.description}
            </p>
            <p className="text-zinc-500 text-sm mt-4">
              Ask me anything related to {selectedMentor.expertise}!
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <Card
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-lime-500 text-black'
                  : 'bg-zinc-800 border-zinc-700'
              }`}
            >
              <CardContent className="p-3">
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="max-w-[80%] bg-zinc-800 border-zinc-700">
              <CardContent className="p-3">
                <div className="flex items-center text-zinc-400">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  <span className="text-xs">AI is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${selectedMentor.name} anything...`}
            className="flex-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400 resize-none min-h-[60px] max-h-[120px]"
            rows={2}
            disabled={isLoading}
          />
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="self-end bg-lime-500 hover:bg-lime-600 text-black"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
