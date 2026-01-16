-- Fix Form Entries RLS Policies
-- Ensures public users can submit forms without authentication

-- First, disable RLS temporarily to clean up
ALTER TABLE public.form_entries DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop all form_entries policies
  DROP POLICY IF EXISTS form_entries_public_insert ON public.form_entries;
  DROP POLICY IF EXISTS form_entries_admin_select ON public.form_entries;
  DROP POLICY IF EXISTS form_entries_admin_update ON public.form_entries;
  DROP POLICY IF EXISTS form_entries_admin_delete ON public.form_entries;
  DROP POLICY IF EXISTS "Public insert form entries" ON public.form_entries;
  DROP POLICY IF EXISTS "Admins manage form entries" ON public.form_entries;
  DROP POLICY IF EXISTS "Anyone can insert form entries" ON public.form_entries;
  DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.form_entries;
  
  -- Drop all form_configurations policies
  DROP POLICY IF EXISTS form_configs_public_select ON public.form_configurations;
  DROP POLICY IF EXISTS form_configs_admin_write ON public.form_configurations;
  DROP POLICY IF EXISTS "Public can read form configurations" ON public.form_configurations;
  DROP POLICY IF EXISTS "Admins manage form configurations" ON public.form_configurations;
END $$;

-- Re-enable RLS
ALTER TABLE public.form_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_configurations ENABLE ROW LEVEL SECURITY;

-- Create new policies for form_entries
-- Allow anyone (authenticated or anonymous) to insert
CREATE POLICY "Enable insert for all users" 
  ON public.form_entries 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to select all entries
CREATE POLICY "Enable select for admins" 
  ON public.form_entries 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update entries
CREATE POLICY "Enable update for admins" 
  ON public.form_entries 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to delete entries
CREATE POLICY "Enable delete for admins" 
  ON public.form_entries 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create policies for form_configurations
-- Allow anyone to read form configurations
CREATE POLICY "Enable select for all users" 
  ON public.form_configurations 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Allow admins full access to form configurations
CREATE POLICY "Enable all for admins" 
  ON public.form_configurations 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.form_entries TO anon;
GRANT SELECT ON public.form_configurations TO anon;

-- Grant necessary permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.form_entries TO authenticated;
GRANT ALL ON public.form_configurations TO authenticated;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('form_entries', 'form_configurations')
ORDER BY tablename, policyname;
