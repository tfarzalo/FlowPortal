import { supabase } from '../config/supabase.js';

export interface IMedia {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  category: string;
  description?: string;
  uploaded_by?: string;
  created_at: Date;
  updated_at: Date;
}

class MediaService {
  static async list(): Promise<IMedia[]> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing media: ${err}`);
    }
  }

  static async listByCategory(category: string): Promise<IMedia[]> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing media by category: ${err}`);
    }
  }

  static async get(id: string): Promise<IMedia | null> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting media: ${err}`);
    }
  }

  static async getByFilename(filename: string): Promise<IMedia | null> {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('filename', filename)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting media by filename: ${err}`);
    }
  }

  static async create(mediaData: Partial<IMedia>): Promise<IMedia> {
    try {
      const { data, error } = await supabase
        .from('media')
        .insert(mediaData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while creating media: ${err}`);
    }
  }

  static async update(id: string, mediaData: Partial<IMedia>): Promise<IMedia | null> {
    try {
      const { data, error } = await supabase
        .from('media')
        .update(mediaData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating media: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting media: ${err}`);
    }
  }

  // Alias methods for backward compatibility with routes
  static async createMedia(mediaData: Partial<IMedia>): Promise<IMedia> {
    return this.create(mediaData);
  }

  static async getAllMedia(filter?: { category?: string }): Promise<IMedia[]> {
    if (filter?.category) {
      return this.listByCategory(filter.category);
    }
    return this.list();
  }

  static async getMediaById(id: string): Promise<IMedia | null> {
    return this.get(id);
  }

  static async updateMedia(id: string, mediaData: Partial<IMedia>): Promise<IMedia | null> {
    return this.update(id, mediaData);
  }

  static async deleteMedia(id: string, uploadsDir?: string): Promise<boolean> {
    return this.delete(id);
  }
}

export { MediaService };
export default MediaService;
