/**
 * Admin API - Migrated to use direct Supabase queries
 * This file now re-exports functions from the Supabase services
 */

// Re-export everything from supabaseAdmin service
export {
  getSiteSettings,
  updateSiteSettings,
  getPages,
  getPageById,
  getPageBySlug,
  getPublishedPageBySlug,
  createPage,
  updatePage,
  deletePage,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  type SiteSettings,
  type ServiceBlock,
  type Page,
  type Post,
  type DashboardStats,
  type User,
} from '../services/supabaseAdmin';

// Alias for backward compatibility
export { getSiteSettings as getPublicSiteSettings } from '../services/supabaseAdmin';
