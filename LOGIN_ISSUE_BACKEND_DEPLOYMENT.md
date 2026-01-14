# Login Issue - Backend Not Deployed

## Current Situation

Your **frontend** is successfully deployed to Netlify at:
- https://newportplumbing.netlify.app

However, your **backend** API is **NOT deployed yet**, which is why login is failing.

## Why Login Isn't Working

When you try to log in, the frontend is trying to connect to the backend API, but it's not finding it:

```
Frontend (Netlify) → Looking for Backend API → ❌ Not Found
```

The browser console probably shows errors like:
- `Failed to fetch`
- `Network error`
- `ERR_CONNECTION_REFUSED`
- `Login failed: Network Error`

## Solution Options

You have 3 options to fix this:

### Option 1: Deploy Backend to Railway (Recommended) ⭐

Railway is a great platform for Node.js backends.

#### Steps:

1. **Go to Railway.app**
   - Visit https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `FlowPortal` repository
   - Select branch: `feature-branch-1762324316584`

3. **Configure Backend Service**
   - Set root directory: `server`
   - Railway will auto-detect Node.js

4. **Add Environment Variables**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   PORT=3000
   NODE_ENV=production
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://flowportal-production.up.railway.app`

6. **Update Netlify Environment Variable**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-railway-url.up.railway.app`
   - Trigger a redeploy on Netlify

#### Cost:
- Railway: $5/month starter plan (or free $5 credit initially)

---

### Option 2: Run Backend Locally (For Testing)

If you just want to test locally before deploying:

1. **Start your local backend:**
   ```bash
   cd /Users/timothyfarzalo/Desktop/FlowPortal-export-2026-01-13/server
   npm install
   npm run dev
   ```

2. **Create a local `.env` file in `server` directory:**
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

3. **Create admin user:**
   ```bash
   npm run create-admin
   ```

4. **Use localhost in browser:**
   - Instead of `https://newportplumbing.netlify.app`
   - Go to `http://localhost:5173`
   - The frontend will connect to `http://localhost:3000`

---

### Option 3: Deploy Backend to Render.com

Alternative to Railway:

1. Go to https://render.com
2. Sign in with GitHub
3. New → Web Service
4. Connect your repository
5. Settings:
   - Root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
6. Add environment variables (same as Railway)
7. Deploy
8. Update Netlify's `VITE_API_URL` with the Render URL

#### Cost:
- Render: Free tier available (with limitations) or $7/month

---

## Quick Fix: I've Updated the Code

I've made the following changes to prepare for backend deployment:

### Updated `client/src/config/api.ts`
- Now checks for `VITE_API_URL` environment variable first
- Falls back to localhost:3000 for development
- This allows you to easily configure the API URL in Netlify

### Files Changed:
```
client/src/config/api.ts - Added VITE_API_URL support
```

## Next Steps (Recommended Path)

1. **Deploy Backend to Railway** (15 minutes)
   - Follow Option 1 above
   - Get your Railway URL

2. **Configure Netlify**
   - Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
   - Redeploy site

3. **Test Login**
   - Go to https://newportplumbing.netlify.app/login
   - Enter your admin credentials
   - Should work! ✅

## Need Your Supabase Credentials?

You'll need these for the backend environment variables:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy:
   - Project URL → `SUPABASE_URL`
   - anon public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## Commit These Changes

Let me commit the API configuration updates:

```bash
git add client/src/config/api.ts
git commit -m "Add VITE_API_URL environment variable support for production deployments"
git push origin feature-branch-1762324316584
```

Then Netlify will rebuild with the updated code.

## Summary

🔴 **Problem:** Backend not deployed, login can't connect to API  
🟡 **Temporary:** Run backend locally for testing  
🟢 **Solution:** Deploy backend to Railway/Render + Configure Netlify

---

**Current Status:**
- ✅ Frontend deployed to Netlify
- ❌ Backend not deployed
- ⏳ Waiting for backend deployment

**After Backend Deployment:**
- ✅ Frontend deployed to Netlify
- ✅ Backend deployed to Railway/Render  
- ✅ Login works!
