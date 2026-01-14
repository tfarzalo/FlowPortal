/**
 * Forms API - Migrated to use direct Supabase queries
 * This file now re-exports functions from the Supabase forms service
 */

// Re-export everything from supabaseForms service
export {
  getFormEntries,
  getFormEntryById,
  updateFormEntry,
  deleteFormEntry,
  getFormEntryStats,
  getFormConfigurations,
  getFormConfigurationByType,
  getFormConfigurationById,
  createFormConfiguration,
  updateFormConfiguration,
  deleteFormConfiguration,
  submitForm,
  type FormEntry,
  type FormField,
  type EmailConfiguration,
  type FormConfiguration,
  type FormEntryStats,
} from '../services/supabaseForms';
