# Direct Supabase Authentication - Single Architecture

## Overview

The application has been refactored to use **Supabase authentication directly** in the frontend, eliminating the need for a separate backend server for authentication. This creates a true single-page application (SPA) architecture.

## New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                 │
│                   https://newportplumbing.netlify.app        │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  Login Page    │────────→│  Supabase Client │           │
│  │                │         │  Authentication  │           │
│  └────────────────┘         └──────────────────┘           │
│                                      │                       │
│  ┌────────────────┐                 │                       │
│  │  Admin Panel   │                 │                       │
│  │  - Pages       │                 │                       │
│  │  - Posts       │                 │                       │
│  │  - Media       │                 │                       │
│  │  - Settings    │                 │                       │
│  └────────────────┘                 │                       │
└──────────────────────────────────────┼───────────────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────┐
                        │   Supabase (Backend)     │
                        │                          │
                        │  • Authentication        │
                        │  • PostgreSQL Database   │
                        │  • Row Level Security    │
                        │  • API (auto-generated)  │
                        └──────────────────────────┘
```

## What Changed

### Before (Old Architecture)
```
Frontend → Express Backend → Supabase Database
         (authentication)
```

- Required separate backend deployment
- Backend handled authentication, JWT tokens, API routes
- More complex deployment (frontend + backend)

### After (New Architecture)
```
Frontend → Supabase (authentication + database)
```

- No separate backend needed
- Supabase handles everything
- Single deployment (frontend only)
- Simpler architecture

## Files Changed

### New Files Created

1. **`client/src/lib/supabase.ts`**
   - Supabase client configuration
   - Reads environment variables
   - Exports configured Supabase client

2. **`client/src/contexts/SupabaseAuthContext.tsx`**
   - New authentication context using Supabase Auth
   - Handles login, logout, session management
   - Automatically syncs with Supabase auth state
   - Loads user role from `users` table

3. **`client/.env.example`**
   - Template for environment variables
   - Documents required Supabase credentials

### Modified Files

1. **`client/src/App.tsx`**
   - Changed import from `AuthContext` to `SupabaseAuthContext`
   - Now uses direct Supabase authentication

2. **`client/package.json`**
   - Added `@supabase/supabase-js` dependency

## How Authentication Works Now

### 1. User Visits Login Page
```tsx
<Login />
```

### 2. User Enters Credentials
- Email: admin@example.com
- Password: ••••••••

### 3. Frontend Calls Supabase Directly
```typescript
await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### 4. Supabase Validates Credentials
- Checks if user exists in `auth.users` table
- Verifies password hash
- Creates session if valid

### 5. Frontend Loads User Data
```typescript
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();
```

### 6. User Role Checked
- If `role === 'admin'` → Grant access to admin panel
- If `role === 'user'` → Redirect to home

### 7. Session Persisted
- Supabase automatically handles session storage
- Refreshes tokens automatically
- Persists across page reloads

## Environment Variables Required

### For Netlify Deployment

Add these environment variables in Netlify:

1. **`VITE_SUPABASE_URL`**
   - Your Supabase project URL
   - Example: `https://abcdefghijklmnop.supabase.co`
   - Found in: Supabase Dashboard → Settings → API → Project URL

2. **`VITE_SUPABASE_ANON_KEY`**
   - Your Supabase anon (public) key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Found in: Supabase Dashboard → Settings → API → anon public

### For Local Development

Create `client/.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Supabase Setup Required

### 1. Enable Email Authentication

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Disable email confirmation (for admin users) or configure SMTP

### 2. Create Users Table (If Not Exists)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

### 3. Create Admin User

#### Option A: Via Supabase Dashboard
1. Authentication → Users → Add user
2. Email: `admin@example.com`
3. Password: (set a strong password)
4. Confirm email: Toggle off
5. Click "Create user"

#### Option B: Via SQL
```sql
-- This will create a user in auth.users and users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('your_password_here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- Insert into users table with admin role
INSERT INTO users (id, email, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin@example.com',
  'admin'
);
```

## Deployment Steps

### 1. Update Netlify Environment Variables

1. Go to Netlify Dashboard
2. Select your site
3. Site settings → Environment variables
4. Remove old variables (if any):
   - `VITE_API_URL` (no longer needed!)
5. Add new variables:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`

### 2. Trigger Redeploy

Netlify will automatically redeploy when you push to GitHub, or you can manually trigger:
1. Deploys tab
2. Trigger deploy → Deploy site

### 3. Test Login

1. Go to https://newportplumbing.netlify.app/login
2. Enter admin credentials
3. Should redirect to admin panel ✅

## Benefits of New Architecture

✅ **Simpler Deployment**
- Only frontend needs to be deployed
- No backend server required
- No Railway/Render costs

✅ **Better Performance**
- Direct connection to Supabase
- No intermediate API layer
- Faster authentication

✅ **Easier Maintenance**
- Fewer moving parts
- Less code to maintain
- Supabase handles security

✅ **Cost Effective**
- Netlify: Free tier available
- Supabase: Free tier available
- No additional backend hosting costs

✅ **Automatic Features**
- Session management
- Token refresh
- Password reset (via Supabase)
- Email verification (via Supabase)

## Security Notes

### Row Level Security (RLS)

Supabase uses PostgreSQL's Row Level Security to ensure users can only access their own data or data they have permission to see.

Example RLS policies:

```sql
-- Only admins can see all users
CREATE POLICY "Admins can see all users"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Only admins can manage pages
CREATE POLICY "Admins can manage pages"
  ON pages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### API Keys

- **Anon Key**: Safe to use in frontend (public)
- **Service Role Key**: NEVER use in frontend (server-side only)

The anon key respects RLS policies, so even if exposed, users can only access data they're authorized to see.

## Migration from Old Auth

### What Was Removed
- ❌ Backend Express server (for auth)
- ❌ JWT token generation in backend
- ❌ `/api/auth/login` endpoint
- ❌ `/api/auth/logout` endpoint
- ❌ Custom password hashing
- ❌ Manual session management

### What Was Added
- ✅ Supabase client in frontend
- ✅ Direct Supabase authentication
- ✅ Automatic session management
- ✅ Automatic token refresh
- ✅ Built-in security (RLS)

### Backward Compatibility

The new `SupabaseAuthContext` maintains the same interface as the old `AuthContext`:

```typescript
const { isAuthenticated, user, login, logout } = useAuth();
```

All existing components using `useAuth()` continue to work without changes!

## Troubleshooting

### Login Not Working

1. **Check environment variables in Netlify**
   - `VITE_SUPABASE_URL` set correctly?
   - `VITE_SUPABASE_ANON_KEY` set correctly?

2. **Check browser console**
   - Look for Supabase errors
   - Check network tab for failed requests

3. **Verify user exists in Supabase**
   - Dashboard → Authentication → Users
   - Check email is confirmed (or disable confirmation)

4. **Check user has admin role**
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   ```

### "User not authorized" errors

- Check RLS policies in Supabase
- Ensure policies allow the operation
- Verify user role is correctly set

### Session not persisting

- Check browser local storage
- Supabase stores session in `supabase.auth.token`
- Clear browser cache and try again

## Next Steps

1. ✅ Code refactored to use Supabase auth
2. ⏳ Push changes to GitHub
3. ⏳ Configure Netlify environment variables
4. ⏳ Create admin user in Supabase
5. ⏳ Test login on deployed site

---

**Status**: ✅ Ready for deployment  
**Architecture**: Single-page application with Supabase backend  
**Backend Server**: Not required!
