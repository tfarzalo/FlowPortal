import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  tagline: string;
  siteUrl: string; // Full URL to the production site (e.g., https://newportplumbing.com)
  logoUrl?: string;
  faviconUrl?: string;
  landingPageIconUrl?: string; // Dedicated icon/logo for landing page hero section
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  googleMapsUrl?: string;
  metaDescription?: string;
  metaKeywords?: string;
  privacyStatement?: string; // HTML content for privacy/SMS consent statement in footer
  comingSoonMode: boolean;
  defaultTheme: 'light' | 'dark';
  // Button styling configuration
  buttonStyles: {
    primaryButtonBg: string;
    primaryButtonText: string;
    primaryButtonHoverBg: string;
    primaryButtonHoverText: string;
    primaryButtonBorder: string;
    primaryButtonBorderColor: string;
    secondaryButtonBg: string;
    secondaryButtonText: string;
    secondaryButtonHoverBg: string;
    secondaryButtonHoverText: string;
    secondaryButtonBorder: string;
    secondaryButtonBorderColor: string;
  };
  // Landing page configuration
  landingPage: {
    heroBackgroundImageUrl?: string;
    heroTagline?: string;
    companyInfo: {
      ccbLicense?: string;
      yearsInBusiness?: string;
      established?: string;
      teamDescription?: string;
      awardsDescription?: string;
    };
    serviceBlocks: Array<{
      id: string;
      title: string;
      description: string;
      iconName: string;
      enabled: boolean;
    }>;
  };
  updatedAt: Date;
}

const schema = new Schema<ISiteSettings>({
  siteName: {
    type: String,
    required: true,
    default: 'FlowPortal'
  },
  tagline: {
    type: String,
    default: 'Your Trusted Plumbing Partner'
  },
  siteUrl: {
    type: String,
    required: true,
    default: 'https://newportplumbing.com'
  },
  logoUrl: {
    type: String,
  },
  faviconUrl: {
    type: String,
  },
  landingPageIconUrl: {
    type: String,
  },
  primaryColor: {
    type: String,
    default: '#2563eb'
  },
  secondaryColor: {
    type: String,
    default: '#1e40af'
  },
  contactEmail: {
    type: String,
    required: true,
    default: 'info@flowportal.com'
  },
  contactPhone: {
    type: String,
    required: true,
    default: '(555) 123-4567'
  },
  address: {
    type: String,
    required: true,
    default: '123 Main St, City, State 12345'
  },
  businessHours: {
    monday: { type: String, default: '9:00 AM - 5:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 5:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 5:00 PM' },
    thursday: { type: String, default: '9:00 AM - 5:00 PM' },
    friday: { type: String, default: '9:00 AM - 5:00 PM' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  socialMedia: {
    type: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String
    },
    default: {}
  },
  googleMapsUrl: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  metaKeywords: {
    type: String,
  },
  privacyStatement: {
    type: String,
  },
  comingSoonMode: {
    type: Boolean,
    default: false
  },
  defaultTheme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark'
  },
  buttonStyles: {
    type: {
      primaryButtonBg: { type: String, default: '#2563eb' },
      primaryButtonText: { type: String, default: '#ffffff' },
      primaryButtonHoverBg: { type: String, default: '#1e40af' },
      primaryButtonHoverText: { type: String, default: '#ffffff' },
      primaryButtonBorder: { type: String, default: '0px' },
      primaryButtonBorderColor: { type: String, default: '#2563eb' },
      secondaryButtonBg: { type: String, default: 'transparent' },
      secondaryButtonText: { type: String, default: '#2563eb' },
      secondaryButtonHoverBg: { type: String, default: '#2563eb' },
      secondaryButtonHoverText: { type: String, default: '#ffffff' },
      secondaryButtonBorder: { type: String, default: '2px' },
      secondaryButtonBorderColor: { type: String, default: '#2563eb' }
    },
    default: {
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
  },
  landingPage: {
    type: {
      heroBackgroundImageUrl: String,
      heroTagline: String,
      companyInfo: {
        type: {
          ccbLicense: String,
          yearsInBusiness: String,
          established: String,
          teamDescription: String,
          awardsDescription: String
        },
        default: {}
      },
      serviceBlocks: {
        type: [{
          id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          iconName: { type: String, required: true },
          enabled: { type: Boolean, default: true }
        }],
        default: []
      }
    },
    default: {
      companyInfo: {},
      serviceBlocks: []
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  timestamps: true
});

const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', schema);

export default SiteSettings;
