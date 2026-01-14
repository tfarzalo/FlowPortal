import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getPublicSiteSettings, SiteSettings } from '../api/admin';
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[SiteSettingsContext] Fetching site settings');
      const data = await withTimeout(getPublicSiteSettings(), 8000);
      console.log('[SiteSettingsContext] Settings loaded:', data);
      if (!data) {
        console.warn('[SiteSettingsContext] No settings returned, leaving settings as null');
        setSettings(FALLBACK_SETTINGS);
        return;
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

  // Update document title and favicon when settings change
  useEffect(() => {
    if (settings) {
      // Update page title
      const siteName = settings.siteName || 'FlowPortal';
      const tagline = settings.tagline || '';
      document.title = tagline ? `${siteName} - ${tagline}` : siteName;
      console.log('[SiteSettingsContext] Updated page title:', document.title);

      // Update favicon
      if (settings.faviconUrl) {
        const faviconUrl = getMediaUrl(settings.faviconUrl);

        // Remove existing favicons
        const existingFavicons = document.querySelectorAll("link[rel*='icon']");
        existingFavicons.forEach(favicon => favicon.remove());

        // Add new favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
        console.log('[SiteSettingsContext] Updated favicon:', faviconUrl);
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
