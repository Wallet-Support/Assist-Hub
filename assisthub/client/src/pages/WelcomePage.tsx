import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle, MessageSquare, BadgeHelp, Zap } from "lucide-react";

const WelcomePage: React.FC = () => {
  const { user, isLoading: isUserLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const totalSteps = 3;
  
  // Handle redirects for users who have already seen welcome
  useEffect(() => {
    if (!isUserLoading && user && user.hasSeenWelcome) {
      console.log("User has already seen welcome, redirecting to support");
      setLocation("/support");
    }
  }, [user, isUserLoading, setLocation]);
  
  const handleCompleteWelcome = async () => {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/user/complete-welcome", {});
      
      // Invalidate the user query to update the hasSeenWelcome field
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome complete!",
        description: "You're all set to start using Assist Hub.",
        variant: "default"
      });
      
      // Redirect to the support page
      setLocation("/support");
    } catch (error) {
      console.error("Failed to complete welcome:", error);
      toast({
        title: "Error",
        description: "Failed to complete welcome process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleCompleteWelcome();
    }
  };
  
  const handleSkip = () => {
    handleCompleteWelcome();
  };
  
  // Render welcome content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-center">Welcome to Assist Hub!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Hello{user?.firstName ? `, ${user.firstName}` : ""}! We're excited to have you here.
                Let's get you started with our support platform.
              </p>
              <p className="text-gray-600">
                Assist Hub combines powerful AI assistance with human support 
                to give you the best customer service experience possible.
              </p>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <BadgeHelp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-center">AI-Powered Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Our advanced AI system can answer your questions instantly,
                24/7, without any wait times.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-left space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Type your question in the chat</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Get instant AI-powered responses</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Complex issues are automatically escalated to human agents</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-center">Let's Get Started!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You're all set to start using Assist Hub for your support needs.
              </p>
              <p className="text-gray-600">
                Click the button below to go to the support chat and ask your first question!
              </p>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };
  
  // Show a loading state when user data is being fetched
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <Header />
        
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
          <Card className="w-full max-w-xl shadow-lg p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded-full w-12 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </Card>
        </div>
        
        <Footer />
      </div>
    );
  }
  
  // If no user is found, show an error state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
        <Header />
        
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
          <Card className="w-full max-w-xl shadow-lg p-8 text-center">
            <CardHeader>
              <CardTitle className="text-2xl text-center">User Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Please log in to access the welcome screen.
              </p>
              <Button 
                onClick={() => setLocation("/login")}
                className="bg-[#0052FF] hover:bg-[#0039B3]"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Main welcome content
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <Header />
      
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-xl shadow-lg">
          {renderStepContent()}
          
          <CardFooter className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div 
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full ${
                    step > index 
                      ? "bg-blue-600" 
                      : step === index + 1 
                        ? "bg-blue-400" 
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-4">
              {step < totalSteps && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  Skip Tour
                </Button>
              )}
              <Button
                onClick={handleNextStep}
                className="bg-[#0052FF] hover:bg-[#0039B3]"
                disabled={loading}
              >
                {step < totalSteps ? "Next" : "Complete"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default WelcomePage;