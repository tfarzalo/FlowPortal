import SiteSettings, { ISiteSettings } from '../models/SiteSettings';

class SiteSettingsService {
  /**
   * Get the site settings (there should only be one document)
   */
  async getSettings(): Promise<ISiteSettings> {
    console.log('[SiteSettingsService] Fetching site settings');
    let settings = await SiteSettings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      console.log('[SiteSettingsService] No settings found, creating defaults');
      settings = new SiteSettings({});
      await settings.save();
    }

    console.log('[SiteSettingsService] Settings retrieved:', {
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl
    });
    return settings;
  }

  /**
   * Update site settings
   */
  async updateSettings(updates: Partial<ISiteSettings>): Promise<ISiteSettings> {
    console.log('[SiteSettingsService] Updating settings with data:', {
      siteName: updates.siteName,
      logoUrl: updates.logoUrl,
      faviconUrl: updates.faviconUrl,
      hasBusinessHours: !!updates.businessHours,
      hasSocialMedia: !!updates.socialMedia,
      updateKeys: Object.keys(updates)
    });

    let settings = await SiteSettings.findOne();

    if (!settings) {
      console.log('[SiteSettingsService] No existing settings, creating new document');
      settings = new SiteSettings(updates);
    } else {
      console.log('[SiteSettingsService] Updating existing settings document');

      // Explicitly handle all fields to ensure proper updates
      if (updates.siteName !== undefined) settings.siteName = updates.siteName;
      if (updates.tagline !== undefined) settings.tagline = updates.tagline;
      if (updates.siteUrl !== undefined) settings.siteUrl = updates.siteUrl;
      if (updates.logoUrl !== undefined) settings.logoUrl = updates.logoUrl;
      if (updates.faviconUrl !== undefined) settings.faviconUrl = updates.faviconUrl;
      if (updates.primaryColor !== undefined) settings.primaryColor = updates.primaryColor;
      if (updates.secondaryColor !== undefined) settings.secondaryColor = updates.secondaryColor;
      if (updates.contactEmail !== undefined) settings.contactEmail = updates.contactEmail;
      if (updates.contactPhone !== undefined) settings.contactPhone = updates.contactPhone;
      if (updates.address !== undefined) settings.address = updates.address;
      if (updates.googleMapsUrl !== undefined) settings.googleMapsUrl = updates.googleMapsUrl;
      if (updates.metaDescription !== undefined) settings.metaDescription = updates.metaDescription;
      if (updates.metaKeywords !== undefined) settings.metaKeywords = updates.metaKeywords;
      if (updates.comingSoonMode !== undefined) settings.comingSoonMode = updates.comingSoonMode;
      if (updates.defaultTheme !== undefined) settings.defaultTheme = updates.defaultTheme;

      // Handle nested objects
      if (updates.businessHours !== undefined) {
        settings.businessHours = {
          ...settings.businessHours,
          ...updates.businessHours
        };
      }

      if (updates.socialMedia !== undefined) {
        settings.socialMedia = {
          ...settings.socialMedia,
          ...updates.socialMedia
        };
      }

      settings.updatedAt = new Date();
    }

    await settings.save();

    console.log('[SiteSettingsService] Settings saved successfully to database:', {
      _id: settings._id,
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      hasBusinessHours: !!settings.businessHours,
      hasSocialMedia: !!settings.socialMedia
    });

    return settings;
  }
}

export default new SiteSettingsService();
