import { users, messages, chatSessions, type User, type UpsertUser, type Message, type InsertMessage, type ChatSession, type InsertChatSession } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Message operations
  getMessages(userId: string, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Chat session operations
  getChatSession(userId: string): Promise<ChatSession | undefined>;
  getActiveChatSessions(): Promise<(ChatSession & { user: User, messages: Message[] })[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession>;
  endChatSession(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }

  // Message operations
  async getMessages(userId: string, limit = 100): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.createdAt)
      .limit(limit);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    // Update last message timestamp for the chat session
    await db
      .update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.userId, message.userId));
      
    return newMessage;
  }

  // Chat session operations
  async getChatSession(userId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.userId, userId),
          eq(chatSessions.isActive, true)
        )
      );
    return session;
  }

  async getActiveChatSessions(): Promise<(ChatSession & { user: User, messages: Message[] })[]> {
    const activeSessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.isActive, true))
      .orderBy(desc(chatSessions.lastMessageAt));

    const result = [];
    
    for (const session of activeSessions) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId));
        
      const userMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, session.userId))
        .orderBy(messages.createdAt);
        
      result.push({
        ...session,
        user,
        messages: userMessages
      });
    }
    
    return result;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    // First check if there's already an active session for this user
    const existingSession = await this.getChatSession(session.userId);
    
    if (existingSession) {
      return existingSession;
    }
    
    const [newSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
      
    return newSession;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.id, id))
      .returning();
      
    return updatedSession;
  }

  async endChatSession(userId: string): Promise<void> {
    await db
      .update(chatSessions)
      .set({ 
        isActive: false,
        endedAt: new Date()
      })
      .where(
        and(
          eq(chatSessions.userId, userId),
          eq(chatSessions.isActive, true)
        )
      );
  }
}

export const storage = new DatabaseStorage();
