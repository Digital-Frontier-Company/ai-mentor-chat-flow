
import { UserPreferences, MentorType, Message } from '@/contexts/MentorContext';
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

  console.log("Starting to simulate streaming...");
  
  const interval = setInterval(() => {
    if (charIndex < text.length) {
      onProgress(text.substring(0, charIndex + 1));
      charIndex++;
    } else {
      clearInterval(interval);
      console.log("Simulated streaming complete");
      onComplete();
    }
  }, delay);

  return () => clearInterval(interval); // Return a cleanup function
};

// Parse the SSE data from OpenAI
const parseOpenAIStreamData = (data: string) => {
  // Handle the different message formats
  if (data === '[DONE]') {
    return { done: true };
  }

  try {
    const json = JSON.parse(data);
    const content = json.choices?.[0]?.delta?.content || '';
    const done = json.choices?.[0]?.finish_reason === 'stop';
    return { content, done };
  } catch (e) {
    console.error('Error parsing SSE data:', e);
    return { content: '', done: false };
  }
};

// Get mentor response using the edge function with true streaming
export const getMentorResponse = async (
  userMessage: string,
  previousMessages: Message[],
  userPreferences: UserPreferences,
  mentor: MentorType,
  onProgress: (text: string) => void,
  onComplete: (sessionId?: string) => void,
  chatSessionId?: string | null
) => {
  try {
    console.log("Starting getMentorResponse...");
    console.log("Message received:", userMessage);
    
    // Format messages for the API
    const apiMessages = buildMessages(previousMessages, userPreferences, mentor);
    
    // Add the new user message
    apiMessages.push({
      role: 'user',
      content: userMessage
    });

    // Get the current user's session
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    // Get the Supabase project URL for functions
    const functionUrl = "https://bapditcjlxctrisoixpg.supabase.co/functions/v1/chat-with-mentor";
    
    // Get current session token
    const accessToken = sessionData?.session?.access_token || '';

    console.log("Sending chat request to edge function:", {
      messages: apiMessages.length,
      mentorId: mentor.id,
      userId: user?.id,
      chatSessionId,
      userPreferences
    });

    // Call our edge function with streaming enabled
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        messages: apiMessages,
        userPreferences,
        mentorId: mentor.id,
        userId: user?.id,
        chatSessionId,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from edge function:", response.status, errorText);
      throw new Error(`Error from edge function (${response.status}): ${errorText}`);
    }

    // Extract the chat session ID from headers if available
    const responseChatSessionId = response.headers.get('X-Chat-Session-Id');
    if (responseChatSessionId) {
      console.log("Received chat session ID from response:", responseChatSessionId);
    }

    // Check if we got a streaming response
    const contentType = response.headers.get('Content-Type') || '';
    
    if (contentType.includes('text/event-stream')) {
      console.log("Processing streaming response...");
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let isStreamCancelled = false;

      if (!reader) {
        throw new Error('Stream reader not available');
      }

      // Process the stream
      const processStream = async () => {
        try {
          while (true) {
            if (isStreamCancelled) {
              console.log("Stream cancelled by user");
              break;
            }
            
            const { done, value } = await reader.read();
            
            if (done) {
              console.log("Stream completed, final text length:", fullText.length);
              console.log("Calling onComplete with session ID:", responseChatSessionId);
              onComplete(responseChatSessionId || undefined);
              break;
            }
            
            // Decode the chunk and process the events
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split('\n')
              .filter(line => line.trim().startsWith('data: '));

            for (const line of lines) {
              const data = line.replace(/^data: /, '').trim();
              
              if (data === '[DONE]') {
                console.log("Stream marked as done via [DONE], final text length:", fullText.length);
                console.log("Calling onComplete with session ID:", responseChatSessionId);
                onComplete(responseChatSessionId || undefined);
                return; // Exit the function completely
              }
              
              const { content, done: lineIsDone } = parseOpenAIStreamData(data);
              
              if (content) {
                fullText += content;
                onProgress(fullText); // Always pass the full accumulated text
              }
              
              if (lineIsDone) {
                console.log("Stream marked as done via finish_reason, final text length:", fullText.length);
                console.log("Calling onComplete with session ID:", responseChatSessionId);
                onComplete(responseChatSessionId || undefined);
                return; // Exit the function completely
              }
            }
          }
        } catch (error) {
          if (!isStreamCancelled) {
            console.error('Error processing stream:', error);
            // Still call onComplete even if there's an error, but with whatever we accumulated
            onComplete(responseChatSessionId || undefined);
          }
        }
      };

      // Start processing the stream
      processStream();
      
      // Return a cleanup function
      return () => {
        console.log("Cancelling stream");
        isStreamCancelled = true;
        reader.cancel('User cancelled the stream').catch(console.error);
      };
    } else {
      // Handle non-streaming response (fallback)
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Extract the AI response
      const aiResponse = data.choices?.[0]?.message?.content || data.response || "No response received";
      const sessionId = data.sessionId || responseChatSessionId;
      
      console.log("Received non-streaming response, session ID:", sessionId);
      console.log("Message received:", aiResponse.substring(0, 50) + "...");
      
      // Fall back to simulated streaming
      return simulateStreamingResponse(
        aiResponse, 
        onProgress, 
        () => {
          console.log("Simulated streaming complete, calling onComplete with session ID:", sessionId);
          onComplete(sessionId);
        }
      );
    }
  } catch (error) {
    console.error('Error in getMentorResponse:', error);
    
    // Fall back to simulation with error message
    console.log("Error occurred, falling back to error message");
    return simulateStreamingResponse(
      "I'm sorry, I encountered an error while processing your request. Please try again later.",
      onProgress,
      onComplete
    );
  }
};

// Function to get a welcome message from the mentor
export const getWelcomeMessage = (mentor: MentorType, userPreferences: UserPreferences): string => {
  const mentorName = mentor.name.replace('Template', '').trim();
  return `Hello ${userPreferences.name || 'there'}! I'm your ${mentorName} mentor. I'm here to help you achieve your goal: "${userPreferences.goal || 'learning'}". Based on your ${userPreferences.experience} experience level, I'll tailor my guidance accordingly. What specific assistance do you need today?`;
};
