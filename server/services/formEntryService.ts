import { supabase } from '../config/supabase.js';

export interface IFormEntry {
  id: string;
  form_type: string;
  data: Record<string, unknown>;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
}

class FormEntryService {
  static async list(): Promise<IFormEntry[]> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing form entries: ${err}`);
    }
  }

  static async listByFormType(formType: string): Promise<IFormEntry[]> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .select('*')
        .eq('form_type', formType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing form entries by type: ${err}`);
    }
  }

  static async listByStatus(status: string): Promise<IFormEntry[]> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing form entries by status: ${err}`);
    }
  }

  static async get(id: string): Promise<IFormEntry | null> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting form entry: ${err}`);
    }
  }

  static async create(entryData: Partial<IFormEntry>): Promise<IFormEntry> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .insert({
          ...entryData,
          status: entryData.status || 'new',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while creating form entry: ${err}`);
    }
  }

  static async update(id: string, entryData: Partial<IFormEntry>): Promise<IFormEntry | null> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .update(entryData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating form entry: ${err}`);
    }
  }

  static async updateStatus(id: string, status: string): Promise<IFormEntry | null> {
    try {
      const { data, error } = await supabase
        .from('form_entries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating form entry status: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('form_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting form entry: ${err}`);
    }
  }

  static async countByStatus(formType?: string): Promise<Record<string, number>> {
    try {
      let query = supabase
        .from('form_entries')
        .select('status', { count: 'exact' });
      
      if (formType) {
        query = query.eq('form_type', formType);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Count by status
      const counts: Record<string, number> = {
        new: 0,
        read: 0,
        replied: 0,
        archived: 0,
      };

      data?.forEach((entry: any) => {
        counts[entry.status] = (counts[entry.status] || 0) + 1;
      });

      return counts;
    } catch (err) {
      throw new Error(`Database error while counting form entries: ${err}`);
    }
  }

  // Backward compatibility methods
  static async getAllEntries(filters?: {
    formType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }): Promise<IFormEntry[]> {
    try {
      let query = supabase
        .from('form_entries')
        .select('*');

      if (filters?.formType) {
        query = query.eq('form_type', filters.formType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters?.searchQuery) {
        // Search in customer_name, customer_email, or notes
        query = query.or(`customer_name.ilike.%${filters.searchQuery}%,customer_email.ilike.%${filters.searchQuery}%,notes.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while getting form entries: ${err}`);
    }
  }

  static async getStats(): Promise<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  }> {
    try {
      const { count: total, error: totalError } = await supabase
        .from('form_entries')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const statusCounts = await this.countByStatus();

      return {
        total: total || 0,
        new: statusCounts.new || 0,
        read: statusCounts.read || 0,
        replied: statusCounts.replied || 0,
        archived: statusCounts.archived || 0,
      };
    } catch (err) {
      throw new Error(`Database error while getting form entry stats: ${err}`);
    }
  }

  static async getEntryById(id: string): Promise<IFormEntry | null> {
    return this.get(id);
  }

  static async createEntry(entryData: Partial<IFormEntry>): Promise<IFormEntry> {
    return this.create(entryData);
  }

  static async updateEntry(id: string, entryData: Partial<IFormEntry>): Promise<IFormEntry | null> {
    return this.update(id, entryData);
  }

  static async deleteEntry(id: string): Promise<boolean> {
    return this.delete(id);
  }
}

export { FormEntryService };
export default FormEntryService;
