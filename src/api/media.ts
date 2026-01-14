/**
 * Media API - Migrated to use direct Supabase queries and storage
 * This file now re-exports functions from the Supabase media service
 */

// Re-export everything from supabaseMedia service
export {
  uploadMedia,
  getMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  type Media,
} from '../services/supabaseMedia';
