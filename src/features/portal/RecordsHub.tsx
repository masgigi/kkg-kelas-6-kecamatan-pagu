import { useState } from 'react';
import type { PortalContent } from './model';
import { ContentSection } from './ContentSection';

const sections = [
  { category: 'Daftar Hadir', emoji: '✅', note: 'Rekap peserta dan arsip kehadiran', color: 'bg-lime-200' },
  { category: 'Undangan', emoji: '✉️', note: 'Surat undangan kegiatan KKG', color: 'bg-pink-200' },
  { category: 'Notulen', emoji: '📝', note: 'Hasil pembahasan dan tindak lanjut rapat', color: 'bg-cyan-200' }
];

export function RecordsHub({ items, isAdmin, loading, error, refresh, navigate }: { items: PortalContent[]; isAdmin: boolean; loading: boolean; error: string; refresh: () => Promise<void>; navigate: (tab: string) => void }) {
  const [selected, setSelected] = useState('Daftar Hadir');
  const visible = items.filter(item => item.kind === 'service' && (isAdmin || item.status === 'published'));
  return <div className="space-y-7 pb-10">
    <section className="rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 sm:p-8">
      <span className="inline-block bg-yellow-300 rounded-full border-2 border-black px-3 py-1 text-xs font-black">ARSIP KEGIATAN KKG</span>
      <h1 className="mt-4 text-3xl sm:text-4xl font-black text-white">📋 Rekap & Arsip</h1>
      <p className="mt-3 font-semibold text-white">Daftar hadir, undangan, dan notulen kegiatan tersimpan dalam satu ruang.</p>
      <div className="mt-5 flex flex-wrap gap-3"><a href="/absensi" className="portal-button bg-yellow-300">✅ Isi presensi</a>{isAdmin && <button className="portal-button bg-white" onClick={() => navigate('attendance')}>📊 Rekap presensi online</button>}</div>
    </section>
    <div className="grid sm:grid-cols-3 gap-4" role="group" aria-label="Jenis arsip kegiatan">{sections.map(section => <button key={section.category} aria-pressed={selected === section.category} onClick={() => setSelected(section.category)} className={`${section.color} text-left p-5 border-3 border-black rounded-2xl transition-transform hover:-translate-y-1 ${selected === section.category ? 'shadow-[5px_5px_0_#000] ring-2 ring-purple-600 ring-offset-2' : ''}`}><span className="text-3xl" aria-hidden="true">{section.emoji}</span><span className="block mt-3 font-black text-xl">{section.category}</span><span className="block text-sm font-semibold mt-2">{section.note}</span><span className="inline-block mt-3 bg-white/80 border border-black px-2 py-1 rounded-lg text-xs font-bold">{visible.filter(item => item.details.category === section.category).length} dokumen</span></button>)}</div>
    {error && <div className="portal-error" role="alert">{error}<button className="portal-button bg-white ml-3" onClick={() => void refresh()}>Coba lagi</button></div>}
    {loading ? <p role="status" className="font-bold p-6">Memuat arsip kegiatan…</p> : <ContentSection key={selected} kind="service" documentCategory={selected} items={items.filter(item => item.details.category === selected)} isAdmin={isAdmin} refresh={refresh} emptyText={isAdmin ? `Tambahkan judul kegiatan, tanggal, keterangan, dan URL ${selected.toLowerCase()}.` : 'Dokumen akan tampil setelah diterbitkan pengurus.'} />}
  </div>;
}
