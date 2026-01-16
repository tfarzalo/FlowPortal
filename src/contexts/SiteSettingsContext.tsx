import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPublicSiteSettings, SiteSettings } from '../api/admin';
import { isSupabaseConfigured, SUPABASE_TIMEOUT_MS } from '../lib/supabase';
import { getMediaUrl } from '../config/api';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const FALLBACK_SETTINGS: SiteSettings = {
  siteName: 'FlowPortal',
  tagline: '',
  siteUrl: '',
  logoUrl: '',
  faviconUrl: '',
  landingPageIconUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  contactEmail: '',
  contactPhone: '',
  address: '',
  businessHours: {
    monday: '9:00 AM - 5:00 PM',
    tuesday: '9:00 AM - 5:00 PM',
    wednesday: '9:00 AM - 5:00 PM',
    thursday: '9:00 AM - 5:00 PM',
    friday: '9:00 AM - 5:00 PM',
    saturday: 'Closed',
    sunday: 'Closed',
  },
  socialMedia: {},
  googleMapsUrl: '',
  metaDescription: '',
  metaKeywords: '',
  privacyStatement: '',
  comingSoonMode: false,
  defaultTheme: 'dark',
  buttonStyles: {
    primaryButtonBg: '#2563eb',
    primaryButtonText: '#ffffff',
    primaryButtonHoverBg: '#1e40af',
    primaryButtonHoverText: '#ffffff',
    primaryButtonBorder: '0px',
    primaryButtonBorderColor: '#2563eb',
    secondaryButtonBg: 'transparent',
    secondaryButtonText: '#2563eb',
    secondaryButtonHoverBg: '#2563eb',
    secondaryButtonHoverText: '#ffffff',
    secondaryButtonBorder: '2px',
    secondaryButtonBorderColor: '#2563eb',
  },
  landingPage: {
    heroBackgroundImageUrl: '',
    heroTagline: '',
    companyInfo: {},
    serviceBlocks: [],
  },
};

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timed out while loading site settings'));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  // Initialize with fallback settings immediately
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    // Try to get cached settings from localStorage for instant load
    try {
      const cached = localStorage.getItem('flowportal-settings-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('[SiteSettingsContext] Loaded cached settings from localStorage');
        return parsed;
      }
    } catch (e) {
      console.warn('[SiteSettingsContext] Failed to load cached settings:', e);
    }
    return FALLBACK_SETTINGS;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const shouldBlock = settings === null;
      setLoading(shouldBlock);
      setError(null);
      if (!isSupabaseConfigured) {
        setError('Supabase credentials are missing.');
        setSettings((current) => current ?? FALLBACK_SETTINGS);
        return;
      }
      console.log('[SiteSettingsContext] Fetching site settings from Supabase');
      const data = await withTimeout(getPublicSiteSettings(), SUPABASE_TIMEOUT_MS);
      console.log('[SiteSettingsContext] Settings loaded:', data);
      if (!data) {
        console.warn('[SiteSettingsContext] No settings returned, using fallback');
        setSettings(FALLBACK_SETTINGS);
        return;
      }
      
      // Cache settings in localStorage for instant load on next visit
      try {
        localStorage.setItem('flowportal-settings-cache', JSON.stringify(data));
        console.log('[SiteSettingsContext] Cached settings to localStorage');
      } catch (e) {
        console.warn('[SiteSettingsContext] Failed to cache settings:', e);
      }
      
      setSettings(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load site settings';
      console.error('[SiteSettingsContext] Error loading settings:', errorMessage);
      setError(errorMessage);
      setSettings((current) => current ?? FALLBACK_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateFaviconLinks = (faviconUrl?: string) => {
    const resolvedUrl = faviconUrl ? getMediaUrl(faviconUrl) : '/favicon.ico';
    const lowerUrl = resolvedUrl.toLowerCase();
    let type = 'image/x-icon';
    if (lowerUrl.endsWith('.png')) {
      type = 'image/png';
    } else if (lowerUrl.endsWith('.svg')) {
      type = 'image/svg+xml';
    } else if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) {
      type = 'image/jpeg';
    }

    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((favicon) => favicon.remove());

    const iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = type;
    iconLink.href = resolvedUrl;
    document.head.appendChild(iconLink);

    const shortcutLink = document.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = type;
    shortcutLink.href = resolvedUrl;
    document.head.appendChild(shortcutLink);

    console.log('[SiteSettingsContext] Updated favicon:', resolvedUrl);
  };

  // Update document title and favicon when settings change
  useEffect(() => {
    if (settings) {
      // Update page title
      const siteName = settings.siteName || 'FlowPortal';
      const tagline = settings.tagline || '';
      document.title = tagline ? `${siteName} - ${tagline}` : siteName;
      console.log('[SiteSettingsContext] Updated page title:', document.title);

      // Update favicon
      updateFaviconLinks(settings.faviconUrl);

      // Apply theme from settings and save to localStorage
      if (settings.defaultTheme) {
        const root = window.document.documentElement;
        const currentTheme = root.classList.contains('light') ? 'light' : 'dark';
        
        // Only update if theme is different to avoid flashing
        if (currentTheme !== settings.defaultTheme) {
          console.log('[SiteSettingsContext] Theme changed from', currentTheme, 'to', settings.defaultTheme);
          root.classList.remove("light", "dark");
          root.classList.add(settings.defaultTheme);
        }
        
        // Always save to localStorage for instant application on next load
        try {
          localStorage.setItem('flowportal-theme', settings.defaultTheme);
          console.log('[SiteSettingsContext] Saved theme to localStorage:', settings.defaultTheme);
        } catch (e) {
          console.warn('[SiteSettingsContext] Failed to save theme to localStorage:', e);
        }
      }
    }
  }, [settings]);

  const refetchSettings = async () => {
    await fetchSettings();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, refetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
