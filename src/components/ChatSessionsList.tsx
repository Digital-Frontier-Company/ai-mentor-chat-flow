
import React from 'react';
import { useMentor } from '@/contexts/MentorContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ChatSessionsListProps {
  onNewChat: () => void;
}

const ChatSessionsList: React.FC<ChatSessionsListProps> = ({ onNewChat }) => {
  const { userSessions, loadChatSession, refreshUserSessions } = useMentor();
  const { toast } = useToast();

  const handleLoadSession = async (sessionId: string) => {
    const success = await loadChatSession(sessionId);
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to load the chat session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Chat History</h2>
        <Button variant="outline" size="sm" onClick={() => refreshUserSessions()}>Refresh</Button>
      </div>

      {userSessions.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <MessageCircle className="h-10 w-10 text-zinc-500" />
              <p className="text-zinc-400">No chat history found</p>
              <Button 
                variant="default" 
                className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-900"
                onClick={onNewChat}
              >
                Start a new chat <Plus className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userSessions.map((session) => (
            <Card 
              key={session.id}
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
              onClick={() => handleLoadSession(session.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1">{session.name}</h3>
                    <p className="text-xs text-zinc-400">
                      Mentor ID: {session.mentor_id}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSession(session.id);
                    }}
                  >
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Card 
            className="bg-zinc-900 border-zinc-800 border-dashed flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors"
            onClick={onNewChat}
          >
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-10 w-10"
                >
                  <Plus className="h-5 w-5" />
                </Button>
                <p className="text-sm text-zinc-400">Start a new chat</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatSessionsList;
