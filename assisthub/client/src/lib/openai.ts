import { apiRequest } from './queryClient';

// Interface for chat message
export interface Message {
  role: 'user' | 'assistant' | 'system' | 'admin';
  content: string;
}

// Interface for chat completion request
interface ChatCompletionRequest {
  messages: Message[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

// Interface for a simple text response
interface TextResponse {
  text: string;
}

/**
 * Generate a response using OpenAI's GPT model
 * @param messages The conversation history
 * @param stream Whether to stream the response
 * @returns A promise that resolves to the response text
 */
export async function generateResponse(
  messages: Message[], 
  stream = false
): Promise<Response> {
  try {
    const requestBody: ChatCompletionRequest = {
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 500
    };

    // Use the OpenAI API via the integration endpoint
    return await apiRequest(
      'POST',
      '/integrations/chat-gpt/conversationgpt4',
      requestBody
    );
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Utility function to handle streaming responses from OpenAI
 * @param response The fetch response object
 * @param onChunk Callback for each chunk of text
 * @param onComplete Callback for when the response is complete
 */
export async function handleStreamingResponse(
  response: Response,
  onChunk: (text: string) => void,
  onComplete: (fullText: string) => void
): Promise<void> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete(fullText);
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(fullText);
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  }
}
