
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatSessionsListProps {
  onNewChat: () => void;
}

const ChatSessionsList: React.FC<ChatSessionsListProps> = ({ onNewChat }) => {
  const { userSessions, loadChatSession, refreshUserSessions } = useMentor();
  const { toast } = useToast();

  const handleLoadSession = async (sessionId: string) => {
    try {
      console.log("Loading chat session:", sessionId);
      const success = await loadChatSession(sessionId);
      if (!success) {
        toast({
          title: "Error",
          description: "Failed to load the chat session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading chat session:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading the chat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Button variant="default" size="sm" onClick={() => refreshUserSessions()}>Refresh</Button>
      </div>

      {userSessions.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <MessageCircle className="h-8 w-8 text-zinc-500" />
              <p className="text-zinc-400 text-sm">No chat history found</p>
              <Button 
                variant="default" 
                size="sm"
                className="mt-1"
                onClick={onNewChat}
              >
                Start a new chat <Plus className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {userSessions.map((session) => (
            <Card 
              key={session.id}
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
              onClick={() => handleLoadSession(session.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium line-clamp-1">{session.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={session.mentor_type === 'custom' ? 'destructive' : 'outline'} className="text-xs px-1 py-0">
                        {session.mentor_type === 'custom' ? 'Custom' : 'Template'}
                      </Badge>
                      <p className="text-xs text-zinc-400 line-clamp-1">
                        ID: {session.mentor_id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSession(session.id);
                    }}
                  >
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            className="bg-zinc-900 border-zinc-800 border-dashed flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors"
            onClick={onNewChat}
          >
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4 text-emerald-500" />
                <p className="text-sm text-zinc-400">New chat</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatSessionsList;
