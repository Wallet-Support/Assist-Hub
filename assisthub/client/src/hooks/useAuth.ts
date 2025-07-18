import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

// Define possible admin status
interface AdminData {
  isAdmin: boolean;
}

export function useAuth() {
  const [location, setLocation] = useLocation();
  
  const { data: user, isLoading, error, isError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  
  const { data: adminData } = useQuery<AdminData>({
    queryKey: ["/api/auth/isAdmin"],
    enabled: !!user,
  });
  
  const isAdmin = adminData?.isAdmin || false;

  // Redirect to login page if not authenticated and got an error
  // But don't redirect if we're already on login or signup page
  useEffect(() => {
    const authPages = ['/login', '/signup', '/welcome'];
    
    if (isError && error && !authPages.includes(location)) {
      // Instead of redirecting to Replit auth, redirect to our login page
      setLocation("/login");
    }
  }, [isError, error, setLocation, location]);
  
  // Redirect to welcome page for first-time users
  useEffect(() => {
    // Only check for welcome screen if we're not already on login, signup, or welcome
    const welcomeRelatedPages = ['/login', '/signup', '/welcome'];
    
    if (!welcomeRelatedPages.includes(location)) {
      // If user exists and hasSeenWelcome is explicitly false, redirect to welcome
      // This check handles both undefined and false cases appropriately
      if (user && user.hasSeenWelcome === false) {
        console.log("Redirecting to welcome page - first time user");
        setLocation("/welcome");
      }
    }
  }, [user, setLocation, location]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin
  };
}
