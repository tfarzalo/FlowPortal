# Settings Page Blank Screen Fix

## Problem Description

When accessing the admin settings page (`/admin/settings`) on a custom deployed domain (not localhost), the page would render as blank. This issue occurred specifically after deployment and when bypassing SSL warnings.

## Root Cause Analysis

The issue was caused by **hardcoded `localhost:3000` URLs** throughout the frontend application, specifically in:

1. **SiteSettings.tsx** - Lines 75, 83, 265, 336
2. **MediaManagement.tsx** - Line 138

When the application was deployed to a custom domain (e.g., `preview-10osi7s9.ui.pythagora.ai`), these hardcoded localhost URLs would:
- Fail to load media files from the correct domain
- Cause CORS errors
- Potentially crash the React component, resulting in a blank page

## Solution Implementation

### 1. Created Dynamic API Configuration Utility

**File:** `client/src/config/api.ts`

This utility provides:
- `getApiUrl()` - Dynamically determines the correct API base URL based on the environment
- `getMediaUrl(relativePath)` - Constructs full URLs for media files

The utility automatically:
- Uses `http://localhost:3000` in development (when hostname is localhost/127.0.0.1)
- Uses the current domain's protocol and hostname in production/deployed environments
- Handles both absolute and relative URLs
- Includes comprehensive logging for debugging

### 2. Updated Components to Use Dynamic URLs

**Files Modified:**
- `client/src/pages/admin/SiteSettings.tsx`
  - Imported `getMediaUrl` from config
  - Updated logo and favicon selection to use dynamic URLs (lines 92-93, 102-103)
  - Updated media preview images to use `getMediaUrl()` (lines 286, 358)
  - Added comprehensive console logging for debugging

- `client/src/pages/MediaManagement.tsx`
  - Imported `getMediaUrl` from config
  - Updated `copyUrlToClipboard()` function (line 139)
  - Updated `viewInNewTab()` function (line 150)
  - Added console logging for debugging

### 3. Added React Error Boundary

**File:** `client/src/components/ErrorBoundary.tsx`

- Created a comprehensive Error Boundary component to catch and display React errors
- Prevents the entire app from crashing when a component error occurs
- Displays user-friendly error messages with:
  - Error details
  - Component stack trace (in development mode)
  - Recovery options (reload page, go back)
- Comprehensive error logging to console

**File:** `client/src/App.tsx`
- Wrapped the entire app with ErrorBoundary
- Added an additional ErrorBoundary specifically around the SiteSettings route for extra protection

### 4. Enhanced Logging

Added comprehensive console logging throughout to aid in debugging:
- API configuration initialization logs
- Settings loading/saving operations
- Media URL construction
- Error conditions with context

## Technical Details

### How the Dynamic URL System Works

```typescript
// In development (localhost:5173 → localhost:3000)
if (window.location.hostname === 'localhost') {
  return 'http://localhost:3000';
}

// In production (preview-xyz.ui.pythagora.ai → preview-xyz.ui.pythagora.ai)
const protocol = window.location.protocol;
const host = window.location.hostname;
return `${protocol}//${host}`;
```

### Example URL Transformations

**Development:**
- Input: `/uploads/logo.png`
- Output: `http://localhost:3000/uploads/logo.png`

**Production:**
- Input: `/uploads/logo.png`
- Output: `https://preview-10osi7s9.ui.pythagora.ai/uploads/logo.png`

## Files Changed

1. **Created:**
   - `client/src/config/api.ts` - API configuration utility
   - `client/src/components/ErrorBoundary.tsx` - Error boundary component
   - `SETTINGS_PAGE_FIX.md` - This documentation

2. **Modified:**
   - `client/src/pages/admin/SiteSettings.tsx` - Use dynamic URLs
   - `client/src/pages/MediaManagement.tsx` - Use dynamic URLs
   - `client/src/App.tsx` - Add error boundary

## Benefits

1. **Environment Agnostic** - Works in both development and production
2. **No Configuration Required** - Automatically detects the correct API URL
3. **Better Error Handling** - Error boundary prevents crashes
4. **Improved Debugging** - Comprehensive console logging
5. **Future Proof** - Works with any deployment domain

## Testing Recommendations

After deployment, verify:
1. Settings page loads without errors
2. Logo and favicon selection works
3. Media URLs are constructed correctly
4. Images load from the correct domain
5. No CORS errors in browser console

## Browser Console Logs to Expect

```
[API Config] Using API URL: https://your-domain.com
[SiteSettings] Loading settings...
[SiteSettings] Settings loaded successfully: { siteName: ..., hasLogo: true }
[SiteSettings] Loading logo media...
[SiteSettings] Loaded logo media successfully: { count: 2, items: [...] }
```

## Rollback Plan

If issues occur, the changes can be reverted by:
1. Removing the ErrorBoundary wrapper from App.tsx
2. Reverting to hardcoded URLs (not recommended)
3. Or simply using localhost development mode for testing

## Future Improvements

- Add environment variable support via `.env` files
- Implement CDN support for media files
- Add retry logic for failed media loads
- Consider implementing a service worker for offline support
