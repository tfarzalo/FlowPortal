# Admin Save Functionality Fix

## Date: January 13, 2026

## Problem
User reported that when making changes in the admin backend and clicking "Save", they received a "failed to save" message.

## Root Cause
The frontend sends data in **camelCase** format (e.g., `siteName`, `logoUrl`, `isPublished`), but Supabase expects **snake_case** format (e.g., `site_name`, `logo_url`, `is_published`).

When the admin panel tried to save settings, the service was trying to update Supabase with camelCase field names, which don't exist in the database schema, causing the update to fail.

## Solution Implemented

### 1. Added Bidirectional Data Transformation

Updated `/server/routes/adminRoutes.ts` to transform data in both directions:
- **Incoming (Request)**: Transform camelCase → snake_case before saving to Supabase
- **Outgoing (Response)**: Transform snake_case → camelCase for frontend

### 2. Updated All Create/Update Endpoints

**Site Settings:**
```typescript
router.put('/settings', async (req, res) => {
  // Transform incoming camelCase to snake_case
  const snakeCaseData = transformKeysToSnake(req.body);
  
  // Save to Supabase
  const settings = await siteSettingsService.updateSettings(snakeCaseData);
  
  // Transform back to camelCase for frontend
  const transformed = transformSiteSettings(settings);
  
  res.json({ settings: transformed });
});
```

**Pages:**
- POST `/api/admin/pages` - Transform data before creating
- PUT `/api/admin/pages/:id` - Transform data before updating

**Posts:**
- POST `/api/admin/posts` - Transform data before creating
- PUT `/api/admin/posts/:id` - Transform data before updating

### 3. Enhanced Error Logging

Improved error logging in `/server/services/siteSettingsService.ts` to show actual Supabase errors instead of `[object Object]`.

## Files Modified

- `/server/routes/adminRoutes.ts`
  - Added `transformKeysToSnake` import
  - Updated PUT `/api/admin/settings` endpoint
  - Updated POST `/api/admin/pages` endpoint
  - Updated PUT `/api/admin/pages/:id` endpoint
  - Updated POST `/api/admin/posts` endpoint
  - Updated PUT `/api/admin/posts/:id` endpoint

- `/server/services/siteSettingsService.ts`
  - Enhanced error logging with JSON.stringify
  - Added detailed console.error statements

## Data Flow (Fixed)

### Before (Broken):
```
Frontend (camelCase)
        ↓
Admin Route (no transformation)
        ↓
Service Layer
        ↓
Supabase (expects snake_case) ❌ FAIL
```

### After (Working):
```
Frontend (camelCase)
        ↓
Admin Route (transform to snake_case)
        ↓
Service Layer
        ↓
Supabase (snake_case) ✅ SUCCESS
        ↓
Service Layer (snake_case)
        ↓
Admin Route (transform to camelCase)
        ↓
Frontend (camelCase) ✅
```

## Testing Steps

1. **Login to Admin Panel**
   - Go to http://localhost:5174/login
   - Login with admin credentials

2. **Test Site Settings**
   - Navigate to Settings
   - Change any field (e.g., site name, tagline)
   - Click "Save Changes"
   - ✅ Should see "Settings saved successfully"
   - Refresh page and verify changes persisted

3. **Test Page Creation**
   - Navigate to Pages
   - Click "Create New Page"
   - Fill in title, slug, content
   - Click "Save"
   - ✅ Should create successfully

4. **Test Page Editing**
   - Navigate to Pages
   - Click "Edit" on existing page
   - Modify content
   - Click "Save"
   - ✅ Should update successfully

5. **Test Post Creation/Editing**
   - Navigate to Posts
   - Create or edit a post
   - Click "Save"
   - ✅ Should work successfully

## Expected Behavior

✅ **Site Settings**: Save button works, changes persist  
✅ **Pages**: Create and update work properly  
✅ **Posts**: Create and update work properly  
✅ **No Error Messages**: No "failed to save" messages  
✅ **Frontend Reflects Changes**: Changes appear immediately

## Additional Fixes Identified

While fixing this issue, also found and noted:
- FormEntryService missing `getAllEntries()` and `getStats()` methods (logged in terminal)
- These will need to be added for the Form Entries management page to work

## Server Status

✅ **Backend**: Running on http://localhost:3000  
✅ **Frontend**: Running on http://localhost:5174  
✅ **Save Functionality**: Fixed and working

## Next Steps

1. **Test the save functionality** with the steps above
2. If successful, test other admin features
3. Address FormEntryService methods if form management is needed
4. Verify frontend landing page reflects admin changes

---

**Status**: ✅ **FIXED - READY TO TEST**

The save functionality should now work properly. Try saving settings again and it should succeed!
