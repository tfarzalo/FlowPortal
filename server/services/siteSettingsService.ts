import { supabase } from '../config/supabase.js';

export interface ISiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  site_url: string;
  logo_url?: string;
  favicon_url?: string;
  landing_page_icon_url?: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  business_hours: Record<string, string>;
  social_media: Record<string, string>;
  google_maps_url?: string;
  meta_description?: string;
  meta_keywords?: string;
  privacy_statement?: string;
  coming_soon_mode: boolean;
  default_theme: 'light' | 'dark';
  button_styles: Record<string, string>;
  landing_page: Record<string, any>;
  updated_at: Date;
}

class SiteSettingsService {
  static async get(): Promise<ISiteSettings | null> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting site settings: ${err}`);
    }
  }

  static async update(settings: Partial<ISiteSettings>): Promise<ISiteSettings> {
    try {
      // First, try to get existing settings
      const existing = await this.get();
      
      if (existing) {
        // Update existing settings
        const { data, error } = await supabase
          .from('site_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) {
          console.error('[SiteSettingsService] Update error:', JSON.stringify(error, null, 2));
          throw error;
        }
        return data;
      } else {
        // Create new settings if none exist
        const { data, error } = await supabase
          .from('site_settings')
          .insert(settings)
          .select()
          .single();
        
        if (error) {
          console.error('[SiteSettingsService] Insert error:', JSON.stringify(error, null, 2));
          throw error;
        }
        return data;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('[SiteSettingsService] Update error details:', errorMessage);
      throw new Error(`Database error while updating site settings: ${errorMessage}`);
    }
  }

  static async upsert(settings: Partial<ISiteSettings>): Promise<ISiteSettings> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(settings, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while upserting site settings: ${err}`);
    }
  }

  static async updatePartial(updates: Partial<ISiteSettings>): Promise<ISiteSettings> {
    try {
      const existing = await this.get();
      
      if (!existing) {
        throw new Error('Site settings not found. Please create settings first.');
      }

      const { data, error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating site settings: ${err}`);
    }
  }

  // Alias methods for backward compatibility with routes
  static async getSettings(): Promise<ISiteSettings | null> {
    return this.get();
  }

  static async updateSettings(settings: Partial<ISiteSettings>): Promise<ISiteSettings> {
    return this.update(settings);
  }
}

export { SiteSettingsService };
export default SiteSettingsService;
