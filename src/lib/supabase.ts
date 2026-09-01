import { createClient } from '@supabase/supabase-js';

// These values are public frontend configuration. Keep this project authoritative
// so stale Vercel environment variables cannot silently point production elsewhere.
const supabaseUrl = 'https://ismbuzqscurwsqxtppvx.supabase.co';
const supabasePublishableKey = 'sb_publishable_XB0MoRfb120Z9HqoL6RNug_e0xQRT-y';

export const supabaseAdminEmail = String(
  (import.meta as any).env?.VITE_SUPABASE_ADMIN_EMAIL || 'kediriacara@gmail.com'
).trim().toLowerCase();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.');
}

if (!supabaseAdminEmail) {
  console.warn('Email admin Supabase belum dikonfigurasi. Isi VITE_SUPABASE_ADMIN_EMAIL.');
}

export const supabase = createClient(
  supabaseUrl || 'https://example.supabase.co',
  supabasePublishableKey || 'supabase-public-placeholder'
);
