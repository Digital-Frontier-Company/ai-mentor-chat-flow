
import { Message, UserPreferences, MentorType } from '@/contexts/MentorContext';
import { supabase } from "@/integrations/supabase/client";

// Define a function to build the messages for the API request
const buildMessages = (
  messages: Message[],
  userPreferences: UserPreferences,
  mentor: MentorType
) => {
  // Convert our app messages to the format expected by the API
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));

  // Return the conversation messages
  return formattedMessages;
};

// Function to simulate streaming (for development when API is not available)
export const simulateStreamingResponse = (
  message: string,
  onProgress: (text: string) => void,
  onComplete: () => void
) => {
  let charIndex = 0;
  const delay = 20; // Milliseconds between each character
  const text = message;

  const interval = setInterval(() => {
    if (charIndex < text.length) {
      onProgress(text.substring(0, charIndex + 1));
      charIndex++;
    } else {
      clearInterval(interval);
      onComplete();
    }
  }, delay);

  return () => clearInterval(interval); // Return a cleanup function
};

// Get mentor response using the edge function
export const getMentorResponse = async (
  userMessage: string,
  previousMessages: Message[],
  userPreferences: UserPreferences,
  mentor: MentorType,
  onProgress: (text: string) => void,
  onComplete: () => void
) => {
  try {
    // Format messages for the API
    const apiMessages = buildMessages(previousMessages, userPreferences, mentor);
    
    // Add the new user message
    apiMessages.push({
      role: 'user',
      content: userMessage
    });

    // Call our edge function
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        messages: apiMessages,
        userPreferences,
        mentorId: mentor.id,
      },
    });

    if (error) {
      console.error('Error calling edge function:', error);
      // Fall back to simulation if the API call fails
      return simulateStreamingResponse(
        `I'm sorry, I encountered an error while processing your request. ${error.message}`,
        onProgress,
        onComplete
      );
    }

    // Extract the AI response
    const aiResponse = data.choices[0].message.content;
    
    // Simulate streaming for now (in production, you would use a streaming API)
    return simulateStreamingResponse(aiResponse, onProgress, onComplete);
  } catch (error) {
    console.error('Error in getMentorResponse:', error);
    
    // Fall back to simulation
    return simulateStreamingResponse(
      "I'm sorry, I encountered an error while processing your request. Please try again later.",
      onProgress,
      onComplete
    );
  }
};

// Function to get a welcome message from the mentor
export const getWelcomeMessage = (mentor: MentorType, userPreferences: UserPreferences): string => {
  return `Hello ${userPreferences.name}! I'm your ${mentor.name}. I'm here to help you achieve your goal: "${userPreferences.goal}". Based on your ${userPreferences.experience} experience level, I'll tailor my guidance accordingly. What specific assistance do you need today?`;
};
