import { supabase } from '../config/supabase.js';

export interface IPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  category: string;
  tags: string[];
  meta_description?: string;
  meta_keywords?: string;
  is_published: boolean;
  published_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

class PostService {
  static async list(): Promise<IPost[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing posts: ${err}`);
    }
  }

  static async listPublished(): Promise<IPost[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing published posts: ${err}`);
    }
  }

  static async get(id: string): Promise<IPost | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting post: ${err}`);
    }
  }

  static async getBySlug(slug: string): Promise<IPost | null> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug.toLowerCase())
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting post by slug: ${err}`);
    }
  }

  static async getByCategory(category: string, publishedOnly: boolean = true): Promise<IPost[]> {
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('category', category);
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('published_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while getting posts by category: ${err}`);
    }
  }

  static async create(postData: Partial<IPost>): Promise<IPost> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          slug: postData.slug?.toLowerCase(),
          tags: postData.tags || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while creating post: ${err}`);
    }
  }

  static async update(id: string, postData: Partial<IPost>): Promise<IPost | null> {
    try {
      const updateData = { ...postData };
      if (updateData.slug) {
        updateData.slug = updateData.slug.toLowerCase();
      }
      
      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating post: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting post: ${err}`);
    }
  }

  // Backward compatibility methods
  static async getAllPosts(publishedOnly: boolean = false): Promise<IPost[]> {
    return publishedOnly ? this.listPublished() : this.list();
  }

  static async getPostById(id: string): Promise<IPost | null> {
    return this.get(id);
  }

  static async getPostsByCategory(category: string, publishedOnly: boolean = false): Promise<IPost[]> {
    return this.getByCategory(category, publishedOnly);
  }

  static async createPost(postData: Partial<IPost>, userId?: string): Promise<IPost> {
    if (userId) {
      postData.created_by = userId;
    }
    return this.create(postData);
  }

  static async updatePost(id: string, postData: Partial<IPost>): Promise<IPost | null> {
    return this.update(id, postData);
  }

  static async deletePost(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export { PostService };
export default PostService;
