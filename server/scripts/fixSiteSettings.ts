import { connectDB } from '../config/database';
import SiteSettings from '../models/SiteSettings';

/**
 * Fix existing SiteSettings documents that may have undefined socialMedia
 * This script ensures all required fields have proper default values
 */
async function fixSiteSettings() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Fetching site settings...');
    const settings = await SiteSettings.findOne();

    if (!settings) {
      console.log('No settings found, creating default settings...');
      const newSettings = new SiteSettings({});
      await newSettings.save();
      console.log('✓ Default settings created successfully');
      process.exit(0);
      return;
    }

    console.log('Current settings:', JSON.stringify(settings, null, 2));

    let needsUpdate = false;

    // Fix socialMedia if it's undefined
    if (!settings.socialMedia) {
      console.log('⚠ socialMedia is undefined, setting to empty object');
      settings.socialMedia = {};
      needsUpdate = true;
    }

    // Fix businessHours if it's undefined
    if (!settings.businessHours) {
      console.log('⚠ businessHours is undefined, setting defaults');
      settings.businessHours = {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 5:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      };
      needsUpdate = true;
    }

    // Ensure all required fields have values
    if (!settings.siteName) {
      settings.siteName = 'FlowPortal';
      needsUpdate = true;
    }
    if (!settings.tagline) {
      settings.tagline = 'Your Trusted Plumbing Partner';
      needsUpdate = true;
    }
    if (!settings.primaryColor) {
      settings.primaryColor = '#2563eb';
      needsUpdate = true;
    }
    if (!settings.secondaryColor) {
      settings.secondaryColor = '#1e40af';
      needsUpdate = true;
    }
    if (!settings.contactEmail) {
      settings.contactEmail = 'info@flowportal.com';
      needsUpdate = true;
    }
    if (!settings.contactPhone) {
      settings.contactPhone = '(555) 123-4567';
      needsUpdate = true;
    }
    if (!settings.address) {
      settings.address = '123 Main St, City, State 12345';
      needsUpdate = true;
    }
    if (settings.comingSoonMode === undefined) {
      settings.comingSoonMode = false;
      needsUpdate = true;
    }
    if (!settings.defaultTheme) {
      settings.defaultTheme = 'dark';
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log('Updating settings...');
      await settings.save();
      console.log('✓ Settings fixed and saved successfully');
    } else {
      console.log('✓ Settings are already correct, no updates needed');
    }

    console.log('\nUpdated settings:', JSON.stringify(settings, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fixing site settings:', error);
    process.exit(1);
  }
}

fixSiteSettings();
