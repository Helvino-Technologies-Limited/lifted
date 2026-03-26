# LIFTED TO LIFT — Deployment Guide

## Architecture
- **Frontend**: Next.js → Vercel
- **Backend**: Express.js → Render
- **Database**: Neon PostgreSQL (already initialised)
- **Media**: Cloudinary (free tier)

---

## Step 1: Set Up Cloudinary (FREE)
1. Create account at cloudinary.com
2. Go to Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. You'll need these for the backend environment variables

---

## Step 2: Deploy Backend to Render
1. Push `backend/` folder to a GitHub repo
2. Go to render.com → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install --legacy-peer-deps`
   - **Start Command**: `node src/db/init.js && npm start`
5. Add Environment Variables:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_ZdrOh6NQX4Iz@ep-sparkling-frog-an0v6fn2-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   JWT_SECRET    = [generate a strong random string]
   FRONTEND_URL  = https://your-site.vercel.app
   PORT          = 5000
   CLOUDINARY_CLOUD_NAME = [from step 1]
   CLOUDINARY_API_KEY    = [from step 1]
   CLOUDINARY_API_SECRET = [from step 1]
   ADMIN_DEFAULT_PASSWORD = Admin@LiftedToLift2024
   ```
6. Click Deploy — note your Render URL (e.g. `https://lifted-to-lift-api.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel
1. Push `frontend/` folder to GitHub (or same monorepo)
2. Go to vercel.com → New Project → Import
3. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `frontend/`
4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL = https://lifted-to-lift-api.onrender.com
   ```
5. Click Deploy

---

## Step 4: First Login
- URL: `https://your-site.vercel.app/admin/login`
- Username: `admin`
- Password: `Admin@LiftedToLift2024`
- **IMPORTANT**: Change your password immediately in Settings → Change Password

---

## Admin Features
| Feature | Location |
|---------|----------|
| Upload Logo | Admin → Hero & Branding |
| Upload Background Video | Admin → Hero & Branding |
| Edit Hero Text | Admin → Hero & Branding |
| Edit All Page Text | Admin → Page Content |
| Upload Photos/Videos | Admin → Media Library |
| Manage Team Members | Admin → Team Members |
| Add Institutions (Tree) | Admin → Institutions |
| Publish News Stories | Admin → News & Stories |
| Update Contact Info | Admin → Contact & Settings |
| Social Media Links | Admin → Contact & Settings |
| Change Password | Admin → Contact & Settings |

---

## Local Development
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your Cloudinary credentials
npm install --legacy-peer-deps
node src/db/init.js   # Only needed once
npm run dev           # Runs on port 5000

# Frontend
cd frontend
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev           # Runs on port 3000
```

---

## Database Info
- Provider: **Neon PostgreSQL** (already initialised and seeded)
- Connection: Already configured in backend
- Tables: admin_users, site_settings, page_content, media, team_members, news, pillar_institutions, partners, gallery_albums
