# Quick Setup Guide - Direct Supabase Authentication

## ✅ What Just Happened

Your application has been refactored to use **direct Supabase authentication**! 

**No backend server required anymore!** 🎉

## Architecture Change

**Before:**
```
Frontend (Netlify) → Backend (Railway/Render) → Supabase
                      $5-7/month
```

**After:**
```
Frontend (Netlify) → Supabase
    FREE                FREE
```

## 3 Steps to Deploy

### Step 1: Get Your Supabase Credentials (2 minutes)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (long JWT token)

### Step 2: Add to Netlify (2 minutes)

1. Go to https://app.netlify.com
2. Select your site (newportplumbing)
3. **Site settings** → **Environment variables**
4. Click **Add a variable** and add:

```
Variable 1:
Key: VITE_SUPABASE_URL
Value: https://your-project.supabase.co

Variable 2:
Key: VITE_SUPABASE_ANON_KEY
Value: your_anon_key_here
```

5. **Remove old variable** (if it exists):
   - ❌ Delete: `VITE_API_URL` (not needed anymore!)

### Step 3: Create Admin User in Supabase (3 minutes)

1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Click **Add user**
4. Fill in:
   - Email: `admin@example.com` (or your email)
   - Password: (choose a strong password)
   - **Auto Confirm User**: Toggle ON ✅
5. Click **Create user**

6. Now add admin role:
   - **SQL Editor** → New query
   - Paste this SQL:

```sql
-- Ensure users table exists
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user (replace email with your email)
INSERT INTO users (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

7. Click **Run** (Cmd+Enter)

### That's It! 🎉

Netlify will automatically redeploy (or trigger manually: Deploys → Trigger deploy)

After deployment (2-3 minutes):
1. Go to: https://newportplumbing.netlify.app/login
2. Enter your email and password
3. You should be logged in and redirected to admin panel ✅

## Troubleshooting

### Still not working?

**Check 1: Environment Variables**
- Go to Netlify → Site settings → Environment variables
- Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Values should NOT have quotes around them

**Check 2: User Created in Supabase**
- Go to Supabase → Authentication → Users
- Your email should be listed
- Status should be "Confirmed" (green checkmark)

**Check 3: Admin Role Assigned**
- Go to Supabase → SQL Editor
- Run: `SELECT * FROM users WHERE email = 'your@email.com';`
- Should show role = 'admin'

**Check 4: Browser Console**
- Open browser DevTools (F12)
- Go to Console tab
- Look for any red errors
- Common issues:
  - "Invalid API key" = Wrong VITE_SUPABASE_ANON_KEY
  - "Invalid credentials" = Wrong password
  - "User not found" = Admin role not set

## Benefits of New Setup

✅ **No Backend Server Required**
- Don't need Railway, Render, Heroku, etc.
- Saves $5-7/month

✅ **Simpler Deployment**
- Only frontend needs to be deployed
- Just Netlify + Supabase

✅ **Faster Login**
- Direct connection to Supabase
- No intermediate API layer

✅ **Better Security**
- Supabase handles password hashing
- Row Level Security (RLS) built-in
- Automatic token refresh

✅ **Free Tier Friendly**
- Netlify free tier: 100GB bandwidth
- Supabase free tier: 500MB database, 50,000 monthly active users

## What Changed in Code

1. **Added Supabase Client** (`client/src/lib/supabase.ts`)
2. **New Auth Context** (`client/src/contexts/SupabaseAuthContext.tsx`)
3. **Updated App.tsx** to use new auth
4. **Environment Variables** now use `VITE_SUPABASE_*` instead of `VITE_API_URL`

## What Stayed the Same

✅ All admin features work the same
✅ All pages work the same
✅ Same login page
✅ Same admin panel
✅ Same user experience

Only the "under the hood" authentication changed!

## Need Help?

Read the full documentation:
- `SUPABASE_DIRECT_AUTH.md` - Complete technical details
- `AUTHENTICATION_ARCHITECTURE.md` - Architecture comparison

---

**Status**: ✅ Code deployed to GitHub
**Next**: Configure Netlify environment variables
**Time**: ~7 minutes total setup
