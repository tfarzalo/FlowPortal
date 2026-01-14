import { supabase } from '../config/supabase.js';

export interface IPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

class PageService {
  static async list(): Promise<IPage[]> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing pages: ${err}`);
    }
  }

  static async listPublished(): Promise<IPage[]> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing published pages: ${err}`);
    }
  }

  static async get(id: string): Promise<IPage | null> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting page: ${err}`);
    }
  }

  static async getBySlug(slug: string): Promise<IPage | null> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug.toLowerCase())
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting page by slug: ${err}`);
    }
  }

  static async create(pageData: Partial<IPage>): Promise<IPage> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          ...pageData,
          slug: pageData.slug?.toLowerCase(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while creating page: ${err}`);
    }
  }

  static async update(id: string, pageData: Partial<IPage>): Promise<IPage | null> {
    try {
      const updateData = { ...pageData };
      if (updateData.slug) {
        updateData.slug = updateData.slug.toLowerCase();
      }
      
      const { data, error } = await supabase
        .from('pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating page: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting page: ${err}`);
    }
  }

  // Alias methods for backward compatibility with routes
  static async getAllPages(publishedOnly: boolean = false): Promise<IPage[]> {
    return publishedOnly ? this.listPublished() : this.list();
  }

  static async getPageById(id: string): Promise<IPage | null> {
    return this.get(id);
  }

  static async getPageBySlug(slug: string): Promise<IPage | null> {
    return this.getBySlug(slug);
  }

  static async createPage(pageData: Partial<IPage>, userId?: string): Promise<IPage> {
    if (userId) {
      pageData.created_by = userId;
    }
    return this.create(pageData);
  }

  static async updatePage(id: string, pageData: Partial<IPage>): Promise<IPage | null> {
    return this.update(id, pageData);
  }

  static async deletePage(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export { PageService };
export default PageService;
