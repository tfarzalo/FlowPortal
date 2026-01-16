ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='site_settings_public_select') THEN
  EXECUTE 'DROP POLICY site_settings_public_select ON public.site_settings';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_settings' AND policyname='site_settings_admin_write') THEN
  EXECUTE 'DROP POLICY site_settings_admin_write ON public.site_settings';
END IF;
END $$;
CREATE POLICY site_settings_public_select ON public.site_settings FOR SELECT USING (true);
CREATE POLICY site_settings_admin_write ON public.site_settings FOR ALL USING (public.is_admin(auth.uid()));
