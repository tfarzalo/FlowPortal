import { connectDB } from '../config/database';
import SiteSettings from '../models/SiteSettings';

/**
 * Migration script to add button styling configuration fields to existing SiteSettings documents
 * This ensures all button style fields are properly initialized with default values
 */
async function migrateButtonStyles() {
  try {
    console.log('[Migration] Starting button styles migration...');
    console.log('[Migration] Connecting to database...');
    await connectDB();

    // Find the site settings document
    const settings = await SiteSettings.findOne();

    if (!settings) {
      console.log('[Migration] No site settings found. Creating new document with defaults...');
      const newSettings = new SiteSettings({
        siteName: 'Newport Plumbing',
        tagline: 'Your Trusted Plumbing Partner',
        siteUrl: 'https://newportplumbing.com',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        contactEmail: 'info@newportplumbing.com',
        contactPhone: '(541) 265-7030',
        address: '123 Main St, Newport, OR 97365',
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
          secondaryButtonBorderColor: '#2563eb'
        }
      });

      await newSettings.save();
      console.log('[Migration] New site settings created successfully with button styles');
    } else {
      console.log('[Migration] Found existing site settings. Checking for missing button style fields...');

      let updated = false;

      // Initialize buttonStyles if it doesn't exist or is incomplete
      if (!settings.buttonStyles) {
        console.log('[Migration] Adding buttonStyles configuration...');
        settings.buttonStyles = {
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
          secondaryButtonBorderColor: '#2563eb'
        };
        updated = true;
      } else {
        // Check if any individual fields are missing and add defaults
        const defaults = {
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
          secondaryButtonBorderColor: '#2563eb'
        };

        for (const [key, value] of Object.entries(defaults)) {
          if (!(key in settings.buttonStyles)) {
            console.log(`[Migration] Adding missing field: buttonStyles.${key}`);
            (settings.buttonStyles as any)[key] = value;
            updated = true;
          }
        }
      }

      if (updated) {
        await settings.save();
        console.log('[Migration] Site settings updated successfully with button styles');
      } else {
        console.log('[Migration] Button styles already up to date');
      }
    }

    console.log('[Migration] Migration completed successfully');
    console.log('[Migration] Current button styles:', {
      hasButtonStyles: !!settings?.buttonStyles,
      primaryButtonBg: settings?.buttonStyles?.primaryButtonBg,
      secondaryButtonBg: settings?.buttonStyles?.secondaryButtonBg
    });

    process.exit(0);
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    process.exit(1);
  }
}

migrateButtonStyles();
