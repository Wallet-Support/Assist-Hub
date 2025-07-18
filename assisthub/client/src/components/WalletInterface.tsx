import React from "react";

interface WalletInterfaceProps {
  className?: string;
}

const WalletInterface: React.FC<WalletInterfaceProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        width="400"
        height="300"
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-md mx-auto"
      >
        <defs>
          <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#0052FF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0039B3', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Phone body */}
        <rect 
          x="50" 
          y="20" 
          width="300" 
          height="260" 
          rx="25" 
          ry="25" 
          fill="url(#phoneGradient)"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        
        {/* Screen */}
        <rect 
          x="70" 
          y="50" 
          width="260" 
          height="200" 
          rx="15" 
          ry="15" 
          fill="url(#screenGradient)"
        />
        
        {/* Status bar */}
        <rect x="85" y="65" width="230" height="15" fill="#334155" rx="7" />
        <text x="95" y="75" fill="#94a3b8" fontSize="8" fontFamily="Arial, sans-serif">9:41</text>
        <circle cx="295" cy="72" r="3" fill="#10b981" />
        <rect x="305" y="69" width="8" height="6" fill="#94a3b8" rx="1" />
        
        {/* Header */}
        <text x="200" y="105" fill="#f1f5f9" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">Assist Hub</text>
        
        {/* Balance card */}
        <rect 
          x="90" 
          y="120" 
          width="220" 
          height="80" 
          rx="12" 
          ry="12" 
          fill="url(#cardGradient)"
        />
        
        {/* Balance text */}
        <text x="200" y="140" fill="white" fontSize="10" textAnchor="middle" fontFamily="Arial, sans-serif">Total Balance</text>
        <text x="200" y="160" fill="white" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">$2,847.32</text>
        <text x="200" y="180" fill="#a3d0ff" fontSize="10" textAnchor="middle" fontFamily="Arial, sans-serif">+12.5% this month</text>
        
        {/* Crypto icons and values */}
        <circle cx="110" cy="225" r="12" fill="#f7931a" />
        <text x="110" y="230" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">₿</text>
        <text x="130" y="225" fill="#f1f5f9" fontSize="11" fontFamily="Arial, sans-serif">Bitcoin</text>
        <text x="130" y="235" fill="#94a3b8" fontSize="9" fontFamily="Arial, sans-serif">0.0425 BTC</text>
        <text x="280" y="230" fill="#f1f5f9" fontSize="11" textAnchor="end" fontFamily="Arial, sans-serif">$1,847.32</text>
        
        <circle cx="110" cy="255" r="12" fill="#627eea" />
        <text x="110" y="260" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">Ξ</text>
        <text x="130" y="255" fill="#f1f5f9" fontSize="11" fontFamily="Arial, sans-serif">Ethereum</text>
        <text x="130" y="265" fill="#94a3b8" fontSize="9" fontFamily="Arial, sans-serif">0.8234 ETH</text>
        <text x="280" y="260" fill="#f1f5f9" fontSize="11" textAnchor="end" fontFamily="Arial, sans-serif">$1,000.00</text>
        
        {/* Action buttons */}
        <rect x="90" y="280" width="45" height="25" rx="12" fill="#059669" />
        <text x="112" y="295" fill="white" fontSize="9" textAnchor="middle" fontFamily="Arial, sans-serif">Send</text>
        
        <rect x="145" y="280" width="45" height="25" rx="12" fill="#0052FF" />
        <text x="167" y="295" fill="white" fontSize="9" textAnchor="middle" fontFamily="Arial, sans-serif">Receive</text>
        
        <rect x="200" y="280" width="45" height="25" rx="12" fill="#7c3aed" />
        <text x="222" y="295" fill="white" fontSize="9" textAnchor="middle" fontFamily="Arial, sans-serif">Swap</text>
        
        <rect x="255" y="280" width="45" height="25" rx="12" fill="#dc2626" />
        <text x="277" y="295" fill="white" fontSize="9" textAnchor="middle" fontFamily="Arial, sans-serif">Buy</text>
        
        {/* Home indicator */}
        <rect x="180" y="290" width="40" height="3" rx="2" fill="#64748b" />
      </svg>
    </div>
  );
};

export default WalletInterface;