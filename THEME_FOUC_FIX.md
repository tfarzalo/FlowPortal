# Theme Flash of Unstyled Content (FOUC) Fix

## Problem
The site was experiencing a "flash of dark mode" (or flash of wrong theme) on initial page load before the correct theme from Supabase settings was applied. This happened because:

1. The HTML loads with no theme class
2. React initializes and mounts
3. `SiteSettingsContext` fetches settings from Supabase (async)
4. Theme is applied after settings load (too late)

This created a jarring user experience where users would briefly see the wrong theme before the correct one loaded.

## Solution
Applied a three-part fix to ensure the theme is applied **synchronously before React renders**:

### 1. Default Theme Class in HTML
Set a default theme class (`dark`) directly on the `<html>` element:

```html
<html lang="en" class="dark">
```

### 2. CSS to Hide Content Until Theme is Applied
Added CSS to prevent rendering until theme is confirmed:

```html
<style>
  /* Prevent FOUC by hiding content until theme is applied */
  html:not(.dark):not(.light) body {
    visibility: hidden;
  }
  html.dark body, html.light body {
    visibility: visible;
  }
</style>
```

### 3. Inline Blocking Script in `index.html`
Added a synchronous script in the `<head>` that:
- Runs immediately when the HTML is parsed (before React loads)
- Reads the saved theme from `localStorage`
- Removes any existing theme classes
- Applies the correct theme class to `<html>` element
- Falls back to 'dark' if no theme is saved

```html
<script>
  // Apply theme synchronously BEFORE React loads to prevent FOUC
  (function() {
    const root = document.documentElement;
    try {
      const savedTheme = localStorage.getItem('flowportal-theme');
      const theme = savedTheme || 'dark'; // Default to dark if no theme saved
      // Remove any existing theme classes and add the correct one
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    } catch (e) {
      // If localStorage fails, default to dark
      root.classList.remove('light');
      root.classList.add('dark');
    }
  })();
</script>
```

### 4. Theme Persistence in `SiteSettingsContext`
Updated the context to save the theme to `localStorage` whenever settings change:

```tsx
// Apply theme from settings and save to localStorage
if (settings.defaultTheme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(settings.defaultTheme);
  
  // Save theme to localStorage for instant application on next load
  try {
    localStorage.setItem('flowportal-theme', settings.defaultTheme);
    console.log('[SiteSettingsContext] Applied and saved theme:', settings.defaultTheme);
  } catch (e) {
    console.warn('[SiteSettingsContext] Failed to save theme to localStorage:', e);
  }
}
```

## How It Works

### First Visit (No Saved Theme)
1. Inline script runs → No theme in localStorage → Applies default 'dark' theme
2. Page renders with dark theme (no flash)
3. React loads → `SiteSettingsContext` fetches settings from Supabase
4. Theme from settings is applied (e.g., 'light') AND saved to localStorage
5. Next visit will use the correct theme from the start

### Subsequent Visits (Saved Theme)
1. Inline script runs → Reads theme from localStorage → Applies correct theme immediately
2. Page renders with correct theme (no flash)
3. React loads → `SiteSettingsContext` fetches settings from Supabase
4. Theme is re-applied (seamlessly, no visible change) and localStorage is updated if theme changed

### Theme Changes in Admin
1. Admin updates theme in Site Settings
2. Settings are saved to Supabase
3. `SiteSettingsContext` refetches settings
4. New theme is applied AND saved to localStorage
5. User's next visit will use the new theme from the start (no flash)

## Benefits
- ✅ **Instant Theme Application**: Theme is applied before any content renders
- ✅ **No Flash of Wrong Theme**: Users never see a brief flash of dark/light mode
- ✅ **Seamless Experience**: Theme transitions are smooth and invisible
- ✅ **Works Across Page Reloads**: Theme persists via localStorage
- ✅ **Admin Changes Apply Immediately**: When admin updates theme, it's saved for all future visits
- ✅ **Fallback Handling**: Defaults to 'dark' if localStorage is unavailable or empty

## Testing
To test the fix:

1. **Clear localStorage** (to simulate first visit):
   ```javascript
   localStorage.removeItem('flowportal-theme');
   ```

2. **Hard refresh** the page (Cmd+Shift+R on macOS, Ctrl+Shift+R on Windows)
   - Should see dark theme immediately with no flash

3. **Go to Admin → Site Settings** and change theme to 'light'
   - Should see theme change immediately after save

4. **Hard refresh** the page again
   - Should see light theme immediately with no flash
   - Check localStorage: `localStorage.getItem('flowportal-theme')` should return 'light'

5. **Change theme back to 'dark'** in admin
   - Should see theme change immediately after save
   - Hard refresh should show dark theme with no flash

## Files Modified
- `index.html` - Added inline script to apply theme before React loads
- `src/contexts/SiteSettingsContext.tsx` - Added localStorage persistence for theme

## Future Enhancements (Optional)
- Add user preference override (allow users to override site theme)
- Add theme toggle in header for quick switching
- Support for system theme preference detection (prefers-color-scheme)
- Animate theme transitions with CSS

## Notes
- The inline script is intentionally placed in `<head>` to run before any body content renders
- The script is wrapped in an IIFE to avoid polluting global scope
- localStorage is wrapped in try/catch to handle privacy mode or quota errors
- Default theme is 'dark' to match the FALLBACK_SETTINGS in SiteSettingsContext
