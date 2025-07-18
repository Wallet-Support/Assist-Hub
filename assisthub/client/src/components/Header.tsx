import React from "react";
import { Link, useLocation } from "wouter";
// Custom version of useAuth that doesn't redirect on auth pages
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

function useHeaderAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  
  const { data: adminData } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/isAdmin"],
    enabled: !!user,
  });
  
  const isAdmin = adminData?.isAdmin || false;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin
  };
};
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Menu } from "lucide-react";
import Logo from "./Logo";

const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useHeaderAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <div className="flex items-center">
          <Logo size={32} />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-6">
            <Link
              href="/"
              className={`px-3 py-2 text-sm font-medium ${
                location === "/" ? "text-[#0052FF]" : "text-neutral-500 hover:text-[#0052FF]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/support"
              className={`px-3 py-2 text-sm font-medium ${
                location === "/support" ? "text-[#0052FF]" : "text-neutral-500 hover:text-[#0052FF]"
              }`}
            >
              Support
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 text-sm font-medium ${
                  location === "/admin" ? "text-[#0052FF]" : "text-neutral-500 hover:text-[#0052FF]"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center text-neutral-600 hover:text-[#0052FF]">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(user?.firstName || undefined)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {user?.firstName || user?.email || "User"}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    // Fallback to Replit auth logout
                    window.location.href = "/api/logout";
                  }
                }}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === "/" ? "text-[#0052FF]" : "text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/support"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === "/support" ? "text-[#0052FF]" : "text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === "/admin" ? "text-[#0052FF]" : "text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    // Fallback to Replit auth logout
                    window.location.href = "/api/logout";
                  }
                }}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-500 hover:text-[#0052FF] hover:bg-neutral-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
