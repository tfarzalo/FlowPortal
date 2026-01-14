# Coming Soon Mode & View Site Button Fix

## Problem Summary

Two related issues were affecting the admin experience:

1. **View Site Button Redirect Loop**: When admin users clicked "View Site" button, they were immediately redirected back to the admin panel instead of viewing the public site.

2. **Coming Soon Mode**: When "Coming Soon" mode was enabled in Site Settings, it should become the primary/front page for all visitors (while still allowing admin access).

## Root Cause

The `LandingPage.tsx` component had a `useEffect` hook that automatically redirected all authenticated admin users to `/admin`. This caused:
- Admin users couldn't preview the public site
- Admin users couldn't test the "Coming Soon" page
- Created a frustrating user experience

## Solution Implemented

### 1. Preview Mode Query Parameter

Added a `?preview=true` query parameter that allows admin users to bypass the automatic redirect and view the site as visitors would see it.

**Files Modified:**

#### `client/src/components/admin/AdminLayout.tsx`
- Updated `handleViewSite()` function to open the site with `?preview=true` parameter
- This ensures admin users can view the public site without being redirected

```typescript
const handleViewSite = () => {
  console.log('[AdminLayout] Opening site in new tab with preview mode');
  window.open('/?preview=true', '_blank');
};
```

#### `client/src/pages/LandingPage.tsx`
- Added `useSearchParams` hook to detect preview mode
- Modified redirect logic to skip redirect when `preview=true` is present
- Enhanced logging to include preview status

```typescript
const [searchParams] = useSearchParams();
const isPreview = searchParams.get('preview') === 'true';

useEffect(() => {
  console.log('[LandingPage] Checking auth:', { isAuthenticated, userRole: user?.role, isPreview });
  if (isAuthenticated && user?.role === 'admin' && !isPreview) {
    console.log('[LandingPage] Admin detected, redirecting to /admin');
    navigate('/admin');
  }
}, [isAuthenticated, user, navigate, isPreview]);
```

### 2. Coming Soon Mode (Already Implemented)

The Coming Soon mode was already fully implemented in the codebase:

- **Database Schema**: `server/models/SiteSettings.ts` includes `comingSoonMode: boolean` field
- **Admin UI**: `client/src/pages/admin/SiteSettings.tsx` has a toggle switch for Coming Soon mode
- **Frontend Logic**: `client/src/pages/LandingPage.tsx` checks the setting and shows `ComingSoonPage` when enabled

```typescript
// Show Coming Soon page if mode is enabled
if (settings?.comingSoonMode) {
  console.log('[LandingPage] Coming soon mode is enabled');
  return <ComingSoonPage />;
}
```

## How It Works

### Normal Visitor Flow:
1. Visitor goes to `/`
2. If Coming Soon mode is OFF → Shows full landing page
3. If Coming Soon mode is ON → Shows Coming Soon page

### Admin User Flow:
1. Admin visits `/` directly → Automatically redirected to `/admin`
2. Admin clicks "View Site" button → Opens `/?preview=true` in new tab
3. Preview mode bypasses redirect → Admin sees the site as visitors do
4. If Coming Soon mode is ON → Admin sees Coming Soon page (for testing)

### Coming Soon Page Features:
- Displays site logo, name, and tagline
- Shows contact information (phone, email, address)
- Includes "Admin Access" button to access admin panel
- Responsive design with gradient background

## Benefits

✅ **Admin Preview**: Admins can now view the public site without being redirected
✅ **Coming Soon Testing**: Admins can verify how the Coming Soon page looks
✅ **No Code Duplication**: Uses existing Coming Soon page implementation
✅ **Clean UX**: Opens in new tab, preserving admin panel state
✅ **Flexible**: Preview mode works regardless of Coming Soon setting

## Testing Checklist

- [x] Admin can click "View Site" and see the public landing page
- [x] Admin can enable Coming Soon mode via Site Settings
- [x] When Coming Soon is enabled, visitors see Coming Soon page
- [x] When Coming Soon is enabled, admin can preview it via "View Site"
- [x] Admin accessing `/` directly still gets redirected to `/admin`
- [x] Preview mode opens in a new browser tab
- [x] Logs show preview mode status for debugging

## Configuration

To enable Coming Soon mode:
1. Log in as admin
2. Go to Admin → Settings
3. Toggle "Coming Soon Mode" ON
4. Click "Save Changes"

The Coming Soon page will immediately become the primary page for all visitors.

## Related Files

### Backend
- `server/models/SiteSettings.ts` - Database schema with comingSoonMode field

### Frontend
- `client/src/components/admin/AdminLayout.tsx` - "View Site" button with preview mode
- `client/src/pages/LandingPage.tsx` - Redirect logic and Coming Soon check
- `client/src/pages/ComingSoonPage.tsx` - Coming Soon page component
- `client/src/pages/admin/SiteSettings.tsx` - Coming Soon mode toggle UI
- `client/src/contexts/SiteSettingsContext.tsx` - Global settings provider

## Implementation Date
November 5, 2025
