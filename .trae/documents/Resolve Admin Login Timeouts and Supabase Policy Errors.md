## Observed Problems
- Auth and site settings calls time out (20s), indicating connectivity/env or RLS blocking issues rather than fast SQL errors.
- Prior errors revealed recursive `users` RLS policies (“infinite recursion detected”), which can break all auth-driven queries.
- `site_settings` ordering by a non-existent column produced errors; now ordering by `updated_at` is safer, but schema may still be incomplete.

## Likely Root Causes
1. Environment variables not injected correctly in the built app or incorrect Supabase project/key.
2. Supabase RLS policies referencing `public.users` within `public.users` policies (recursion) and overly restrictive access.
3. Schema drift (missing `updated_at` / `created_at` columns), causing queries to fail or hang under RLS.

## Plan Of Action
### 1) Environment & Connectivity Validation
- Confirm runtime env:
  - Open the Login screen and verify the diagnostics banner shows a non-empty `Supabase URL` and “anon key loaded = yes”.
  - If not present, rebuild after setting `.env` and redeploy.
- Connectivity check:
  - From Supabase SQL Editor, run `select` on `public.site_settings` to ensure data returns quickly.
  - Optional external check: call `GET https://<project>.supabase.co/rest/v1/site_settings?select=*` with `apikey: <anon-key>` and `Authorization: Bearer <anon-key>` to validate REST access.

### 2) Fix Users RLS Recursion And Admin Access
- Create a SECURITY DEFINER helper to evaluate admin without policy recursion:
  - `CREATE OR REPLACE FUNCTION public.is_admin(uid uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$ SELECT COALESCE((SELECT role = 'admin' FROM public.users WHERE id = uid), false) $$;`
  - `GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;`
- Drop and recreate `users` policies to use `is_admin(...)`:
  - Drop existing `users_select_self_or_admin`, `users_update_self_or_admin`, `users_insert_self` if they exist.
  - Recreate:
    - `CREATE POLICY users_select_self_or_admin ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));`
    - `CREATE POLICY users_update_self_or_admin ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));`
    - `CREATE POLICY users_insert_self ON public.users FOR INSERT WITH CHECK (auth.uid() = id);`
- Upsert initial admin:
  - `WITH admin_list AS (SELECT unnest(ARRAY['design@thunderlightmedia.com'])::text AS email) INSERT INTO public.users (id, email, role) SELECT au.id, lower(au.email), 'admin' FROM auth.users au JOIN admin_list al ON lower(au.email) = lower(al.email) ON CONFLICT (id) DO UPDATE SET role = 'admin';`

### 3) Confirm RLS For Forms And Settings
- `form_configurations`:
  - Public `select`: `CREATE POLICY form_configs_public_select ON public.form_configurations FOR SELECT USING (true);`
  - Admin write: `CREATE POLICY form_configs_admin_write ON public.form_configurations FOR ALL USING (public.is_admin(auth.uid()));`
- `form_entries`:
  - Public `insert`: `CREATE POLICY form_entries_public_insert ON public.form_entries FOR INSERT WITH CHECK (true);`
  - Admin read/write/delete:
    - `CREATE POLICY form_entries_admin_select ON public.form_entries FOR SELECT USING (public.is_admin(auth.uid()));`
    - `CREATE POLICY form_entries_admin_update ON public.form_entries FOR UPDATE USING (public.is_admin(auth.uid()));`
    - `CREATE POLICY form_entries_admin_delete ON public.form_entries FOR DELETE USING (public.is_admin(auth.uid()));`

### 4) Schema Sanity Checks
- Ensure required columns exist:
  - `site_settings`: `updated_at timestamptz DEFAULT now()` (optional also `created_at timestamptz DEFAULT now()`).
  - `users`: `id uuid`, `email text`, `role text` with default `'user'`.
  - `form_entries`: `created_at timestamptz DEFAULT now()`.
  - `form_configurations`: `created_at timestamptz DEFAULT now()`.
- If missing, add with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`.

### 5) Client-Side Hardening (Small Changes)
- Increase `VITE_SUPABASE_TIMEOUT_MS` to `60000` temporarily to avoid false timeouts during debugging.
- Keep the Login diagnostics banner; after fixes, it should report configured URL/key and no timeouts.

### 6) Verification Steps
- Rebuild and preview.
- Login with `design@thunderlightmedia.com`; confirm `/admin` access.
- Load Site Settings and ensure no timeout and data returns.
- Submit a booking form; confirm it appears in Admin → Form Entries with `status='new'` and `user_agent`.
- Run SQL checks:
  - RLS enabled: `SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('users','form_entries','form_configurations');`
  - Policies list: `SELECT * FROM pg_policies WHERE schemaname='public' AND tablename IN ('users','form_entries','form_configurations');`

### 7) Rollback/Contingency
- If policies cause errors, drop newly created ones and reapply the previous set without recursion.
- If connectivity still times out, verify project URL and anon key, and test Supabase REST endpoints directly; raise timeout back to 20s after resolution.

## Deliverables
- SQL scripts to fix RLS recursion and set policies.
- Schema migration snippets to add missing columns.
- Updated env guidance and verification checklist.
- Runbook for future admin provisioning and forms validation.
