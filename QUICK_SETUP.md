# FlowPortal - Quick Setup Guide (Unified Architecture)

## 🚀 What You Have Now

A **single-page application (SPA)** that connects directly to Supabase. No backend server needed!

## ✅ Prerequisites

- Supabase account (free tier works)
- Netlify account (free tier works)
- GitHub repository

## 📋 Setup Checklist

### 1. Supabase Setup (15 minutes)

#### A. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project URL and anon key

#### B. Run Database Migration
1. Go to SQL Editor in Supabase dashboard
2. Copy the contents of `/server/scripts/supabase-schema.sql` (if exists) OR use this quick setup:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table  
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL,
  tagline TEXT,
  site_url TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  landing_page_icon_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  business_hours JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  google_maps_url TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  privacy_statement TEXT,
  coming_soon_mode BOOLEAN DEFAULT false,
  default_theme TEXT DEFAULT 'dark',
  button_styles JSONB DEFAULT '{}',
  landing_page JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  url TEXT NOT NULL,
  category TEXT DEFAULT 'other',
  description TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_entries table
CREATE TABLE form_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL,
  data JSONB NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_configurations table
CREATE TABLE form_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT UNIQUE NOT NULL,
  form_name TEXT NOT NULL,
  fields JSONB NOT NULL,
  email_configuration JSONB NOT NULL,
  service_options TEXT[],
  available_dates JSONB,
  available_times TEXT[],
  success_message TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read published posts" ON posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view media" ON media FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins full access site_settings" ON site_settings FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
  
CREATE POLICY "Admins full access pages" ON pages FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
  
CREATE POLICY "Admins full access posts" ON posts FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
  
CREATE POLICY "Admins full access media" ON media FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
  
CREATE POLICY "Admins full access form_entries" ON form_entries FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
  
CREATE POLICY "Admins full access form_configurations" ON form_configurations FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
  
CREATE POLICY "Admins full access users" ON users FOR ALL 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Public can submit forms
CREATE POLICY "Anyone can insert form entries" ON form_entries FOR INSERT 
  WITH CHECK (true);

-- Insert default site settings
INSERT INTO site_settings (site_name, tagline, site_url, contact_email, contact_phone, address)
VALUES ('FlowPortal', 'Your tagline here', 'https://yoursite.com', 'info@example.com', '(555) 123-4567', '123 Main St, City, State 12345');
```

3. Click "Run"

#### C. Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it `media`
4. Set to **Public**
5. Click **Create Bucket**

#### D. Set Storage Policies
1. Click on the `media` bucket
2. Go to **Policies**
3. Add these policies:

```sql
-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Public read
CREATE POLICY "Public can read media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media');

-- Admin delete
CREATE POLICY "Admins can delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
```

#### E. Create Admin User
1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Copy the user's UUID
6. Go to **SQL Editor** and run:

```sql
INSERT INTO users (id, email, role, first_name, last_name)
VALUES (
  'paste-uuid-here',
  'admin@example.com',
  'admin',
  'Admin',
  'User'
);
```

### 2. Frontend Setup (5 minutes)

#### A. Install Dependencies
```bash
cd client
npm install
```

#### B. Configure Environment Variables
Create `client/.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard** > **Settings** > **API**

#### C. Test Locally
```bash
npm run dev
```

Visit `http://localhost:5173` and try logging in with your admin credentials.

### 3. Deploy to Netlify (10 minutes)

#### A. Push to GitHub
```bash
git add .
git commit -m "Unified architecture with direct Supabase integration"
git push origin main
```

#### B. Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **Add new site** > **Import an existing project**
3. Choose GitHub and select your repository
4. Configure:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

#### C. Set Environment Variables
In Netlify site settings > Environment variables, add:
- `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `your-anon-key`

#### D. Deploy
Click **Deploy site**. Netlify will build and deploy automatically.

### 4. Verify Everything Works

1. **Public Site**: Visit your Netlify URL
2. **Admin Login**: Go to `/login` and log in with admin credentials
3. **Admin Panel**: You should be redirected to `/admin`
4. **Test Features**:
   - View dashboard stats
   - Create a new page
   - Upload media
   - Update settings
   - Submit a form (as public user)
   - View form entries (as admin)

## 🎉 You're Done!

Your FlowPortal is now live with:
- ✅ Direct Supabase authentication
- ✅ No backend server needed
- ✅ All admin features working
- ✅ Automatic deployments via Netlify

## 🔍 Common Issues

### Can't login?
- Verify admin user exists in `users` table with `role = 'admin'`
- Check that email/password match Supabase Auth
- Check browser console for errors

### Media upload fails?
- Verify `media` storage bucket exists and is public
- Check storage policies are set correctly
- Verify user is authenticated

### Dashboard shows zero stats?
- Add some test data (pages, posts, etc.)
- Check RLS policies allow admin read access
- Check browser console for errors

### Build fails on Netlify?
- Verify environment variables are set
- Check build logs for specific errors
- Ensure `client` is the base directory

## 📚 Next Steps

1. **Customize Settings**: Go to `/admin/settings` and update your site info
2. **Create Content**: Add pages and posts
3. **Upload Media**: Add logos, images, etc.
4. **Configure Forms**: Set up form configurations for contact/booking
5. **Custom Domain**: Add your domain in Netlify settings

## 📖 Documentation

For more details, see:
- `UNIFIED_ARCHITECTURE.md` - Complete architecture overview
- `client/src/services/supabaseAdmin.ts` - Admin operations
- `client/src/services/supabaseForms.ts` - Form operations  
- `client/src/services/supabaseMedia.ts` - Media operations

## 🆘 Need Help?

Check these files for troubleshooting:
- Browser console (F12)
- Netlify build logs
- Supabase logs (Supabase Dashboard > Logs)
