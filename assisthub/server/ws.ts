import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { generateAIResponse } from './openai';

// Map to track connected clients
const clients = new Map<string, WebSocket>();
// Map to track admin connections
const adminClients = new Map<string, WebSocket>();

export function setupWebsockets(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    // Handle the initial connection message to identify the client
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle different message types
        switch (message.type) {
          case 'register':
            handleRegistration(ws, message);
            break;
          case 'user_message':
            await handleUserMessage(message);
            break;
          case 'admin_message':
            await handleAdminMessage(message);
            break;
          case 'request_human':
            await handleHumanSupportRequest(message);
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      // Find and remove the disconnected client
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      
      // Check if it was an admin
      for (const [adminId, client] of adminClients.entries()) {
        if (client === ws) {
          adminClients.delete(adminId);
          console.log(`Admin ${adminId} disconnected`);
          break;
        }
      }
    });
  });

  return wss;
}

// Handle client registration
function handleRegistration(ws: WebSocket, message: any) {
  const { userId, isAdmin } = message;
  
  if (isAdmin) {
    adminClients.set(userId, ws);
    console.log(`Admin ${userId} registered`);
    
    // Send current active sessions to the admin
    broadcastActiveSessions();
  } else {
    clients.set(userId, ws);
    console.log(`User ${userId} registered`);
  }
}

// Handle user messages
async function handleUserMessage(message: any) {
  const { userId, content } = message;
  
  try {
    // Ensure user has an active chat session
    let session = await storage.getChatSession(userId);
    if (!session) {
      session = await storage.createChatSession({
        userId,
        isActive: true,
        hasHumanSupport: false,
      });
    }
    
    // Save the user message
    await storage.createMessage({
      userId,
      content,
      role: 'user',
    });
    
    // Notify admins of new message
    broadcastToAdmins({
      type: 'new_message',
      userId,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    });
    
    // If this user has human support, don't send AI response
    if (session.hasHumanSupport) {
      return;
    }
    
    // Send typing indicator to the user
    const userWs = clients.get(userId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'typing',
        isTyping: true
      }));
    }
    
    // Generate AI response
    const aiResponse = await generateAIResponse(userId, content);
    
    // Save the AI response
    await storage.createMessage({
      userId,
      content: aiResponse,
      role: 'assistant',
    });
    
    // Send the AI response to the user
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'message',
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }));
      
      // Stop typing indicator
      userWs.send(JSON.stringify({
        type: 'typing',
        isTyping: false
      }));
    }
    
    // Also notify admins of AI response
    broadcastToAdmins({
      type: 'new_message',
      userId,
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error handling user message:', error);
    
    // Notify user of error
    const userWs = clients.get(userId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process your message. Please try again.'
      }));
    }
  }
}

// Handle admin messages
async function handleAdminMessage(message: any) {
  const { adminId, userId, content } = message;
  
  try {
    // Save the admin message
    await storage.createMessage({
      userId,
      content,
      role: 'admin',
    });
    
    // Update the chat session to have human support if it doesn't already
    const session = await storage.getChatSession(userId);
    if (session && !session.hasHumanSupport) {
      await storage.updateChatSession(session.id, { hasHumanSupport: true });
    }
    
    // Send the message to the user
    const userWs = clients.get(userId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify({
        type: 'message',
        content,
        role: 'assistant', // Show admin messages as assistant to the user
        isHumanSupport: true,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Broadcast to other admins
    broadcastToAdmins({
      type: 'new_message',
      userId,
      content,
      role: 'admin',
      timestamp: new Date().toISOString(),
      adminId // Include sender admin ID
    }, adminId); // Exclude the sending admin
    
  } catch (error) {
    console.error('Error handling admin message:', error);
    
    // Notify admin of error
    const adminWs = adminClients.get(adminId);
    if (adminWs && adminWs.readyState === WebSocket.OPEN) {
      adminWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to send message. Please try again.'
      }));
    }
  }
}

// Handle human support requests
async function handleHumanSupportRequest(message: any) {
  const { userId } = message;
  
  try {
    // Update the chat session
    const session = await storage.getChatSession(userId);
    if (session) {
      await storage.updateChatSession(session.id, { hasHumanSupport: true });
      
      // Save system message about human support request
      await storage.createMessage({
        userId,
        content: 'User has requested human support.',
        role: 'system',
      });
      
      // Notify all admins
      broadcastToAdmins({
        type: 'human_support_request',
        userId,
        timestamp: new Date().toISOString()
      });
      
      // Notify user that the request was received
      const userWs = clients.get(userId);
      if (userWs && userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify({
          type: 'system_message',
          content: 'Your request for human support has been received. A support agent will join the conversation shortly.',
          timestamp: new Date().toISOString()
        }));
      }
    }
  } catch (error) {
    console.error('Error handling human support request:', error);
  }
}

// Broadcast message to all admins (optionally excluding one)
function broadcastToAdmins(message: any, excludeAdminId?: string) {
  for (const [adminId, ws] of adminClients.entries()) {
    if (excludeAdminId && adminId === excludeAdminId) continue;
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

// Broadcast active sessions to all admins
async function broadcastActiveSessions() {
  try {
    const activeSessions = await storage.getActiveChatSessions();
    
    for (const [_, ws] of adminClients.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'active_sessions',
          sessions: activeSessions
        }));
      }
    }
  } catch (error) {
    console.error('Error broadcasting active sessions:', error);
  }
}
