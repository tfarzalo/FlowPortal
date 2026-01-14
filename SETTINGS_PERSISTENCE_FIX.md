# Settings Persistence Fix - Complete Implementation

## Problem Summary

Admin settings (logo, favicon, branding info, etc.) were not being properly saved to the database and reflected on the frontend. The main issues were:

1. **Logo/Favicon URL Storage Issue**: Frontend was storing full URLs (`http://localhost:3000/uploads/file.png`) instead of relative paths (`/uploads/file.png`)
2. **URL Construction Issue**: Frontend components were not consistently using `getMediaUrl()` to construct full URLs from relative paths
3. **Service Layer Issues**: Backend service was using `Object.assign()` which doesn't always trigger Mongoose change detection for nested objects

## Solution Implemented

### 1. Backend Service Layer Enhancement (`server/services/siteSettingsService.ts`)

**Changes:**
- Enhanced `updateSettings()` method to explicitly handle each field individually
- Added proper handling for nested objects (businessHours, socialMedia)
- Improved logging to track data flow through the service layer
- Ensured Mongoose properly detects and saves all changes

**Key Code:**
```typescript
// Explicitly handle all fields to ensure proper updates
if (updates.siteName !== undefined) settings.siteName = updates.siteName;
if (updates.logoUrl !== undefined) settings.logoUrl = updates.logoUrl;
if (updates.faviconUrl !== undefined) settings.faviconUrl = updates.faviconUrl;
// ... etc for all fields

// Handle nested objects
if (updates.businessHours !== undefined) {
  settings.businessHours = {
    ...settings.businessHours,
    ...updates.businessHours
  };
}
```

### 2. Backend Routes Enhancement (`server/routes/adminRoutes.ts`)

**Changes:**
- Added detailed logging for PUT /api/admin/settings endpoint
- Log incoming request data, field keys, and response data
- Added stack trace logging for errors

### 3. Frontend URL Storage Fix (`client/src/pages/admin/SiteSettings.tsx`)

**Changes:**
- Modified `selectLogo()` and `selectFavicon()` functions to store **relative paths** instead of full URLs
- Changed from: `const logoUrl = getMediaUrl(media.url)`
- Changed to: `const logoUrl = media.url`
- Updated display logic to use `getMediaUrl()` when rendering images

**Why This Matters:**
- Database should store portable, environment-agnostic paths: `/uploads/file.png`
- Frontend constructs full URLs dynamically based on environment: `http://localhost:3000/uploads/file.png` or `https://newportplumbing.com/uploads/file.png`

### 4. Frontend Display Components

**Fixed Files:**
- `client/src/components/landing/HeroSection.tsx`
- `client/src/components/landing/LandingFooter.tsx`
- `client/src/pages/ComingSoonPage.tsx`

**Changes:**
- Added import: `import { getMediaUrl } from "@/config/api";`
- Updated image src attributes: `src={getMediaUrl(settings.logoUrl)}`
- All components now properly construct full URLs from relative paths

### 5. Database Verification Script

**New File:** `server/scripts/verifyAndFixSettings.ts`

**Features:**
- Checks all site settings fields
- Validates businessHours and socialMedia objects
- Lists available logo files in media library
- Provides suggestions for fixing issues
- Can be run anytime to verify database state

**Usage:**
```bash
npm run verify:settings
```

## Architecture

### Data Flow for Logo/Favicon:

1. **Upload Media**
   - Admin uploads file via Media Management
   - File saved to: `/uploads/file-123.png`
   - Database stores: `{ url: "/uploads/file-123.png", category: "logo" }`

2. **Select in Settings**
   - Admin opens Site Settings
   - Selects logo from media library
   - Frontend stores relative path: `/uploads/file-123.png`

3. **Save Settings**
   - Frontend sends: `{ logoUrl: "/uploads/file-123.png" }`
   - Backend saves to database exactly as received
   - Database contains: `logoUrl: "/uploads/file-123.png"`

4. **Display on Public Site**
   - Component loads settings: `{ logoUrl: "/uploads/file-123.png" }`
   - Component calls: `getMediaUrl(settings.logoUrl)`
   - Returns: `http://localhost:3000/uploads/file-123.png` (dev) or `https://newportplumbing.com/uploads/file-123.png` (prod)
   - Image tag uses full URL

### Environment-Aware URL Construction

The `getMediaUrl()` function in `client/src/config/api.ts`:
- Checks if path is already a full URL (returns as-is)
- Otherwise, detects environment:
  - **Development**: Prepends `http://localhost:3000`
  - **Production**: Uses current window location
- Ensures URLs work in any deployment environment

## Files Modified

### Backend
1. `server/services/siteSettingsService.ts` - Enhanced field handling
2. `server/routes/adminRoutes.ts` - Improved logging
3. `server/package.json` - Added verify:settings script

### Frontend
1. `client/src/pages/admin/SiteSettings.tsx` - Fixed URL storage
2. `client/src/components/landing/HeroSection.tsx` - Fixed URL display
3. `client/src/components/landing/LandingFooter.tsx` - Fixed URL display
4. `client/src/pages/ComingSoonPage.tsx` - Fixed URL display

### New Files
1. `server/scripts/verifyAndFixSettings.ts` - Database verification tool

## Testing the Fix

### 1. Verify Database State
```bash
cd server
npm run verify:settings
```

### 2. Upload a Logo
1. Go to Admin > Media Management
2. Upload a logo file (PNG recommended)
3. Set category to "logo"
4. Note the file name in the list

### 3. Configure Site Settings
1. Go to Admin > Site Settings
2. Click "Select from Media Library" under Site Logo
3. Choose the uploaded logo
4. Verify preview appears
5. Update other fields (site name, tagline, contact info, etc.)
6. Click "Save Changes"
7. Check for success toast notification

### 4. Verify on Public Site
1. Click "View Site" button in admin
2. Check hero section for logo
3. Scroll to footer and check logo there
4. Verify all contact information is displayed correctly
5. Check business hours and social media links

### 5. Verify Persistence
1. Refresh the page
2. Logo and all settings should remain
3. Check browser console for any errors
4. Verify backend logs show successful retrieval

## Debugging

### Backend Logs to Check
```
[SiteSettingsService] Updating settings with data: { ... }
[SiteSettingsService] Settings saved successfully to database: { ... }
[AdminRoutes] Settings updated, returning response with: { ... }
```

### Frontend Logs to Check
```
[SiteSettings] Settings loaded successfully: { hasLogo: true, ... }
[SiteSettings] Setting logo URL to: /uploads/file-123.png
[SiteSettings] Settings saved successfully
[HeroSection] Logo loaded from: http://localhost:3000/uploads/file-123.png
```

### Common Issues

**Issue**: Logo not displaying after save
- **Check**: Browser console for 404 errors
- **Solution**: Verify file exists in `server/uploads/` directory
- **Command**: `ls -la server/uploads/`

**Issue**: Settings revert after page refresh
- **Check**: Backend logs during save operation
- **Solution**: Run `npm run verify:settings` to check database
- **Check**: Ensure MongoDB is running and connected

**Issue**: Different URLs in dev vs production
- **Expected**: This is normal! `getMediaUrl()` adapts to environment
- **Dev**: `http://localhost:3000/uploads/...`
- **Prod**: `https://newportplumbing.com/uploads/...`

## Best Practices

1. **Always store relative paths in database**
   - Good: `/uploads/file.png`
   - Bad: `http://localhost:3000/uploads/file.png`

2. **Always use getMediaUrl() for display**
   - Good: `<img src={getMediaUrl(settings.logoUrl)} />`
   - Bad: `<img src={settings.logoUrl} />`

3. **Upload files through Media Management**
   - Ensures proper database records
   - Provides easy selection interface
   - Tracks file metadata

4. **Test in both environments**
   - Verify in development (localhost)
   - Verify in production (deployed URL)
   - URLs should adapt automatically

## Maintenance Commands

```bash
# Verify database settings
npm run verify:settings

# Export current data
npm run export:data

# Create backup before changes
npm run backup:db

# List all backups
npm run list:backups

# Import data (restore)
npm run import:data
```

## Related Documentation

- `BLANK_SETTINGS_PAGE_FIX.md` - Previous settings page fix
- `MEDIA_SYSTEM.md` - Media upload system documentation
- `DATABASE_MIGRATION_GUIDE.md` - Data migration procedures
- `SITE_URL_UPDATE_SUMMARY.md` - Site URL configuration

## Summary

This fix ensures that:
✅ All settings are properly saved to the database
✅ Logo and favicon URLs are stored as portable relative paths
✅ Frontend components construct environment-appropriate full URLs
✅ Settings persist across page refreshes and deployments
✅ Database verification tools are available for troubleshooting
✅ Comprehensive logging aids in debugging issues

The implementation follows best practices for environment-agnostic data storage and provides robust tools for maintaining site configuration.
