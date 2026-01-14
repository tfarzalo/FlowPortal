import { supabase } from '../config/supabase.js';

export interface IFormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'time' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
  enabled: boolean;
}

export interface IEmailConfiguration {
  enabled: boolean;
  recipients: string[];
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  includeAllFields: boolean;
  customMessage?: string;
}

export interface IFormConfiguration {
  id: string;
  form_type: string;
  form_name: string;
  fields: IFormField[];
  email_configuration: IEmailConfiguration;
  service_options?: string[];
  available_dates?: Record<string, any>;
  available_times?: string[];
  success_message?: string;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

class FormConfigurationService {
  static async list(): Promise<IFormConfiguration[]> {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .order('form_type');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(`Database error while listing form configurations: ${err}`);
    }
  }

  static async get(id: string): Promise<IFormConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting form configuration: ${err}`);
    }
  }

  static async getByFormType(formType: string): Promise<IFormConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .select('*')
        .eq('form_type', formType)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(`Database error while getting form configuration by type: ${err}`);
    }
  }

  static async create(configData: Partial<IFormConfiguration>): Promise<IFormConfiguration> {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .insert(configData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while creating form configuration: ${err}`);
    }
  }

  static async update(id: string, configData: Partial<IFormConfiguration>): Promise<IFormConfiguration | null> {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .update(configData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while updating form configuration: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('form_configurations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting form configuration: ${err}`);
    }
  }

  static async deleteByFormType(formType: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('form_configurations')
        .delete()
        .eq('form_type', formType);
      
      if (error) throw error;
      return true;
    } catch (err) {
      throw new Error(`Database error while deleting form configuration by type: ${err}`);
    }
  }

  static async upsertByFormType(configData: Partial<IFormConfiguration>): Promise<IFormConfiguration> {
    try {
      const { data, error } = await supabase
        .from('form_configurations')
        .upsert(configData, { onConflict: 'form_type' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Database error while upserting form configuration: ${err}`);
    }
  }

  static getDefaultBookingConfig(): Partial<IFormConfiguration> {
    return {
      form_type: 'booking',
      form_name: 'Booking Request',
      enabled: true,
      success_message: 'Thank you! We will contact you within 24 hours to confirm your appointment.',
      fields: [
        {
          id: 'fullName',
          label: 'Full Name',
          type: 'text',
          required: true,
          order: 1,
          enabled: true,
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          order: 2,
          enabled: true,
        },
        {
          id: 'phone',
          label: 'Phone',
          type: 'phone',
          required: true,
          order: 3,
          enabled: true,
        },
        {
          id: 'service',
          label: 'Service',
          type: 'select',
          required: true,
          order: 4,
          enabled: true,
        },
        {
          id: 'preferredDate',
          label: 'Preferred Date',
          type: 'date',
          required: true,
          order: 5,
          enabled: true,
        },
        {
          id: 'preferredTime',
          label: 'Preferred Time',
          type: 'time',
          required: true,
          order: 6,
          enabled: true,
        },
        {
          id: 'address',
          label: 'Service Address',
          type: 'textarea',
          required: true,
          order: 7,
          enabled: true,
        },
        {
          id: 'message',
          label: 'Additional Notes',
          type: 'textarea',
          required: false,
          order: 8,
          enabled: true,
        },
      ],
      email_configuration: {
        enabled: false,
        recipients: [],
        subject: 'New Booking Request',
        fromName: 'Website',
        fromEmail: 'noreply@example.com',
        includeAllFields: true,
      },
    };
  }

  // Backward-compatible aliases
  static async getAllConfigs(): Promise<IFormConfiguration[]> {
    return this.list();
  }

  static async getConfigByType(formType: string): Promise<IFormConfiguration | null> {
    return this.getByFormType(formType);
  }

  static async upsertConfig(configData: Partial<IFormConfiguration>): Promise<IFormConfiguration> {
    return this.upsertByFormType(configData);
  }

  static async deleteConfig(formType: string): Promise<boolean> {
    return this.deleteByFormType(formType);
  }
}

export { FormConfigurationService };
export default FormConfigurationService;
