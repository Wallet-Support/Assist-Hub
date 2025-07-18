import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";

type Message = {
  id?: number;
  content: string;
  role: "user" | "assistant" | "system" | "admin";
  timestamp?: string;
  isHumanSupport?: boolean;
};

type ChatOptions = {
  onNewMessage?: (message: Message) => void;
  onTypingChange?: (isTyping: boolean) => void;
  onError?: (error: string) => void;
};

export function useChat(options: ChatOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasHumanSupport, setHasHumanSupport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;

  // Load chat history
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    async function loadHistory() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "history" }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to load chat history");
        }
        
        const history = await response.json();
        setMessages(history);
      } catch (err) {
        console.error(err);
        setError("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadHistory();
  }, [isAuthenticated, user]);

  // Set up WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    function connect() {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log("WebSocket connected");
        setError(null); // Clear any connection errors
        reconnectAttempts.current = 0; // Reset reconnect attempts
        
        // Register with the server
        socket.send(JSON.stringify({
          type: 'register',
          userId: user.id
        }));
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            const newMessage = {
              content: data.content,
              role: data.role,
              timestamp: data.timestamp,
              isHumanSupport: data.isHumanSupport
            };
            setMessages(prev => [...prev, newMessage]);
            
            if (data.isHumanSupport) {
              setHasHumanSupport(true);
            }
            break;
            
          case 'typing':
            setIsTyping(data.isTyping);
            break;
            
          case 'system_message':
            const systemMsg = {
              content: data.content,
              role: "system",
              timestamp: data.timestamp
            };
            setMessages(prev => [...prev, systemMsg]);
            break;
            
          case 'error':
            setError(data.message);
            break;
        }
      };
      
      socket.onclose = (event) => {
        // Only attempt reconnection if this wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          console.log("WebSocket disconnected, attempting to reconnect...");
          reconnectAttempts.current += 1;
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 16000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError("Connection lost. Please refresh the page to reconnect.");
        }
      };
      
      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setError("Connection error. Trying to reconnect...");
        }
      };
    }
    
    connect();
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting"); // Use normal close code
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user?.id]); // Remove options from dependencies

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!isAuthenticated || !user || !content.trim()) return;
    
    try {
      // Add user message to local state
      const userMessage = {
        content,
        role: "user",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Prefer WebSocket if connected
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'user_message',
          userId: user.id,
          content
        }));
      } else {
        // Fallback to REST API
        setIsTyping(true);
        
        const response = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, action: "send" }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        
        const { assistantMessage } = await response.json();
        
        // Add AI response to messages
        const aiMessage = {
          content: assistantMessage.content,
          role: "assistant",
          timestamp: assistantMessage.createdAt
        };
        setMessages(prev => [...prev, aiMessage]);
        
        setIsTyping(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
      setIsTyping(false);
    }
  }, [isAuthenticated, user]);

  // Request human support
  const requestHumanSupport = useCallback(() => {
    if (!isAuthenticated || !user) return;
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'request_human',
        userId: user.id
      }));
      
      // Add system message
      const systemMessage = {
        content: "You have requested human support. A support agent will join the conversation shortly.",
        role: "system",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, systemMessage]);
      setHasHumanSupport(true);
    } else {
      setError("Connection error. Please try again.");
    }
  }, [isAuthenticated, user]);

  return {
    messages,
    isLoading,
    isTyping,
    hasHumanSupport,
    error,
    sendMessage,
    requestHumanSupport
  };
}
