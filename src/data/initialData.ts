import { DriveFolder, ScheduleItem, TransactionItem, TeacherItem, AnnouncementItem, OnlineMeeting, SchoolAccount } from '../types';

export const initialDriveFolders: DriveFolder[] = [
  {
    id: 'df-1',
    title: 'Modul Ajar',
    fileCount: 34,
    url: 'https://drive.google.com/drive/u/0/folders/1_ModulAjar_KKG6_Pagu',
    color: 'from-purple-500 to-indigo-600',
    description: 'Modul ajar Kurikulum Merdeka Semester 1 & 2 lengkap semua mata pelajaran',
    iconName: 'BookOpen'
  },
  {
    id: 'df-2',
    title: 'ATP & TP',
    fileCount: 18,
    url: 'https://drive.google.com/drive/u/0/folders/2_ATP_TP_KKG6_Pagu',
    color: 'from-amber-400 to-yellow-500',
    description: 'Alur Tujuan Pembelajaran dan Capaian Pembelajaran Fase C Kelas 6',
    iconName: 'FileSpreadsheet'
  },
  {
    id: 'df-3',
    title: 'Asesmen',
    fileCount: 24,
    url: 'https://drive.google.com/drive/u/0/folders/3_Asesmen_KKG6_Pagu',
    color: 'from-emerald-400 to-teal-600',
    description: 'Rubrik penilaian formatif, sumatif, dan lembar kerja peserta didik (LKPD)',
    iconName: 'CheckSquare'
  },
  {
    id: 'df-4',
    title: 'Soal & Kisi-Kisi',
    fileCount: 37,
    url: 'https://drive.google.com/drive/u/0/folders/4_Soal_KisiKisi_KKG6_Pagu',
    color: 'from-cyan-400 to-blue-600',
    description: 'Bank soal STS, SAS, Try Out, dan kisi-kisi penilaian lengkap',
    iconName: 'FileText'
  },
  {
    id: 'df-5',
    title: 'Administrasi Kelas',
    fileCount: 16,
    url: 'https://drive.google.com/drive/u/0/folders/5_Admin_Kelas_KKG6_Pagu',
    color: 'from-pink-500 to-rose-600',
    description: 'Jurnal harian, absensi, kalender pendidikan, dan kelengkapan guru',
    iconName: 'FolderArchive'
  },
  {
    id: 'df-6',
    title: 'Media Pembelajaran',
    fileCount: 29,
    url: 'https://drive.google.com/drive/u/0/folders/6_Media_Canva_KKG6_Pagu',
    color: 'from-orange-400 to-amber-600',
    description: 'Slide PPT interaktif, link template Canva, video, dan poster edukasi',
    iconName: 'Presentation'
  }
];

export const initialSchedules: ScheduleItem[] = [
  {
    id: 'sch-1',
    title: 'KKG Rutin #08 - Persiapan Pembelajaran Semester Ganjil',
    date: '2026-08-12',
    time: '09.00 - 12.00 WIB',
    location: 'SDN Pagu 1',
    agenda: [
      'Evaluasi program kerja semester sebelumnya',
      'Penyusunan Administrasi Kelas VI Kurikulum Merdeka',
      'Sharing template Canva & media pembelajaran interaktif',
      'Pembahasan Kas & Iuran Anggota'
    ],
    status: 'Akan Datang',
    invitationUrl: '#',
    mapsUrl: 'https://maps.google.com/?q=SDN+Pagu+1+Kediri',
    googleMeetUrl: 'https://meet.google.com/kkg-pagu-kelas6'
  },
  {
    id: 'sch-2',
    title: 'Workshop Penyusunan Modul Ajar & Asesmen Digital',
    date: '2026-08-26',
    time: '08.30 - 11.30 WIB',
    location: 'SDN Sitimerto 1',
    agenda: [
      'Penyusunan Modul Ajar Berdeferensiasi',
      'Praktik pembuatan kuis interaktif dengan Quizizz/Google Forms',
      'Review instrumen Asesmen Sumatif'
    ],
    status: 'Persiapan',
    invitationUrl: '#',
    mapsUrl: 'https://maps.google.com/?q=SDN+Sitimerto+Kediri',
    googleMeetUrl: 'https://meet.google.com/kkg-pagu-modul'
  },
  {
    id: 'sch-3',
    title: 'Evaluasi Pembelajaran & Bedah Bank Soal STS',
    date: '2026-09-09',
    time: '09.00 - 12.00 WIB',
    location: 'SDN Semen 1',
    agenda: [
      'Penyusunan Kisi-Kisi dan Soal Sumatif Tengah Semester',
      'Standardisasi rubrik penilaian',
      'Update data anggota & kas KKG'
    ],
    status: 'Terjadwal',
    invitationUrl: '#',
    mapsUrl: 'https://maps.google.com/?q=SDN+Semen+Pagu+Kediri'
  }
];

export const initialTransactions: TransactionItem[] = [
  {
    id: 'tx-1',
    date: '2026-07-01',
    description: 'Kas Anggota Bulan Juli 2026 (20 Sekolah)',
    type: 'masuk',
    amount: 1000000,
    schoolOrTeacher: 'Anggota KKG Pagu',
    category: 'Kas Anggota'
  },
  {
    id: 'tx-2',
    date: '2026-07-07',
    description: 'Konsumsi Rapat KKG di SDN Pagu 1',
    type: 'keluar',
    amount: 350000,
    schoolOrTeacher: 'Panitia KKG',
    category: 'Konsumsi'
  },
  {
    id: 'tx-3',
    date: '2026-07-10',
    description: 'Kas Anggota Tambahan (10 Sekolah)',
    type: 'masuk',
    amount: 500000,
    schoolOrTeacher: 'Grup B KKG',
    category: 'Kas Anggota'
  },
  {
    id: 'tx-4',
    date: '2026-07-15',
    description: 'Pembelian ATK & Print Banner KKG6UP!',
    type: 'keluar',
    amount: 200000,
    schoolOrTeacher: 'Sekretaris KKG',
    category: 'ATK'
  },
  {
    id: 'tx-5',
    date: '2026-07-20',
    description: 'Pemasukan Kas Susulan Juli (10 Sekolah)',
    type: 'masuk',
    amount: 500000,
    schoolOrTeacher: 'Grup C KKG',
    category: 'Kas Anggota'
  },
  {
    id: 'tx-6',
    date: '2026-07-25',
    description: 'Sewa Proyektor & Zoom Meeting Premium',
    type: 'keluar',
    amount: 150000,
    schoolOrTeacher: 'Sie Perlengkapan',
    category: 'Kegiatan'
  },
  {
    id: 'tx-7',
    date: '2026-07-26',
    description: 'Kas Anggota Awal Agustus (15 Sekolah)',
    type: 'masuk',
    amount: 1450000,
    schoolOrTeacher: 'Anggota KKG Pagu',
    category: 'Kas Anggota'
  }
];

export const initialTeachers: TeacherItem[] = [];

export const initialAnnouncements: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: '📢 KKG Rutin Bulan Agustus 2026',
    date: '2026-07-26',
    author: 'Pengurus KKG Pagu',
    content: 'Halo Bapak/Ibu Guru Kelas 6 se-Kecamatan Pagu! 👋\n\nKKG selanjutnya akan dilaksanakan pada:\n📆 Rabu, 12 Agustus 2026\n⏰ 09.00 WIB\n📍 SDN Pagu 1\n\nAgenda utama: Pembahasan persiapan administrasi Kurikulum Merdeka Semester Ganjil & sharing media pembelajaran. Jangan lupa membawa laptop masing-masing! 💻✨',
    tags: ['#KKG6UP', '#GuruKelas6', '#Pagu', '#SemangatBelajar'],
    isPinned: true
  },
  {
    id: 'ann-2',
    title: '📂 Update Google Drive SIXDRIVE KKG',
    date: '2026-07-24',
    author: 'Tim Modul KKG',
    content: 'Bapak/Ibu Guru, folder Modul Ajar dan ATP Semester 1 sudah diperbarui dengan perangkat ajar versi revisi 2026. Silakan cek menu SIXDRIVE untuk langsung mengunduh file pendukung!',
    tags: ['#SIXDRIVE', '#PerangkatAjar', '#KurikulumMerdeka'],
    isPinned: false
  }
];

export const initialOnlineMeeting: OnlineMeeting = {
  id: 'meet-1',
  title: '🔴 Rapat Online KKG - Orientasi Semester Ganjil',
  scheduledTime: 'Rabu, 12 Agustus 2026 • 09.00 WIB',
  meetUrl: 'https://meet.google.com/kkg-pagu-kelas6',
  status: 'Mendatang',
  agendaNote: '1. Pembukaan oleh Ketua KKG\n2. Paparan Administrasi\n3. Tanya Jawab & Diskusi Interaktif'
};

export const initialSchoolAccounts: SchoolAccount[] = [];

export const initialLoginHistory = [];
