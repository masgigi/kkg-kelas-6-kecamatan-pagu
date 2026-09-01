import React, { useState, useEffect } from 'react';
import AttendanceForm from './components/AttendanceForm';
import { AttendanceAdmin } from './components/AttendanceAdmin';
import {
  DriveFolder,
  ScheduleItem,
  TransactionItem,
  TeacherItem,
  AnnouncementItem,
  OnlineMeeting,
  SchoolAccount,
  UserSession,
  AttendanceItem,
  LoginHistoryItem
} from './types';
import { storage } from './utils/storage';
import { calculateCashSummary } from './utils/export';
import { whenSupabaseReady } from './utils/supabaseSync';
import { supabase, supabaseAdminEmail } from './lib/supabase';

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
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const isPublicAttendance = new URLSearchParams(window.location.search).get('absen') === '1';

  // Remote sync runs in the background; cached/default data renders immediately.
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 1500);
    whenSupabaseReady().then(() => {
      window.clearTimeout(timeout);
      setIsLoading(false);
    });
    return () => window.clearTimeout(timeout);
  }, []);

  // Core Persistent State
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>(storage.getDriveFolders());
  const [schedules, setSchedules] = useState<ScheduleItem[]>(storage.getSchedules());
  const [transactions, setTransactions] = useState<TransactionItem[]>(storage.getTransactions());
  const [teachers, setTeachers] = useState<TeacherItem[]>(storage.getTeachers());
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(storage.getAnnouncements());
  const [onlineMeeting, setOnlineMeeting] = useState<OnlineMeeting>(storage.getOnlineMeeting());
  const [schoolAccounts, setSchoolAccounts] = useState<SchoolAccount[]>(storage.getSchoolAccounts());
  const [userSession, setUserSession] = useState<UserSession>(storage.getUserSession());
  const [notifEnabled, setNotifEnabled] = useState<boolean>(storage.getNotifEnabled());
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>(storage.getLoginHistory());
  const [attendance, setAttendance] = useState<AttendanceItem[]>(storage.getAttendance());

  // Admin access is valid only while an authorized Supabase Auth session exists.
  useEffect(() => {
    const applyAuthSession = (session: any) => {
      const email = session?.user?.email?.toLowerCase();
      const cachedSession = storage.getUserSession();
      if (email && email === supabaseAdminEmail) {
        const adminSession: UserSession = { isLoggedIn: true, role: 'admin' };
        setUserSession(adminSession);
        storage.setUserSession(adminSession);
      } else if (cachedSession.role === 'admin') {
        const guestSession: UserSession = { isLoggedIn: false, role: 'guest' };
        setUserSession(guestSession);
        storage.setUserSession(guestSession);
      }
    };

    void supabase.auth.getSession().then(({ data }) => applyAuthSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applyAuthSession(session);
    });
    return () => listener.subscription.unsubscribe();
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
    const unsubscribe = storage.subscribeToChanges((key) => {
      setDriveFolders(storage.getDriveFolders());
      setSchedules(storage.getSchedules());
      setTransactions(storage.getTransactions());
      setTeachers(storage.getTeachers());
      setAnnouncements(storage.getAnnouncements());
      setOnlineMeeting(storage.getOnlineMeeting());
      setSchoolAccounts(storage.getSchoolAccounts());
      setUserSession(storage.getUserSession());
      setLoginHistory(storage.getLoginHistory());
      setAttendance(storage.getAttendance());
    });
    return unsubscribe;
  }, []);

  const handleSubmitAttendance = (record: Omit<AttendanceItem, 'id'>) => {
    const newRecord: AttendanceItem = { ...record, id: `att-${Date.now()}` };
    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    storage.setAttendance(updated);
  };

  const handleDeleteAttendance = (id: string) => {
    const updated = attendance.filter((item) => item.id !== id);
    setAttendance(updated);
    storage.setAttendance(updated);
  };

  const { saldo } = calculateCashSummary(transactions);
  const isAdmin = userSession.role === 'admin';

  const handleRecordLoginHistory = (entry: { role: 'teacher' | 'admin'; schoolName: string; teacherName: string }) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newLog: LoginHistoryItem = {
      id: 'log-' + Date.now(),
      role: entry.role,
      schoolName: entry.schoolName,
      teacherName: entry.teacherName,
      timestamp: `${formattedDate}, ${formattedTime} WIB`,
      status: 'Berhasil Login'
    };

    const updated = [newLog, ...loginHistory];
    setLoginHistory(updated);
    storage.setLoginHistory(updated);
  };

  const handleClearLoginHistory = () => {
    setLoginHistory([]);
    storage.setLoginHistory([]);
  };

  const handleUploadDriveSuccess = (fileInfo: {
    title: string;
    category: string;
    uploader: string;
  }) => {
    // Increment file count in selected drive folder
    const updatedFolders = driveFolders.map((f) => {
      if (f.title === fileInfo.category) {
        return { ...f, fileCount: f.fileCount + 1 };
      }
      return f;
    });
    setDriveFolders(updatedFolders);
    storage.setDriveFolders(updatedFolders);

    // Broadcast announcement notification
    const newNotif: AnnouncementItem = {
      id: 'ann-' + Date.now(),
      title: `📁 Berkas Baru: ${fileInfo.title}`,
      date: 'Hari ini',
      author: fileInfo.uploader,
      content: `File "${fileInfo.title}" telah berhasil diunggah oleh ${fileInfo.uploader} ke folder ${fileInfo.category} SIXDRIVE KKG.`,
      tags: ['Drive', fileInfo.category],
      isPinned: true
    };
    const updatedAnn = [newNotif, ...announcements];
    setAnnouncements(updatedAnn);
    storage.setAnnouncements(updatedAnn);
  };

  // Explicit mutation handlers that push updates to Firestore and local cache
  const handleAddTransaction = (newTx: Omit<TransactionItem, 'id'>) => {
    const tx: TransactionItem = {
      ...newTx,
      id: 'tx-' + Date.now()
    };
    const updated = [tx, ...transactions];
    setTransactions(updated);
    storage.setTransactions(updated);
  };

  const handleEditTransaction = (txData: TransactionItem) => {
    const updated = transactions.map((t) => (t.id === txData.id ? txData : t));
    setTransactions(updated);
    storage.setTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Hapus pencatatan transaksi ini?')) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      storage.setTransactions(updated);
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

  const handleSaveSchedule = (scheduleData: Omit<ScheduleItem, 'id'> | ScheduleItem) => {
    let updated: ScheduleItem[];
    if ('id' in scheduleData && scheduleData.id) {
      const exists = schedules.some((s) => s.id === scheduleData.id);
      if (exists) {
        updated = schedules.map((s) => (s.id === scheduleData.id ? (scheduleData as ScheduleItem) : s));
      } else {
        updated = [scheduleData as ScheduleItem, ...schedules];
      }
    } else {
      const newSchedule: ScheduleItem = {
        ...(scheduleData as Omit<ScheduleItem, 'id'>),
        id: 'sch-' + Date.now()
      };
      updated = [newSchedule, ...schedules];
    }
    setSchedules(updated);
    storage.setSchedules(updated);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Hapus jadwal pertemuan ini?')) {
      const updated = schedules.filter((s) => s.id !== id);
      setSchedules(updated);
      storage.setSchedules(updated);
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

  const handleSaveTeacher = (teacherData: Omit<TeacherItem, 'id'> | TeacherItem) => {
    let updated: TeacherItem[];
    if ('id' in teacherData && teacherData.id) {
      const exists = teachers.some((t) => t.id === teacherData.id);
      if (exists) {
        updated = teachers.map((t) => (t.id === teacherData.id ? (teacherData as TeacherItem) : t));
      } else {
        updated = [...teachers, teacherData as TeacherItem];
      }
    } else {
      const newTeacher: TeacherItem = {
        ...(teacherData as Omit<TeacherItem, 'id'>),
        id: 't-' + Date.now()
      };
      updated = [...teachers, newTeacher];
    }
    setTeachers(updated);
    storage.setTeachers(updated);
  };

  const handleDeleteTeacher = (id: string) => {
    if (confirm('Hapus data guru ini dari database?')) {
      const updated = teachers.filter((t) => t.id !== id);
      setTeachers(updated);
      storage.setTeachers(updated);
    }
  };

  const handleAddAnnouncement = (ann: Omit<AnnouncementItem, 'id'>) => {
    const newAnn: AnnouncementItem = {
      ...ann,
      id: 'ann-' + Date.now()
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    storage.setAnnouncements(updated);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Hapus pengumuman ini?')) {
      const updated = announcements.filter((a) => a.id !== id);
      setAnnouncements(updated);
      storage.setAnnouncements(updated);
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

  const handleSaveDriveFolder = (folderData: DriveFolder) => {
    const exists = driveFolders.some((f) => f.id === folderData.id);
    let updated: DriveFolder[];
    if (exists) {
      updated = driveFolders.map((f) => (f.id === folderData.id ? folderData : f));
    } else {
      updated = [...driveFolders, folderData];
    }
    setDriveFolders(updated);
    storage.setDriveFolders(updated);
  };

  const handleDeleteDriveFolder = (id: string) => {
    const updated = driveFolders.filter((f) => f.id !== id);
    setDriveFolders(updated);
    storage.setDriveFolders(updated);
  };

  const handleUpdateMeeting = (data: OnlineMeeting) => {
    setOnlineMeeting(data);
    storage.setOnlineMeeting(data);
  };

  const handleSetUserSession = (session: UserSession) => {
    setUserSession(session);
    storage.setUserSession(session);
  };

  const handleSetNotifEnabled = (enabled: boolean) => {
    setNotifEnabled(enabled);
    storage.setNotifEnabled(enabled);
  };

  const nextSchedule = schedules.find((s) => s.status === 'Akan Datang' || s.status === 'Persiapan') || schedules[0];

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
        unreadCount={schedules.length}
      />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'home' && (
          <Dashboard
            schedules={schedules}
            driveFolders={driveFolders}
            announcements={announcements}
            cashBalance={saldo}
            totalTeachersCount={teachers.length}
            setActiveTab={setActiveTab}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
          />
        )}

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
          <DriveView
            driveFolders={driveFolders}
            isAdmin={isAdmin}
            onAddDriveFolder={handleOpenAddDriveFolder}
            onEditDriveFolder={handleOpenEditDriveFolder}
            onDeleteDriveFolder={handleDeleteDriveFolder}
            onUploadSuccess={handleUploadDriveSuccess}
          />
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
            onAddAnnouncement={handleAddAnnouncement}
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
        schoolAccounts={schoolAccounts}
        userSession={userSession}
        setUserSession={handleSetUserSession}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
        onRecordLoginHistory={handleRecordLoginHistory}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        userSession={userSession}
        setUserSession={handleSetUserSession}
        onOpenLoginHistory={() => setIsLoginHistoryOpen(true)}
        onRecordLoginHistory={handleRecordLoginHistory}
      />

      <LoginHistoryModal
        isOpen={isLoginHistoryOpen}
        onClose={() => setIsLoginHistoryOpen(false)}
        loginHistory={loginHistory}
        onClearHistory={handleClearLoginHistory}
        isAdmin={isAdmin}
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
      <footer className="border-t-4 border-black bg-white py-8 px-4 text-center text-xs font-black text-gray-700 pb-20 md:pb-8">
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
