# 🚀 MongoDB to Supabase Migration Guide

## Overview

This guide provides a **clean, phased approach** to migrate your FlowPortal application from MongoDB to Supabase (PostgreSQL).

## Why This Migration Makes Sense

- ✅ **Built-in Authentication**: Supabase Auth handles user management
- ✅ **Real-time Capabilities**: Built-in real-time subscriptions
- ✅ **Row Level Security (RLS)**: Database-level security policies
- ✅ **Auto-generated APIs**: REST and GraphQL APIs out of the box
- ✅ **File Storage**: Supabase Storage for media files
- ✅ **Better Scaling**: Managed PostgreSQL with connection pooling
- ✅ **TypeScript Support**: Auto-generated types from database schema

---

## 📊 Current Database Structure Analysis

Your application has **7 main collections/tables**:

1. **Users** - User accounts with authentication
2. **Pages** - CMS pages
3. **Posts** - Blog posts
4. **SiteSettings** - Site configuration (complex nested structure)
5. **Media** - File metadata
6. **FormConfiguration** - Dynamic form configurations
7. **FormEntry** - Form submissions

---

## 🎯 Migration Strategy: Three Approaches

### **Approach 1: Big Bang Migration** ⚡ (Recommended for Development)
- **Timeline**: 2-3 days
- **Downtime**: Required during migration
- **Risk**: Low (for dev/staging)
- **Best for**: Starting fresh or testing environments

### **Approach 2: Parallel Migration** 🔄 (Recommended for Production)
- **Timeline**: 1-2 weeks
- **Downtime**: Minimal
- **Risk**: Medium
- **Best for**: Production with active users

### **Approach 3: Dual-Write Migration** 📝 (Most Complex)
- **Timeline**: 2-4 weeks
- **Downtime**: None
- **Risk**: Higher complexity
- **Best for**: High-traffic production sites

---

## 🏗️ Recommended: **Big Bang Migration** (Easiest & Cleanest)

This is the cleanest approach for most scenarios. Here's the step-by-step process:

---

## Phase 1: Setup Supabase (30 minutes)

### Step 1.1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon/Public Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...` (secret!)
   - Database Password

### Step 1.2: Install Supabase Client

```bash
cd /Users/timothyfarzalo/Desktop/FlowPortal-export-2026-01-13
npm install @supabase/supabase-js --workspace=server
npm install @supabase/supabase-js --workspace=client
```

---

## Phase 2: Create Database Schema (1 hour)

### Step 2.1: Run SQL Migrations in Supabase Dashboard

Go to Supabase Dashboard → SQL Editor → New Query

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor', 'super_admin')),
  refresh_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);

-- 2. PAGES TABLE
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

-- 3. POSTS TABLE
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category VARCHAR(100) DEFAULT 'uncategorized',
  tags TEXT[], -- Array of strings
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
CREATE INDEX idx_posts_published_at ON posts(published_at);

-- 4. MEDIA TABLE
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

-- 5. SITE_SETTINGS TABLE (Using JSONB for nested structures)
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
  button_styles JSONB DEFAULT '{}'::jsonb,
  landing_page JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure only one settings row exists (singleton pattern)
CREATE UNIQUE INDEX idx_site_settings_singleton ON site_settings((id IS NOT NULL));

-- 6. FORM_CONFIGURATIONS TABLE
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

-- 7. FORM_ENTRIES TABLE
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

-- Trigger function to update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_configurations_updated_at BEFORE UPDATE ON form_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_entries_updated_at BEFORE UPDATE ON form_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Phase 3: Export MongoDB Data (15 minutes)

```bash
cd /Users/timothyfarzalo/Desktop/FlowPortal-export-2026-01-13/server
npm run export:data
```

This creates: `server/exports/database-export-2026-01-13T10-30-00.json`

---

## Phase 4: Create Data Migration Script (Included Below)

I'll create a migration script that:
1. Reads your MongoDB export
2. Transforms MongoDB ObjectIDs to UUIDs
3. Handles nested structures → JSONB
4. Imports into Supabase

---

## Phase 5: Update Application Code (2-3 hours)

### Replace Mongoose with Supabase Client

**Current (Mongoose):**
```typescript
const users = await User.find();
```

**New (Supabase):**
```typescript
const { data: users } = await supabase.from('users').select('*');
```

---

## 🎁 What I'll Provide Next

Would you like me to create:

1. ✅ **Complete migration script** (`migrateToSupabase.ts`)
2. ✅ **New Supabase service layers** (replaces Mongoose services)
3. ✅ **Updated route handlers** (using Supabase)
4. ✅ **Environment configuration** (.env setup)
5. ✅ **Authentication migration** (JWT → Supabase Auth or keep JWT)

---

## 📈 Benefits After Migration

- **Faster queries** with PostgreSQL indexing
- **Type safety** with auto-generated types
- **Built-in caching** with connection pooling
- **Real-time updates** for collaborative features
- **Better scalability** for growth
- **Unified storage** for media files (Supabase Storage)

---

## ⏱️ Estimated Timeline

| Phase | Time | Description |
|-------|------|-------------|
| Setup Supabase | 30 min | Create project, install packages |
| Create Schema | 1 hour | Run SQL migrations |
| Export MongoDB | 15 min | Export existing data |
| Data Migration Script | 1 hour | Transform and import data |
| Update Code | 3-4 hours | Replace Mongoose with Supabase |
| Testing | 2 hours | Test all features |
| **Total** | **~8 hours** | **One full working day** |

---

## 🚦 Next Steps

**Option A**: I can create all the migration scripts and updated code for you right now

**Option B**: You review this plan first, then we proceed with implementation

**Option C**: We do a hybrid approach - keep MongoDB for now, add Supabase for new features

Which approach would you prefer? I'm ready to start building the migration scripts whenever you're ready! 🚀
