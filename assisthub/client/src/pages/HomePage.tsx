import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WalletInterface from "@/components/WalletInterface";
import { Bot, Headset, BarChart3, ArrowRight, UserCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [countries, setCountries] = useState(0);
  const [users, setUsers] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [founded, setFounded] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (countries < 100) setCountries((prev) => Math.min(prev + 2, 100));
      if (users < 108) setUsers((prev) => Math.min(prev + 2, 108));
      if (sessions < 130) setSessions((prev) => Math.min(prev + 2, 130));
      if (founded < 2012) setFounded((prev) => Math.min(prev + 40, 2012));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Auth Status (only visible when logged in) */}
      {isAuthenticated && user && (
        <div className="bg-green-50 py-2 px-4 text-center">
          <div className="flex justify-center items-center">
            <span className="text-green-600">
              <UserCircle2 className="h-4 w-4 inline-block mr-1" />
              Logged in as: {user.firstName || user.email || "User"}
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
              Welcome to Assist Hub
            </h1>
            <p className="mt-6 text-xl text-gray-600">
              Your trusted partner in navigating the world of digital
              collectibles
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-[#0052FF] hover:bg-[#0039B3] px-6 py-6 text-lg"
                asChild
              >
                <Link href={isAuthenticated ? "/support" : "/login"}>
                  {isAuthenticated ? "Get Started" : "Log In to Get Started"}
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button
                  className="bg-white text-[#0052FF] border-[#0052FF] hover:bg-blue-50 px-6 py-6 text-lg"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              )}
              <Button
                variant="outline"
                className="border-neutral-300 hover:bg-neutral-100 text-neutral-700 px-6 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#0052FF] text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-4 gap-8 px-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{countries}+</div>
            <div className="mt-2">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{users}M+</div>
            <div className="mt-2">Verified Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">${sessions}B+</div>
            <div className="mt-2">Assets</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{founded}</div>
            <div className="mt-2">Founded</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-700">Powerful Features</h2>
            <p className="text-neutral-500 mt-3">Everything you need for exceptional customer support</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="text-[#0052FF] mb-4 text-2xl">
                <Bot size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-700">AI-Powered Support</h3>
              <p className="text-neutral-500">Intelligent responses powered by advanced AI to resolve customer queries instantly</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="text-[#0052FF] mb-4 text-2xl">
                <Headset size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-700">Live Agent Handoff</h3>
              <p className="text-neutral-500">Seamless transition to human agents when complex issues require personal attention</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="text-[#0052FF] mb-4 text-2xl">
                <BarChart3 size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-neutral-700">Advanced Analytics</h3>
              <p className="text-neutral-500">Comprehensive insights and metrics to continually improve support quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Section */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Assist Hub
              </h2>
              <p className="mb-6 text-lg text-gray-600">
                Your comprehensive support platform for crypto and digital assets. 
                Get instant AI assistance and seamless human support when you need it.
              </p>
              <Button
                className="bg-[#0052FF] hover:bg-[#0039B3]"
              >
                Download Now
              </Button>
            </div>
            <div className="flex justify-center">
              <WalletInterface className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 bg-[#0052FF] rounded-none text-white my-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Customers Say</h2>
          <div className="italic text-xl mb-6">"The AI support system has transformed how we handle customer queries. Response times have decreased by 80%, and customer satisfaction is at an all-time high."</div>
          <div className="font-semibold">Sarah Johnson, Support Director</div>
          <div className="text-blue-200">TechCorp Inc.</div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-neutral-700 mb-4">Ready to transform your support experience?</h2>
          <p className="text-neutral-500 mb-8 max-w-2xl mx-auto">Join thousands of companies providing exceptional customer service through our platform.</p>
          <Button 
            className="bg-[#0052FF] hover:bg-[#0039B3] px-8 py-6 text-lg"
            asChild
          >
            <Link href={isAuthenticated ? "/support" : "/login"}>
              {isAuthenticated ? "Go to Support" : "Log In to Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          {!isAuthenticated && (
            <Button 
              className="bg-white text-[#0052FF] border-[#0052FF] hover:bg-blue-50 px-8 py-6 text-lg ml-4"
              asChild
            >
              <Link href="/signup">
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
