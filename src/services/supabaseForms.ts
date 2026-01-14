/**
 * Supabase Forms Service
 * Direct Supabase queries for form entries and configurations
 * Replaces backend API calls with direct database queries
 */

import { supabase } from '../lib/supabase';

// ==================== UTILITY FUNCTIONS ====================

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
}

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  
  return obj;
}

// ==================== TYPES ====================

export interface FormEntry {
  _id?: string;
  id?: string;
  formType: string;
  data: Record<string, unknown>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'time' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
  enabled: boolean;
}

export interface EmailConfiguration {
  enabled: boolean;
  recipients: string[];
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  includeAllFields: boolean;
  customMessage?: string;
}

export interface FormConfiguration {
  _id?: string;
  id?: string;
  formType: string;
  formName: string;
  fields: FormField[];
  emailConfiguration: EmailConfiguration;
  serviceOptions?: string[];
  availableDates?: {
    startDate?: Date;
    endDate?: Date;
    excludedDates?: Date[];
  };
  availableTimes?: string[];
  successMessage?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormEntryStats {
  total: number;
  byStatus: Record<string, number>;
  byFormType: Record<string, number>;
  recentCount: number;
}

// ==================== FORM ENTRIES ====================

export async function getFormEntries(filters?: {
  formType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}): Promise<FormEntry[]> {
  let query = supabase.from('form_entries').select('*');

  if (filters?.formType) {
    query = query.eq('form_type', filters.formType);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters?.searchQuery) {
    // Search in customer_name, customer_email, and customer_phone
    query = query.or(`customer_name.ilike.%${filters.searchQuery}%,customer_email.ilike.%${filters.searchQuery}%,customer_phone.ilike.%${filters.searchQuery}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching form entries:', error);
    throw new Error(error.message);
  }

  return (data || []).map(entry => {
    const camelEntry = toCamelCase(entry);
    return { ...camelEntry, _id: camelEntry.id };
  });
}

export async function getFormEntryById(id: string): Promise<FormEntry> {
  const { data, error } = await supabase
    .from('form_entries')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching form entry:', error);
    throw new Error(error.message);
  }

  const camelEntry = toCamelCase(data);
  return { ...camelEntry, _id: camelEntry.id };
}

export async function updateFormEntry(id: string, updates: Partial<FormEntry>): Promise<FormEntry> {
  // Remove _id and id from updates
  const { _id, id: _, ...cleanUpdates } = updates;
  
  // Transform to snake_case
  const snakeUpdates = toSnakeCase(cleanUpdates);

  const { data, error } = await supabase
    .from('form_entries')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating form entry:', error);
    throw new Error(error.message);
  }

  const camelEntry = toCamelCase(data);
  return { ...camelEntry, _id: camelEntry.id };
}

export async function deleteFormEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('form_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting form entry:', error);
    throw new Error(error.message);
  }
}

export async function getFormEntryStats(): Promise<FormEntryStats> {
  const { data, error } = await supabase
    .from('form_entries')
    .select('status, form_type, created_at');

  if (error) {
    console.error('[Supabase] Error fetching form entry stats:', error);
    throw new Error(error.message);
  }

  const entries = data || [];
  const total = entries.length;

  // Calculate by status
  const byStatus: Record<string, number> = {};
  entries.forEach(entry => {
    byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
  });

  // Calculate by form type
  const byFormType: Record<string, number> = {};
  entries.forEach(entry => {
    byFormType[entry.form_type] = (byFormType[entry.form_type] || 0) + 1;
  });

  // Calculate recent count (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = entries.filter(entry => 
    new Date(entry.created_at) >= sevenDaysAgo
  ).length;

  return {
    total,
    byStatus,
    byFormType,
    recentCount,
  };
}

// ==================== FORM CONFIGURATIONS ====================

export async function getFormConfigurations(): Promise<FormConfiguration[]> {
  const { data, error } = await supabase
    .from('form_configurations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error fetching form configurations:', error);
    throw new Error(error.message);
  }

  return (data || []).map(config => {
    const camelConfig = toCamelCase(config);
    return { ...camelConfig, _id: camelConfig.id };
  });
}

export async function getFormConfigurationByType(formType: string): Promise<FormConfiguration | null> {
  const { data, error } = await supabase
    .from('form_configurations')
    .select('*')
    .eq('form_type', formType)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('[Supabase] Error fetching form configuration:', error);
    throw new Error(error.message);
  }

  const camelConfig = toCamelCase(data);
  return { ...camelConfig, _id: camelConfig.id };
}

export async function getFormConfigurationById(id: string): Promise<FormConfiguration> {
  const { data, error } = await supabase
    .from('form_configurations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[Supabase] Error fetching form configuration:', error);
    throw new Error(error.message);
  }

  const camelConfig = toCamelCase(data);
  return { ...camelConfig, _id: camelConfig.id };
}

export async function createFormConfiguration(configData: Partial<FormConfiguration>): Promise<FormConfiguration> {
  // Transform to snake_case
  const snakeConfig = toSnakeCase(configData);

  const { data, error } = await supabase
    .from('form_configurations')
    .insert(snakeConfig)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error creating form configuration:', error);
    throw new Error(error.message);
  }

  const camelConfig = toCamelCase(data);
  return { ...camelConfig, _id: camelConfig.id };
}

export async function updateFormConfiguration(id: string, updates: Partial<FormConfiguration>): Promise<FormConfiguration> {
  // Remove _id and id from updates
  const { _id, id: _, ...cleanUpdates } = updates;
  
  // Transform to snake_case
  const snakeUpdates = toSnakeCase(cleanUpdates);

  const { data, error } = await supabase
    .from('form_configurations')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error updating form configuration:', error);
    throw new Error(error.message);
  }

  const camelConfig = toCamelCase(data);
  return { ...camelConfig, _id: camelConfig.id };
}

export async function deleteFormConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('form_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] Error deleting form configuration:', error);
    throw new Error(error.message);
  }
}

// ==================== PUBLIC FORM SUBMISSION ====================

export async function submitForm(formType: string, formData: Record<string, unknown>): Promise<FormEntry> {
  // Get form configuration to validate
  const config = await getFormConfigurationByType(formType);
  
  if (!config) {
    throw new Error(`Form configuration not found for type: ${formType}`);
  }

  if (!config.enabled) {
    throw new Error('This form is currently disabled');
  }

  // Extract customer info from form data
  const customerName = String(formData.name || formData.fullName || formData.customerName || '');
  const customerEmail = String(formData.email || formData.customerEmail || '');
  const customerPhone = String(formData.phone || formData.phoneNumber || formData.customerPhone || '');

  // Create form entry
  const entryData = {
    form_type: formType,
    data: formData,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    status: 'new' as const,
  };

  const { data, error } = await supabase
    .from('form_entries')
    .insert(entryData)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error submitting form:', error);
    throw new Error(error.message);
  }

  const camelEntry = toCamelCase(data);
  return { ...camelEntry, _id: camelEntry.id };
}
