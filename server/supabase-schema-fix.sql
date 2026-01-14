-- Quick Fix: Add missing refresh_token column to existing users table
-- Run this in Supabase SQL Editor if you already have the users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::text;

CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);
