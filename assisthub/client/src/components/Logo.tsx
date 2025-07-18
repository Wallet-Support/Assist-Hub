import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "default" | "white";
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "", variant = "default" }) => {
  const textColor = variant === "white" ? "text-white" : "text-gray-800";
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0052FF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0039B3', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Circle background */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="url(#logoGradient)"
          stroke="#0028A0"
          strokeWidth="2"
        />
        
        {/* Letter A */}
        <path
          d="M30 75 L50 25 L70 75 M37 60 L63 60"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className={`text-xl font-bold ${textColor}`}>Assist Hub</span>
    </div>
  );
};

export default Logo;