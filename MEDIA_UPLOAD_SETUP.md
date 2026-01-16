# Media Upload System Setup Guide

## Overview
The FlowPortal application uses **Supabase Storage** for media file uploads. This guide will help you set up the complete media management system.

## Architecture

```
User Uploads File
    ↓
Frontend (MediaManagement.tsx)
    ↓
supabaseMedia.ts Service
    ↓
Supabase Storage (media bucket)
    ↓
Database Record (media table)
    ↓
Public URL Generated
```

## Step-by-Step Setup

### 1. Create Media Table (SQL)

Run this in your **Supabase SQL Editor**:

```sql
-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS media_category_idx ON media(category);
CREATE INDEX IF NOT EXISTS media_uploaded_by_idx ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS media_created_at_idx ON media(created_at DESC);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view media" ON media;
DROP POLICY IF EXISTS "Authenticated users can upload media" ON media;
DROP POLICY IF EXISTS "Admins can update media" ON media;
DROP POLICY IF EXISTS "Admins can delete media" ON media;

-- Create RLS policies
CREATE POLICY "Anyone can view media"
ON media FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upload media"
ON media FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Admins can update media"
ON media FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete media"
ON media FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 2. Create Storage Bucket

**Via Supabase Dashboard:**

1. Go to: https://fnjdwozizspchhehzpcv.supabase.co
2. Click **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `media`
   - **Public bucket**: ✅ **ENABLED** (important for public image access)
   - **File size limit**: 50 MB (or your preference)
   - **Allowed MIME types**: Leave empty to allow all, or specify: `image/*,application/pdf`
5. Click **"Create bucket"**

### 3. Set Storage Bucket Policies

Run this SQL to configure storage policies:

```sql
-- Allow public to read/view files
CREATE POLICY "Public can view media files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' 
  AND (storage.foldername(name))[1] = 'uploads'
);

-- Allow admins to update
CREATE POLICY "Admins can update media files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete
CREATE POLICY "Admins can delete media files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### 4. Verify Setup

Check that everything is configured correctly:

```sql
-- Check media table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'media';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'media';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'media';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'media';

-- Check storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'media';
```

## How It Works

### Upload Process

1. **User selects file** in `/admin/media`
2. **File is uploaded** to Supabase Storage at `uploads/[timestamp]-[filename]`
3. **Public URL is generated**: 
   ```
   https://[project].supabase.co/storage/v1/object/public/media/uploads/[filename]
   ```
4. **Database record created** in `media` table with:
   - filename
   - original_name
   - mime_type
   - size
   - url (public URL)
   - category
   - description
   - uploaded_by (user ID)

### Supported File Categories

- `image` - Photos, graphics
- `logo` - Brand logos, icons
- `pdf` - PDF documents
- `document` - Word docs, spreadsheets
- `other` - Any other files

## Usage in Admin Area

### Upload Media

1. Navigate to **Admin** → **Media**
2. Click **"Choose File"**
3. Select category (e.g., "image", "logo")
4. Add description (optional)
5. Click **"Upload File"**

### Use Media in Settings

1. Go to **Admin** → **Settings**
2. For Logo/Favicon/Icons:
   - Click **"Select from Media"**
   - Choose uploaded image
   - URL is automatically saved

### Copy Media URLs

- Click the **copy icon** (📋) next to any media item
- URL is copied to clipboard
- Use in pages, posts, or external references

### Delete Media

- Click **trash icon** (🗑️) next to media item
- Confirms deletion
- Removes from both storage and database

## URL Structure

### Supabase Storage URLs
```
https://fnjdwozizspchhehzpcv.supabase.co/storage/v1/object/public/media/uploads/[filename]
```

### Example
```
https://fnjdwozizspchhehzpcv.supabase.co/storage/v1/object/public/media/uploads/1736984526-logo.png
```

## Code Components

### Service Layer
- **File**: `src/services/supabaseMedia.ts`
- **Functions**:
  - `uploadMedia()` - Upload file and create record
  - `getMedia()` - Fetch all media (with optional category filter)
  - `getMediaById()` - Get single media item
  - `updateMedia()` - Update metadata
  - `deleteMedia()` - Delete file and record

### UI Components
- **File**: `src/pages/MediaManagement.tsx`
- **Features**:
  - File upload with preview
  - Category filtering
  - Inline editing
  - Copy URL to clipboard
  - Delete confirmation
  - File size display
  - Mime type icons

### API Config
- **File**: `src/config/api.ts`
- **Function**: `getMediaUrl()` - Handles Supabase storage URLs

## Troubleshooting

### Upload Fails with "User not authenticated"
- Ensure you're logged in as admin
- Check browser console for auth errors
- Verify JWT token is valid

### Upload Fails with "Storage bucket not found"
- Verify bucket named "media" exists in Supabase Storage
- Check bucket is marked as "public"

### Upload Fails with "Permission denied"
- Check storage policies are created
- Verify RLS policies allow authenticated insert
- Ensure user has valid session

### Images Don't Display
- Check URL in browser - should return image
- Verify bucket is public
- Check storage policy allows SELECT for public

### Can't Delete Media
- Verify admin role in profiles table
- Check RLS policies allow admin delete
- Check storage policies allow admin delete

## Security Notes

- ✅ **Public bucket** allows anyone to view uploaded media
- ✅ **Only authenticated users** can upload
- ✅ **Only admins** can delete or update metadata
- ✅ **File validation** by mime type (configurable)
- ✅ **File size limits** enforced by Supabase (50MB default)

## Testing Checklist

- [ ] Create storage bucket named "media" (public)
- [ ] Run SQL to create media table
- [ ] Run SQL to create RLS policies
- [ ] Run SQL to create storage policies
- [ ] Log in as admin
- [ ] Navigate to Admin → Media
- [ ] Upload an image file
- [ ] Verify image appears in list
- [ ] Copy URL and open in browser
- [ ] Edit description/category
- [ ] Use image as logo in Settings
- [ ] Delete test image
- [ ] Verify deletion from storage and database

## Next Steps

1. **Test uploads** with various file types
2. **Set file size limits** in Supabase bucket settings
3. **Configure allowed MIME types** if needed
4. **Add image optimization** (optional - resize on upload)
5. **Set up CDN** for faster delivery (optional)

---

✅ **Media upload system ready!**
Upload files in Admin → Media, and use them throughout your application.
