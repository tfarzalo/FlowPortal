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

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[SiteSettingsContext] Fetching site settings');
      const data = await getPublicSiteSettings();
      console.log('[SiteSettingsContext] Settings loaded:', data);
      setSettings(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load site settings';
      console.error('[SiteSettingsContext] Error loading settings:', errorMessage);
      setError(errorMessage);
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
