import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContactBar } from "@/components/landing/ContactBar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export function PageView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = settings?.defaultTheme || 'dark';
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError('No page slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching page with slug: ${slug}`);

        const response = await fetch(`/api/pages/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Page not found');
          } else {
            setError('Failed to load page');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPage(data.page);
        console.log('Page loaded successfully:', data.page.title);
      } catch (err: unknown) {
        console.error('Error fetching page:', err);
        setError('Failed to load page');
      } finally {
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

      <main className="container mx-auto px-4 py-12 md:py-20">
        <article className="max-w-4xl mx-auto">
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
