-- Performance Optimization for FlowPortal
-- Add indexes to improve query performance on commonly accessed columns
-- Uses IF NOT EXISTS to avoid errors if indexes already exist

-- ==================== PAGES TABLE ====================

-- Index on slug for fast lookups (most common query)
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Index on published status + slug for combined queries
CREATE INDEX IF NOT EXISTS idx_pages_published_slug ON pages(is_published, slug) WHERE is_published = true;

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at DESC);

-- Index on updated_at for caching invalidation
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at DESC);


-- ==================== SITE_SETTINGS TABLE ====================

-- Index on updated_at for cache validation
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at DESC);


-- ==================== POSTS TABLE ====================

-- Index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Index on published status + created_at for blog listings
CREATE INDEX IF NOT EXISTS idx_posts_published_created ON posts(is_published, created_at DESC) WHERE is_published = true;

-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);

-- Index on created_by (author) for filtering
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON posts(created_by);


-- ==================== FORM_ENTRIES TABLE ====================

-- Index on form_type for filtering
CREATE INDEX IF NOT EXISTS idx_form_entries_form_type ON form_entries(form_type);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_form_entries_created_at ON form_entries(created_at DESC);

-- Index on customer_email for lookups
CREATE INDEX IF NOT EXISTS idx_form_entries_customer_email ON form_entries(customer_email);


-- ==================== FORM_CONFIGURATIONS TABLE ====================

-- Index on form_type for lookups
CREATE INDEX IF NOT EXISTS idx_form_configurations_form_type ON form_configurations(form_type);

-- Index on enabled for filtering
CREATE INDEX IF NOT EXISTS idx_form_configurations_enabled ON form_configurations(enabled) WHERE enabled = true;


-- ==================== MEDIA TABLE ====================

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- Index on url for lookups
CREATE INDEX IF NOT EXISTS idx_media_url ON media(url);

-- Index on category for filtering
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);

-- Index on uploaded_by for filtering
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);


-- ==================== PROFILES TABLE ====================

-- Index on email for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index on role for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);


-- Analyze tables to update statistics (only for tables that exist)
DO $$
BEGIN
  -- Analyze core tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages') THEN
    EXECUTE 'ANALYZE pages';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
    EXECUTE 'ANALYZE posts';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_settings') THEN
    EXECUTE 'ANALYZE site_settings';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_entries') THEN
    EXECUTE 'ANALYZE form_entries';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'form_configurations') THEN
    EXECUTE 'ANALYZE form_configurations';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media') THEN
    EXECUTE 'ANALYZE media';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    EXECUTE 'ANALYZE profiles';
  END IF;
END $$;

