ALTER TABLE public.form_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_configurations' AND policyname='form_configs_public_select') THEN
  EXECUTE 'DROP POLICY form_configs_public_select ON public.form_configurations';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_configurations' AND policyname='form_configs_admin_write') THEN
  EXECUTE 'DROP POLICY form_configs_admin_write ON public.form_configurations';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_configurations' AND policyname='Admins manage form configurations') THEN
  EXECUTE 'DROP POLICY "Admins manage form configurations" ON public.form_configurations';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_entries' AND policyname='form_entries_public_insert') THEN
  EXECUTE 'DROP POLICY form_entries_public_insert ON public.form_entries';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_entries' AND policyname='form_entries_admin_select') THEN
  EXECUTE 'DROP POLICY form_entries_admin_select ON public.form_entries';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_entries' AND policyname='form_entries_admin_update') THEN
  EXECUTE 'DROP POLICY form_entries_admin_update ON public.form_entries';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_entries' AND policyname='form_entries_admin_delete') THEN
  EXECUTE 'DROP POLICY form_entries_admin_delete ON public.form_entries';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_entries' AND policyname='Admins manage form entries') THEN
  EXECUTE 'DROP POLICY "Admins manage form entries" ON public.form_entries';
END IF;
IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='form_entries' AND policyname='Public insert form entries') THEN
  EXECUTE 'DROP POLICY "Public insert form entries" ON public.form_entries';
END IF;
END $$;
CREATE POLICY form_configs_public_select ON public.form_configurations FOR SELECT USING (true);
CREATE POLICY form_configs_admin_write ON public.form_configurations FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY form_entries_public_insert ON public.form_entries FOR INSERT WITH CHECK (true);
CREATE POLICY form_entries_admin_select ON public.form_entries FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY form_entries_admin_update ON public.form_entries FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY form_entries_admin_delete ON public.form_entries FOR DELETE USING (public.is_admin(auth.uid()));
