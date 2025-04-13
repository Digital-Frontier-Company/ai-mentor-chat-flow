
import { Message, UserPreferences, MentorType } from '@/contexts/MentorContext';

// Define a function to build the messages for the API request
const buildMessages = (
  messages: Message[],
  userPreferences: UserPreferences,
  mentor: MentorType
) => {
  // Create the system message with the mentor's prompt and user preferences
  const systemMessage = {
    role: 'system',
    content: `${mentor.systemPrompt}\n\nUser Information:\n- Name: ${userPreferences.name}\n- Goal: ${userPreferences.goal}\n- Experience Level: ${userPreferences.experience}\n\nProvide personalized, specific advice and maintain a supportive, encouraging tone. Ask follow-up questions when needed.`
  };

  // Convert our app messages to the format expected by the API
  const formattedMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content
  }));

  // Return an array with the system message first, followed by the conversation
  return [systemMessage, ...formattedMessages];
};

// Function to simulate streaming (will be replaced with actual API call later)
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

// For now, we'll simulate an API response
// Note: In a real implementation, this would call the OpenAI API
export const getMentorResponse = async (
  userMessage: string,
  previousMessages: Message[],
  userPreferences: UserPreferences,
  mentor: MentorType,
  onProgress: (text: string) => void,
  onComplete: () => void
) => {
  // In a real implementation, we would make an API call like this:
  // const apiMessages = buildMessages(previousMessages, userPreferences, mentor);
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${apiKey}`
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4o',
  //     messages: apiMessages,
  //     stream: true,
  //   }),
  // });

  // For now, simulate a response based on the mentor type and user message
  let simulatedResponse = '';
  
  if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
    simulatedResponse = `Hi ${userPreferences.name}! I'm your ${mentor.name.replace(' Mentor', '').replace(' Coach', '').replace(' Advisor', '')} guide. It's great to meet you. I understand your goal is to ${userPreferences.goal}. That's an excellent objective! With your ${userPreferences.experience} experience level, we can work together to develop strategies tailored to your needs. What specific aspect of ${mentor.name.toLowerCase().replace(' mentor', '').replace(' coach', '').replace(' advisor', '')} would you like to focus on first?`;
  } else if (userMessage.toLowerCase().includes('goal') || userMessage.toLowerCase().includes('help')) {
    simulatedResponse = `Absolutely! Based on your goal to ${userPreferences.goal}, I think we should approach this step by step. Given your ${userPreferences.experience} experience level, we'll need to focus on building a solid foundation first. Let me know what challenges you're facing right now, and we can develop a personalized plan to help you overcome them.`;
  } else if (userMessage.toLowerCase().includes('advice') || userMessage.toLowerCase().includes('tip')) {
    simulatedResponse = `Here's my advice tailored to your situation: since you want to ${userPreferences.goal} and you're at a ${userPreferences.experience} experience level, I recommend starting with fundamentals before advancing to more complex strategies. Would you like me to elaborate on any specific aspect of this approach?`;
  } else if (userMessage.toLowerCase().includes('thank')) {
    simulatedResponse = `You're very welcome, ${userPreferences.name}! I'm here to support you on your journey to ${userPreferences.goal}. Feel free to come back anytime you need guidance or want to discuss your progress. Remember, consistent small steps lead to significant achievements!`;
  } else {
    simulatedResponse = `That's an interesting question. As your ${mentor.name}, I'd suggest considering a few key factors related to ${userPreferences.goal}. Given your ${userPreferences.experience} experience level, it's important to balance ambition with realistic expectations. Would you like me to provide more specific guidance on this topic?`;
  }

  // Simulate streaming
  return simulateStreamingResponse(simulatedResponse, onProgress, onComplete);
};

// Function to get a welcome message from the mentor
export const getWelcomeMessage = (mentor: MentorType, userPreferences: UserPreferences): string => {
  return `Hello ${userPreferences.name}! I'm your ${mentor.name}. I'm here to help you achieve your goal: "${userPreferences.goal}". Based on your ${userPreferences.experience} experience level, I'll tailor my guidance accordingly. What specific assistance do you need today?`;
};
