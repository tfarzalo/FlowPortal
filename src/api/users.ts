/**
 * Users API - Migrated to use direct Supabase queries
 * This file now re-exports functions from the Supabase admin service
 */

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from '../services/supabaseAdmin';
