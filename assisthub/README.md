# Assist Hub - AI-Powered Customer Support Platform

A comprehensive customer support platform that seamlessly integrates AI assistance with human support agents. Built with React, TypeScript, Express, and PostgreSQL.

![Assist Hub Logo](https://via.placeholder.com/200x100/0052FF/FFFFFF?text=Assist+Hub)

## 🚀 Features

- **AI-Powered Support**: Intelligent AI assistant providing instant responses to customer queries
- **Human Agent Handoff**: Seamless escalation from AI to human support agents
- **Real-time Chat**: WebSocket-based messaging for instant communication
- **Admin Dashboard**: Live monitoring of support sessions and agent management
- **Dual Authentication**: Support for both email/password and OAuth authentication
- **Mobile-Responsive**: Beautiful, responsive design that works on all devices
- **Professional Branding**: Custom blue gradient design with modern UI components

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **shadcn/ui** components built on Radix UI
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **WebSockets** for real-time communication
- **PostgreSQL** with Drizzle ORM
- **OpenAI** integration for AI responses
- **bcrypt** for secure password hashing
- **Express sessions** with PostgreSQL storage

### Infrastructure
- **Drizzle ORM** for type-safe database operations
- **Neon PostgreSQL** for serverless database
- **Session-based authentication** with role management
- **Graceful error handling** and reconnection logic

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key (optional - graceful fallback available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/assist-hub.git
cd assist-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database (required)
DATABASE_URL=your_postgresql_connection_string

# OpenAI (optional - AI features will gracefully degrade without this)
OPENAI_API_KEY=your_openai_api_key

# Session Security (required for production)
SESSION_SECRET=your_secure_session_secret

# For OAuth authentication (optional)
REPLIT_DOMAINS=your-domain.com
```

### 4. Database Setup

```bash
# Push database schema
npm run db:push
```

### 5. Create Admin User

```bash
# Run the admin creation script
npx tsx create-admin.ts
```

Default admin credentials:
- Email: `superadmin@assisthub.com`
- Password: `assisthub@`

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
assist-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Express backend
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── openai.ts         # AI integration
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data access layer
│   ├── vite.ts           # Vite integration
│   └── ws.ts             # WebSocket server
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── ...config files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript checks
- `npm run db:push` - Push database schema changes

## 🎯 Core Features

### AI Support Assistant
- Contextual responses using OpenAI GPT models
- Conversation history awareness
- Cryptocurrency and NFT specialized knowledge
- Graceful fallback when AI services are unavailable

### Human Support Integration
- One-click escalation from AI to human agents
- Real-time admin dashboard for monitoring active sessions
- Seamless handoff preserving conversation context
- Multi-session management for support agents

### Real-time Communication
- WebSocket-based messaging with automatic reconnection
- Connection status indicators
- Typing indicators and message timestamps
- Robust error handling and recovery

### Authentication & Security
- Secure session management with PostgreSQL storage
- bcrypt password hashing
- Role-based access control (admin/user)
- CORS configuration for secure cross-origin requests

## 🔐 Security Features

- Secure session handling with HTTP-only cookies
- Input validation using Zod schemas
- Rate limiting and connection management
- Environment-based configuration
- Secure admin access controls

## 🌟 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

Ensure all required environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure session secret
- `NODE_ENV=production`
- `OPENAI_API_KEY` (optional)

### Database Migration

```bash
npm run db:push
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support, email support@assisthub.com or create an issue in this repository.

## 🎉 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- Powered by [OpenAI](https://openai.com/) for intelligent AI responses
- Database hosted on [Neon](https://neon.tech/) for serverless PostgreSQL
- Icons by [Lucide React](https://lucide.dev/)

---

**Made with ❤️ for better customer support experiences**