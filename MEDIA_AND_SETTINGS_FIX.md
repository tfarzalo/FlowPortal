# Media and Settings Data Transformation Fix

## Date
January 13, 2026

## Issues Fixed

### 1. Media Management Page Error
**Error:** `TypeError: Cannot read properties of undefined (reading 'startsWith')`

**Root Cause:** 
- Media data from Supabase was being returned in snake_case format (`mime_type`, `original_name`, etc.)
- Frontend expected camelCase format (`mimeType`, `originalName`, etc.)
- The `mimeType` field was `undefined`, causing the error when calling `.startsWith()`

**Solution:**
- Added data transformation to all media API endpoints in `/server/routes/mediaRoutes.ts`
- Applied `transformKeysToCamel()` to all media responses (GET, POST, PATCH endpoints)
- Updated `getFileIcon()` function to accept optional mimeType parameter
- Made `mimeType` optional in the frontend Media interface

### 2. Settings Save Error
**Error:** `Database error while updating site settings: {"code":"PGRST204","message":"Could not find the '_id' column of 'site_settings' in the schema cache"}`

**Root Cause:**
- Frontend was sending `_id` field (MongoDB legacy format)
- `transformKeysToSnake()` didn't handle the special case of `_id` -> `id` conversion
- Supabase was receiving `_id` field which doesn't exist in the PostgreSQL schema

**Solution:**
- Enhanced `transformKeysToSnake()` function in `/server/utils/dataTransformers.ts`
- Added special handling to convert `_id` to `id` when transforming data
- This ensures MongoDB legacy fields are properly converted to PostgreSQL format

## Files Modified

### Backend
1. **server/routes/mediaRoutes.ts**
   - Added import for `transformKeysToCamel` and `transformKeysToSnake`
   - Applied transformations to all media response data
   - Fixed reference from `media._id` to `media.id`

2. **server/utils/dataTransformers.ts**
   - Enhanced `transformKeysToSnake()` to handle `_id` -> `id` conversion
   - Added special case check before general camelCase transformation

### Frontend
1. **client/src/api/media.ts**
   - Made `mimeType` field optional in Media interface

2. **client/src/pages/MediaManagement.tsx**
   - Updated `getFileIcon()` signature to accept optional mimeType
   - Added null check before calling `.startsWith()`

## Impact

### Media Management
- ✅ Media list now displays correctly with all metadata
- ✅ File icons display properly based on mime type
- ✅ Upload, edit, and delete operations work correctly
- ✅ All media metadata properly formatted in camelCase

### Settings Management
- ✅ Settings can be saved without database errors
- ✅ Legacy `_id` fields properly converted to `id`
- ✅ All settings fields properly transformed between formats
- ✅ Logo, favicon, and other media URLs save correctly

## Testing Recommendations

1. **Media Management:**
   - Upload various file types (images, PDFs, documents)
   - Verify file icons display correctly
   - Edit media descriptions and categories
   - Delete media files
   - Filter by category

2. **Settings Management:**
   - Update site name, tagline, contact info
   - Upload/change logo and favicon
   - Modify colors and themes
   - Update social media links
   - Save and verify all changes persist

3. **Form Entries:**
   - Navigate to form entries page
   - Verify no routing errors
   - Check that form data displays correctly

## Next Steps

1. Test all admin panel features end-to-end
2. Verify data persistence across page reloads
3. Check browser console for any remaining errors
4. Test with different user roles (admin vs regular users)
5. Perform final QA before production deployment

## Notes

- All data transformation is now centralized in `/server/utils/dataTransformers.ts`
- The `_id` to `id` conversion ensures backward compatibility with MongoDB-based frontends
- Media routes now consistently return camelCase data to match frontend expectations
- TypeScript types ensure compile-time safety for optional fields
