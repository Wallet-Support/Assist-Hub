import { useEffect, useRef, useState, useCallback } from "react";

type AdminMessage = {
  type: string;
  userId?: string;
  content?: string;
  role?: string;
  timestamp?: string;
  sessions?: any[];
};

export function useAdminWebSocket() {
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up WebSocket connection for admin
  useEffect(() => {
    function connect(userId: string) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.onopen = () => {
        console.log("Admin WebSocket connected");
        setIsConnected(true);
        setError(null);
        
        // Register as admin
        socket.send(JSON.stringify({
          type: 'register',
          userId,
          isAdmin: true
        }));
      };
      
      socket.onmessage = (event) => {
        const data: AdminMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'active_sessions':
            if (data.sessions) {
              setActiveSessions(data.sessions);
            }
            break;
            
          case 'new_message':
            if (data.userId) {
              // Update the session with new message
              setActiveSessions(prev => prev.map(session => {
                if (session.userId === data.userId) {
                  return {
                    ...session,
                    messages: [
                      ...session.messages,
                      {
                        content: data.content,
                        role: data.role,
                        timestamp: data.timestamp
                      }
                    ],
                    lastMessageAt: data.timestamp
                  };
                }
                return session;
              }));
            }
            break;
            
          case 'human_support_request':
            if (data.userId) {
              // Update the session to show human support is requested
              setActiveSessions(prev => prev.map(session => {
                if (session.userId === data.userId) {
                  return {
                    ...session,
                    hasHumanSupport: true,
                    lastMessageAt: data.timestamp
                  };
                }
                return session;
              }));
            }
            break;
            
          case 'error':
            setError(data.content || "An error occurred");
            break;
        }
      };
      
      socket.onclose = () => {
        console.log("Admin WebSocket disconnected, attempting to reconnect...");
        setIsConnected(false);
        
        // Try to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => connect(userId), 3000);
      };
      
      socket.onerror = (err) => {
        console.error("Admin WebSocket error:", err);
        setError("Connection error. Trying to reconnect...");
        setIsConnected(false);
      };
    }
    
    // Get user ID from authenticated user
    fetch("/api/auth/user")
      .then(res => res.json())
      .then(user => {
        if (user && user.id) {
          connect(user.id);
        }
      })
      .catch(err => {
        console.error("Failed to get user:", err);
        setError("Authentication error");
      });
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Load active sessions through REST API as backup
  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await fetch("/api/admin/sessions");
        
        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }
        
        const sessions = await response.json();
        setActiveSessions(sessions);
      } catch (err) {
        console.error(err);
        setError("Failed to load active sessions");
      }
    }
    
    loadSessions();
  }, []);

  // Send admin message function
  const sendAdminMessage = useCallback(async (userId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      // Prefer WebSocket if connected
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'admin_message',
          adminId: userId,
          userId,
          content
        }));
        
        // Update local state
        setActiveSessions(prev => prev.map(session => {
          if (session.userId === userId) {
            return {
              ...session,
              messages: [
                ...session.messages,
                {
                  content,
                  role: "admin",
                  timestamp: new Date().toISOString()
                }
              ],
              lastMessageAt: new Date().toISOString()
            };
          }
          return session;
        }));
      } else {
        // Fallback to REST API
        const response = await fetch("/api/admin/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, message: content }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        
        // Reload sessions to get updated state
        const sessionsResponse = await fetch("/api/admin/sessions");
        
        if (sessionsResponse.ok) {
          const sessions = await sessionsResponse.json();
          setActiveSessions(sessions);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
    }
  }, []);

  return {
    activeSessions,
    isConnected,
    error,
    sendAdminMessage
  };
}
