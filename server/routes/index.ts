import express from 'express';
import { Request, Response } from 'express';
import siteSettingsService from '../services/siteSettingsService';
import pageService from '../services/pageService';
const router = express.Router();

// Root path response
router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req: Request, res: Response) => {
  res.status(200).send("pong");
});

// Description: Get site settings (public endpoint)
// Endpoint: GET /api/site-settings
// Request: {}
// Response: { settings: ISiteSettings }
router.get("/api/site-settings", async (req: Request, res: Response) => {
  try {
    console.log('Fetching site settings (public endpoint)');
    const settings = await siteSettingsService.getSettings();
    
    // Transform snake_case to camelCase for frontend compatibility
    if (settings) {
      const transformed = {
        _id: settings.id,
        siteName: settings.site_name,
        tagline: settings.tagline,
        siteUrl: settings.site_url,
        logoUrl: settings.logo_url,
        faviconUrl: settings.favicon_url,
        landingPageIconUrl: settings.landing_page_icon_url,
        primaryColor: settings.primary_color,
        secondaryColor: settings.secondary_color,
        contactEmail: settings.contact_email,
        contactPhone: settings.contact_phone,
        address: settings.address,
        businessHours: settings.business_hours,
        socialMedia: settings.social_media,
        googleMapsUrl: settings.google_maps_url,
        metaDescription: settings.meta_description,
        metaKeywords: settings.meta_keywords,
        privacyStatement: settings.privacy_statement,
        comingSoonMode: settings.coming_soon_mode,
        defaultTheme: settings.default_theme,
        buttonStyles: settings.button_styles,
        landingPage: settings.landing_page,
        updatedAt: settings.updated_at,
      };
      return res.status(200).json({ settings: transformed });
    }
    
    res.status(200).json({ settings });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching site settings: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

// Description: Get page by slug (public endpoint)
// Endpoint: GET /api/pages/:slug
// Request: {}
// Response: { page: IPage }
router.get("/api/pages/:slug", async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    console.log(`Fetching page with slug: ${slug} (public endpoint)`);
    const page = await pageService.getPageBySlug(slug);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Only return published pages to public
    if (!page.is_published) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.status(200).json({ page });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching page by slug: ${errorMessage}`);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
