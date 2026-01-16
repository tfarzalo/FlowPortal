-- Fix pages table foreign key constraint issue
-- This allows pages to be created even if created_by references a user that doesn't exist in auth.users
-- OR makes created_by nullable

-- Option 1: Drop the foreign key constraint and recreate it with ON DELETE SET NULL
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_created_by_fkey;

ALTER TABLE pages 
ADD CONSTRAINT pages_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Option 2: Make created_by nullable (if it isn't already)
ALTER TABLE pages ALTER COLUMN created_by DROP NOT NULL;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pages' 
ORDER BY ordinal_position;
