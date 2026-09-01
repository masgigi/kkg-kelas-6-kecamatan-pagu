import {
  DriveFolder,
  ScheduleItem,
  TransactionItem,
  TeacherItem,
  AnnouncementItem,
  OnlineMeeting,
  SchoolAccount,
  UserSession,
  LoginHistoryItem,
  AttendanceItem
} from '../types';
import {
  initialDriveFolders,
  initialSchedules,
  initialTransactions,
  initialTeachers,
  initialAnnouncements,
  initialOnlineMeeting,
  initialSchoolAccounts,
  initialLoginHistory
} from '../data/initialData';

import { saveToSupabase, initSupabaseListeners, resetAndRebuildSupabaseData } from './supabaseSync';

const STORAGE_KEYS = {
  DRIVE_FOLDERS: 'kkg6up_drive_folders',
  SCHEDULES: 'kkg6up_schedules',
  TRANSACTIONS: 'kkg6up_transactions',
  TEACHERS: 'kkg6up_teachers',
  ANNOUNCEMENTS: 'kkg6up_announcements',
  ONLINE_MEETING: 'kkg6up_online_meeting',
  SCHOOL_ACCOUNTS: 'kkg6up_school_accounts',
  USER_SESSION: 'kkg6up_user_session',
  NOTIF_ENABLED: 'kkg6up_notif_enabled',
  LOGIN_HISTORY: 'kkg6up_login_history',
  ATTENDANCE: 'kkg6up_attendance'
};

// Helper for local storage with fallback
function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySync(key);

    // Also sync to Supabase
    if (key === STORAGE_KEYS.SCHEDULES) saveToSupabase('schedules', value);
    if (key === STORAGE_KEYS.TRANSACTIONS) saveToSupabase('transactions', value);
    if (key === STORAGE_KEYS.TEACHERS) saveToSupabase('teachers', value);
    if (key === STORAGE_KEYS.DRIVE_FOLDERS) saveToSupabase('drive_folders', value);
    if (key === STORAGE_KEYS.ANNOUNCEMENTS) saveToSupabase('announcements', value);
    if (key === STORAGE_KEYS.ONLINE_MEETING) saveToSupabase('online_meetings', value);
    if (key === STORAGE_KEYS.SCHOOL_ACCOUNTS) saveToSupabase('school_accounts', value);
    if (key === STORAGE_KEYS.LOGIN_HISTORY) saveToSupabase('login_history', value);
    if (key === STORAGE_KEYS.ATTENDANCE) saveToSupabase('attendance', value);
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

// Broadcast channel for lightweight real-time tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('kkg6up_sync_channel');
  } catch (e) {
    console.log('BroadcastChannel not supported');
  }
}

function notifySync(key: string) {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'DATA_UPDATED', key, timestamp: Date.now() });
  }
}

export const storage = {
  getDriveFolders: (): DriveFolder[] => getStoredData(STORAGE_KEYS.DRIVE_FOLDERS, initialDriveFolders),
  setDriveFolders: (data: DriveFolder[]) => setStoredData(STORAGE_KEYS.DRIVE_FOLDERS, data),

  getSchedules: (): ScheduleItem[] => getStoredData(STORAGE_KEYS.SCHEDULES, initialSchedules),
  setSchedules: (data: ScheduleItem[]) => setStoredData(STORAGE_KEYS.SCHEDULES, data),

  getTransactions: (): TransactionItem[] => getStoredData(STORAGE_KEYS.TRANSACTIONS, initialTransactions),
  setTransactions: (data: TransactionItem[]) => setStoredData(STORAGE_KEYS.TRANSACTIONS, data),

  getTeachers: (): TeacherItem[] => getStoredData(STORAGE_KEYS.TEACHERS, initialTeachers),
  setTeachers: (data: TeacherItem[]) => setStoredData(STORAGE_KEYS.TEACHERS, data),

  getAnnouncements: (): AnnouncementItem[] => getStoredData(STORAGE_KEYS.ANNOUNCEMENTS, initialAnnouncements),
  setAnnouncements: (data: AnnouncementItem[]) => setStoredData(STORAGE_KEYS.ANNOUNCEMENTS, data),

  getOnlineMeeting: (): OnlineMeeting => getStoredData(STORAGE_KEYS.ONLINE_MEETING, initialOnlineMeeting),
  setOnlineMeeting: (data: OnlineMeeting) => setStoredData(STORAGE_KEYS.ONLINE_MEETING, data),

  getSchoolAccounts: (): SchoolAccount[] => getStoredData(STORAGE_KEYS.SCHOOL_ACCOUNTS, initialSchoolAccounts),
  setSchoolAccounts: (data: SchoolAccount[]) => setStoredData(STORAGE_KEYS.SCHOOL_ACCOUNTS, data),

  getUserSession: (): UserSession => getStoredData(STORAGE_KEYS.USER_SESSION, { isLoggedIn: false, role: 'guest' }),
  setUserSession: (data: UserSession) => setStoredData(STORAGE_KEYS.USER_SESSION, data),

  getNotifEnabled: (): boolean => getStoredData(STORAGE_KEYS.NOTIF_ENABLED, true),
  setNotifEnabled: (enabled: boolean) => setStoredData(STORAGE_KEYS.NOTIF_ENABLED, enabled),

  getLoginHistory: (): LoginHistoryItem[] => getStoredData(STORAGE_KEYS.LOGIN_HISTORY, initialLoginHistory),
  setLoginHistory: (data: LoginHistoryItem[]) => setStoredData(STORAGE_KEYS.LOGIN_HISTORY, data),

  getAttendance: (): AttendanceItem[] => getStoredData(STORAGE_KEYS.ATTENDANCE, []),
  setAttendance: (data: AttendanceItem[]) => setStoredData(STORAGE_KEYS.ATTENDANCE, data),

  resetToDefault: async () => {
    localStorage.clear();
    await resetAndRebuildSupabaseData();
    window.location.reload();
  },

  exportAllData: () => {
    const data = {
      appName: 'KKG6UP',
      version: '2.0-supabase',
      exportedAt: new Date().toISOString(),
      driveFolders: storage.getDriveFolders(),
      schedules: storage.getSchedules(),
      transactions: storage.getTransactions(),
      teachers: storage.getTeachers(),
      announcements: storage.getAnnouncements(),
      onlineMeeting: storage.getOnlineMeeting(),
      schoolAccounts: storage.getSchoolAccounts()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kkg6up-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importAllData: (jsonData: any) => {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Format file JSON tidak valid!');
    }
    if (Array.isArray(jsonData.driveFolders)) storage.setDriveFolders(jsonData.driveFolders);
    if (Array.isArray(jsonData.schedules)) storage.setSchedules(jsonData.schedules);
    if (Array.isArray(jsonData.transactions)) storage.setTransactions(jsonData.transactions);
    if (Array.isArray(jsonData.teachers)) storage.setTeachers(jsonData.teachers);
    if (Array.isArray(jsonData.announcements)) storage.setAnnouncements(jsonData.announcements);
    if (jsonData.onlineMeeting && typeof jsonData.onlineMeeting === 'object') storage.setOnlineMeeting(jsonData.onlineMeeting);
    if (Array.isArray(jsonData.schoolAccounts)) storage.setSchoolAccounts(jsonData.schoolAccounts);
    window.location.reload();
  },

  subscribeToChanges: (callback: (key: string) => void) => {
    // 1. Broadcast channel listener for local multi-tab sync
    const listener = (event: MessageEvent) => {
      if (event.data && event.data.type === 'DATA_UPDATED') {
        callback(event.data.key);
      }
    };
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', listener);
    }

    // 2. Real-time Supabase listener for multi-user / multi-device sync
    const unsubscribeSupabase = initSupabaseListeners((key) => {
      callback(key);
    });

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', listener);
      }
      unsubscribeSupabase();
    };
  }
};
