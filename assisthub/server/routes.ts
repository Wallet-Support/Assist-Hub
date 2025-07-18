import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { setupWebsockets } from "./ws";
import { generateAIResponse } from "./openai";
import { handleSignup, handleLogin, handleLogout, getCurrentUser, requireAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSockets
  setupWebsockets(httpServer);
  
  // Development-only login route for testing
  if (process.env.NODE_ENV === 'development') {
    // Hidden login page - only accessible with a secret token
    const DEV_SECRET_TOKEN = 'dev-token-' + Date.now().toString().slice(-6);
    console.log("Development login token (keep secure!):", DEV_SECRET_TOKEN);
    console.log("Access dev login at:", `http://localhost:5000/dev-login?token=${DEV_SECRET_TOKEN}`);
    console.log("Access direct admin panel at:", `http://localhost:5000/dev-direct-admin`);
    
    // Direct admin access with token (for easier access to the admin dashboard)
    app.get('/dev-admin-login', (req: any, res: Response) => {
      const token = req.query.token;
      
      if (token !== DEV_SECRET_TOKEN) {
        return res.status(404).send('Page not found');
      }
      
      // Since we can't use req.login directly, create a special page with admin credentials
      res.send(`
        <html>
          <head>
            <title>Admin Dashboard Access</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              .info { margin: 20px 0; background: #f0f9ff; border: 1px solid #bae6fd; padding: 15px; border-radius: 4px; }
              .credentials { background: #f0fdf4; border: 1px solid #86efac; padding: 10px; margin: 10px 0; border-radius: 4px; }
              .warning { color: #b91c1c; }
              .button { display: inline-block; background: #0070f3; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <h1>Admin Dashboard Access</h1>
            <p class="warning">⚠️ For development testing only</p>
            
            <div class="info">
              <p>Admin credentials have been created in the database. You can access the admin features using these credentials:</p>
              
              <div class="credentials">
                <strong>Admin ID:</strong> admin-user-1<br>
                <strong>Email:</strong> admin@assisthub.com
              </div>
              
              <p>Access to the admin dashboard requires authentication. In a production environment, you would login through the normal authentication flow.</p>
              
              <a href="/admin" class="button">Go to Admin Dashboard</a>
            </div>
          </body>
        </html>
      `);
      
      // Create or update the admin user in the background
      storage.getUser('admin-user-1')
        .then(user => {
          if (!user) {
            return storage.upsertUser({
              id: 'admin-user-1',
              email: 'admin@assisthub.com',
              firstName: 'Admin',
              lastName: 'User',
              isAdmin: true,
            });
          }
          return user;
        })
        .catch(error => {
          console.error('Error ensuring admin user exists:', error);
        });
    });
    
    console.log("Direct admin access at:", `http://localhost:5000/dev-admin-login?token=${DEV_SECRET_TOKEN}`);
    
    app.get('/dev-login', (req: any, res: Response) => {
      // Check if the token is provided
      const token = req.query.token;
      
      if (token !== DEV_SECRET_TOKEN) {
        return res.status(404).send('Page not found');
      }
      
      res.send(`
        <html>
          <head>
            <title>Development Login</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              form { margin: 20px 0; }
              button { padding: 8px; margin: 10px 0; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; }
              .warning { color: #b91c1c; margin-bottom: 15px; }
            </style>
          </head>
          <body>
            <h1>Development Login</h1>
            <p class="warning">⚠️ This page is for development testing only</p>
            <form action="/dev-login?token=${DEV_SECRET_TOKEN}" method="post">
              <input type="hidden" name="token" value="${DEV_SECRET_TOKEN}">
              <button type="submit" name="loginType" value="user">Login as Regular User</button>
              <br>
              <button type="submit" name="loginType" value="admin">Login as Admin</button>
            </form>
          </body>
        </html>
      `);
    });

    app.post('/dev-login', async (req: any, res: Response) => {
      // Verify token again for security
      const token = req.query.token || req.body.token;
      
      if (token !== DEV_SECRET_TOKEN) {
        return res.status(404).send('Page not found');
      }
      
      const loginType = req.body.loginType || 'user';
      
      // Create a mock user session
      let userId = 'user-123';
      let isAdminUser = false;
      
      if (loginType === 'admin') {
        userId = 'admin-user-1';
        isAdminUser = true;
      }
      
      // Get or create the user
      let user = await storage.getUser(userId);
      
      if (!user) {
        user = await storage.upsertUser({
          id: userId,
          email: isAdminUser ? 'admin@assisthub.com' : 'user@example.com',
          firstName: isAdminUser ? 'Admin' : 'Test',
          lastName: isAdminUser ? 'User' : 'User',
          isAdmin: isAdminUser,
        });
      }
      
      // Set up the user session
      req.login({
        claims: {
          sub: userId,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName
        }
      }, () => {
        res.redirect('/');
      });
    });
  }
  
  // Set up authentication
  await setupAuth(app);

  // Email-based authentication routes
  app.post('/api/auth/signup', handleSignup);
  app.post('/api/auth/login', handleLogin);
  app.post('/api/auth/logout', handleLogout);
  
  // Get current user - will check both Replit auth and email auth
  app.get('/api/auth/user', async (req: any, res) => {
    // First check for email-based auth
    if (req.session?.user) {
      try {
        const user = await storage.getUser(req.session.user.id);
        if (user) {
          // Don't return the password hash
          const { password: _, ...safeUser } = user;
          return res.json(safeUser);
        }
      } catch (error) {
        console.error("Error fetching email auth user:", error);
      }
    }
    
    // Fall back to Replit auth
    if (req.isAuthenticated && req.isAuthenticated()) {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      } catch (error) {
        console.error("Error fetching Replit auth user:", error);
      }
    }
    
    // No valid authentication found
    return res.status(401).json({ message: "Unauthorized" });
  });
  
  // Debug route to check server status
  app.get('/api/debug', (req, res) => {
    console.log("Debug endpoint called");
    return res.json({ status: "ok", time: new Date().toISOString() });
  });
  
  // Check if user is admin - works with both auth methods
  app.get('/api/auth/isAdmin', async (req: any, res) => {
    // Check for email-based auth first
    if (req.session?.user) {
      return res.json({ isAdmin: req.session.user.isAdmin || false });
    }
    
    // Fall back to Replit auth
    if (req.isAuthenticated && req.isAuthenticated()) {
      try {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json({ isAdmin: user?.isAdmin || false });
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }
    
    // Not authenticated
    return res.status(401).json({ message: "Unauthorized" });
  });

  // Mark welcome screen as seen
  app.post('/api/user/complete-welcome', async (req: any, res) => {
    try {
      // Get user ID from either auth method
      let userId;
      
      // Check email auth first
      if (req.session?.user) {
        userId = req.session.user.id;
      } 
      // Then check Replit auth
      else if (req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Use upsertUser instead of updateUser to ensure compatibility
      await storage.upsertUser({
        ...user,
        hasSeenWelcome: true
      });
      
      // Update the session if using email auth
      if (req.session?.user) {
        req.session.user = {
          ...req.session.user,
          hasSeenWelcome: true
        };
      }
      
      console.log(`User ${userId} has completed welcome screen`);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error marking welcome as complete:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Chat endpoints - works with both auth methods
  app.post('/api/chat/messages', async (req: any, res) => {
    try {
      // Get user ID from either auth method
      let userId;
      
      // Check email auth first
      if (req.session?.user) {
        userId = req.session.user.id;
      } 
      // Then check Replit auth
      else if (req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { message, action = "send" } = req.body;
      
      if (action === "send" && message) {
        // Create a chat session if one doesn't exist
        let session = await storage.getChatSession(userId);
        if (!session) {
          session = await storage.createChatSession({
            userId,
            isActive: true,
            hasHumanSupport: false,
          });
        }
        
        // Save user message
        const userMessage = await storage.createMessage({
          userId,
          content: message,
          role: 'user',
        });
        
        // Check if this is REST API (not WebSocket) request - generate AI response
        if (!req.body.wsHandled) {
          // Generate AI response
          const aiResponse = await generateAIResponse(userId, message);
          
          // Save AI response
          const assistantMessage = await storage.createMessage({
            userId,
            content: aiResponse,
            role: 'assistant',
          });
          
          // Return both messages
          res.json({
            userMessage,
            assistantMessage
          });
        } else {
          // WebSocket is handling the response
          res.json({ success: true });
        }
      } else if (action === "history") {
        // Get chat history
        const messages = await storage.getMessages(userId);
        res.json(messages);
      } else {
        res.status(400).json({ message: "Invalid action" });
      }
    } catch (error) {
      console.error("Error handling chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });
  
  // Development direct admin access (bypass authentication for testing only)
  if (process.env.NODE_ENV === 'development') {
    app.get('/dev-direct-admin', async (req, res) => {
      try {
        const activeSessions = await storage.getActiveChatSessions();
        
        res.send(`
          <html>
            <head>
              <title>Admin Dashboard (Dev Mode)</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1, h2 { color: #333; }
                .warning { color: #b91c1c; background: #fee2e2; padding: 8px; border-radius: 4px; }
                .session { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 4px; }
                .message { margin: 5px 0 5px 20px; padding: 5px; background: white; border-radius: 4px; }
                .user { color: #1d4ed8; }
                .assistant { color: #047857; }
                .admin { color: #7e22ce; }
              </style>
            </head>
            <body>
              <h1>Admin Dashboard (Development Mode)</h1>
              <p class="warning">⚠️ This is a simplified admin view for development. In production, use the full React admin interface.</p>
              
              <h2>Active Chat Sessions (${activeSessions.length})</h2>
              
              ${activeSessions.map(session => `
                <div class="session">
                  <strong>User:</strong> ${session.user.email || session.userId} 
                  <br>
                  <strong>Started:</strong> ${session.createdAt ? new Date(session.createdAt).toLocaleString() : 'Unknown'}
                  <br>
                  <strong>Has Human Support:</strong> ${session.hasHumanSupport ? 'Yes' : 'No'}
                  
                  <h3>Messages:</h3>
                  ${session.messages.map(msg => `
                    <div class="message ${msg.role}">
                      <strong>${msg.role}:</strong> ${msg.content}
                      <small>${msg.createdAt ? `(${new Date(msg.createdAt).toLocaleTimeString()})` : ''}</small>
                    </div>
                  `).join('')}
                </div>
              `).join('')}
              
              ${activeSessions.length === 0 ? '<p>No active chat sessions</p>' : ''}
            </body>
          </html>
        `);
      } catch (error) {
        console.error("Error in dev admin page:", error);
        res.status(500).send('Error loading admin data');
      }
    });
  }

  // Admin endpoints - works with both auth methods
  app.post('/api/admin/messages', async (req: any, res) => {
    try {
      // Check if user is authenticated and is an admin
      let adminId;
      let isUserAdmin = false;
      
      // Check email auth first
      if (req.session?.user) {
        adminId = req.session.user.id;
        isUserAdmin = req.session.user.isAdmin === true;
      } 
      // Then check Replit auth
      else if (req.isAuthenticated && req.isAuthenticated()) {
        adminId = req.user.claims.sub;
        // Check if user is admin
        const adminUser = await storage.getUser(adminId);
        isUserAdmin = adminUser?.isAdmin === true;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!isUserAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ message: "User ID and message are required" });
      }
      
      // Save the admin message
      const adminMessage = await storage.createMessage({
        userId,
        content: message,
        role: 'admin',
      });
      
      // Update the session to have human support
      const session = await storage.getChatSession(userId);
      if (session && !session.hasHumanSupport) {
        await storage.updateChatSession(session.id, { hasHumanSupport: true });
      }
      
      res.json({ success: true, message: adminMessage });
    } catch (error) {
      console.error("Error handling admin message:", error);
      res.status(500).json({ message: "Failed to send admin message" });
    }
  });
  
  app.get('/api/admin/sessions', async (req: any, res) => {
    try {
      // Check if user is authenticated and is an admin
      let isUserAdmin = false;
      
      // Check email auth first
      if (req.session?.user) {
        isUserAdmin = req.session.user.isAdmin === true;
      } 
      // Then check Replit auth
      else if (req.isAuthenticated && req.isAuthenticated()) {
        // Check if user is admin
        const adminUser = await storage.getUser(req.user.claims.sub);
        isUserAdmin = adminUser?.isAdmin === true;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      if (!isUserAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const activeSessions = await storage.getActiveChatSessions();
      res.json(activeSessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ message: "Failed to fetch active sessions" });
    }
  });

  return httpServer;
}
