# Hosting Platform Deployment Guide

This document outlines how to deploy the MVP hosting platform to production.

## 1. Database Configuration
Currently, the backend uses **SQLite** (`prisma/dev.db`), which is great for local development but not recommended for production due to concurrent write limitations.

**Before launch:**
1. Provision a managed PostgreSQL database (e.g., Supabase, Neon, AWS RDS, DigitalOcean).
2. Update `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npx prisma migrate dev --name init` to initialize the Postgres DB.

## 2. Environment Variables
You must set the following environment variables in your production server:

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"

# JWT Secrets (Generate secure random strings)
JWT_SECRET="your-super-secure-jwt-secret"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret"

# Razorpay Keys (Replace with LIVE keys)
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="..."
```

### Frontend (`.env`)
```env
VITE_API_URL="https://api.yourdomain.com/api"
VITE_RAZORPAY_KEY_ID="rzp_live_..."
```

## 3. Backend Deployment (Render, DigitalOcean, AWS)
The backend is a standard Node.js/Express app.

1. Configure the build command: `npm install && npm run build`
2. Configure the start command: `npm run start:prod`
3. Expose port `5000` (or whatever the host assigns).

## 4. Frontend Deployment (Vercel, Netlify)
The frontend is a Vite + React application.

1. Connect your GitHub repository to Vercel/Netlify.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add the frontend environment variables in the Vercel dashboard.

## 5. Security Checklist
- [x] Rate limiting is enabled on the backend.
- [x] Helmet is configured to set secure HTTP headers.
- [ ] Change `allowedOrigins` in `server/src/index.ts` to exactly match your frontend domain.
- [ ] Replace `Ethereal Email` testing credentials in `email.service.ts` with your real SMTP details.
