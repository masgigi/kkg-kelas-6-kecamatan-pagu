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

export const initialTeachers: TeacherItem[] = [
  {
    id: 't-1',
    name: 'HERMIN TRIYATI',
    school: 'SDN SEMEN',
    nip: '19760317 202321 2 003',
    role: 'Guru Kelas VI',
    phone: '081234567801',
    email: 'hermintriyati@gmail.com'
  },
  {
    id: 't-2',
    name: 'METTY PUSPITASARI',
    school: 'SDN BULUPASAR',
    nip: '19821222 201408 2 004',
    role: 'Guru Kelas VI',
    phone: '081234567802',
    email: 'mettypuspitasari@gmail.com'
  },
  {
    id: 't-3',
    name: "SYAFA'ATUL MUDA'IMAH",
    school: 'SDN SEMANDING',
    nip: '19830616 202321 2 017',
    role: 'Guru Kelas VI',
    phone: '081234567803',
    email: 'syafaatulmudaimah@gmail.com'
  },
  {
    id: 't-4',
    name: 'ENY WIDYA WATI',
    school: 'SDN WATES',
    nip: '19850930 202321 2 022',
    role: 'Guru Kelas VI',
    phone: '081234567804',
    email: 'enywidyawati@gmail.com'
  },
  {
    id: 't-5',
    name: 'ANANG SULISTYONO',
    school: 'SDN WONOSARI 1',
    nip: '19851118 202221 1 007',
    role: 'Guru Kelas VI',
    phone: '081234567805',
    email: 'anangsulistyono@gmail.com'
  },
  {
    id: 't-6',
    name: 'MARYAM JUNARI',
    school: 'SDN TANJUNG',
    nip: '19870127 202221 2 015',
    role: 'Guru Kelas VI',
    phone: '081234567806',
    email: 'maryamjunari@gmail.com'
  },
  {
    id: 't-7',
    name: 'PUTRI AGUSTINA',
    school: 'SDN KAMBINGAN',
    nip: '19890815 201903 2 008',
    role: 'Guru Kelas VI',
    phone: '081234567807',
    email: 'putriagustina@gmail.com'
  },
  {
    id: 't-8',
    name: 'WHENDY NILA ADELINA',
    school: 'SDN TANJUNG',
    nip: '19891112 202521 2 134',
    role: 'Guru Kelas VI',
    phone: '081234567808',
    email: 'whendynila@gmail.com'
  },
  {
    id: 't-9',
    name: 'IGIGIH BUDI PRADANA',
    school: 'SDN BULUPASAR',
    nip: '19910722 202221 1 005',
    role: 'Guru Kelas VI',
    phone: '081234567809',
    email: 'igigihbudi@gmail.com'
  },
  {
    id: 't-10',
    name: 'WAHYU SETYAWAN',
    school: 'SDN MENANG',
    nip: '19920525 202012 1 009',
    role: 'Guru Kelas VI',
    phone: '081234567810',
    email: 'wahyusetyawan@gmail.com'
  },
  {
    id: 't-11',
    name: 'ELFANDY RIZKI PRATAMA',
    school: 'SDN JAGUNG',
    nip: '19920616 202221 1 001',
    role: 'Guru Kelas VI',
    phone: '081234567811',
    email: 'elfandyrizki@gmail.com'
  },
  {
    id: 't-12',
    name: 'INDAH TRILESTARI',
    school: 'SDN TENGGERKIDUL 2',
    nip: '19920719 202221 2 002',
    role: 'Guru Kelas VI',
    phone: '081234567812',
    email: 'indahtrilestari@gmail.com'
  },
  {
    id: 't-13',
    name: 'WASIK KHOLIFATUN',
    school: 'SDN BENDO',
    nip: '19940518 202521 2 159',
    role: 'Guru Kelas VI',
    phone: '081234567813',
    email: 'wasikkholifatun@gmail.com'
  },
  {
    id: 't-14',
    name: "ELITA NUR A'INI",
    school: 'SDN TENGGERKIDUL 1',
    nip: '19941030 202421 2 008',
    role: 'Guru Kelas VI',
    phone: '081234567814',
    email: 'elitanuraini@gmail.com'
  },
  {
    id: 't-15',
    name: 'ENGGAR ADI PUSPITA',
    school: 'SDN SITIMERTO',
    nip: '19950615 202012 2 015',
    role: 'Guru Kelas VI',
    phone: '081234567815',
    email: 'enggaradipuspita@gmail.com'
  },
  {
    id: 't-16',
    name: 'DAIRABYI AINI ZAIN',
    school: 'SDN WONOSARI 2',
    nip: '19950719 202521 2 098',
    role: 'Guru Kelas VI',
    phone: '081234567816',
    email: 'dairabyiaini@gmail.com'
  },
  {
    id: 't-17',
    name: 'EVAANNA TENTY AGUSTIN',
    school: 'SDN PAGU 2',
    nip: '19960810 202221 2 003',
    role: 'Guru Kelas VI',
    phone: '081234567817',
    email: 'evaannatenty@gmail.com'
  },
  {
    id: 't-18',
    name: 'VRINTIT DIO SAPUTRO',
    school: 'SD EMAUS',
    nip: '-',
    role: 'Guru Kelas VI',
    phone: '081234567818',
    email: 'vrintitdiosaputro@gmail.com'
  },
  {
    id: 't-19',
    name: 'EVA NURCHABIB',
    school: 'SDNU PAGU',
    nip: '-',
    role: 'Guru Kelas VI',
    phone: '081234567819',
    email: 'evanurchabib@gmail.com'
  },
  {
    id: 't-20',
    name: 'EVA AGUSTIN',
    school: 'SDNU PAGU',
    nip: '-',
    role: 'Guru Kelas VI',
    phone: '081234567820',
    email: 'evaagustin@gmail.com'
  }
];

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
  agendaNote: '1. Pembukaan oleh Ketua KKG\n2. Paparan Administrasi\n3. Tanya Jawab & Diskusi Interaktif',
  passcode: 'pagu6up'
};

export const initialSchoolAccounts: SchoolAccount[] = [
  { schoolName: 'SDN Pagu 1', password: 'sdnpagu1', teacherName: 'Anisa Rahmawati, S.Pd.', hasPaidKasCurrentMonth: true, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Sitimerto 1', password: 'sdnsitimerto1', teacherName: 'Budi Santoso, S.Pd.', hasPaidKasCurrentMonth: true, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Semen 1', password: 'sdnsemen1', teacherName: 'Dewi Lestari, S.Pd.', hasPaidKasCurrentMonth: true, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Wates', password: 'sdnwates', teacherName: 'Eko Prasetyo, S.Pd.SD', hasPaidKasCurrentMonth: true, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Bendo 1', password: 'sdnbendo1', teacherName: 'Fitri Handayani, M.Pd.', hasPaidKasCurrentMonth: true, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Tanjung', password: 'sdntanjung', teacherName: 'Gunawan Wibowo, S.Pd.', hasPaidKasCurrentMonth: false, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Menang 1', password: 'sdnmenang1', teacherName: 'Heni Setyowati, S.Pd.', hasPaidKasCurrentMonth: true, lastAttendance: '12 Juli 2026' },
  { schoolName: 'SDN Kambingan', password: 'sdnkambingan', teacherName: 'Iwan Kurniawan, S.Pd.', hasPaidKasCurrentMonth: false, lastAttendance: '12 Juli 2026' },
];

export const initialLoginHistory = [
  {
    id: 'log-1',
    role: 'teacher' as const,
    schoolName: 'SDN Pagu 1',
    teacherName: 'Anisa Rahmawati, S.Pd.',
    timestamp: '30 Juli 2026, 08:15 WIB',
    status: 'Berhasil Login' as const
  },
  {
    id: 'log-2',
    role: 'admin' as const,
    schoolName: 'Korwil Pagu (Admin KKG)',
    teacherName: 'Pengurus Utama KKG Pagu',
    timestamp: '30 Juli 2026, 07:45 WIB',
    status: 'Berhasil Login' as const
  },
  {
    id: 'log-3',
    role: 'teacher' as const,
    schoolName: 'SDN Sitimerto 1',
    teacherName: 'Budi Santoso, S.Pd.',
    timestamp: '29 Juli 2026, 14:20 WIB',
    status: 'Berhasil Login' as const
  }
];
