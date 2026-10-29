import React, { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import type { TeacherItem } from '../../types';
import { PortalContent, Submission, blankContent } from './model';
import { ContentEditor } from './ContentEditor';
import { ContentSection } from './ContentSection';
import { ContributionForm, ContributionReview } from './Contributions';

export const featureLinks = [
  { id: 'profile', title: 'Profil & Pengurus', note: 'Kenali KKG dan tim penggeraknya', emoji: '👥', color: 'bg-purple-500 text-white' },
  { id: 'program', title: 'Program & Agenda', note: 'Rencana kerja dan kegiatan bersama', emoji: '🎯', color: 'bg-orange-500 text-white' },
  { id: 'update', title: 'Informasi KKG', note: 'Pengumuman dan kabar terbaru', emoji: '📢', color: 'bg-cyan-300 text-black' },
  { id: 'stories', title: 'Dokumentasi & Praktik Baik', note: 'Cerita kegiatan dan inspirasi mengajar', emoji: '📸', color: 'bg-pink-500 text-white' },
  { id: 'drive', title: 'Perangkat & Sumber Belajar', note: 'Cari, buka, dan bagikan bahan ajar', emoji: '📚', color: 'bg-yellow-300 text-black' },
  { id: 'services', title: 'Layanan Anggota', note: 'Arsip, tautan penting, dan usulan', emoji: '🗂️', color: 'bg-lime-300 text-black' },
  { id: 'records', title: 'Rekap & Arsip', note: 'Daftar hadir, undangan, dan notulen rapat', emoji: '📋', color: 'bg-cyan-200 text-black' }
];

export function FeatureLinks({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return <section className="space-y-4" aria-label="Jelajahi KKG">
    <div><h2 className="font-black text-2xl">🌈 Ruang Kolaborasi KKG</h2><p className="text-sm font-bold text-gray-600 mt-1">Kenali komunitasnya, temukan ilmunya, bagikan inspirasinya.</p></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 py-2 pr-2">
      {featureLinks.map(link => <button
        key={link.id}
        onClick={() => onNavigate(link.id)}
        className={`kkg-feature-card ${link.color} group flex min-h-52 flex-col items-start text-left p-5 sm:p-6 rounded-2xl border-3 border-black shadow-[5px_5px_0_#000]`}
      >
        <span aria-hidden="true" className="kkg-feature-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 border-2 border-current/25 text-3xl">{link.emoji}</span>
        <span className="relative z-10 mt-4 block text-xl sm:text-2xl font-black leading-tight tracking-tight text-balance">{link.title}</span>
        <span className="relative z-10 mt-2 block text-sm sm:text-base font-semibold leading-snug max-w-72">{link.note}</span>
        <span aria-hidden="true" className="kkg-feature-arrow mt-auto pt-4 inline-flex items-center justify-center"><ArrowRight size={21} strokeWidth={3} /></span>
      </button>)}
    </div>
  </section>;
}

export function PortalHub({ view, items, isAdmin, loading, error, refresh, teachers, navigate }: {
  view: 'profile' | 'program' | 'stories' | 'resources' | 'services'; items: PortalContent[]; isAdmin: boolean; loading: boolean; error: string; refresh: () => Promise<void>; teachers: TeacherItem[]; navigate: (tab: string) => void;
}) {
  const [storyTab, setStoryTab] = useState<'documentation' | 'practice'>('documentation');
  const [contribution, setContribution] = useState<Submission['kind'] | null>(null);
  const [addingResource, setAddingResource] = useState<PortalContent | null>(null);
  const [resourceSaved, setResourceSaved] = useState(false);
  const link = featureLinks.find(f => f.id === (view === 'resources' ? 'drive' : view))!;
  const section = (kind: Parameters<typeof ContentSection>[0]['kind'], emptyText?: string) => <ContentSection key={kind} kind={kind} items={items} isAdmin={isAdmin} refresh={refresh} emptyText={emptyText} />;
  return <div className="space-y-7 pb-10">
    <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] p-5 sm:p-7">
      <span className="inline-flex bg-yellow-300 border-2 border-black rounded-full px-3 py-1 text-xs font-black mb-3">⚡ SIXVIBE • KKG6UP!</span>
      <h1 className="text-2xl sm:text-4xl font-black text-white">{link.emoji} {link.title}</h1><p className="text-sm font-bold text-white mt-2">{link.note}.</p>
      <div className="flex flex-wrap gap-3 mt-5">
        {view === 'profile' && <button className="portal-button bg-cyan-300" onClick={() => navigate('crew')}>Lihat {teachers.length} guru anggota <ArrowRight size={16} /></button>}
        {view === 'program' && <><button className="portal-button bg-yellow-300" onClick={() => navigate('schedule')}>📅 Buka agenda & jadwal</button><a className="portal-button bg-white" href="/absensi" target="_blank" rel="noopener noreferrer">Isi presensi ↗</a></>}
        {view === 'stories' && <button className="portal-button bg-lime-300" onClick={() => setContribution('practice')}><Plus size={16} />Bagikan praktik baik</button>}
        {view === 'resources' && <button className="portal-button bg-yellow-300" onClick={() => isAdmin ? setAddingResource({ ...blankContent('resource'), status: 'published' }) : setContribution('resource')}><Plus size={16} />{isAdmin ? 'Unggah / Tambah ke Katalog' : 'Bagikan sumber belajar'}</button>}
        {view === 'services' && <button className="portal-button bg-cyan-300" onClick={() => setContribution('suggestion')}>💬 Kirim usulan / masukan</button>}
      </div>
    </section>
    {error && <div role="alert" className="portal-error">{error}<button onClick={() => void refresh()} className="portal-button bg-white ml-3">Coba lagi</button></div>}
    {loading ? <p role="status" className="p-6 font-bold">Memuat konten KKG…</p> : <>
      {view === 'profile' && <>{section('profile')}<div className="grid grid-cols-2 gap-4"><div className="bg-yellow-200 border-3 border-black rounded-2xl p-5"><p className="text-3xl font-black">{teachers.length}</p><p className="font-bold text-sm">Guru anggota</p></div><div className="bg-pink-200 border-3 border-black rounded-2xl p-5"><p className="text-3xl font-black">{new Set(teachers.map(t => t.school.trim().toUpperCase())).size}</p><p className="font-bold text-sm">Sekolah terdaftar</p></div></div><ContentSection kind="committee" items={items.filter(item => item.details.record_type !== 'team')} isAdmin={isAdmin} refresh={refresh} /><ContentSection kind="committee" contentVariant="team" items={items.filter(item => item.details.record_type === 'team')} isAdmin={isAdmin} refresh={refresh} emptyText="Fokus kerja dan produk utama setiap tim akan ditampilkan setelah diterbitkan pengurus." /></>}
      {view === 'program' && section('program', isAdmin
        ? 'Tambahkan program resmi beserta periode, target, penanggung jawab, dan status pelaksanaan.'
        : 'Program kerja resmi akan ditampilkan setelah diterbitkan pengurus. Agenda pertemuan dapat dilihat melalui tombol di atas.')}
      {view === 'stories' && <><div className="flex flex-wrap gap-3" aria-label="Kategori cerita"><button aria-pressed={storyTab === 'documentation'} className={`portal-button ${storyTab === 'documentation' ? 'bg-orange-300' : 'bg-white'}`} onClick={() => setStoryTab('documentation')}>📸 Dokumentasi kegiatan</button><button aria-pressed={storyTab === 'practice'} className={`portal-button ${storyTab === 'practice' ? 'bg-lime-300' : 'bg-white'}`} onClick={() => setStoryTab('practice')}>💡 Praktik baik guru</button></div>{section(storyTab)}</>}
      {view === 'resources' && <>{resourceSaved && <p role="status" className="rounded-xl border-2 border-black bg-lime-100 p-4 font-bold">Sumber belajar berhasil disimpan. Bahan berstatus Terbit dapat dilihat pengunjung di katalog.</p>}{section('resource')}{isAdmin && <ContributionReview kindFilter="resource" onReviewed={refresh} />}</>}
      {view === 'services' && <><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[{ id: 'cash', label: '💸 Kas KKG', color: 'bg-emerald-300' }, { id: 'meeting', label: '🎥 Rapat Online', color: 'bg-orange-300' }, { id: 'crew', label: '👩‍🏫 Data Guru', color: 'bg-cyan-300' }, { id: 'schedule', label: '📅 Agenda', color: 'bg-pink-300' }].map(item => <button key={item.id} className={`portal-button ${item.color}`} onClick={() => navigate(item.id)}>{item.label}</button>)}</div>{section('service')}{isAdmin && <ContributionReview onReviewed={refresh} />}</>}
    </>}
    {contribution && <ContributionForm kind={contribution} onClose={() => setContribution(null)} />}
    {addingResource && isAdmin && <ContentEditor initial={addingResource} onClose={() => setAddingResource(null)} onSaved={async () => { await refresh(); setResourceSaved(true); }} />}
  </div>;
}
