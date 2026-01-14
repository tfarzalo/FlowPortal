import { connectDB } from '../config/database';
import SiteSettings from '../models/SiteSettings';

/**
 * Migration script to add landing page configuration fields to existing SiteSettings documents
 * This ensures all new fields are properly initialized with default values
 */
async function migrateLandingPageSettings() {
  try {
    console.log('[Migration] Starting landing page settings migration...');
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
        businessHours: {
          monday: '8:00 AM - 6:00 PM',
          tuesday: '8:00 AM - 6:00 PM',
          wednesday: '8:00 AM - 6:00 PM',
          thursday: '8:00 AM - 6:00 PM',
          friday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        socialMedia: {},
        comingSoonMode: false,
        defaultTheme: 'dark',
        landingPage: {
          companyInfo: {
            ccbLicense: '#24586',
            yearsInBusiness: 'Since 1978',
            established: '1978',
            teamDescription: 'Licensed Plumbers',
            awardsDescription: 'Best Plumbing 15 Years'
          },
          serviceBlocks: [
            {
              id: 'service-1',
              title: 'Remodel & New Construction',
              description: 'Complete plumbing solutions for your remodeling projects and new construction builds.',
              iconName: 'Home',
              enabled: true
            },
            {
              id: 'service-2',
              title: 'Residential & Commercial Repairs',
              description: 'Expert repair services for both residential homes and commercial properties.',
              iconName: 'Wrench',
              enabled: true
            },
            {
              id: 'service-3',
              title: 'Water Heater Service',
              description: 'Professional water heater repair and replacement for reliable hot water supply.',
              iconName: 'Flame',
              enabled: true
            },
            {
              id: 'service-4',
              title: 'Fixture & Faucet Repair',
              description: 'Quality repair and installation of all types of plumbing fixtures and faucets.',
              iconName: 'Droplet',
              enabled: true
            },
            {
              id: 'service-5',
              title: 'Whole House Repipe',
              description: 'Complete replumbing services to modernize your home\'s plumbing system.',
              iconName: 'Building2',
              enabled: true
            },
            {
              id: 'service-6',
              title: 'Emergency Service',
              description: 'Fast emergency plumbing response when you need it most.',
              iconName: 'AlertCircle',
              enabled: true
            },
            {
              id: 'service-7',
              title: 'Parts & Fixtures',
              description: 'Stocking all major brands of plumbing parts and fixtures in our showroom.',
              iconName: 'Package',
              enabled: true
            },
            {
              id: 'service-8',
              title: 'Free Estimates',
              description: 'Get a free, no-obligation estimate for your plumbing project.',
              iconName: 'DollarSign',
              enabled: true
            }
          ]
        }
      });

      await newSettings.save();
      console.log('[Migration] New site settings created successfully');
    } else {
      console.log('[Migration] Found existing site settings. Checking for missing fields...');

      let updated = false;

      // Initialize landingPage if it doesn't exist
      if (!settings.landingPage) {
        console.log('[Migration] Adding landingPage configuration...');
        settings.landingPage = {
          companyInfo: {
            ccbLicense: '#24586',
            yearsInBusiness: 'Since 1978',
            established: '1978',
            teamDescription: 'Licensed Plumbers',
            awardsDescription: 'Best Plumbing 15 Years'
          },
          serviceBlocks: [
            {
              id: 'service-1',
              title: 'Remodel & New Construction',
              description: 'Complete plumbing solutions for your remodeling projects and new construction builds.',
              iconName: 'Home',
              enabled: true
            },
            {
              id: 'service-2',
              title: 'Residential & Commercial Repairs',
              description: 'Expert repair services for both residential homes and commercial properties.',
              iconName: 'Wrench',
              enabled: true
            },
            {
              id: 'service-3',
              title: 'Water Heater Service',
              description: 'Professional water heater repair and replacement for reliable hot water supply.',
              iconName: 'Flame',
              enabled: true
            },
            {
              id: 'service-4',
              title: 'Fixture & Faucet Repair',
              description: 'Quality repair and installation of all types of plumbing fixtures and faucets.',
              iconName: 'Droplet',
              enabled: true
            },
            {
              id: 'service-5',
              title: 'Whole House Repipe',
              description: 'Complete replumbing services to modernize your home\'s plumbing system.',
              iconName: 'Building2',
              enabled: true
            },
            {
              id: 'service-6',
              title: 'Emergency Service',
              description: 'Fast emergency plumbing response when you need it most.',
              iconName: 'AlertCircle',
              enabled: true
            },
            {
              id: 'service-7',
              title: 'Parts & Fixtures',
              description: 'Stocking all major brands of plumbing parts and fixtures in our showroom.',
              iconName: 'Package',
              enabled: true
            },
            {
              id: 'service-8',
              title: 'Free Estimates',
              description: 'Get a free, no-obligation estimate for your plumbing project.',
              iconName: 'DollarSign',
              enabled: true
            }
          ]
        };
        updated = true;
      } else {
        // Initialize nested objects if they don't exist
        if (!settings.landingPage.companyInfo) {
          console.log('[Migration] Adding companyInfo...');
          settings.landingPage.companyInfo = {
            ccbLicense: '#24586',
            yearsInBusiness: 'Since 1978',
            established: '1978',
            teamDescription: 'Licensed Plumbers',
            awardsDescription: 'Best Plumbing 15 Years'
          };
          updated = true;
        }

        if (!settings.landingPage.serviceBlocks || settings.landingPage.serviceBlocks.length === 0) {
          console.log('[Migration] Adding default service blocks...');
          settings.landingPage.serviceBlocks = [
            {
              id: 'service-1',
              title: 'Remodel & New Construction',
              description: 'Complete plumbing solutions for your remodeling projects and new construction builds.',
              iconName: 'Home',
              enabled: true
            },
            {
              id: 'service-2',
              title: 'Residential & Commercial Repairs',
              description: 'Expert repair services for both residential homes and commercial properties.',
              iconName: 'Wrench',
              enabled: true
            },
            {
              id: 'service-3',
              title: 'Water Heater Service',
              description: 'Professional water heater repair and replacement for reliable hot water supply.',
              iconName: 'Flame',
              enabled: true
            },
            {
              id: 'service-4',
              title: 'Fixture & Faucet Repair',
              description: 'Quality repair and installation of all types of plumbing fixtures and faucets.',
              iconName: 'Droplet',
              enabled: true
            },
            {
              id: 'service-5',
              title: 'Whole House Repipe',
              description: 'Complete replumbing services to modernize your home\'s plumbing system.',
              iconName: 'Building2',
              enabled: true
            },
            {
              id: 'service-6',
              title: 'Emergency Service',
              description: 'Fast emergency plumbing response when you need it most.',
              iconName: 'AlertCircle',
              enabled: true
            },
            {
              id: 'service-7',
              title: 'Parts & Fixtures',
              description: 'Stocking all major brands of plumbing parts and fixtures in our showroom.',
              iconName: 'Package',
              enabled: true
            },
            {
              id: 'service-8',
              title: 'Free Estimates',
              description: 'Get a free, no-obligation estimate for your plumbing project.',
              iconName: 'DollarSign',
              enabled: true
            }
          ];
          updated = true;
        }
      }

      if (updated) {
        await settings.save();
        console.log('[Migration] Site settings updated successfully');
      } else {
        console.log('[Migration] Site settings already up to date');
      }
    }

    console.log('[Migration] Migration completed successfully');
    console.log('[Migration] Current settings:', {
      siteName: settings?.siteName,
      hasLandingPage: !!settings?.landingPage,
      hasCompanyInfo: !!settings?.landingPage?.companyInfo,
      serviceBlocksCount: settings?.landingPage?.serviceBlocks?.length || 0
    });

    process.exit(0);
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    process.exit(1);
  }
}

migrateLandingPageSettings();
