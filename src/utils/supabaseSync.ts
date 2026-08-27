import { supabase } from '../lib/supabase';
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

const COLLECTIONS = {
  schedules: 'schedules',
  transactions: 'transactions',
  teachers: 'teachers',
  driveFolders: 'drive_folders',
  announcements: 'announcements',
  onlineMeeting: 'online_meetings',
  schoolAccounts: 'school_accounts',
  loginHistory: 'login_history',
  attendance: 'attendance'
};

const STORAGE_KEYS = {
  schedules: 'kkg6up_schedules',
  transactions: 'kkg6up_transactions',
  teachers: 'kkg6up_teachers',
  driveFolders: 'kkg6up_drive_folders',
  announcements: 'kkg6up_announcements',
  onlineMeeting: 'kkg6up_online_meeting',
  schoolAccounts: 'kkg6up_school_accounts',
  loginHistory: 'kkg6up_login_history',
  attendance: 'kkg6up_attendance'
};

let isSyncingFromSupabase = false;
let isSupabaseReady = false;
let readyPromiseResolve: () => void = () => {};
const readyPromise = new Promise<void>((resolve) => { readyPromiseResolve = resolve; });

export function isSupabaseSyncing(): boolean {
  return isSyncingFromSupabase;
}

export function isSupabaseReadySynced(): boolean {
  return isSupabaseReady;
}

export function whenSupabaseReady(): Promise<void> {
  return readyPromise;
}

function markReady() {
  if (!isSupabaseReady) {
    isSupabaseReady = true;
    readyPromiseResolve();
  }
}

function sanitizeForSupabase(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForSupabase);
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) cleaned[key] = sanitizeForSupabase(val);
    }
    return cleaned;
  }
  return obj;
}

function normalizeItem(item: any, index?: number): any {
  const id = item.id || item.schoolName || (index !== undefined ? `doc-${index}` : `doc-${Date.now()}`);
  return { ...sanitizeForSupabase(item), id };
}

function toDatabaseRow(table: string, item: any, index?: number): any {
  const row = normalizeItem(item, index);
  switch (table) {
    case COLLECTIONS.driveFolders:
      return { id: row.id, title: row.title, file_count: row.fileCount ?? 0, url: row.url, color: row.color, description: row.description, icon_name: row.iconName };
    case COLLECTIONS.schedules:
      return { id: row.id, title: row.title, date: row.date, time: row.time, location: row.location, agenda: row.agenda ?? [], status: row.status, invitation_url: row.invitationUrl, maps_url: row.mapsUrl, google_meet_url: row.googleMeetUrl };
    case COLLECTIONS.transactions:
      return { id: row.id, date: row.date, description: row.description, type: row.type, amount: row.amount, school_or_teacher: row.schoolOrTeacher, category: row.category };
    case COLLECTIONS.teachers:
      return { id: row.id, name: row.name, school: row.school, nip: row.nip, role: row.role, phone: row.phone, email: row.email, avatar_url: row.avatarUrl };
    case COLLECTIONS.announcements:
      return { id: row.id, title: row.title, date: row.date, author: row.author, content: row.content, tags: row.tags ?? [], is_pinned: row.isPinned ?? false, image_url: row.imageUrl };
    case COLLECTIONS.onlineMeeting:
      return { id: row.id || 'meet-1', title: row.title, scheduled_time: row.scheduledTime, meet_url: row.meetUrl, status: row.status, agenda_note: row.agendaNote, passcode: row.passcode };
    case COLLECTIONS.schoolAccounts:
      return { school_name: row.schoolName || row.school_name, password: row.password, teacher_name: row.teacherName, has_paid_kas_current_month: row.hasPaidKasCurrentMonth ?? false, last_attendance: row.lastAttendance };
    case COLLECTIONS.loginHistory:
      return { id: row.id, role: row.role, school_name: row.schoolName, teacher_name: row.teacherName, timestamp: row.timestamp, status: row.status };
    case COLLECTIONS.attendance:
      return { id: row.id, schedule_id: row.scheduleId, teacher_id: row.teacherId, teacher_name: row.teacherName, school: row.school, status: row.status, checked_in_at: row.checkedInAt, note: row.note };
    default:
      return row;
  }
}

function fromDatabaseRow(table: string, row: any): any {
  switch (table) {
    case COLLECTIONS.driveFolders: return { ...row, fileCount: row.file_count, iconName: row.icon_name };
    case COLLECTIONS.schedules: return { ...row, invitationUrl: row.invitation_url, mapsUrl: row.maps_url, googleMeetUrl: row.google_meet_url };
    case COLLECTIONS.transactions: return { ...row, schoolOrTeacher: row.school_or_teacher };
    case COLLECTIONS.teachers: return { ...row, avatarUrl: row.avatar_url };
    case COLLECTIONS.announcements: return { ...row, isPinned: row.is_pinned, imageUrl: row.image_url };
    case COLLECTIONS.onlineMeeting: return { ...row, scheduledTime: row.scheduled_time, meetUrl: row.meet_url, agendaNote: row.agenda_note };
    case COLLECTIONS.schoolAccounts: return { ...row, schoolName: row.school_name, teacherName: row.teacher_name, hasPaidKasCurrentMonth: row.has_paid_kas_current_month, lastAttendance: row.last_attendance };
    case COLLECTIONS.loginHistory: return { ...row, schoolName: row.school_name, teacherName: row.teacher_name };
    case COLLECTIONS.attendance: return { ...row, scheduleId: row.schedule_id, teacherId: row.teacher_id, teacherName: row.teacher_name, checkedInAt: row.checked_in_at };
    default: return row;
  }
}

export async function saveToSupabase(collectionName: string, data: any) {
  if (isSyncingFromSupabase) return;

  try {
    if (collectionName === COLLECTIONS.onlineMeeting) {
      const payload = toDatabaseRow(COLLECTIONS.onlineMeeting, data);
      const { error } = await supabase
        .from(COLLECTIONS.onlineMeeting)
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    } else if (Array.isArray(data)) {
      const items = data.map((item, i) => toDatabaseRow(collectionName, item, i));
      const { error } = await supabase
        .from(collectionName)
        .upsert(items, { onConflict: 'id' });
      if (error) throw error;
    }
  } catch (err) {
    console.error('Supabase save error:', err);
  }
}

export async function resetAndRebuildSupabaseData() {
  isSyncingFromSupabase = true;
  try {
    const seedCollection = async (colName: string, items: any[]) => {
      await supabase.from(colName).delete().neq('id', '__never_match__');
      const normalized = items.map((item, i) => toDatabaseRow(colName, item, i));
      const { error } = await supabase.from(colName).upsert(normalized, { onConflict: colName === COLLECTIONS.schoolAccounts ? 'school_name' : 'id' });
      if (error) throw error;
    };

    await seedCollection(COLLECTIONS.schedules, initialSchedules);
    await seedCollection(COLLECTIONS.transactions, initialTransactions);
    await seedCollection(COLLECTIONS.teachers, initialTeachers);
    await seedCollection(COLLECTIONS.driveFolders, initialDriveFolders);
    await seedCollection(COLLECTIONS.announcements, initialAnnouncements);
    await seedCollection(COLLECTIONS.onlineMeeting, [initialOnlineMeeting]);
    await seedCollection(COLLECTIONS.schoolAccounts, initialSchoolAccounts);
    await seedCollection(COLLECTIONS.loginHistory, initialLoginHistory);

    console.log('Supabase collections successfully rebuilt!');
  } catch (err) {
    console.error('Error resetting Supabase collections:', err);
  } finally {
    isSyncingFromSupabase = false;
  }
}

function processSnapshotData(
  collectionName: string,
  storageKey: string,
  items: any[],
  initialItems: any[]
) {
  let itemsToUse: any[];

  if (items.length === 0) {
    const localDataRaw = localStorage.getItem(storageKey);
    let existingLocalData: any = null;
    if (localDataRaw) {
      try { existingLocalData = JSON.parse(localDataRaw); } catch { existingLocalData = null; }
    }

    if (existingLocalData && (Array.isArray(existingLocalData) ? existingLocalData.length > 0 : typeof existingLocalData === 'object')) {
      itemsToUse = existingLocalData;
      saveToSupabase(collectionName, existingLocalData);
    } else {
      itemsToUse = initialItems;
      saveToSupabase(collectionName, initialItems);
    }
  } else {
    itemsToUse = items;
  }

  isSyncingFromSupabase = true;
  try {
    localStorage.setItem(storageKey, JSON.stringify(itemsToUse));
  } catch (e) {
    console.warn(`Error updating local cache for ${storageKey}:`, e);
  }
  isSyncingFromSupabase = false;

  return itemsToUse;
}

export function initSupabaseListeners(onUpdate: (key: string) => void) {
  const initialLoads = [
    { table: COLLECTIONS.schedules, key: STORAGE_KEYS.schedules, initial: initialSchedules },
    { table: COLLECTIONS.transactions, key: STORAGE_KEYS.transactions, initial: initialTransactions },
    { table: COLLECTIONS.teachers, key: STORAGE_KEYS.teachers, initial: initialTeachers },
    { table: COLLECTIONS.driveFolders, key: STORAGE_KEYS.driveFolders, initial: initialDriveFolders },
    { table: COLLECTIONS.announcements, key: STORAGE_KEYS.announcements, initial: initialAnnouncements },
    { table: COLLECTIONS.schoolAccounts, key: STORAGE_KEYS.schoolAccounts, initial: initialSchoolAccounts },
    { table: COLLECTIONS.loginHistory, key: STORAGE_KEYS.loginHistory, initial: initialLoginHistory },
    { table: COLLECTIONS.attendance, key: STORAGE_KEYS.attendance, initial: [] }
  ];

  // Load all remote data once before realtime channels are subscribed.
  Promise.all(initialLoads.map(async ({ table, key, initial }) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Supabase load error (${table}):`, error);
      return;
    }
    const rows = (data || []).map((r) => fromDatabaseRow(table, r));
    processSnapshotData(table, key, rows, initial);
    onUpdate(key);
  })).then(async () => {
    const { data, error } = await supabase.from(COLLECTIONS.onlineMeeting).select('*').eq('id', 'meet-1').maybeSingle();
    if (!error && data) {
      localStorage.setItem(STORAGE_KEYS.onlineMeeting, JSON.stringify(data));
      onUpdate(STORAGE_KEYS.onlineMeeting);
    } else if (!error && !data) {
      await saveToSupabase(COLLECTIONS.onlineMeeting, initialOnlineMeeting);
    }
    markReady();
  }).catch((error) => {
    console.error('Supabase initial sync failed:', error);
    markReady();
  });
  supabase
    .channel('schedules-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.schedules }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.schedules).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.schedules, r));
      processSnapshotData(COLLECTIONS.schedules, STORAGE_KEYS.schedules, rows, initialSchedules);
      onUpdate(STORAGE_KEYS.schedules);
    })
    .subscribe();

  // 2. Transactions
  supabase
    .channel('transactions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.transactions }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.transactions).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.transactions, r));
      processSnapshotData(COLLECTIONS.transactions, STORAGE_KEYS.transactions, rows, initialTransactions);
      onUpdate(STORAGE_KEYS.transactions);
    })
    .subscribe();

  // 3. Teachers
  supabase
    .channel('teachers-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.teachers }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.teachers).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.teachers, r));
      processSnapshotData(COLLECTIONS.teachers, STORAGE_KEYS.teachers, rows, initialTeachers);
      onUpdate(STORAGE_KEYS.teachers);
    })
    .subscribe();

  // 4. Drive Folders
  supabase
    .channel('drive_folders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.driveFolders }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.driveFolders).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.driveFolders, r));
      processSnapshotData(COLLECTIONS.driveFolders, STORAGE_KEYS.driveFolders, rows, initialDriveFolders);
      onUpdate(STORAGE_KEYS.driveFolders);
    })
    .subscribe();

  // 5. Announcements
  supabase
    .channel('announcements-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.announcements }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.announcements).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.announcements, r));
      processSnapshotData(COLLECTIONS.announcements, STORAGE_KEYS.announcements, rows, initialAnnouncements);
      onUpdate(STORAGE_KEYS.announcements);
    })
    .subscribe();

  // 6. Online Meeting
  supabase
    .channel('online_meetings-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.onlineMeeting }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.onlineMeeting).select('*').eq('id', 'meet-1').single();
      if (data) {
        isSyncingFromSupabase = true;
        localStorage.setItem(STORAGE_KEYS.onlineMeeting, JSON.stringify(data));
        isSyncingFromSupabase = false;
        onUpdate(STORAGE_KEYS.onlineMeeting);
      }
    })
    .subscribe();

  // 7. School Accounts
  supabase
    .channel('school_accounts-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.schoolAccounts }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.schoolAccounts).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.schoolAccounts, r));
      processSnapshotData(COLLECTIONS.schoolAccounts, STORAGE_KEYS.schoolAccounts, rows, initialSchoolAccounts);
      onUpdate(STORAGE_KEYS.schoolAccounts);
    })
    .subscribe();

  // 8. Login History
  supabase
    .channel('login_history-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.loginHistory }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.loginHistory).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.loginHistory, r));
      processSnapshotData(COLLECTIONS.loginHistory, STORAGE_KEYS.loginHistory, rows, initialLoginHistory);
      onUpdate(STORAGE_KEYS.loginHistory);
    })
    .subscribe();

  // 9. Attendance
  supabase
    .channel('attendance-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.attendance }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.attendance).select('*');
      const rows = (data || []).map((r) => fromDatabaseRow(COLLECTIONS.attendance, r));
      processSnapshotData(COLLECTIONS.attendance, STORAGE_KEYS.attendance, rows, []);
      onUpdate(STORAGE_KEYS.attendance);
    })
    .subscribe();
}
