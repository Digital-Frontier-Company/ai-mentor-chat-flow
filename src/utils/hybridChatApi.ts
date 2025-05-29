
import { getMentorResponse } from './openaiApi';
import { MentorType, UserPreferences, Message } from '@/contexts/MentorContext';

export interface ChatApiOptions {
  forceEdgeFunction?: boolean;
}

export const sendHybridMessage = async (
  message: string,
  messages: Message[],
  userPreferences: UserPreferences,
  selectedMentor: MentorType,
  onChunk: (text: string) => void,
  onComplete: (sessionId: string) => void,
  sessionId: string | null,
  userId?: string,
  options: ChatApiOptions = {}
): Promise<() => void> => {
  console.log('Using Supabase Edge Function for chat response (n8n disabled)');
  
  // Always use the Supabase Edge Function for now (bypassing n8n)
  return await getMentorResponse(
    message,
    messages,
    userPreferences,
    selectedMentor,
    onChunk,
    onComplete,
    sessionId
  );
};
