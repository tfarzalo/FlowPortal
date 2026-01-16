import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContactBar } from "@/components/landing/ContactBar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { getPublishedPageBySlug, type Page } from "@/api/admin";

// Cache with timestamp for validation
interface CachedPage {
  page: Page;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const pageCache = new Map<string, CachedPage>();

export function PageView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  useEffect(() => {
    // Reset state when slug changes
    if (fetchedRef.current) {
      setLoading(true);
      setError(null);
      setPage(null);
      fetchedRef.current = false;
    }

    const fetchPage = async () => {
      if (!slug || fetchedRef.current) {
        if (!slug) {
          setError('No page slug provided');
          setLoading(false);
        }
        return;
      }

      fetchedRef.current = true;

      try {
        setError(null);
        const startTime = performance.now();
        console.log(`[PageView] Fetching page: ${slug}`);

        // Check memory cache first (fastest)
        const cached = pageCache.get(slug);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
          setPage(cached.page);
          setLoading(false);
          console.log(`[PageView] Loaded from memory cache in ${(performance.now() - startTime).toFixed(2)}ms`);
          
          // Background refresh if cache is older than 1 minute
          if (now - cached.timestamp > 60 * 1000) {
            getPublishedPageBySlug(slug)
              .then(freshPage => {
                pageCache.set(slug, { page: freshPage, timestamp: Date.now() });
                setPage(freshPage);
              })
              .catch(err => console.warn('[PageView] Background refresh failed:', err));
          }
          
          return;
        }

        // Check sessionStorage (fast)
        const cacheKey = `page-${slug}`;
        const sessionCached = sessionStorage.getItem(cacheKey);
        
        if (sessionCached) {
          try {
            const { page: cachedPage, timestamp }: CachedPage = JSON.parse(sessionCached);
            
            if (now - timestamp < CACHE_DURATION) {
              setPage(cachedPage);
              setLoading(false);
              pageCache.set(slug, { page: cachedPage, timestamp });
              console.log(`[PageView] Loaded from sessionStorage in ${(performance.now() - startTime).toFixed(2)}ms`);
              
              // Background refresh if cache is older than 1 minute
              if (now - timestamp > 60 * 1000) {
                getPublishedPageBySlug(slug)
                  .then(freshPage => {
                    const cacheData = { page: freshPage, timestamp: Date.now() };
                    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
                    pageCache.set(slug, cacheData);
                    setPage(freshPage);
                  })
                  .catch(err => console.warn('[PageView] Background refresh failed:', err));
              }
              
              return;
            }
          } catch (err) {
            console.warn('[PageView] Failed to parse cached page:', err);
            sessionStorage.removeItem(cacheKey);
          }
        }

        // Fetch from server
        const pageData = await getPublishedPageBySlug(slug);
        const loadTime = performance.now() - startTime;
        
        setPage(pageData);
        setLoading(false);
        
        // Cache in both memory and sessionStorage
        const cacheData = { page: pageData, timestamp: Date.now() };
        pageCache.set(slug, cacheData);
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        
        console.log(`[PageView] Page loaded in ${loadTime.toFixed(2)}ms:`, pageData.title);
      } catch (err: unknown) {
        console.error('[PageView] Error fetching page:', err);
        const error = err as Error;
        if (error.message.includes('not found')) {
          setError('Page not found');
        } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
          setError('Request timed out. Please check your connection.');
        } else {
          setError('Failed to load page');
        }
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Update document title and meta tags when page loads
  useEffect(() => {
    if (page) {
      const siteName = settings?.siteName || 'FlowPortal';
      document.title = `${page.title} - ${siteName}`;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', page.metaDescription || `${page.title} - ${siteName}`);

      // Update meta keywords if present
      if (page.metaKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', page.metaKeywords);
      }
    }

    // Cleanup on unmount - reset to default
    return () => {
      const siteName = settings?.siteName || 'FlowPortal';
      document.title = siteName;
    };
  }, [page, settings]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'light bg-gray-50'}`}>
        <ContactBar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'light bg-gray-50'}`}>
        <ContactBar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {error === 'Page not found' ? '404' : 'Error'}
          </h1>
          <p className={`text-xl mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error || 'Page not found'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return Home
          </button>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950' : 'light bg-gray-50'}`}>
      <ContactBar />

      <main className="container mx-auto px-6 py-12 md:py-20">
        <article>
          <header className="mb-8">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {page.title}
            </h1>
          </header>

          <div
            className={`prose prose-lg max-w-none ${
              isDark
                ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-li:text-gray-300'
                : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-li:text-gray-700'
            }`}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </main>

      <LandingFooter />
    </div>
  );
}
