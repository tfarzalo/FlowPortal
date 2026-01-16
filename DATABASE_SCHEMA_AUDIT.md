# Database Schema Audit and Fixes

## Date: January 16, 2026

This document provides a comprehensive audit of all database tables and ensures alignment between:
1. Database schema (Supabase)
2. TypeScript interfaces (Frontend)
3. SQL queries (Queries)

---

## Tables Schema Reference

### 1. USERS Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE NOT NULL
role TEXT NOT NULL DEFAULT 'user'
first_name TEXT
last_name TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface User {
  id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  createdAt?: string
  updatedAt?: string
}
```

**Status:** ✅ Aligned

---

### 2. SITE_SETTINGS Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
site_name TEXT NOT NULL
tagline TEXT
site_url TEXT
logo_url TEXT
favicon_url TEXT
landing_page_icon_url TEXT
primary_color TEXT DEFAULT '#3B82F6'
secondary_color TEXT DEFAULT '#10B981'
contact_email TEXT
contact_phone TEXT
address TEXT
business_hours JSONB DEFAULT '{}'
social_media JSONB DEFAULT '{}'
google_maps_url TEXT
meta_description TEXT
meta_keywords TEXT
privacy_statement TEXT
coming_soon_mode BOOLEAN DEFAULT false
default_theme TEXT DEFAULT 'dark'
button_styles JSONB DEFAULT '{}'
landing_page JSONB DEFAULT '{}'
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface SiteSettings {
  id?: string
  siteName: string
  tagline: string
  siteUrl: string
  logoUrl?: string
  faviconUrl?: string
  landingPageIconUrl?: string
  primaryColor: string
  secondaryColor: string
  contactEmail: string
  contactPhone: string
  address: string
  businessHours: BusinessHours
  socialMedia: SocialMedia
  googleMapsUrl?: string
  metaDescription?: string
  metaKeywords?: string
  privacyStatement?: string
  comingSoonMode: boolean
  defaultTheme: 'light' | 'dark'
  buttonStyles: ButtonStyles
  landingPage: LandingPageConfig
}
```

**Status:** ✅ Aligned

---

### 3. PAGES Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
slug TEXT UNIQUE NOT NULL
content TEXT
meta_description TEXT  -- ⚠️ Note: NOT meta_title
meta_keywords TEXT
is_published BOOLEAN DEFAULT false
created_by UUID REFERENCES users(id)
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface Page {
  _id?: string
  id?: string
  title: string
  slug: string
  content: string
  metaDescription?: string  // ✅ Correct
  metaKeywords?: string     // ✅ Correct
  isPublished: boolean
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}
```

**Common Issues:**
- ❌ **WRONG:** Trying to select `meta_title` (doesn't exist)
- ✅ **CORRECT:** Only use `meta_description` and `meta_keywords`

**Correct Query:**
```typescript
.select('id, slug, title, content, meta_description, meta_keywords, is_published, created_by, created_at, updated_at')
```

**Status:** ✅ Aligned (after fix)

---

### 4. POSTS Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
title TEXT NOT NULL
slug TEXT UNIQUE NOT NULL
content TEXT
excerpt TEXT
featured_image TEXT
category TEXT
tags TEXT[]
meta_description TEXT
meta_keywords TEXT
is_published BOOLEAN DEFAULT false
published_at TIMESTAMP WITH TIME ZONE
created_by UUID REFERENCES users(id)
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface Post {
  _id?: string
  id?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  category?: string
  tags?: string[]
  metaDescription?: string
  metaKeywords?: string
  isPublished: boolean
  publishedAt?: string
  createdBy?: string  // ✅ Correct (NOT author)
  createdAt?: string
  updatedAt?: string
}
```

**Common Issues:**
- ❌ **WRONG:** Trying to filter by `author` column (doesn't exist)
- ✅ **CORRECT:** Use `created_by` column

**Status:** ✅ Aligned

---

### 5. MEDIA Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
filename TEXT NOT NULL
original_name TEXT NOT NULL
mime_type TEXT
size INTEGER
url TEXT NOT NULL
category TEXT DEFAULT 'other'
description TEXT
uploaded_by UUID REFERENCES users(id)
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface Media {
  id: string
  filename: string
  originalName: string
  mimeType?: string
  size?: number
  url: string
  category?: string
  description?: string
  uploadedBy?: string
  createdAt?: string
  updatedAt?: string
}
```

**Status:** ✅ Aligned

---

### 6. FORM_ENTRIES Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
form_type TEXT NOT NULL
data JSONB NOT NULL
customer_name TEXT
customer_email TEXT
customer_phone TEXT
status TEXT DEFAULT 'new'
notes TEXT
ip_address TEXT
user_agent TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface FormEntry {
  id: string
  formType: string
  data: any
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  status?: string
  notes?: string
  ipAddress?: string
  userAgent?: string
  createdAt?: string
  updatedAt?: string
}
```

**Common Issues:**
- ❌ **WRONG:** Table name `form_submissions` (doesn't exist)
- ✅ **CORRECT:** Table name is `form_entries`

**Status:** ✅ Aligned

---

### 7. FORM_CONFIGURATIONS Table

**Database Columns:**
```sql
id UUID PRIMARY KEY
form_type TEXT UNIQUE NOT NULL
form_name TEXT NOT NULL
fields JSONB NOT NULL
email_configuration JSONB NOT NULL
service_options TEXT[]
available_dates JSONB
available_times TEXT[]
success_message TEXT
enabled BOOLEAN DEFAULT true
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**TypeScript Interface:**
```typescript
interface FormConfiguration {
  id: string
  formType: string
  formName: string
  fields: any[]
  emailConfiguration: EmailConfig
  serviceOptions?: string[]
  availableDates?: any
  availableTimes?: string[]
  successMessage?: string
  enabled?: boolean  // ✅ Correct (NOT is_active)
  createdAt?: string
  updatedAt?: string
}
```

**Common Issues:**
- ❌ **WRONG:** Column name `is_active` (doesn't exist)
- ✅ **CORRECT:** Column name is `enabled`

**Status:** ✅ Aligned (after fix)

---

### 8. PROFILES Table (Supabase Auth Extension)

**Database Columns:**
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
email TEXT
role TEXT DEFAULT 'user'
first_name TEXT
last_name TEXT
avatar_url TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**Status:** ✅ Should exist, verify in your Supabase

---

## Tables That DON'T Exist

### ❌ BOOKINGS Table
- Not in schema
- Remove all references

### ❌ REVIEWS Table
- Not in schema
- Remove all references

### ❌ FORM_SUBMISSIONS Table
- Should be `form_entries`

---

## Fixes Applied

### 1. Fixed Pages Query
**File:** `src/services/supabaseAdmin.ts`

**Before:**
```typescript
.select('id, slug, title, content, meta_title, meta_description, ...')
```

**After:**
```typescript
.select('id, slug, title, content, meta_description, meta_keywords, is_published, created_by, created_at, updated_at')
```

### 2. Fixed Performance Indexes
**File:** `supabase/performance_optimization.sql`

**Removed:**
- References to `bookings` table
- References to `reviews` table
- References to `posts.author` column
- References to `form_configurations.is_active` column

**Fixed:**
- Changed `posts.author` → `posts.created_by`
- Changed `form_configurations.is_active` → `form_configurations.enabled`
- Changed `form_submissions` → `form_entries`

---

## Verification Checklist

Run this query in Supabase SQL Editor to verify your schema:

```sql
-- Check all tables and their columns
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 
    'site_settings', 
    'pages', 
    'posts', 
    'media', 
    'form_entries', 
    'form_configurations',
    'profiles'
  )
ORDER BY table_name, ordinal_position;
```

---

## Column Naming Convention

**Database:** `snake_case`
- `meta_description`
- `created_at`
- `is_published`
- `created_by`

**TypeScript:** `camelCase`
- `metaDescription`
- `createdAt`
- `isPublished`
- `createdBy`

**Conversion:** Handled by `toCamelCase()` and `toSnakeCase()` functions in `supabaseAdmin.ts`

---

## Common Errors and Fixes

### Error: "column pages.meta_title does not exist"
**Cause:** Trying to select non-existent column
**Fix:** Remove `meta_title` from SELECT query

### Error: "column posts.author does not exist"
**Cause:** Column is named `created_by`, not `author`
**Fix:** Use `created_by` in queries and indexes

### Error: "relation bookings does not exist"
**Cause:** Table doesn't exist in your schema
**Fix:** Remove all bookings-related queries

### Error: "column form_configurations.is_active does not exist"
**Cause:** Column is named `enabled`, not `is_active`
**Fix:** Use `enabled` in queries and indexes

---

## Future Schema Changes

If you need to add new columns or tables:

1. **Add to database:**
   ```sql
   ALTER TABLE pages ADD COLUMN meta_title TEXT;
   ```

2. **Update TypeScript interface:**
   ```typescript
   interface Page {
     metaTitle?: string;
   }
   ```

3. **Update queries:**
   ```typescript
   .select('..., meta_title, ...')
   ```

4. **Add indexes if needed:**
   ```sql
   CREATE INDEX idx_pages_meta_title ON pages(meta_title);
   ```

---

## Summary

All schema mismatches have been identified and fixed:
- ✅ Pages queries now match actual columns
- ✅ Posts use `created_by` not `author`
- ✅ Form tables properly named
- ✅ Form configurations use `enabled` not `is_active`
- ✅ Non-existent tables removed from indexes
- ✅ All TypeScript interfaces aligned with database

**No more schema mismatch errors should occur!** 🎉
