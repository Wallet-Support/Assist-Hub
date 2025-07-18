import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminWebSocket } from "@/lib/ws";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Info, Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { activeSessions, isConnected, error, sendAdminMessage } = useAdminWebSocket();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the selected session
  const selectedSession = activeSessions.find(
    session => session.user.id === selectedSessionId
  );
  
  // Select the first session by default if none is selected
  useEffect(() => {
    if (activeSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(activeSessions[0].user.id);
    }
  }, [activeSessions, selectedSessionId]);
  
  // Auto-scroll to bottom when messages change or session changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedSessionId) {
      sendAdminMessage(selectedSessionId, newMessage);
      setNewMessage("");
    }
  };
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Sign In Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            Please sign in to access the admin dashboard.
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-[#0052FF] hover:bg-[#0039B3]"
              asChild
            >
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-6">Access Denied</h2>
            <p className="text-gray-600 mb-6 text-center">
              You do not have permission to access the admin dashboard.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <Header />
      
      <div className="mx-auto max-w-7xl pt-20 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Sessions Panel */}
          <div className="bg-white rounded-xl shadow-xl p-4">
            <h2 className="text-xl font-bold mb-4">Active Sessions</h2>
            <div className="space-y-2">
              {activeSessions.length === 0 ? (
                <p className="text-gray-500">No active sessions</p>
              ) : (
                activeSessions.map((session) => (
                  <button
                    key={session.user.id}
                    onClick={() => setSelectedSessionId(session.user.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedSessionId === session.user.id
                        ? "bg-[#0052FF] text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {getInitials(session.user.firstName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium">
                          {session.user.email}
                        </div>
                        <div className="text-sm opacity-80">
                          {new Date(session.lastMessageAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Conversation Panel */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-xl">
            {selectedSession ? (
              <>
                <div className="border-b p-4">
                  <h2 className="text-xl font-bold">
                    Chat with {selectedSession.user.email}
                  </h2>
                </div>
                
                <div className="h-[600px] overflow-y-auto p-4">
                  {selectedSession.messages.map((message: any, index: number) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${
                        message.role === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "admin"
                            ? "bg-[#0052FF] text-white"
                            : message.role === "system"
                            ? "bg-yellow-100 text-yellow-800"
                            : message.role === "assistant"
                            ? "bg-gray-100 text-gray-800 italic"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div>
                          {message.role === "assistant" ? (
                            <>Assist Hub AI: {message.content}</>
                          ) : (
                            message.content
                          )}
                        </div>
                        <div className={`text-xs ${
                          message.role === "admin" ? "text-blue-200" : "text-gray-500"
                        } mt-1`}>
                          {new Date(message.createdAt || message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <form onSubmit={handleSubmit} className="border-t p-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border-neutral-300 focus:border-[#0052FF] focus:ring-[#0052FF]"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-[#0052FF] hover:bg-[#0039B3] disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-neutral-500">
                    <span className="mr-4">
                      Support Agent: {user?.firstName || user?.email}
                    </span>
                    <span className={`flex items-center ${isConnected ? 'text-green-500' : 'text-yellow-500'}`}>
                      <span className={`h-2 w-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      {isConnected ? 'Connected' : 'Reconnecting...'}
                    </span>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-4 text-gray-500">
                {activeSessions.length === 0 ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <Info className="h-12 w-12 mx-auto text-gray-400" />
                    </div>
                    <p className="text-lg">No active support sessions</p>
                    <p className="text-sm mt-2">When users start a chat, they will appear here</p>
                  </div>
                ) : (
                  "Select a session to view the conversation"
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
