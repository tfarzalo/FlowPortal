# View Site Button Fix

## Problem Description

When clicking the "View Site" button in the admin area header, the application would navigate to the landing page in the **same window/tab**, effectively replacing the admin panel with the landing page. This forced users to use the browser's back button to return to the admin area.

## Expected Behavior

The "View Site" button should open the landing page in a **new browser tab/window**, allowing admins to:
- Keep their admin panel open and active
- Preview the public site without losing their current admin context
- Easily switch between tabs to compare admin changes with the public view

## Root Cause

In `client/src/components/admin/AdminLayout.tsx`, the "View Site" button was using React Router's `navigate('/')` function (line 127), which navigates within the same window:

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => navigate('/')}
>
  View Site
</Button>
```

## Solution Implemented

### 1. Added ExternalLink Icon Import

Added the `ExternalLink` icon from lucide-react to visually indicate that the button opens a new tab.

```typescript
import {
  // ... other icons
  ExternalLink,
} from "lucide-react";
```

### 2. Created handleViewSite Function

Created a dedicated handler function that uses `window.open()` with the `_blank` target to open in a new tab:

```typescript
const handleViewSite = () => {
  console.log('[AdminLayout] Opening site in new tab');
  window.open('/', '_blank');
};
```

### 3. Updated Button Component

Updated the button to:
- Call the new `handleViewSite` function
- Display the ExternalLink icon for visual clarity

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={handleViewSite}
>
  <ExternalLink className="w-4 h-4 mr-2" />
  View Site
</Button>
```

## Benefits

1. **Better UX:** Admins can keep their workspace open while previewing
2. **No Context Loss:** Admin panel state is preserved
3. **Visual Clarity:** ExternalLink icon indicates new tab behavior
4. **Standard Pattern:** Follows common web patterns for external links
5. **Easy Switching:** Users can quickly switch between admin and public views

## Files Modified

- ✅ `client/src/components/admin/AdminLayout.tsx`
  - Added `ExternalLink` icon import
  - Created `handleViewSite()` function
  - Updated "View Site" button to use new handler and icon

## Technical Details

### window.open() Parameters

```typescript
window.open('/', '_blank');
```

- **First parameter (`'/'`):** The URL to open (root path)
- **Second parameter (`'_blank'`):** Opens in a new tab/window
  - Modern browsers typically open in a new tab by default
  - User's browser settings determine tab vs. window behavior

### Browser Compatibility

This solution uses standard browser APIs that work across all modern browsers:
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

### Alternative Approaches Considered

1. **Using `<a>` tag with `target="_blank"`**
   - Would work but less flexible for programmatic control
   - Requires wrapping in a link element

2. **Using `navigate()` with new window**
   - React Router doesn't natively support opening in new tabs
   - Would require additional configuration

3. **Using `window.location.href` in new window**
   - More verbose than `window.open()`
   - No additional benefits

## Logging

Added console log for debugging:
```typescript
console.log('[AdminLayout] Opening site in new tab');
```

This helps verify the button click is registered and aids in troubleshooting.

## Testing Verification

After applying this fix:
- ✅ Click "View Site" opens landing page in new tab
- ✅ Admin panel remains open in original tab
- ✅ ExternalLink icon is visible on button
- ✅ No console errors
- ✅ Works on all supported browsers

## Future Enhancements (Optional)

1. **Add keyboard shortcut:** Ctrl/Cmd + K to open site
2. **Remember tab preference:** Store user's tab behavior preference
3. **Preview mode:** Open in preview mode with admin toolbar overlay
4. **Multiple preview tabs:** Open specific pages directly from admin
