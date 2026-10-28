import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PortalContent, Submission, validateContent } from './model';

export function usePortalContent(isAdmin: boolean) {
  const [items, setItems] = useState<PortalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const version = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++version.current;
    const result = await supabase.from('kkg_content').select('*').order('sort_order').order('created_at', { ascending: false }).limit(500);
    if (request !== version.current) return;
    if (result.error) setError('Konten KKG belum berhasil dimuat. Periksa koneksi, lalu coba lagi.');
    else { setItems(result.data as PortalContent[]); setError(''); }
    setLoading(false);
  }, []);
  useEffect(() => {
    setItems([]);
    setLoading(true);
    void refresh();
    const channel = supabase.channel('kkg-content').on('postgres_changes', { event: '*', schema: 'public', table: 'kkg_content' }, () => void refresh()).subscribe();
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => { ++version.current; void supabase.removeChannel(channel); window.removeEventListener('focus', onFocus); };
  }, [isAdmin, refresh]);
  return { items, loading, error, refresh };
}

export async function saveContent(item: PortalContent) {
  const invalid = validateContent(item);
  if (invalid) throw new Error(invalid);
  const { created_at, updated_at, ...values } = item;
  values.title = values.title.trim();
  const result = updated_at
    ? await supabase.from('kkg_content').update(values).eq('id', item.id).eq('updated_at', updated_at).select('id').maybeSingle()
    : await supabase.from('kkg_content').insert(values).select('id').single();
  if (result.error) throw new Error(`Gagal menyimpan: ${result.error.message}`);
  if (!result.data) throw new Error('Data telah berubah di perangkat lain. Tutup formulir, muat ulang, lalu edit kembali.');
}

export async function submitContribution(values: Pick<Submission, 'kind' | 'title' | 'body' | 'author_name' | 'school_name' | 'link_url'>) {
  const id = crypto.randomUUID();
  const { error } = await supabase.from('kkg_submissions').insert({ ...values, id });
  if (error) throw new Error('Kiriman belum tersimpan. Periksa koneksi dan coba lagi.');
  return id;
}

export async function reviewContribution(id: string, action: 'publish' | 'review' | 'reject') {
  const { error } = await supabase.rpc('review_kkg_submission', { submission_id: id, review_action: action });
  if (error) throw new Error(error.message);
}

export async function uploadPortalFile(file: File): Promise<string> {
  if (file.size > 20 * 1024 * 1024) throw new Error('Ukuran berkas maksimal 20 MB. Gunakan tautan Drive untuk berkas lebih besar.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'jpg', 'jpeg', 'png', 'webp', 'mp4'].includes(extension)) throw new Error('Jenis berkas belum didukung. Gunakan PDF, dokumen Office, ZIP, foto, atau MP4.');
  const path = `portal/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('kkg-files').upload(path, file, { upsert: false });
  if (error) throw new Error(`Unggahan gagal: ${error.message}`);
  return supabase.storage.from('kkg-files').getPublicUrl(path).data.publicUrl;
}
