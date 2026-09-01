import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://ismbuzqscurwsqxtppvx.supabase.co';
const supabasePublishableKey =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_XB0MoRfb120Z9HqoL6RNug_e0xQRT-y';

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
