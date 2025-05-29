
import { N8N_CONFIG } from '@/config/n8nConfig';
import { MentorType, UserPreferences, Message } from '@/contexts/MentorContext';

export interface N8nChatPayload {
  action: 'sendMessage';
  sessionId: string;
  message: string;
  chatInput: string;
  metadata: {
    mentor: {
      id: string;
      name: string;
      description: string;
      category: string;
    };
    userPreferences: UserPreferences;
    conversationHistory: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
    userId?: string;
  };
}

export interface N8nResponse {
  output: string;
  sessionId: string;
  error?: string;
}

export const sendMessageToN8n = async (
  message: string,
  messages: Message[],
  userPreferences: UserPreferences,
  selectedMentor: MentorType,
  sessionId: string | null,
  userId?: string
): Promise<N8nResponse> => {
  const payload: N8nChatPayload = {
    action: 'sendMessage',
    sessionId: sessionId || `temp_${Date.now()}`,
    message,
    chatInput: message,
    metadata: {
      mentor: {
        id: selectedMentor.id,
        name: selectedMentor.name,
        description: selectedMentor.description,
        category: selectedMentor.category,
      },
      userPreferences,
      conversationHistory: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      userId,
    },
  };

  console.log('Sending message to n8n:', payload);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), N8N_CONFIG.timeout);

  try {
    const response = await fetch(N8N_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response formats from n8n
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      output: data.output || data.response || data.message || 'No response from n8n',
      sessionId: data.sessionId || sessionId || `temp_${Date.now()}`,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('n8n request timed out');
    }
    
    throw error;
  }
};

// Streaming version for future implementation
export const streamMessageToN8n = async (
  message: string,
  messages: Message[],
  userPreferences: UserPreferences,
  selectedMentor: MentorType,
  onChunk: (text: string) => void,
  onComplete: (sessionId: string) => void,
  sessionId: string | null,
  userId?: string
): Promise<() => void> => {
  // For now, use the regular API and simulate streaming
  try {
    const response = await sendMessageToN8n(
      message,
      messages,
      userPreferences,
      selectedMentor,
      sessionId,
      userId
    );

    // Simulate streaming by breaking the response into chunks
    const chunks = response.output.split(' ');
    let currentText = '';
    
    for (let i = 0; i < chunks.length; i++) {
      currentText += (i > 0 ? ' ' : '') + chunks[i];
      onChunk(currentText);
      
      // Add a small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    onComplete(response.sessionId);
  } catch (error) {
    throw error;
  }

  // Return cleanup function
  return () => {
    // No cleanup needed for simulated streaming
  };
};
