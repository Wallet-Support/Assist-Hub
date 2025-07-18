import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title and meta description
document.title = "Assist Hub - AI-Powered Customer Support Platform";
const metaDescription = document.createElement('meta');
metaDescription.name = "description";
metaDescription.content = "Connect with our powerful AI-assisted support team for instant help with your questions about digital collectibles and cryptocurrency.";
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social media sharing
const ogTitle = document.createElement('meta');
ogTitle.setAttribute("property", "og:title");
ogTitle.content = "Assist Hub - AI-Powered Customer Support Platform";
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.setAttribute("property", "og:description");
ogDescription.content = "Get instant help with your cryptocurrency and NFT questions from our AI-powered support platform.";
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.setAttribute("property", "og:type");
ogType.content = "website";
document.head.appendChild(ogType);

createRoot(document.getElementById("root")!).render(<App />);
