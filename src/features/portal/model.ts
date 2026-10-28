import type { ScheduleItem } from '../../types';

export type ContentKind = 'profile' | 'committee' | 'program' | 'documentation' | 'practice' | 'resource' | 'service';
export type ContentStatus = 'draft' | 'published' | 'archived';
export interface PortalContent {
  id: string;
  kind: ContentKind;
  title: string;
  summary: string;
  body: string;
  author_name: string;
  image_url: string;
  link_url: string;
  tags: string[];
  details: Record<string, string>;
  status: ContentStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface Submission {
  id: string;
  kind: 'practice' | 'resource' | 'suggestion';
  title: string;
  body: string;
  author_name: string;
  school_name: string;
  link_url: string;
  status: 'pending' | 'reviewed' | 'rejected';
  created_at: string;
}
export type DetailField = { key: string; label: string; type?: 'textarea' | 'date' | 'url' | 'email'; options?: string[] };
export const contentConfig: Record<ContentKind, { label: string; emoji: string; color: string; titleLabel: string; bodyLabel: string; fields: DetailField[] }> = {
  profile: { label: 'Profil KKG', emoji: '⚡', color: 'bg-purple-200', titleLabel: 'Nama KKG', bodyLabel: 'Tentang KKG', fields: [
    { key: 'vision', label: 'Visi', type: 'textarea' }, { key: 'mission', label: 'Misi (satu per baris)', type: 'textarea' },
    { key: 'address', label: 'Alamat sekretariat' }, { key: 'contact', label: 'Kontak sekretariat' }, { key: 'email', label: 'Email sekretariat', type: 'email' }
  ] },
  committee: { label: 'Pengurus', emoji: '👥', color: 'bg-cyan-200', titleLabel: 'Nama pengurus', bodyLabel: 'Tugas / keterangan', fields: [
    { key: 'position', label: 'Jabatan' }, { key: 'school', label: 'Sekolah' }, { key: 'term', label: 'Masa bakti' }
  ] },
  program: { label: 'Program Kerja', emoji: '🎯', color: 'bg-pink-200', titleLabel: 'Nama program', bodyLabel: 'Rencana kegiatan dan target hasil', fields: [
    { key: 'period', label: 'Tahun / semester' }, { key: 'responsible', label: 'Penanggung jawab' },
    { key: 'progress', label: 'Status program', options: ['Direncanakan', 'Berjalan', 'Selesai'] }, { key: 'date', label: 'Target pelaksanaan', type: 'date' }
  ] },
  documentation: { label: 'Dokumentasi', emoji: '📸', color: 'bg-orange-200', titleLabel: 'Nama kegiatan / album', bodyLabel: 'Cerita dan hasil kegiatan', fields: [
    { key: 'date', label: 'Tanggal kegiatan', type: 'date' }, { key: 'location', label: 'Lokasi' },
    { key: 'photos', label: 'URL foto album (satu per baris)', type: 'textarea' }, { key: 'video', label: 'Tautan video', type: 'url' }
  ] },
  practice: { label: 'Praktik Baik', emoji: '💡', color: 'bg-lime-200', titleLabel: 'Judul praktik baik', bodyLabel: 'Cerita praktik baik', fields: [
    { key: 'school', label: 'Sekolah' }, { key: 'subject', label: 'Mata pelajaran' },
    { key: 'problem', label: 'Tantangan pembelajaran', type: 'textarea' }, { key: 'steps', label: 'Langkah yang dilakukan', type: 'textarea' },
    { key: 'results', label: 'Hasil dan refleksi', type: 'textarea' }
  ] },
  resource: { label: 'Sumber Belajar', emoji: '📚', color: 'bg-yellow-200', titleLabel: 'Judul perangkat / sumber belajar', bodyLabel: 'Deskripsi dan petunjuk penggunaan', fields: [
    { key: 'category', label: 'Kategori', options: ['Modul Ajar', 'ATP & TP', 'Asesmen', 'LKPD', 'Soal & Kisi-Kisi', 'Media Pembelajaran', 'Administrasi Kelas', 'Referensi'] },
    { key: 'subject', label: 'Mata pelajaran', options: ['Lintas Mapel', 'Bahasa Indonesia', 'Matematika', 'IPAS', 'Pendidikan Pancasila', 'Bahasa Inggris', 'PJOK', 'Seni', 'Pendidikan Agama', 'Muatan Lokal'] },
    { key: 'semester', label: 'Semester', options: ['1', '2', '1 & 2'] }, { key: 'school', label: 'Sekolah / penyusun' }
  ] },
  service: { label: 'Layanan & Arsip', emoji: '🗂️', color: 'bg-emerald-200', titleLabel: 'Judul layanan / arsip', bodyLabel: 'Keterangan', fields: [
    { key: 'category', label: 'Kategori', options: ['Notulen', 'Surat', 'Tautan Penting', 'Panduan', 'Lainnya'] }, { key: 'date', label: 'Tanggal dokumen', type: 'date' }
  ] }
};

export function safeUrl(value?: string): string {
  if (!value?.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return '';
    const hostname = url.hostname.toLowerCase();
    const labels = hostname.split('.');
    const isDnsName = labels.length >= 2 &&
      labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) &&
      /^(?:[a-z]{2,63}|xn--[a-z0-9-]+)$/.test(labels[labels.length - 1]);
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
    const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || /^\[[0-9a-f:]+\]$/.test(hostname);
    if (!isDnsName && !isLocal && !isIpAddress) return '';
    if (['example.com', 'example.org', 'example.net'].includes(hostname) ||
        /\.(?:example|invalid|test)$/.test(hostname) || url.pathname === '/-') return '';
    if (hostname === 'meet.google.com' && /^\/kkg-pagu(?:-|\/|$)/.test(url.pathname)) return '';
    return url.href;
  } catch { return ''; }
}

export function todayJakarta(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function upcomingSchedule(schedules: ScheduleItem[], today = todayJakarta()): ScheduleItem | undefined {
  return schedules.filter(s => s.status !== 'Selesai' && s.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function blankContent(kind: ContentKind): PortalContent {
  return { id: crypto.randomUUID(), kind, title: '', summary: '', body: '', author_name: '', image_url: '', link_url: '', tags: [], details: {}, status: 'draft', sort_order: 0, created_at: '', updated_at: '' };
}

export function validateContent(item: PortalContent): string {
  if (!item.title.trim()) return 'Judul wajib diisi.';
  if (item.title.length > 200 || item.body.length > 30000) return 'Judul maksimal 200 karakter dan isi maksimal 30.000 karakter.';
  for (const url of [item.link_url, item.image_url, item.details.video, ...(item.details.photos || '').split('\n')]) {
    if (url?.trim() && !safeUrl(url)) return 'Tautan harus berupa alamat http:// atau https:// yang valid.';
  }
  if (item.kind === 'resource' && !safeUrl(item.link_url)) return 'Sumber belajar memerlukan tautan berkas atau unggahan.';
  if (item.kind === 'committee' && !item.details.position?.trim()) return 'Jabatan pengurus wajib diisi.';
  return '';
}
