import { connectDB } from '../config/database';
import SiteSettings from '../models/SiteSettings';

/**
 * Update Site URL Script
 * This script updates the siteUrl field in the SiteSettings document
 * to the custom domain: https://newportplumbing.com
 */

const PRODUCTION_SITE_URL = 'https://newportplumbing.com';

async function updateSiteUrl() {
  console.log('[updateSiteUrl] Starting site URL update...');

  // Connect to database
  await connectDB();
  console.log('[updateSiteUrl] Database connected');

  try {
    // Find the existing site settings document
    let settings = await SiteSettings.findOne();

    if (!settings) {
      console.log('[updateSiteUrl] No site settings found, creating new one...');
      settings = new SiteSettings({
        siteName: 'Newport Plumbing',
        siteUrl: PRODUCTION_SITE_URL,
      });
      await settings.save();
      console.log('[updateSiteUrl] Created new site settings with URL:', PRODUCTION_SITE_URL);
    } else {
      console.log('[updateSiteUrl] Found existing site settings:', {
        siteName: settings.siteName,
        currentSiteUrl: settings.siteUrl || 'NOT SET',
      });

      // Update the siteUrl field
      settings.siteUrl = PRODUCTION_SITE_URL;
      await settings.save();

      console.log('[updateSiteUrl] Successfully updated site URL to:', PRODUCTION_SITE_URL);
    }

    console.log('[updateSiteUrl] Current site settings:');
    console.log('  - Site Name:', settings.siteName);
    console.log('  - Site URL:', settings.siteUrl);
    console.log('  - Contact Email:', settings.contactEmail);
    console.log('  - Contact Phone:', settings.contactPhone);

    console.log('\n✅ Site URL update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[updateSiteUrl] Error updating site URL:', error);
    process.exit(1);
  }
}

// Run the script
updateSiteUrl();
