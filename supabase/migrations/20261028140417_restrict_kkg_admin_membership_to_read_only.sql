-- Membership changes require a project-owner migration; website admins can only read the allowlist.
REVOKE INSERT, UPDATE, DELETE ON public.kkg_admin_members FROM authenticated;

DROP POLICY "KKG admin add members" ON public.kkg_admin_members;
DROP POLICY "KKG admin update members" ON public.kkg_admin_members;
DROP POLICY "KKG admin remove members" ON public.kkg_admin_members;
