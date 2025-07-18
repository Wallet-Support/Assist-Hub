import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { storage } from "./storage";
import { SignupRequest, LoginRequest } from "@shared/schema";

// Extend Express Request to include session user
declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      email: string | null;
      isAdmin: boolean | null;
      authType: string;
    };
  }
}

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

// Hash a password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify a password against a hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Handle user signup
export async function handleSignup(req: Request, res: Response) {
  try {
    const { email, password } = req.body as SignupRequest;
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Generate a unique ID for the user (like UUID)
    const userId = uuidv4();
    
    // Create the user
    const user = await storage.upsertUser({
      id: userId,
      email,
      password: hashedPassword,
      authType: "email",
      isAdmin: false,
    });
    
    // Don't return the password hash
    const { password: _, ...safeUser } = user;
    
    return res.status(201).json({
      message: "User created successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "An error occurred during signup" });
  }
}

// Handle user login
export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginRequest;
    
    // Get the user
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Verify the password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Store user in session
    if (req.session) {
      req.session.user = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin || false,
        authType: user.authType
      };
    }
    
    // Don't return the password hash
    const { password: _, ...safeUser } = user;
    
    return res.status(200).json({
      message: "Login successful",
      user: safeUser
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An error occurred during login" });
  }
}

// Handle user logout
export function handleLogout(req: Request, res: Response) {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    return res.status(200).json({ message: "Already logged out" });
  }
}

// Get current user information
export async function getCurrentUser(req: Request, res: Response) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = await storage.getUser(req.session.user.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Don't return the password hash
    const { password: _, ...safeUser } = user;
    
    return res.status(200).json(safeUser);
  } catch (error) {
    console.error("Error getting current user:", error);
    return res.status(500).json({ message: "An error occurred" });
  }
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Middleware to check if user is an admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}