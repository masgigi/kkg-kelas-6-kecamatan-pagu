import React, { useState, useEffect, useRef } from 'react';
import AttendanceForm from './components/AttendanceForm';
import { AttendanceAdmin } from './components/AttendanceAdmin';
import {
  DriveFolder,
  ScheduleItem,
  TransactionItem,
  TeacherItem,
  AnnouncementItem,
  OnlineMeeting,
  UserSession,
  AttendanceItem,
  LoginHistoryItem
} from './types';
import { storage } from './utils/storage';
import { calculateCashSummary } from './utils/export';
import {
  loadPublicAttendanceData,
  subscribeToPublicAttendanceChanges,
  whenSupabaseReady
} from './utils/supabaseSync';
import { supabase } from './lib/supabase';
import { usePortalContent, saveContent } from './features/portal/api';
import { PortalHub } from './features/portal/PortalHub';
import { blankContent, todayJakarta, upcomingSchedule } from './features/portal/model';

import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { NotificationBanner } from './components/NotificationBanner';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { DriveView } from './components/DriveView';
import { CashView } from './components/CashView';
import { CrewView } from './components/CrewView';
import { UpdateView } from './components/UpdateView';
import { MeetingView } from './components/MeetingView';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { AdminModal } from './components/AdminModal';
import { HelpModal } from './components/HelpModal';
import { ScheduleModal } from './components/ScheduleModal';
import { TeacherModal } from './components/TeacherModal';
import { DriveModal } from './components/DriveModal';
import { LoginHistoryModal } from './components/LoginHistoryModal';

export default function App() {
  const validTabs = ['home', 'profile', 'program', 'stories', 'services', 'schedule', 'drive', 'cash', 'crew', 'meeting', 'update', 'attendance'];
  const [activeTab, setActiveTabState] = useState(() => validTabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');
  const [resourceMode, setResourceMode] = useState<'catalog' | 'folders'>('catalog');
  const setActiveTab = (tab: string) => {
    if (!validTabs.includes(tab)) return;
    setActiveTabState(tab);
    window.history.pushState(null, '', `#${tab}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  useEffect(() => {
    const restoreTab = () => setActiveTabState(validTabs.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');
    window.addEventListener('popstate', restoreTab);
    return () => window.removeEventListener('popstate', restoreTab);
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const isPublicAttendance =
    normalizedPath === '/absensi' ||
    new URLSearchParams(window.location.search).get('absen') === '1';

  // Remote sync runs in the background; cached/default data renders immediately.
  useEffect(() => {
    if (isPublicAttendance) return;
    const timeout = window.setTimeout(() => setIsLoading(false), 1500);
    whenSupabaseReady().then(() => {
      window.clearTimeout(timeout);
      setIsLoading(false);
    });
    return () => window.clearTimeout(timeout);
  }, [isPublicAttendance]);

  // Core Persistent State
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(storage.getDriveFolders());
  const [schedules, setSchedules] = useState<ScheduleItem[]>(storage.getSchedules());
  const [transactions, setTransactions] = useState<TransactionItem[]>(storage.getTransactions());
  const [teachers, setTeachers] = useState<TeacherItem[]>(storage.getTeachers());
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(storage.getAnnouncements());
  const [onlineMeeting, setOnlineMeeting] = useState<OnlineMeeting>(storage.getOnlineMeeting());
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const cached = storage.getUserSession();
    return cached.role === 'admin' ? { isLoggedIn: false, role: 'guest' } : cached;
  });
  const [notifEnabled, setNotifEnabled] = useState<boolean>(storage.getNotifEnabled());
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  const [loginHistoryError, setLoginHistoryError] = useState('');
  const loginHistoryRequestId = useRef(0);
  useEffect(() => { storage.clearLegacyLoginHistoryCache(); }, []);
  const [attendance, setAttendance] = useState<AttendanceItem[]>(storage.getAttendance());
  const [attendanceLoadError, setAttendanceLoadError] = useState('');
  const [attendanceReloadToken, setAttendanceReloadToken] = useState(0);
  const [adminWriteError, setAdminWriteError] = useState('');

  // The public attendance page reads its required data directly from Supabase.
  // It never falls back to bundled sample data, so it stays consistent with the portal.
  useEffect(() => {
    if (!isPublicAttendance) return;

    let isCancelled = false;
    let requestVersion = 0;

    const refreshAttendanceData = async (showSpinner: boolean) => {
      const currentVersion = ++requestVersion;
      if (showSpinner) setIsLoading(true);
      try {
        const remoteData = await loadPublicAttendanceData();
        if (isCancelled || currentVersion !== requestVersion) return;
        setSchedules(remoteData.schedules);
        setTeachers(remoteData.teachers);
        setAttendance(remoteData.attendance);
        setAttendanceLoadError('');
      } catch (error) {
        if (isCancelled || currentVersion !== requestVersion) return;
        console.error('Gagal memuat data absensi dari Supabase:', error);
        setAttendanceLoadError('Data jadwal dan guru belum berhasil dimuat dari server.');
      } finally {
        if (!isCancelled && currentVersion === requestVersion) setIsLoading(false);
      }
    };

    void refreshAttendanceData(true);
    const unsubscribe = subscribeToPublicAttendanceChanges(() => {
      void refreshAttendanceData(false);
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [attendanceReloadToken, isPublicAttendance]);

  // Admin access is verified against the server's current membership for each Auth session.
  useEffect(() => {
    let active = true;
    let checkVersion = 0;
    const applyAuthSession = async (session: { user?: { id?: string } } | null) => {
      const version = ++checkVersion;
      let authorized = false;
      if (session?.user?.id) {
        const { data, error } = await supabase.rpc('is_kkg_admin');
        authorized = !error && data === true;
      }
      if (!active || version !== checkVersion) return;
      const next: UserSession = authorized
        ? { isLoggedIn: true, role: 'admin' }
        : { isLoggedIn: false, role: 'guest' };
      setUserSession(next);
      storage.setUserSession(next);
    };

    void supabase.auth.getSession().then(({ data }) => void applyAuthSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase recommends deferring client API calls made after an auth event.
      window.setTimeout(() => { void applyAuthSession(session); }, 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  // Modals state
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLoginHistoryOpen, setIsLoginHistoryOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [editingDriveFolder, setEditingDriveFolder] = useState<DriveFolder | null>(null);

  // Subscribe to multi-tab & Supabase real-time synchronization
  useEffect(() => {
    if (isPublicAttendance) return () => undefined;
    const unsubscribe = storage.subscribeToChanges((key) => {
      setDriveFolders(storage.getDriveFolders());
      setSchedules(storage.getSchedules());
      setTransactions(storage.getTransactions());
      setTeachers(storage.getTeachers());
      setAnnouncements(storage.getAnnouncements());
      setOnlineMeeting(storage.getOnlineMeeting());
      setAttendance(storage.getAttendance());
    });
    return unsubscribe;
  }, [isPublicAttendance]);

  const handleSubmitAttendance = async (record: Omit<AttendanceItem, 'id'>) => {
    const newRecord: AttendanceItem = { ...record, id: `att-${crypto.randomUUID()}` };
    const { error } = await supabase.from('attendance').insert({
      id: newRecord.id,
      schedule_id: newRecord.scheduleId,
      teacher_id: newRecord.teacherId,
      teacher_name: newRecord.teacherName,
      school: newRecord.school,
      status: newRecord.status,
      checked_in_at: newRecord.checkedInAt,
      note: newRecord.note
    });
    if (error) throw new Error(`Absensi belum tersimpan: ${error.message}`);
    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    storage.cacheAttendance(updated);
  };

  const handleDeleteAttendance = async (id: string) => {
    const { data, error } = await supabase.from('attendance').delete().eq('id', id).select('id').maybeSingle();
    if (error || !data) {
      setAdminWriteError(`Absensi belum dihapus: ${error?.message || 'Data tidak ditemukan di server.'}`);
      return;
    }
    const updated = attendance.filter((item) => item.id !== id);
    setAttendance(updated);
    storage.cacheAttendance(updated);
    setAdminWriteError('');
  };

  const { saldo } = calculateCashSummary(transactions);
  const isAdmin = userSession.isLoggedIn && userSession.role === 'admin';
  const portal = usePortalContent(isAdmin);
  const visibleAnnouncements = announcements.filter(a => !a.expiresOn || a.expiresOn >= todayJakarta());
  const portalProps = { ...portal, isAdmin, teachers, navigate: setActiveTab };

  const refreshLoginHistory = async () => {
    const requestId = ++loginHistoryRequestId.current;
    setLoginHistoryLoading(true);
    setLoginHistoryError('');
    try {
      const { data, error } = await supabase.from('login_history')
        .select('id,role,school_name,teacher_name,timestamp,status')
        .order('created_at', { ascending: false });
      if (requestId !== loginHistoryRequestId.current) return;
      if (error) throw error;
      setLoginHistory((data || []).map((row): LoginHistoryItem => ({
        id: row.id,
        role: row.role === 'admin' ? 'admin' : 'teacher',
        schoolName: row.school_name,
        teacherName: row.teacher_name,
        timestamp: row.timestamp || '',
        status: row.status || 'Berhasil Login'
      })));
    } catch (error) {
      if (requestId !== loginHistoryRequestId.current) return;
      setLoginHistory([]);
      setLoginHistoryError(`Riwayat login belum berhasil dimuat: ${(error as Error).message}`);
    } finally {
      if (requestId === loginHistoryRequestId.current) setLoginHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      loginHistoryRequestId.current += 1;
      setLoginHistory([]);
      setLoginHistoryError('');
      setLoginHistoryLoading(false);
      setIsLoginHistoryOpen(false);
      return;
    }
    void refreshLoginHistory();
    return () => { loginHistoryRequestId.current += 1; };
  }, [isAdmin, isLoginHistoryOpen]);

  const handleRecordLoginHistory = async (entry: { role: 'teacher' | 'admin'; schoolName: string; teacherName: string }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' });

    const newLog: LoginHistoryItem = {
      id: `log-${crypto.randomUUID()}`,
      role: entry.role,
      schoolName: entry.schoolName,
      teacherName: entry.teacherName,
      timestamp: `${formattedDate}, ${formattedTime} WIB`,
      status: 'Berhasil Login'
    };

    const { error } = await supabase.from('login_history').insert({
      id: newLog.id,
      role: newLog.role,
      school_name: newLog.schoolName,
      teacher_name: newLog.teacherName,
      timestamp: newLog.timestamp,
      status: newLog.status
    });
    if (error) throw new Error(`Riwayat login belum tersimpan: ${error.message}`);
    if (entry.role === 'admin') await refreshLoginHistory();
  };

  const handleUploadDriveSuccess = async (fileInfo: {
    title: string;
    category: string;
    uploader: string;
    fileUrl?: string;
  }) => {
    await saveContent({ ...blankContent('resource'), title: fileInfo.title, author_name: fileInfo.uploader,
      link_url: fileInfo.fileUrl || '', details: { category: fileInfo.category }, status: 'published' });
    await portal.refresh();
    setResourceMode('catalog');
  };

  // Save each admin change in Supabase before updating the local cache.
  const handleAddTransaction = async (newTx: Omit<TransactionItem, 'id'>) => {
    const tx: TransactionItem = {
      ...newTx,
      id: `tx-${crypto.randomUUID()}`
    };
    const { error } = await supabase.from('transactions').insert({ id: tx.id, date: tx.date, description: tx.description, type: tx.type, amount: tx.amount, school_or_teacher: tx.schoolOrTeacher, category: tx.category });
    if (error) throw new Error(`Transaksi belum tersimpan: ${error.message}`);
    const updated = [tx, ...transactions];
    setTransactions(updated);
    storage.cacheTransactions(updated);
    setAdminWriteError('');
  };

  const handleEditTransaction = async (txData: TransactionItem) => {
    const { data, error } = await supabase.from('transactions').update({ date: txData.date, description: txData.description, type: txData.type, amount: txData.amount, school_or_teacher: txData.schoolOrTeacher, category: txData.category }).eq('id', txData.id).select('id').maybeSingle();
    if (error || !data) throw new Error(`Transaksi belum tersimpan: ${error?.message || 'Data tidak ditemukan di server.'}`);
    const updated = transactions.map((t) => (t.id === txData.id ? txData : t));
    setTransactions(updated);
    storage.cacheTransactions(updated);
    setAdminWriteError('');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Hapus pencatatan transaksi ini?')) {
      const { data, error } = await supabase.from('transactions').delete().eq('id', id).select('id').maybeSingle();
      if (error || !data) throw new Error(`Transaksi belum dihapus: ${error?.message || 'Data tidak ditemukan di server.'}`);
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      storage.cacheTransactions(updated);
      setAdminWriteError('');
    }
  };

  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (scheduleData: Omit<ScheduleItem, 'id'> | ScheduleItem) => {
    const existingSchedule = 'id' in scheduleData ? schedules.find(s => s.id === scheduleData.id) : undefined;
    const schedule: ScheduleItem = 'id' in scheduleData && scheduleData.id
      ? { ...existingSchedule, ...scheduleData } as ScheduleItem
      : { ...scheduleData, id: `sch-${crypto.randomUUID()}` } as ScheduleItem;
    const row = { id: schedule.id, title: schedule.title, date: schedule.date, time: schedule.time,
      location: schedule.location, agenda: schedule.agenda, status: schedule.status,
      invitation_url: schedule.invitationUrl || null, maps_url: schedule.mapsUrl || null,
      google_meet_url: schedule.googleMeetUrl || null };
    const { error } = await supabase.from('schedules').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`Jadwal belum tersimpan: ${error.message}`);
    const updated = schedules.some(s => s.id === schedule.id)
      ? schedules.map(s => s.id === schedule.id ? schedule : s) : [schedule, ...schedules];
    setSchedules(updated);
    storage.cacheSchedules(updated);
    setAdminWriteError('');
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Hapus jadwal pertemuan ini?')) {
      const { data, error } = await supabase.from('schedules').delete().eq('id', id).select('id').maybeSingle();
      if (error || !data) { setAdminWriteError(`Jadwal belum dihapus: ${error?.message || 'Data tidak ditemukan di server.'}`); return; }
      const updated = schedules.filter((s) => s.id !== id);
      setSchedules(updated);
      storage.cacheSchedules(updated);
      setAdminWriteError('');
    }
  };

  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t: TeacherItem) => {
    setEditingTeacher(t);
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = async (teacherData: Omit<TeacherItem, 'id'> | TeacherItem) => {
    const teacher: TeacherItem = 'id' in teacherData && teacherData.id
      ? teacherData as TeacherItem
      : { ...teacherData, id: `t-${crypto.randomUUID()}` } as TeacherItem;
    const { error } = await supabase.from('teachers').upsert({ id: teacher.id, name: teacher.name, school: teacher.school,
      role: teacher.role }, { onConflict: 'id' });
    if (error) throw new Error(`Data guru belum tersimpan: ${error.message}`);
    const updated = teachers.some(t => t.id === teacher.id)
      ? teachers.map(t => t.id === teacher.id ? teacher : t) : [...teachers, teacher];
    setTeachers(updated);
    storage.cacheTeachers(updated);
    setAdminWriteError('');
  };

  const handleDeleteTeacher = async (id: string) => {
    if (confirm('Hapus data guru ini dari database?')) {
      const { data, error } = await supabase.from('teachers').delete().eq('id', id).select('id').maybeSingle();
      if (error || !data) { setAdminWriteError(`Data guru belum dihapus: ${error?.message || 'Data tidak ditemukan di server.'}`); return; }
      const updated = teachers.filter((t) => t.id !== id);
      setTeachers(updated);
      storage.cacheTeachers(updated);
      setAdminWriteError('');
    }
  };

  const handleSaveAnnouncement = async (ann: AnnouncementItem) => {
    const { data, error } = await supabase.from('announcements').upsert({ id: ann.id, title: ann.title,
      date: ann.date, author: ann.author, content: ann.content, tags: ann.tags, is_pinned: ann.isPinned,
      image_url: ann.imageUrl || null, expires_on: ann.expiresOn || null, attachment_url: ann.attachmentUrl || null }).select('id').maybeSingle();
    if (error || !data) throw new Error(`Pengumuman belum tersimpan: ${error?.message || 'Data tidak ditemukan di server.'}`);
    setAnnouncements(current => [ann, ...current.filter(a => a.id !== ann.id)]);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (confirm('Hapus pengumuman ini?')) {
      const { data, error } = await supabase.from('announcements').delete().eq('id', id).select('id').maybeSingle();
      if (error || !data) throw new Error(`Pengumuman belum dihapus: ${error?.message || 'Data tidak ditemukan di server.'}`);
      setAnnouncements(current => current.filter(a => a.id !== id));
    }
  };

  const handleOpenAddDriveFolder = () => {
    setEditingDriveFolder(null);
    setIsDriveModalOpen(true);
  };

  const handleOpenEditDriveFolder = (folder: DriveFolder) => {
    setEditingDriveFolder(folder);
    setIsDriveModalOpen(true);
  };

  const handleSaveDriveFolder = async (folderData: DriveFolder) => {
    const { error } = await supabase.from('drive_folders').upsert({ id: folderData.id, title: folderData.title,
      file_count: folderData.fileCount, url: folderData.url, color: folderData.color,
      description: folderData.description, icon_name: folderData.iconName }, { onConflict: 'id' });
    if (error) throw new Error(`Folder belum tersimpan: ${error.message}`);
    const exists = driveFolders.some((f) => f.id === folderData.id);
    let updated: DriveFolder[];
    if (exists) {
      updated = driveFolders.map((f) => (f.id === folderData.id ? folderData : f));
    } else {
      updated = [...driveFolders, folderData];
    }
    setDriveFolders(updated);
    storage.cacheDriveFolders(updated);
    setAdminWriteError('');
  };

  const handleDeleteDriveFolder = async (id: string) => {
    const { data, error } = await supabase.from('drive_folders').delete().eq('id', id).select('id').maybeSingle();
    if (error || !data) { setAdminWriteError(`Folder belum dihapus: ${error?.message || 'Data tidak ditemukan di server.'}`); return; }
    const updated = driveFolders.filter((f) => f.id !== id);
    setDriveFolders(updated);
    storage.cacheDriveFolders(updated);
    setAdminWriteError('');
  };

  const handleUpdateMeeting = async (data: OnlineMeeting) => {
    const { data: saved, error } = await supabase.from('online_meetings').update({
      title: data.title, scheduled_time: data.scheduledTime, meet_url: data.meetUrl,
      agenda_note: data.agendaNote, status: data.status
    }).eq('id', data.id).select('id').maybeSingle();
    if (error || !saved) throw new Error(error?.message || 'Rapat belum ditemukan di server.');
    setOnlineMeeting(data);
    storage.cacheOnlineMeeting(data);
  };

  const handleSetUserSession = (session: UserSession) => {
    setUserSession(session);
    storage.setUserSession(session);
  };

  const handleSetNotifEnabled = (enabled: boolean) => {
    setNotifEnabled(enabled);
    storage.setNotifEnabled(enabled);
  };

  const nextSchedule = upcomingSchedule(schedules);

  // Show loading spinner while Supabase syncs
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-black border-t-purple-600 rounded-full animate-spin mx-auto" />
          <div>
            <p className="font-black text-lg text-black">⚡ KKG SIXVIBE</p>
            <p className="text-sm font-bold text-gray-500">Menyinkronkan data dari server...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isPublicAttendance && attendanceLoadError) {
    return (
      <main className="min-h-screen bg-yellow-300 p-5 text-black flex items-center justify-center">
        <section className="w-full max-w-lg border-4 border-black bg-white p-6 text-center shadow-[8px_8px_0_#000] space-y-4">
          <p className="text-5xl" aria-hidden="true">⚠️</p>
          <h1 className="text-2xl font-black">Data Absensi Belum Terhubung</h1>
          <p className="font-bold">{attendanceLoadError}</p>
          <button
            type="button"
            onClick={() => setAttendanceReloadToken((value) => value + 1)}
            className="w-full border-2 border-black bg-purple-600 px-5 py-3 font-black text-white shadow-[4px_4px_0_#000]"
          >
            Coba Lagi
          </button>
          <a href="/" className="inline-block border-b-2 border-black font-black">Kembali ke Portal</a>
        </section>
      </main>
    );
  }

  // Public attendance route (no login needed)
  if (isPublicAttendance) {
    return (
      <AttendanceForm
        schedules={schedules}
        teachers={teachers}
        attendance={attendance}
        onSubmit={handleSubmitAttendance}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-900 font-sans selection:bg-yellow-300 selection:text-black">
      {/* Top Ticker Notification Banner */}
      <NotificationBanner
        nextSchedule={nextSchedule}
        setActiveTab={setActiveTab}
      />

      {/* Main Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
        unreadCount={schedules.filter(s => s.status !== 'Selesai' && s.date >= todayJakarta()).length}
      />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {adminWriteError && <div role="alert" className="portal-error mb-6 flex items-start justify-between gap-3"><span>{adminWriteError}</span><button type="button" className="font-black" aria-label="Tutup pesan kesalahan" onClick={() => setAdminWriteError('')}>×</button></div>}
        {activeTab === 'home' && (
          <Dashboard
            schedules={schedules}
            driveFolders={driveFolders}
            announcements={visibleAnnouncements}
            cashBalance={saldo}
            totalTeachersCount={teachers.length}
            setActiveTab={setActiveTab}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && <PortalHub view="profile" {...portalProps} />}
        {activeTab === 'program' && <PortalHub view="program" {...portalProps} />}
        {activeTab === 'stories' && <PortalHub view="stories" {...portalProps} />}
        {activeTab === 'services' && <PortalHub view="services" {...portalProps} />}

        {activeTab === 'attendance' && !isAdmin && <section className="bg-yellow-200 border-4 border-black rounded-3xl p-7 mb-10 space-y-4"><h1 className="text-2xl font-black">✅ Presensi Kegiatan KKG</h1><p className="font-semibold">Isi kehadiran melalui formulir presensi. Rekap dikelola oleh pengurus.</p><a href="/absensi" className="portal-button bg-purple-600 text-white">Buka formulir presensi →</a></section>}

        {activeTab === 'attendance' && isAdmin && (
          <AttendanceAdmin
            schedules={schedules}
            teachers={teachers}
            attendance={attendance}
            isAdmin={isAdmin}
            onDeleteAttendance={handleDeleteAttendance}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            schedules={schedules}
            isAdmin={isAdmin}
            onAddSchedule={handleOpenAddSchedule}
            onEditSchedule={handleOpenEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            notifEnabled={notifEnabled}
            setNotifEnabled={handleSetNotifEnabled}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'drive' && (
          <>
          <div className="flex flex-wrap gap-3 mb-6" aria-label="Sumber belajar">
            <button aria-pressed={resourceMode === 'catalog'} className={`portal-button ${resourceMode === 'catalog' ? 'bg-yellow-300' : 'bg-white'}`} onClick={() => setResourceMode('catalog')}>📚 Katalog Sumber Belajar</button>
            <button aria-pressed={resourceMode === 'folders'} className={`portal-button ${resourceMode === 'folders' ? 'bg-purple-300' : 'bg-white'}`} onClick={() => setResourceMode('folders')}>📁 Folder SIXDRIVE</button>
          </div>
          {resourceMode === 'catalog' ? <PortalHub view="resources" {...portalProps} /> :
          <DriveView
            driveFolders={driveFolders}
            isAdmin={isAdmin}
            onAddDriveFolder={handleOpenAddDriveFolder}
            onEditDriveFolder={handleOpenEditDriveFolder}
            onDeleteDriveFolder={handleDeleteDriveFolder}
            onUploadSuccess={handleUploadDriveSuccess}
          />
          }
          </>
        )}

        {activeTab === 'cash' && (
          <CashView
            transactions={transactions}
            isAdmin={isAdmin}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'crew' && (
          <CrewView
            teachers={teachers}
            isAdmin={isAdmin}
            onAddTeacher={handleOpenAddTeacher}
            onEditTeacher={handleOpenEditTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        )}

        {activeTab === 'meeting' && (
          <MeetingView
            meeting={onlineMeeting}
            isAdmin={isAdmin}
            onUpdateMeeting={handleUpdateMeeting}
            notifEnabled={notifEnabled}
          />
        )}

        {activeTab === 'update' && (
          <UpdateView
            announcements={announcements}
            isAdmin={isAdmin}
            onSaveAnnouncement={handleSaveAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}
      </main>

      {/* Mobile Bottom Bar Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        userSession={userSession}
        setUserSession={handleSetUserSession}
        onRecordLoginHistory={handleRecordLoginHistory}
      />

      <AdminModal
        onNavigate={setActiveTab}
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        userSession={userSession}
        setUserSession={handleSetUserSession}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
        onRecordLoginHistory={handleRecordLoginHistory}
      />

      <LoginHistoryModal
        isOpen={isLoginHistoryOpen && isAdmin}
        onClose={() => setIsLoginHistoryOpen(false)}
        loginHistory={loginHistory}
        isLoading={loginHistoryLoading}
        error={loginHistoryError}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        initialSchedule={editingSchedule}
      />

      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSave={handleSaveTeacher}
        initialTeacher={editingTeacher}
      />

      <DriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onSave={handleSaveDriveFolder}
        initialFolder={editingDriveFolder}
      />

      {/* Footer - pb-20 untuk mobile agar tidak tertutup BottomNav */}
      <footer className="border-t-4 border-black bg-white py-8 px-4 text-center text-xs font-black text-gray-700 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-sm font-black text-black">
            <span>⚡ KKG SIXVIBE • KKG6UP!</span>
          </p>
          <p className="text-gray-500">
            Portal Digital Kelompok Kerja Guru Kelas 6 • Kecamatan Pagu, Kabupaten Kediri
          </p>
          <p className="text-[10px] text-gray-400">
            Satu Guru, Satu Vibe, Satu Tujuan • Gen Z & Mobile Friendly Edition
          </p>
        </div>
      </footer>
    </div>
  );
}
