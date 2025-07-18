# Assist Hub - AI-Powered Customer Support Platform

## Overview

Assist Hub is a comprehensive customer support platform that combines AI assistance with human support capabilities. The application is built as a full-stack solution with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The platform specializes in cryptocurrency and NFT-related customer support, featuring real-time chat capabilities, admin dashboards, and seamless handoffs between AI and human agents.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 2025 - GitHub Export Preparation:**
- Fixed WebSocket connection stability issues in support chat
- Created comprehensive README.md with full documentation
- Added deployment guide for multiple hosting platforms
- Updated .gitignore for proper GitHub repository structure
- Created environment template (.env.example) for easy setup
- Added MIT license for open source distribution
- Cleaned project structure by removing development artifacts
- Project is now ready for professional GitHub export

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSockets for live chat functionality
- **API Design**: RESTful endpoints with WebSocket extensions

### Authentication System
- **Dual Authentication**: Supports both email/password and Replit OAuth
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Role-based Access**: Admin and user roles with route protection

## Key Components

### Database Schema (Drizzle ORM)
- **Users Table**: Stores user profiles, auth type, admin status, and welcome state
- **Messages Table**: Chat message history with role-based message types
- **Chat Sessions Table**: Manages active chat sessions and human support escalation
- **Sessions Table**: Express session storage for authentication

### Real-time Chat System
- **WebSocket Server**: Handles real-time messaging between users and admins
- **Message Routing**: Automatic routing between AI and human agents
- **Session Management**: Tracks active chat sessions and escalation to human support
- **Connection Handling**: Automatic reconnection and error recovery

### AI Integration
- **OpenAI Integration**: GPT-powered responses with configurable system messages
- **Fallback Responses**: Graceful degradation when AI services are unavailable
- **Context Awareness**: Maintains conversation history for contextual responses
- **Crypto/NFT Specialization**: System prompts optimized for cryptocurrency support

### Admin Dashboard
- **Live Session Monitoring**: Real-time view of active user sessions
- **Message History**: Complete conversation logs for each user
- **Human Takeover**: Seamless transition from AI to human support
- **Multi-session Management**: Handle multiple customer conversations simultaneously

## Data Flow

### User Registration/Login Flow
1. User accesses signup/login pages with form validation
2. Credentials processed via email/password or Replit OAuth
3. Session created and stored in PostgreSQL
4. User redirected to welcome page (first-time) or support chat
5. Welcome completion updates user profile and enables full access

### Chat Message Flow
1. User sends message via WebSocket connection
2. Message stored in database with timestamp and role
3. AI service generates contextual response using conversation history
4. Response delivered via WebSocket and stored in database
5. Admin can monitor and intervene through dashboard interface

### Human Support Escalation
1. User requests human support or admin initiates takeover
2. Chat session marked for human support in database
3. Admin receives notification through WebSocket
4. Subsequent messages routed directly between user and admin
5. Full conversation history available to support agent

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection via Neon serverless
- **drizzle-orm**: Type-safe database ORM with schema validation
- **openai**: AI response generation (optional, graceful fallback)
- **bcrypt**: Password hashing and verification
- **ws**: WebSocket server implementation

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management and caching
- **react-hook-form**: Form handling with validation
- **zod**: Runtime type validation and schema definition
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Fast build tool with HMR support
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Server**: `npm run dev` starts Express server with tsx watch mode
- **Client**: Vite dev server with proxy to backend API
- **Database**: Drizzle kit for schema migrations and management
- **WebSockets**: Development WebSocket server on same port

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Production PostgreSQL via DATABASE_URL environment variable
- **Sessions**: PostgreSQL session storage for scalability

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **OPENAI_API_KEY**: OpenAI API access (optional, fallback available)
- **REPLIT_DOMAINS**: Replit OAuth domains (development optional)
- **NODE_ENV**: Environment detection for feature flags

### Security Considerations
- **CORS**: Configured for development and production environments
- **Session Security**: Secure session configuration with appropriate TTL
- **Input Validation**: Zod schemas for all user inputs
- **Authentication**: Protected routes with session verification
- **Admin Access**: Role-based access control for administrative functions

The application is designed to be deployed on platforms like Replit, with graceful fallbacks for missing services and environment-specific configurations for optimal performance in both development and production environments.