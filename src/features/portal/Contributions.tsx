import React, { useCallback, useEffect, useState } from 'react';
import { Check, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Submission, safeUrl } from './model';
import { reviewContribution, submitContribution } from './api';
import { PortalModal } from './PortalModal';

export function ContributionForm({ kind, onClose }: { kind: Submission['kind']; onClose: () => void }) {
  const [values, setValues] = useState({ kind, title: '', body: '', author_name: '', school_name: '', link_url: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [website, setWebsite] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (website || busy) return;
    if (values.link_url && !safeUrl(values.link_url)) { setError('Gunakan tautan http:// atau https:// yang valid.'); return; }
    setBusy(true); setError('');
    try { setReceipt(await submitContribution(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])) as typeof values)); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <PortalModal title={kind === 'suggestion' ? 'Kirim Usulan / Masukan' : kind === 'practice' ? 'Bagikan Praktik Baik' : 'Bagikan Sumber Belajar'} onClose={onClose} busy={busy}>
    {receipt ? <div role="status" className="text-center space-y-4 py-5"><Check className="mx-auto text-emerald-600" size={44} /><h3 className="font-black text-xl">Kiriman sudah tersimpan!</h3><p className="text-sm">Pengurus akan meninjau kiriman Anda. Simpan nomor referensi berikut untuk menghubungi pengurus.</p><p className="bg-yellow-100 border-2 border-black rounded-xl p-3 font-mono text-xs break-all">{receipt}</p><button className="portal-button bg-cyan-300" onClick={onClose}>Selesai</button></div>
      : <form onSubmit={submit} className="space-y-4">
        <p className="text-sm font-semibold bg-purple-100 border-2 border-black rounded-xl p-3">Kiriman masuk ke pengurus terlebih dahulu. Praktik baik dan sumber belajar ditampilkan setelah disetujui.</p>
        <fieldset disabled={busy} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="portal-label">Nama pengirim<input required minLength={2} maxLength={200} className="portal-input" value={values.author_name} onChange={e => setValues({ ...values, author_name: e.target.value })} /></label>
            <label className="portal-label">Sekolah / unit kerja<input required minLength={2} maxLength={200} className="portal-input" value={values.school_name} onChange={e => setValues({ ...values, school_name: e.target.value })} /></label>
          </div>
          <label className="portal-label">Judul<input required maxLength={200} className="portal-input" value={values.title} onChange={e => setValues({ ...values, title: e.target.value })} /></label>
          <label className="portal-label">{kind === 'practice' ? 'Tantangan, langkah, hasil, dan refleksi' : 'Isi / keterangan'}<textarea required minLength={10} maxLength={15000} rows={7} className="portal-input" value={values.body} onChange={e => setValues({ ...values, body: e.target.value })} /></label>
          <label className="portal-label">Tautan bahan pendukung {kind === 'resource' ? '(wajib)' : '(opsional)'}<input type="url" required={kind === 'resource'} maxLength={2000} className="portal-input" placeholder="https://drive.google.com/…" value={values.link_url} onChange={e => setValues({ ...values, link_url: e.target.value })} /></label>
          <p className="text-xs font-semibold text-gray-600">Pastikan pengurus dapat membuka tautan yang Anda bagikan.</p>
          <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
        </fieldset>
        {error && <p role="alert" className="portal-error">{error}</p>}
        <button type="submit" disabled={busy} className="portal-button bg-purple-600 text-white"><Send size={16} />{busy ? 'Mengirim…' : 'Kirim ke Pengurus'}</button>
      </form>}
  </PortalModal>;
}

export function ContributionReview({ onReviewed }: { onReviewed: () => Promise<void> }) {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('kkg_submissions').select('*').eq('status', 'pending').order('created_at').limit(100);
    if (error) setError('Antrean kiriman belum berhasil dimuat.');
    else { setItems(data as Submission[]); setError(''); }
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);
  const review = async (action: 'publish' | 'review' | 'reject') => {
    if (!reviewing) return;
    setBusy(true); setError('');
    try { await reviewContribution(reviewing.id, action); setReviewing(null); await load(); await onReviewed(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <section className="rounded-3xl border-3 border-black shadow-[5px_5px_0_#000] bg-purple-100 p-5 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">📥 Tinjau Kiriman Guru</h2><button className="portal-button bg-white" onClick={() => void load()}>Muat ulang</button></div>
    <p className="text-sm font-semibold">Nama pengirim diisi oleh pengirim. Periksa isi dan tautan sebelum menerbitkan.</p>
    {loading ? <p role="status">Memuat kiriman…</p> : !items.length ? <p className="font-bold">Tidak ada kiriman yang menunggu ditinjau.</p> : <div className="space-y-3">{items.map(item => <button key={item.id} onClick={() => setReviewing(item)} className="w-full text-left rounded-xl border-2 border-black p-4 bg-white hover:bg-yellow-50"><span className="font-black block">{item.title}</span><span className="text-sm">{item.author_name} • {item.school_name} • {item.kind === 'suggestion' ? 'Usulan' : item.kind === 'practice' ? 'Praktik baik' : 'Sumber belajar'}</span></button>)}</div>}
    {error && !reviewing && <p role="alert" className="portal-error">{error}</p>}
    {reviewing && <PortalModal title="Tinjau kiriman" onClose={() => setReviewing(null)} busy={busy}><div className="space-y-4"><h3 className="font-black text-xl">{reviewing.title}</h3><p className="text-sm font-bold">{reviewing.author_name} • {reviewing.school_name}</p><p className="whitespace-pre-wrap break-words">{reviewing.body}</p>{safeUrl(reviewing.link_url) && <a className="portal-button bg-cyan-200" href={safeUrl(reviewing.link_url)} target="_blank" rel="noopener noreferrer">Periksa tautan ↗</a>}{error && <p role="alert" className="portal-error">{error}</p>}<div className="flex flex-wrap gap-3 pt-3 border-t-2 border-black"><button disabled={busy} className="portal-button bg-emerald-300" onClick={() => void review(reviewing.kind === 'suggestion' ? 'review' : 'publish')}><Check size={16} />{reviewing.kind === 'suggestion' ? 'Tandai sudah ditinjau' : 'Setujui & Terbitkan'}</button><button disabled={busy} className="portal-button bg-pink-200" onClick={() => void review('reject')}><X size={16} />Tolak kiriman</button></div></div></PortalModal>}
  </section>;
}
