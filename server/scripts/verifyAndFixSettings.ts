/**
 * Script to verify and fix site settings in the database
 * This ensures all fields are properly set and logo/favicon URLs are correctly stored
 */

import { connectDB } from '../config/database';
import SiteSettings from '../models/SiteSettings';
import Media from '../models/Media';

async function verifyAndFixSettings() {
  // Connect to database first
  await connectDB();
  try {
    console.log('='.repeat(60));
    console.log('Starting Site Settings Verification and Fix');
    console.log('='.repeat(60));

    // Fetch current settings
    let settings = await SiteSettings.findOne();

    if (!settings) {
      console.log('\n❌ No settings document found in database');
      console.log('Creating new settings document with defaults...');
      settings = new SiteSettings({});
      await settings.save();
      console.log('✅ Created default settings document');
    } else {
      console.log('\n✅ Found existing settings document');
    }

    console.log('\n' + '-'.repeat(60));
    console.log('Current Settings State:');
    console.log('-'.repeat(60));
    console.log(`Site Name: ${settings.siteName}`);
    console.log(`Tagline: ${settings.tagline}`);
    console.log(`Site URL: ${settings.siteUrl}`);
    console.log(`Logo URL: ${settings.logoUrl || '(not set)'}`);
    console.log(`Favicon URL: ${settings.faviconUrl || '(not set)'}`);
    console.log(`Primary Color: ${settings.primaryColor}`);
    console.log(`Secondary Color: ${settings.secondaryColor}`);
    console.log(`Contact Email: ${settings.contactEmail}`);
    console.log(`Contact Phone: ${settings.contactPhone}`);
    console.log(`Coming Soon Mode: ${settings.comingSoonMode}`);
    console.log(`Default Theme: ${settings.defaultTheme}`);

    // Check business hours
    console.log('\nBusiness Hours:');
    if (!settings.businessHours) {
      console.log('❌ Business hours not set, will initialize...');
      settings.businessHours = {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
      };
    } else {
      Object.entries(settings.businessHours).forEach(([day, hours]) => {
        console.log(`  ${day}: ${hours}`);
      });
    }

    // Check social media
    console.log('\nSocial Media:');
    if (!settings.socialMedia) {
      console.log('❌ Social media not set, will initialize...');
      settings.socialMedia = {};
    } else {
      const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
      platforms.forEach(platform => {
        const url = (settings.socialMedia as any)[platform];
        console.log(`  ${platform}: ${url || '(not set)'}`);
      });
    }

    // Check for logo media in database
    console.log('\n' + '-'.repeat(60));
    console.log('Checking Media Library for Logos:');
    console.log('-'.repeat(60));
    const logoMedia = await Media.find({ category: 'logo' }).sort({ createdAt: -1 });

    if (logoMedia.length === 0) {
      console.log('⚠️  No logo files found in media library');
      console.log('   Please upload a logo through the Media Management page');
    } else {
      console.log(`✅ Found ${logoMedia.length} logo file(s) in media library:`);
      logoMedia.forEach((media, index) => {
        console.log(`   ${index + 1}. ${media.originalName}`);
        console.log(`      URL: ${media.url}`);
        console.log(`      Full Path: /api/media/${media.url}`);
      });

      // If logo URL is not set but we have logo files, suggest using the first one
      if (!settings.logoUrl && logoMedia.length > 0) {
        console.log('\n💡 Suggestion: Logo URL is not set in settings');
        console.log('   You can set it to one of the logos above using the admin interface');
        console.log(`   Example: /api/media/${logoMedia[0].url}`);
      }
    }

    // Check all required fields
    console.log('\n' + '-'.repeat(60));
    console.log('Field Validation:');
    console.log('-'.repeat(60));

    let needsSave = false;
    const requiredDefaults = {
      siteName: 'Newport Plumbing',
      tagline: 'Your Trusted Plumbing Partner',
      siteUrl: 'https://newportplumbing.com',
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      contactEmail: 'info@newportplumbing.com',
      contactPhone: '(541) 265-9632',
      address: '412 SW Coast Hwy, Newport, OR 97365',
      comingSoonMode: false,
      defaultTheme: 'dark' as 'dark'
    };

    for (const [field, defaultValue] of Object.entries(requiredDefaults)) {
      if (!(settings as any)[field]) {
        console.log(`⚠️  ${field} is missing, setting to default: ${defaultValue}`);
        (settings as any)[field] = defaultValue;
        needsSave = true;
      } else {
        console.log(`✅ ${field} is set`);
      }
    }

    // Ensure nested objects exist
    if (!settings.businessHours) {
      needsSave = true;
    }
    if (!settings.socialMedia) {
      needsSave = true;
    }

    // Save if any changes were made
    if (needsSave) {
      console.log('\n📝 Saving updated settings to database...');
      settings.updatedAt = new Date();
      await settings.save();
      console.log('✅ Settings saved successfully');
    } else {
      console.log('\n✅ All settings are properly configured, no changes needed');
    }

    // Final verification - re-fetch from database
    console.log('\n' + '='.repeat(60));
    console.log('Final Verification (re-fetching from database):');
    console.log('='.repeat(60));

    const verifiedSettings = await SiteSettings.findOne();
    if (verifiedSettings) {
      console.log(`✅ Site Name: ${verifiedSettings.siteName}`);
      console.log(`✅ Logo URL: ${verifiedSettings.logoUrl || '(not set)'}`);
      console.log(`✅ Favicon URL: ${verifiedSettings.faviconUrl || '(not set)'}`);
      console.log(`✅ Social Media: ${verifiedSettings.socialMedia ? 'Initialized' : 'Missing'}`);
      console.log(`✅ Business Hours: ${verifiedSettings.businessHours ? 'Initialized' : 'Missing'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification Complete!');
    console.log('='.repeat(60));
    console.log('\nNext Steps:');
    console.log('1. If logo/favicon URLs are not set, upload files to Media Management');
    console.log('2. Go to Admin > Site Settings to configure logo and favicon');
    console.log('3. Click "Save Changes" to persist your selections');
    console.log('4. Verify changes appear on the public site\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error during verification:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

verifyAndFixSettings();
