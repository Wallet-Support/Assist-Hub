import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AlertCircle, Send, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SupportChat: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    isTyping,
    hasHumanSupport,
    error,
    sendMessage,
    requestHumanSupport
  } = useChat();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage("");
    }
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
            Please sign in or create an account to access the support chat.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              className="bg-[#0052FF] hover:bg-[#0039B3]"
              asChild
            >
              <Link href="/login">Log In</Link>
            </Button>
            <Button 
              variant="outline"
              className="border-[#0052FF] text-[#0052FF] hover:bg-blue-50"
              asChild
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <Header />
      
      <div className="mx-auto max-w-4xl pt-20 p-4">
        <div className="rounded-xl bg-white shadow-xl">
          <div className="border-b p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {hasHumanSupport ? "Live Support Chat" : "AI Support Assistant"}
                </h1>
                <p className="text-sm text-neutral-500">Ask any question about our services</p>
              </div>
              
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-2">
                {error && error.includes("Connection") ? (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500">Reconnecting...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">Connected</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {/* Welcome message */}
            {messages.length === 0 && !isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-lg px-4 py-3 max-w-[80%] text-neutral-700">
                  <p>👋 Hello! I'm your Assist Hub AI assistant. How can I help you today?</p>
                </div>
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center">
                <div className="bg-neutral-100 rounded-lg px-4 py-3 text-neutral-700">
                  Loading conversation history...
                </div>
              </div>
            )}
            
            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-[#0052FF] text-white"
                      : message.role === "system"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.timestamp && (
                    <div className={`text-xs mt-1 ${
                      message.role === "user" ? "text-blue-200" : "text-neutral-400"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-lg px-4 py-3 text-neutral-700">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce delay-150"></div>
                    <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error message - only show persistent errors, not temporary connection issues */}
            {error && !error.includes("Connection") && !error.includes("Trying to reconnect") && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t p-4">
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
                disabled={!newMessage.trim() || isTyping}
                className="bg-[#0052FF] hover:bg-[#0039B3] disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            <div className="flex justify-between mt-3">
              <div className="text-xs text-neutral-500">
                <span className="inline-flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-1 ${
                    hasHumanSupport ? "bg-green-500" : "bg-blue-500"
                  }`}></span>
                  {hasHumanSupport ? "Human Support Active" : "AI Support Active"}
                </span>
              </div>
              {!hasHumanSupport && (
                <Button 
                  variant="link" 
                  className="text-xs text-[#0052FF] p-0 h-auto hover:text-[#0039B3]"
                  onClick={requestHumanSupport}
                >
                  Request Human Support
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupportChat;
