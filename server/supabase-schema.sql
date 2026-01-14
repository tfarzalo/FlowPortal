-- FlowPortal Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase Dashboard -> SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor', 'super_admin')),
  refresh_token VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::text,
  CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. PAGES TABLE
-- ============================================================================
DROP TABLE IF EXISTS pages CASCADE;

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT slug_lowercase CHECK (slug = LOWER(TRIM(slug)))
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published);
CREATE INDEX idx_pages_created_by ON pages(created_by);

-- ============================================================================
-- 3. POSTS TABLE
-- ============================================================================
DROP TABLE IF EXISTS posts CASCADE;

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category VARCHAR(100) DEFAULT 'uncategorized',
  tags TEXT[] DEFAULT '{}',
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT slug_lowercase CHECK (slug = LOWER(TRIM(slug)))
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(is_published);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_created_by ON posts(created_by);

-- ============================================================================
-- 4. MEDIA TABLE
-- ============================================================================
DROP TABLE IF EXISTS media CASCADE;

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) UNIQUE NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('image', 'logo', 'pdf', 'document', 'other')),
  description TEXT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_filename ON media(filename);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- ============================================================================
-- 5. SITE_SETTINGS TABLE (Singleton with JSONB)
-- ============================================================================
DROP TABLE IF EXISTS site_settings CASCADE;

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) DEFAULT 'FlowPortal',
  tagline VARCHAR(500) DEFAULT 'Your Trusted Plumbing Partner',
  site_url VARCHAR(500) DEFAULT 'https://newportplumbing.com',
  logo_url TEXT,
  favicon_url TEXT,
  landing_page_icon_url TEXT,
  primary_color VARCHAR(50) DEFAULT '#2563eb',
  secondary_color VARCHAR(50) DEFAULT '#10b981',
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  business_hours JSONB DEFAULT '{
    "monday": "8:00 AM - 5:00 PM",
    "tuesday": "8:00 AM - 5:00 PM",
    "wednesday": "8:00 AM - 5:00 PM",
    "thursday": "8:00 AM - 5:00 PM",
    "friday": "8:00 AM - 5:00 PM",
    "saturday": "Closed",
    "sunday": "Closed"
  }'::jsonb,
  social_media JSONB DEFAULT '{}'::jsonb,
  google_maps_url TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  privacy_statement TEXT,
  coming_soon_mode BOOLEAN DEFAULT false,
  default_theme VARCHAR(20) DEFAULT 'light' CHECK (default_theme IN ('light', 'dark')),
  button_styles JSONB DEFAULT '{
    "primaryButtonBg": "#2563eb",
    "primaryButtonText": "#ffffff",
    "primaryButtonHoverBg": "#1d4ed8",
    "primaryButtonHoverText": "#ffffff",
    "primaryButtonBorder": "1px solid #2563eb",
    "primaryButtonBorderColor": "#2563eb",
    "secondaryButtonBg": "#f3f4f6",
    "secondaryButtonText": "#1f2937",
    "secondaryButtonHoverBg": "#e5e7eb",
    "secondaryButtonHoverText": "#1f2937",
    "secondaryButtonBorder": "1px solid #d1d5db",
    "secondaryButtonBorderColor": "#d1d5db"
  }'::jsonb,
  landing_page JSONB DEFAULT '{
    "serviceBlocks": [],
    "companyInfo": {}
  }'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure only one settings row exists (singleton pattern)
CREATE UNIQUE INDEX idx_site_settings_singleton ON site_settings((id IS NOT NULL));

-- ============================================================================
-- 6. FORM_CONFIGURATIONS TABLE
-- ============================================================================
DROP TABLE IF EXISTS form_configurations CASCADE;

CREATE TABLE form_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_type VARCHAR(100) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  email_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  service_options TEXT[],
  available_dates JSONB,
  available_times TEXT[],
  success_message TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_form_configurations_type ON form_configurations(form_type);
CREATE INDEX idx_form_configurations_enabled ON form_configurations(enabled);

-- ============================================================================
-- 7. FORM_ENTRIES TABLE
-- ============================================================================
DROP TABLE IF EXISTS form_entries CASCADE;

CREATE TABLE form_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  notes TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_form_entries_type ON form_entries(form_type);
CREATE INDEX idx_form_entries_status ON form_entries(status);
CREATE INDEX idx_form_entries_created_at ON form_entries(created_at DESC);
CREATE INDEX idx_form_entries_customer_email ON form_entries(customer_email);
CREATE INDEX idx_form_entries_type_status ON form_entries(form_type, status);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_form_configurations_updated_at ON form_configurations;
CREATE TRIGGER update_form_configurations_updated_at BEFORE UPDATE ON form_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_form_entries_updated_at ON form_entries;
CREATE TRIGGER update_form_entries_updated_at BEFORE UPDATE ON form_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended
-- ============================================================================

-- Enable RLS on all tables (you can customize policies later)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entries ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (for your backend)
-- This allows your server with service_role_key to access everything

-- Public read access for published pages (customize as needed)
CREATE POLICY "Public pages are viewable by everyone" ON pages
  FOR SELECT USING (is_published = true);

-- Public read access for published posts
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (is_published = true);

-- Public read access for site settings
CREATE POLICY "Site settings are viewable by everyone" ON site_settings
  FOR SELECT USING (true);

-- Public read access for media
CREATE POLICY "Media is viewable by everyone" ON media
  FOR SELECT USING (true);

-- Admin full access (you'll implement auth logic in your app)
-- For now, service_role_key bypasses RLS automatically

-- ============================================================================
-- INITIAL DATA (Optional - uncomment if you want default settings)
-- ============================================================================

-- Insert default site settings if none exist
INSERT INTO site_settings (
  site_name, 
  tagline, 
  site_url, 
  primary_color, 
  secondary_color,
  coming_soon_mode
) 
SELECT 
  'FlowPortal',
  'Your Trusted Plumbing Partner',
  'https://newportplumbing.com',
  '#2563eb',
  '#10b981',
  false
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- ============================================================================
-- DONE! Your database is ready for migration
-- ============================================================================

-- Next steps:
-- 1. Run this SQL in Supabase Dashboard -> SQL Editor
-- 2. Run the migration script: npm run migrate:from-mongo
-- 3. Verify data in Supabase Dashboard -> Table Editor
