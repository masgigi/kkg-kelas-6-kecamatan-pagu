import React, { useState } from 'react';
import { Edit2, Pin, Plus, Search, Trash2 } from 'lucide-react';
import { AnnouncementItem } from '../types';
import { PortalModal } from '../features/portal/PortalModal';
import { safeUrl, todayJakarta } from '../features/portal/model';

export function UpdateView({ announcements, isAdmin, onSaveAnnouncement, onDeleteAnnouncement }: {
  announcements: AnnouncementItem[]; isAdmin: boolean;
  onSaveAnnouncement: (item: AnnouncementItem) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState<AnnouncementItem | null>(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const today = todayJakarta();
  const filtered = announcements.filter(a => (isAdmin || !a.expiresOn || a.expiresOn >= today) && `${a.title} ${a.content} ${a.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => Number(!!b.isPinned) - Number(!!a.isPinned) || b.date.localeCompare(a.date));
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editing) return;
    if (editing.expiresOn && editing.expiresOn < editing.date) { setError('Tanggal berakhir harus sama atau setelah tanggal pengumuman.'); return; }
    if ((editing.attachmentUrl && !safeUrl(editing.attachmentUrl)) || (editing.imageUrl && !safeUrl(editing.imageUrl))) { setError('Gunakan tautan http:// atau https:// yang valid.'); return; }
    setBusy(true); setError('');
    try { await onSaveAnnouncement({ ...editing, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean) }); setEditing(null); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  const remove = async (id: string) => { setError(''); try { await onDeleteAnnouncement(id); } catch (e) { setError((e as Error).message); } };
  return <div className="space-y-6 pb-12">
    <header className="bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 text-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_#000]">
      <span className="inline-block bg-yellow-300 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-3">📢 SIXUPDATE</span>
      <h1 className="text-2xl sm:text-4xl font-black">Informasi & Pengumuman KKG</h1><p className="text-sm font-bold mt-2">Kabar terbaru, surat edaran, dan informasi kegiatan KKG.</p>
      {isAdmin && <button className="portal-button bg-yellow-300 text-black mt-5" onClick={() => { setError(''); setTagsInput(''); setEditing({ id: `ann-${crypto.randomUUID()}`, title: '', date: today, author: 'Pengurus KKG', content: '', tags: [], isPinned: false }); }}><Plus size={16} />Buat Pengumuman</button>}
    </header>
    <label className="relative block max-w-lg"><span className="sr-only">Cari pengumuman</span><Search className="absolute top-3.5 left-3" size={18} /><input className="portal-input !pl-10" placeholder="Cari informasi atau pengumuman…" value={search} onChange={e => setSearch(e.target.value)} /></label>
    {error && !editing && <p role="alert" className="portal-error">{error}</p>}
    {!filtered.length && <div className="bg-lime-100 rounded-3xl border-3 border-black p-7 text-center font-bold">Belum ada pengumuman yang cocok.</div>}
    {filtered.map(ann => <article key={ann.id} className={`bg-white rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[4px_4px_0_#000] ${ann.isPinned ? 'ring-4 ring-yellow-300' : ''}`}>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-bold mb-3"><span>{ann.author} • {ann.date}</span>{ann.isPinned && <span className="flex items-center gap-1 bg-yellow-300 rounded-lg border border-black px-2"><Pin size={13} />Disematkan</span>}</div>
      <h2 className="text-xl font-black mb-3">{ann.title}</h2>
      {safeUrl(ann.imageUrl) && <img src={safeUrl(ann.imageUrl)} alt={ann.title} loading="lazy" className="max-h-80 w-full object-contain rounded-xl mb-4" />}
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{ann.content}</p>
      <div className="flex flex-wrap gap-2 mt-4">{ann.tags.map((tag, i) => <span key={i} className="bg-yellow-200 border border-black rounded px-2 py-1 text-xs font-bold">{tag}</span>)}</div>
      {ann.expiresOn && <p className="text-xs font-bold mt-4 text-gray-600">{ann.expiresOn < today ? 'Arsip — berakhir' : 'Berlaku hingga'} {ann.expiresOn}</p>}
      <div className="flex flex-wrap gap-3 mt-4">{safeUrl(ann.attachmentUrl) && <a href={safeUrl(ann.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="portal-button bg-cyan-200">Buka lampiran ↗</a>}{isAdmin && <><button className="portal-button bg-purple-100" onClick={() => { setError(''); setTagsInput(ann.tags.join(', ')); setEditing(ann); }}><Edit2 size={15} />Edit</button><button className="portal-button bg-pink-200" aria-label={`Hapus ${ann.title}`} onClick={() => void remove(ann.id)}><Trash2 size={15} />Hapus</button></>}</div>
    </article>)}
    {editing && isAdmin && <PortalModal title="Kelola Pengumuman" onClose={() => setEditing(null)} busy={busy}><form onSubmit={save} className="space-y-4"><fieldset disabled={busy} className="space-y-4">
      <label className="portal-label">Judul pengumuman<input required maxLength={200} className="portal-input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></label>
      <div className="grid sm:grid-cols-2 gap-3"><label className="portal-label">Tanggal<input type="date" required className="portal-input" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} /></label><label className="portal-label">Tanggal berakhir (opsional)<input type="date" min={editing.date} className="portal-input" value={editing.expiresOn || ''} onChange={e => setEditing({ ...editing, expiresOn: e.target.value })} /></label></div>
      <label className="portal-label">Penulis<input required maxLength={200} className="portal-input" value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} /></label>
      <label className="portal-label">Isi pengumuman<textarea required rows={7} maxLength={30000} className="portal-input" value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} /></label>
      <label className="portal-label">Tag (pisahkan koma)<input maxLength={500} className="portal-input" value={tagsInput} onChange={e => setTagsInput(e.target.value)} /></label>
      <label className="portal-label">URL lampiran / surat<input type="url" maxLength={2000} className="portal-input" value={editing.attachmentUrl || ''} onChange={e => setEditing({ ...editing, attachmentUrl: e.target.value })} /></label>
      <label className="portal-label">URL gambar<input type="url" maxLength={2000} className="portal-input" value={editing.imageUrl || ''} onChange={e => setEditing({ ...editing, imageUrl: e.target.value })} /></label>
      <label className="flex gap-3 font-bold text-sm"><input type="checkbox" checked={!!editing.isPinned} onChange={e => setEditing({ ...editing, isPinned: e.target.checked })} />Sematkan di urutan teratas</label>
    </fieldset>{error && <p role="alert" className="portal-error">{error}</p>}<button disabled={busy} className="portal-button bg-purple-600 text-white" type="submit">{busy ? 'Menyimpan…' : 'Simpan Pengumuman'}</button></form></PortalModal>}
  </div>;
}
