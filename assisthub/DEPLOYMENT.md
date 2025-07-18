# Deployment Guide for Assist Hub

This guide covers deploying Assist Hub to various platforms.

## 🚀 Quick Deployment Options

### 1. Vercel Deployment

Vercel provides excellent hosting for full-stack applications:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables to Set in Vercel:**
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure session secret
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `NODE_ENV=production`

### 2. Railway Deployment

Railway offers simple PostgreSQL + app hosting:

1. Connect your GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically on push

### 3. Render Deployment

Deploy both web service and PostgreSQL:

1. Connect GitHub repository
2. Create PostgreSQL database
3. Create web service
4. Configure environment variables

### 4. DigitalOcean App Platform

1. Create new app from GitHub
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

## 🗄️ Database Setup

### Neon (Recommended for Serverless)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` environment variable

### Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Get PostgreSQL connection string
3. Add to environment variables

### Self-hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres createdb assist_hub

# Create user
sudo -u postgres createuser --interactive
```

## 🔧 Environment Configuration

Create these environment variables in your deployment platform:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-secure-secret-at-least-32-characters
NODE_ENV=production

# Optional
OPENAI_API_KEY=sk-your-openai-key
REPLIT_DOMAINS=yourdomain.com
```

## 📋 Pre-deployment Checklist

- [ ] Database is created and accessible
- [ ] All environment variables are set
- [ ] Database schema is pushed (`npm run db:push`)
- [ ] Admin user is created
- [ ] Build process completes successfully
- [ ] All dependencies are listed in package.json

## 🔍 Health Check Endpoints

Your deployed app should respond to:

- `GET /` - Main application
- `GET /api/auth/user` - API health check
- `GET /api/admin/sessions` - Admin functionality (requires auth)

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify DATABASE_URL format
- Check firewall/security group settings
- Ensure database accepts external connections

**WebSocket Issues:**
- Enable WebSocket support in your hosting platform
- Check for proxy configuration requirements

**Session Issues:**
- Verify SESSION_SECRET is set
- Check cookie settings for HTTPS

**Build Failures:**
- Ensure all TypeScript types are resolved
- Check for missing dependencies
- Verify Node.js version compatibility

### Logs and Monitoring

Most platforms provide built-in logging. Key things to monitor:

- Database connection status
- WebSocket connection counts
- API response times
- Error rates

## 🔄 Continuous Deployment

Set up automatic deployments:

1. Connect your GitHub repository
2. Configure automatic deployments on main branch
3. Set up preview deployments for pull requests
4. Configure deployment hooks if needed

## 📊 Performance Optimization

For production deployments:

1. **Database Optimization:**
   - Use connection pooling
   - Add database indexes for frequently queried fields
   - Consider read replicas for high traffic

2. **Frontend Optimization:**
   - Enable gzip compression
   - Configure CDN for static assets
   - Set up proper caching headers

3. **Security:**
   - Enable HTTPS
   - Configure CORS properly
   - Set secure session cookies
   - Regular security updates

## 🔧 Scaling Considerations

As your application grows:

- **Database:** Upgrade to larger instance or add read replicas
- **WebSockets:** Consider Redis for session storage across multiple instances
- **Load Balancing:** Set up load balancer for multiple app instances
- **Monitoring:** Add application performance monitoring (APM)

---

Need help with deployment? Check the [main README](README.md) or create an issue in the repository.