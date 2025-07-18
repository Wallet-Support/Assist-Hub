import { storage } from "./storage";

// System message that defines the AI assistant's role
const SYSTEM_MESSAGE = `
You are a helpful and professional customer support assistant for a cryptocurrency platform focused on NFTs.
Your name is Assist Hub AI.

Reply in a friendly, professional, and helpful manner.
If you don't know the answer, say so clearly and offer to connect the user with a human agent.
Keep responses concise and focused on helping users with their crypto and NFT-related queries.
`;

// Check if OpenAI API key is available
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

// Function to generate AI response from the conversation history
export async function generateAIResponse(
  userId: string,
  userMessage: string,
): Promise<string> {
  try {
    // Get the conversation history for this user
    const messageHistory = await storage.getMessages(userId);
    
    // If OpenAI API key is available, use the SDK to generate a response
    if (hasOpenAIKey) {
      try {
        // Dynamic import to avoid importing when no API key is available
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Format messages for OpenAI API
        // Define a type that matches OpenAI's expected structure
        type OpenAIMessage = 
          | { role: "system"; content: string }
          | { role: "user"; content: string }
          | { role: "assistant"; content: string };
          
        const formattedMessages: OpenAIMessage[] = [
          { role: "system", content: SYSTEM_MESSAGE },
          // Include up to 10 past messages for context
          ...messageHistory.slice(-10).map(msg => {
            // Map roles to ones OpenAI accepts
            const role = msg.role === "admin" ? "assistant" : 
                        (msg.role === "system" || msg.role === "user" || msg.role === "assistant") ? 
                        msg.role : "user";
            
            return {
              role: role as "system" | "user" | "assistant",
              content: msg.content
            };
          })
        ];
        
        // Add the current user message
        formattedMessages.push({ 
          role: "user",
          content: userMessage 
        });
        
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 500,
        });

        // Extract and return the assistant's response
        return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again or contact human support.";
      } catch (apiError) {
        console.error("OpenAI API error:", apiError);
        return getFallbackResponse(userMessage);
      }
    } else {
      // No API key, use fallback
      console.warn("OpenAI API key not available, using fallback responses");
      return getFallbackResponse(userMessage);
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I apologize, but I'm experiencing technical difficulties. Please try again later or request human support.";
  }
}

// Provide fallback responses when OpenAI is not available
function getFallbackResponse(userMessage: string): string {
  const lowerCaseMessage = userMessage.toLowerCase();
  
  if (lowerCaseMessage.includes("hello") || lowerCaseMessage.includes("hi")) {
    return "Hello! Welcome to Assist Hub. How can I assist you today? (Note: For full AI support, an OpenAI API key is required)";
  } else if (lowerCaseMessage.includes("help")) {
    return "I'm here to help! Please let me know what specific assistance you need with our services. (Note: For full AI support, an OpenAI API key is required)";
  } else if (lowerCaseMessage.includes("human") || lowerCaseMessage.includes("agent") || lowerCaseMessage.includes("person")) {
    return "I'll connect you with a human support agent shortly. Please wait while I transfer your request. (Note: For full AI support, an OpenAI API key is required)";
  } else {
    return "Thank you for your message. Our AI assistant requires an OpenAI API key to provide personalized responses. In the meantime, please feel free to ask about our services, and I'll do my best to assist you.";
  }
}
