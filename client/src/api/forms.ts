import api from './api';

// ============================================
// Types
// ============================================

export interface FormEntry {
  _id: string;
  formType: string;
  data: Record<string, unknown>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
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

// ============================================
// Form Entries API
// ============================================

// Description: Get all form entries with optional filtering
// Endpoint: GET /api/forms/entries
// Request: { formType?, status?, startDate?, endDate?, searchQuery? }
// Response: { entries: FormEntry[] }
export const getFormEntries = async (filters?: {
  formType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}): Promise<{ entries: FormEntry[] }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.formType) params.append('formType', filters.formType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery);

    const response = await api.get(`/api/forms/entries?${params.toString()}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching form entries:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get a single form entry by ID
// Endpoint: GET /api/forms/entries/:id
// Request: {}
// Response: { entry: FormEntry }
export const getFormEntryById = async (id: string): Promise<{ entry: FormEntry }> => {
  try {
    const response = await api.get(`/api/forms/entries/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching form entry:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Update form entry status and notes
// Endpoint: PATCH /api/forms/entries/:id
// Request: { status?, notes? }
// Response: { entry: FormEntry }
export const updateFormEntry = async (
  id: string,
  updates: {
    status?: 'new' | 'read' | 'replied' | 'archived';
    notes?: string;
  }
): Promise<{ entry: FormEntry }> => {
  try {
    const response = await api.patch(`/api/forms/entries/${id}`, updates);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating form entry:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Delete a form entry
// Endpoint: DELETE /api/forms/entries/:id
// Request: {}
// Response: { success: boolean }
export const deleteFormEntry = async (id: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`/api/forms/entries/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error deleting form entry:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get form entry statistics
// Endpoint: GET /api/forms/entries-stats
// Request: {}
// Response: { total, byStatus, byFormType, recentCount }
export const getFormEntryStats = async (): Promise<FormEntryStats> => {
  try {
    const response = await api.get('/api/forms/entries-stats');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching form entry stats:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// ============================================
// Form Configuration API
// ============================================

// Description: Get all form configurations
// Endpoint: GET /api/forms/configurations
// Request: {}
// Response: { configurations: FormConfiguration[] }
export const getFormConfigurations = async (): Promise<{ configurations: FormConfiguration[] }> => {
  try {
    const response = await api.get('/api/forms/configurations');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching form configurations:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Get form configuration by type
// Endpoint: GET /api/forms/configurations/:formType
// Request: {}
// Response: { configuration: FormConfiguration }
export const getFormConfigurationByType = async (formType: string): Promise<{ configuration: FormConfiguration }> => {
  try {
    const response = await api.get(`/api/forms/configurations/${formType}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching form configuration:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Create or update form configuration
// Endpoint: POST /api/forms/configurations
// Request: { formType, formName, fields, emailConfiguration, serviceOptions?, availableDates?, availableTimes?, successMessage?, enabled? }
// Response: { configuration: FormConfiguration }
export const saveFormConfiguration = async (config: Partial<FormConfiguration>): Promise<{ configuration: FormConfiguration }> => {
  try {
    const response = await api.post('/api/forms/configurations', config);
    return response.data;
  } catch (error: unknown) {
    console.error('Error saving form configuration:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Delete form configuration
// Endpoint: DELETE /api/forms/configurations/:formType
// Request: {}
// Response: { success: boolean }
export const deleteFormConfiguration = async (formType: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete(`/api/forms/configurations/${formType}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error deleting form configuration:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Test email configuration
// Endpoint: POST /api/forms/test-email
// Request: { emailConfiguration: EmailConfiguration }
// Response: { success: boolean, messageId?, testUrl?, error? }
export const testEmailConfiguration = async (emailConfiguration: EmailConfiguration): Promise<{
  success: boolean;
  messageId?: string;
  testUrl?: string;
  error?: string;
}> => {
  try {
    const response = await api.post('/api/forms/test-email', { emailConfiguration });
    return response.data;
  } catch (error: unknown) {
    console.error('Error testing email configuration:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};

// Description: Initialize default form configurations
// Endpoint: POST /api/forms/initialize
// Request: {}
// Response: { success: boolean, configurations: FormConfiguration[] }
export const initializeFormConfigurations = async (): Promise<{
  success: boolean;
  message?: string;
  configurations: FormConfiguration[];
}> => {
  try {
    const response = await api.post('/api/forms/initialize');
    return response.data;
  } catch (error: unknown) {
    console.error('Error initializing form configurations:', error);
    const err = error as { response?: { data?: { error?: string } }; message?: string };
    throw new Error(err?.response?.data?.error || err?.message || 'An error occurred');
  }
};
