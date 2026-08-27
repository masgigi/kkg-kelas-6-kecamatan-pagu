export type CategoryDrive = 
  | 'Modul Ajar'
  | 'ATP & TP'
  | 'Asesmen'
  | 'Soal & Kisi-Kisi'
  | 'Administrasi Kelas'
  | 'Media Pembelajaran';

export interface DriveFolder {
  id: string;
  title: CategoryDrive;
  fileCount: number;
  url: string;
  color: string; // Tailwind bg color or hex
  description: string;
  iconName: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09.00 - 12.00 WIB"
  location: string;
  agenda: string[];
  status: 'Akan Datang' | 'Persiapan' | 'Terjadwal' | 'Selesai';
  invitationUrl?: string;
  mapsUrl?: string;
  googleMeetUrl?: string;
}

export interface TransactionItem {
  id: string;
  date: string;
  description: string;
  type: 'masuk' | 'keluar';
  amount: number;
  schoolOrTeacher?: string;
  category: 'Kas Anggota' | 'Konsumsi' | 'ATK' | 'Cetak & Foto' | 'Kegiatan' | 'Lain-lain';
}

export interface TeacherItem {
  id: string;
  name: string;
  school: string;
  nip?: string;
  role: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  isLoggedInDefaultPass?: string; // default school password
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  tags: string[];
  isPinned?: boolean;
  imageUrl?: string;
}

export interface OnlineMeeting {
  id: string;
  title: string;
  scheduledTime: string;
  meetUrl: string;
  status: 'Live Sekarang' | 'Mendatang' | 'Selesai';
  agendaNote: string;
  passcode?: string;
}

export interface SchoolAccount {
  schoolName: string;
  password: string; // Password input = nama sekolah / code
  teacherName: string;
  hasPaidKasCurrentMonth: boolean;
  lastAttendance: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  role: 'guest' | 'teacher' | 'admin';
  schoolName?: string;
  teacherName?: string;
}

export interface AttendanceItem {
  id: string;
  scheduleId: string;
  teacherId: string;
  teacherName: string;
  school: string;
  status: 'Hadir' | 'Izin';
  checkedInAt: string;
  note?: string;
}

export interface LoginHistoryItem {
  id: string;
  role: 'teacher' | 'admin';
  schoolName: string;
  teacherName: string;
  timestamp: string;
  status: 'Berhasil Login' | 'Keluar';
}
