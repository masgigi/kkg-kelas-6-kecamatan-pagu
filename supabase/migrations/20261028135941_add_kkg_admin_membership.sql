-- Authorize KKG administrators through confirmed Supabase Auth accounts.
CREATE TABLE public.kkg_admin_members (
  email text PRIMARY KEY
    CHECK (email = lower(btrim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  active boolean NOT NULL DEFAULT true,
  added_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kkg_admin_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.kkg_admin_members FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kkg_admin_members TO authenticated;

INSERT INTO public.kkg_admin_members (email) VALUES
  ('kediriacara@gmail.com'),
  ('kkgkelas6@gmail.com');

CREATE SCHEMA IF NOT EXISTS kkg_private;
REVOKE ALL ON SCHEMA kkg_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA kkg_private TO authenticated;

-- This restricted function reads Auth's verified email by auth.uid(), not a mutable JWT email.
CREATE FUNCTION kkg_private.current_user_is_kkg_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(EXISTS (
    SELECT 1
    FROM auth.users AS u
    JOIN public.kkg_admin_members AS m ON m.email = lower(btrim(u.email))
    WHERE u.id = (SELECT auth.uid())
      AND u.email_confirmed_at IS NOT NULL
      AND u.confirmation_sent_at IS NOT NULL
      AND m.active
  ), false)
$$;
REVOKE ALL ON FUNCTION kkg_private.current_user_is_kkg_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION kkg_private.current_user_is_kkg_admin() TO authenticated;

-- Preserve the RPC name used by all current table and Storage policies.
CREATE OR REPLACE FUNCTION public.is_kkg_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT kkg_private.current_user_is_kkg_admin()), false)
$$;
REVOKE ALL ON FUNCTION public.is_kkg_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_kkg_admin() TO authenticated;

CREATE POLICY "KKG admin read members"
ON public.kkg_admin_members FOR SELECT TO authenticated
USING ((SELECT public.is_kkg_admin()));

CREATE POLICY "KKG admin add members"
ON public.kkg_admin_members FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_kkg_admin()));

CREATE POLICY "KKG admin update members"
ON public.kkg_admin_members FOR UPDATE TO authenticated
USING ((SELECT public.is_kkg_admin()))
WITH CHECK ((SELECT public.is_kkg_admin()));

CREATE POLICY "KKG admin remove members"
ON public.kkg_admin_members FOR DELETE TO authenticated
USING ((SELECT public.is_kkg_admin()));

COMMENT ON TABLE public.kkg_admin_members IS
  'Approved KKG admin email addresses. Access requires a matching Supabase Auth user that completed email confirmation.';
