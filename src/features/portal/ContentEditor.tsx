import React, { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { PortalContent, contentConfig } from './model';
import { saveContent, uploadPortalFile } from './api';
import { PortalModal } from './PortalModal';
import { MediaPreview } from './MediaPreview';

export function ContentEditor({ initial, onClose, onSaved }: { initial: PortalContent; onClose: () => void; onSaved: () => Promise<void> }) {
  const [item, setItem] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tagsInput, setTagsInput] = useState(initial.tags.join(', '));
  const [mediaUrl, setMediaUrl] = useState(initial.details.media_url || initial.image_url || initial.details.video || (initial.details.photos || '').split('\n').find(Boolean) || initial.link_url);
  const config = contentConfig[item.kind];
  const change = (key: keyof PortalContent, value: unknown) => setItem(prev => ({ ...prev, [key]: value }));
  const upload = async (file: File | undefined, target: 'image_url' | 'link_url') => {
    if (!file) return;
    setBusy(true); setError('');
    try {
      if (target === 'image_url' && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Pilih foto JPG, PNG, atau WebP.');
      const url = await uploadPortalFile(file);
      change(target, url);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const values = item.kind === 'documentation'
        ? { ...item, details: { ...item.details, media_url: mediaUrl.trim() }, summary: item.body.trim().slice(0, 500) }
        : { ...item, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 20) };
      await saveContent(values); await onSaved(); onClose();
    }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return <PortalModal title={`${initial.updated_at ? 'Edit' : 'Tambah'} ${config.label}`} onClose={onClose} busy={busy}>
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <label className="portal-label">{item.kind === 'documentation' ? 'Judul kegiatan' : config.titleLabel}<input required maxLength={200} className="portal-input" value={item.title} onChange={e => change('title', e.target.value)} /></label>
        {item.kind === 'documentation' ? <>
          <label className="portal-label">Keterangan kegiatan<textarea required maxLength={30000} rows={4} className="portal-input" placeholder="Ceritakan kegiatan secara singkat…" value={item.body} onChange={e => change('body', e.target.value)} /></label>
          <label className="portal-label">URL foto atau video<input required type="url" maxLength={2000} className="portal-input" placeholder="https://…" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} /></label>
          <p className="text-sm font-semibold text-gray-700">Tempel tautan foto, YouTube, Google Drive, Google Foto (Bagikan → Buat link), atau postingan/Reel Instagram publik. Pastikan tautan dapat dilihat pengunjung tanpa meminta izin.</p>
          <MediaPreview url={mediaUrl} title={item.title || 'kegiatan'} />
        </> : <>
        <label className="portal-label">Ringkasan singkat<textarea maxLength={500} rows={2} className="portal-input" value={item.summary} onChange={e => change('summary', e.target.value)} /></label>
        <label className="portal-label">{config.bodyLabel}<textarea maxLength={30000} rows={5} className="portal-input" value={item.body} onChange={e => change('body', e.target.value)} /></label>
        <div className="grid sm:grid-cols-2 gap-4">
          {config.fields.map(field => <label key={field.key} className={`portal-label ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>{field.label}
            {field.options ? <select className="portal-input" value={item.details[field.key] || ''} onChange={e => change('details', { ...item.details, [field.key]: e.target.value })}><option value="">Pilih…</option>{field.options.map(value => <option key={value}>{value}</option>)}</select>
              : field.type === 'textarea' ? <textarea rows={3} maxLength={10000} className="portal-input" value={item.details[field.key] || ''} onChange={e => change('details', { ...item.details, [field.key]: e.target.value })} />
              : <input type={field.type || 'text'} maxLength={2000} className="portal-input" value={item.details[field.key] || ''} onChange={e => change('details', { ...item.details, [field.key]: e.target.value })} />}
          </label>)}
        </div>
        <label className="portal-label">Penulis / penyusun<input maxLength={200} className="portal-input" value={item.author_name} onChange={e => change('author_name', e.target.value)} /></label>
        <label className="portal-label">Tautan berkas / informasi<input type="url" maxLength={2000} className="portal-input" placeholder="https://…" value={item.link_url} onChange={e => change('link_url', e.target.value)} /></label>
        <label className="portal-label"><span className="flex items-center gap-2"><Upload size={16} /> Atau unggah berkas (maksimal 20 MB)</span><input type="file" className="portal-input" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.webp,.mp4" onChange={e => void upload(e.target.files?.[0], 'link_url')} /></label>
        <label className="portal-label">URL foto sampul / pengurus<input type="url" maxLength={2000} className="portal-input" placeholder="https://…" value={item.image_url} onChange={e => change('image_url', e.target.value)} /></label>
        <label className="portal-label">Atau unggah foto<input type="file" className="portal-input" accept="image/jpeg,image/png,image/webp" onChange={e => void upload(e.target.files?.[0], 'image_url')} /></label>
        <p className="text-xs font-semibold text-gray-600">Berkas unggahan memakai penyimpanan publik KKG. Simpan bahan yang memang boleh dibagikan.</p>
        <label className="portal-label">Tag (pisahkan dengan koma)<input maxLength={500} className="portal-input" value={tagsInput} onChange={e => setTagsInput(e.target.value)} /></label>
        </>}
        <div className="grid grid-cols-2 gap-4">
          <label className="portal-label">Status<select className="portal-input" value={item.status} onChange={e => change('status', e.target.value)}><option value="draft">Draf</option><option value="published">Terbit</option><option value="archived">Arsip</option></select></label>
          <label className="portal-label">Urutan tampil<input type="number" min={0} max={9999} className="portal-input" value={item.sort_order} onChange={e => change('sort_order', Number(e.target.value))} /></label>
        </div>
      </fieldset>
      {error && <p role="alert" className="portal-error">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3 border-t-2 border-black pt-4">
        <button type="button" disabled={busy} onClick={onClose} className="portal-button bg-gray-100">Batal</button>
        <button type="submit" disabled={busy} className="portal-button bg-purple-600 text-white"><Save size={17} />{busy ? 'Menyimpan…' : 'Simpan Konten'}</button>
      </div>
    </form>
  </PortalModal>;
}
