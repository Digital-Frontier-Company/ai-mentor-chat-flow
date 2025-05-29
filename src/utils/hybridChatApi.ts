
import { getMentorResponse } from './openaiApi';
import { sendMessageToN8n, streamMessageToN8n } from './n8nApi';
import { useN8nIntegration } from '@/config/n8nConfig';
import { MentorType, UserPreferences, Message } from '@/contexts/MentorContext';

export interface ChatApiOptions {
  forceEdgeFunction?: boolean;
  forceN8n?: boolean;
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
  const shouldUseN8n = options.forceN8n || (!options.forceEdgeFunction && useN8nIntegration());
  
  console.log('Hybrid chat routing:', {
    useN8n: shouldUseN8n,
    n8nEnabled: useN8nIntegration(),
    forceEdgeFunction: options.forceEdgeFunction,
    forceN8n: options.forceN8n,
  });

  if (shouldUseN8n) {
    try {
      console.log('Using n8n for chat response');
      return await streamMessageToN8n(
        message,
        messages,
        userPreferences,
        selectedMentor,
        onChunk,
        onComplete,
        sessionId,
        userId
      );
    } catch (error) {
      console.error('n8n failed, falling back to edge function:', error);
      
      // Fallback to edge function if n8n fails
      if (options.forceN8n) {
        throw error; // Don't fallback if explicitly forced to use n8n
      }
    }
  }

  // Use the existing Supabase Edge Function
  console.log('Using Supabase Edge Function for chat response');
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
