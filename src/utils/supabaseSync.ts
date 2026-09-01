import { isSupabaseConfigured, supabase, supabaseAdminEmail } from '../lib/supabase';
import type { AttendanceItem, ScheduleItem, TeacherItem } from '../types';
import {
  initialAnnouncements,
  initialDriveFolders,
  initialLoginHistory,
  initialOnlineMeeting,
  initialSchedules,
  initialTeachers,
  initialTransactions
} from '../data/initialData';

const COLLECTIONS = {
  schedules: 'schedules', transactions: 'transactions', teachers: 'teachers',
  driveFolders: 'drive_folders', announcements: 'announcements',
  onlineMeeting: 'online_meetings',
  loginHistory: 'login_history', attendance: 'attendance'
} as const;

const STORAGE_KEYS = {
  schedules: 'kkg6up_schedules', transactions: 'kkg6up_transactions',
  teachers: 'kkg6up_teachers', driveFolders: 'kkg6up_drive_folders',
  announcements: 'kkg6up_announcements', onlineMeeting: 'kkg6up_online_meeting',
  loginHistory: 'kkg6up_login_history',
  attendance: 'kkg6up_attendance'
} as const;

const SELECT_COLUMNS: Record<string, string> = {
  [COLLECTIONS.teachers]: 'id,name,school,role,avatar_url',
  [COLLECTIONS.onlineMeeting]: 'id,title,scheduled_time,meet_url,status,agenda_note,meeting_notes'
};

let isSyncingFromSupabase = false;
let isSupabaseReady = false;
let readyPromiseResolve: () => void = () => undefined;
const readyPromise = new Promise<void>((resolve) => { readyPromiseResolve = resolve; });
const pendingSaves = new Map<string, Promise<void>>();

export function isSupabaseSyncing(): boolean { return isSyncingFromSupabase; }
export function isSupabaseReadySynced(): boolean { return isSupabaseReady; }
export function whenSupabaseReady(): Promise<void> { return readyPromise; }

export interface PublicAttendanceData {
  schedules: ScheduleItem[];
  teachers: TeacherItem[];
  attendance: AttendanceItem[];
}

function markReady() {
  if (!isSupabaseReady) {
    isSupabaseReady = true;
    readyPromiseResolve();
  }
}

function sanitizeForSupabase(value: any): any {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitizeForSupabase);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, sanitizeForSupabase(item)])
    );
  }
  return value;
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
    case COLLECTIONS.loginHistory: return { ...row, schoolName: row.school_name, teacherName: row.teacher_name };
    case COLLECTIONS.attendance: return { ...row, scheduleId: row.schedule_id, teacherId: row.teacher_id, teacherName: row.teacher_name, checkedInAt: row.checked_in_at };
    default: return row;
  }
}

export async function loadPublicAttendanceData(): Promise<PublicAttendanceData> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase belum dikonfigurasi.');
  }

  const [schedulesResult, teachersResult, attendanceResult] = await Promise.all([
    supabase.from(COLLECTIONS.schedules).select('*').order('date', { ascending: true }),
    supabase.from(COLLECTIONS.teachers)
      .select(SELECT_COLUMNS[COLLECTIONS.teachers])
      .order('name', { ascending: true }),
    supabase.from(COLLECTIONS.attendance).select('*')
  ]);

  const firstError = schedulesResult.error || teachersResult.error || attendanceResult.error;
  if (firstError) throw firstError;

  return {
    schedules: (schedulesResult.data || []).map((row) => fromDatabaseRow(COLLECTIONS.schedules, row)),
    teachers: (teachersResult.data || []).map((row) => fromDatabaseRow(COLLECTIONS.teachers, row)),
    attendance: (attendanceResult.data || []).map((row) => fromDatabaseRow(COLLECTIONS.attendance, row))
  };
}

export function subscribeToPublicAttendanceChanges(onChange: () => void): () => void {
  if (!isSupabaseConfigured) return () => undefined;

  const channel = supabase
    .channel('public-attendance-form-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.schedules }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.teachers }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.attendance }, onChange)
    .subscribe();

  return () => { void supabase.removeChannel(channel); };
}

async function persistSnapshot(collectionName: string, data: any): Promise<void> {
  if (!isSupabaseConfigured || isSyncingFromSupabase) return;

  const { data: authData } = await supabase.auth.getSession();
  const isAdminSession =
    authData.session?.user?.email?.toLowerCase() === supabaseAdminEmail;

  // Public forms may insert a new attendance/login row, but only the admin is
  // allowed to reconcile, update, or delete the complete remote collection.
  if (
    !isAdminSession &&
    (collectionName === COLLECTIONS.attendance || collectionName === COLLECTIONS.loginHistory)
  ) {
    if (!Array.isArray(data) || data.length === 0) return;
    const { error } = await supabase.from(collectionName).insert(toDatabaseRow(collectionName, data[0]));
    if (error && error.code !== '23505') throw error;
    return;
  }

  if (collectionName === COLLECTIONS.onlineMeeting) {
    const { error } = await supabase.from(COLLECTIONS.onlineMeeting)
      .upsert(toDatabaseRow(COLLECTIONS.onlineMeeting, data), { onConflict: 'id' });
    if (error) throw error;
    return;
  }

  if (!Array.isArray(data)) return;
  const primaryKey = 'id';
  const rows = data.map((item, index) => toDatabaseRow(collectionName, item, index));

  if (rows.length > 0) {
    const { error } = await supabase.from(collectionName).upsert(rows, { onConflict: primaryKey });
    if (error) throw error;
  }

  // Array setters represent the complete collection. Removing stale rows keeps
  // remotely deleted items from appearing again after a realtime refresh.
  const { data: existingRows, error: selectError } = await supabase.from(collectionName).select(primaryKey);
  if (selectError) throw selectError;
  const wantedKeys = new Set(rows.map((row) => String(row[primaryKey])));
  const staleKeys = (existingRows || [])
    .map((row: any) => row[primaryKey])
    .filter((key: any) => !wantedKeys.has(String(key)));

  if (staleKeys.length > 0) {
    const { error: deleteError } = await supabase.from(collectionName).delete().in(primaryKey, staleKeys);
    if (deleteError) throw deleteError;
  }
}

export function saveToSupabase(collectionName: string, data: any): Promise<void> {
  if (!isSupabaseConfigured || isSyncingFromSupabase) return Promise.resolve();
  const previous = pendingSaves.get(collectionName) || Promise.resolve();
  const current = previous.catch(() => undefined)
    .then(() => persistSnapshot(collectionName, data))
    .catch((error) => console.error(`Supabase save error (${collectionName}):`, error));
  pendingSaves.set(collectionName, current);
  current.finally(() => {
    if (pendingSaves.get(collectionName) === current) pendingSaves.delete(collectionName);
  });
  return current;
}

export async function resetAndRebuildSupabaseData() {
  if (!isSupabaseConfigured) return;
  const defaults = [
    [COLLECTIONS.schedules, initialSchedules], [COLLECTIONS.transactions, initialTransactions],
    [COLLECTIONS.teachers, initialTeachers], [COLLECTIONS.driveFolders, initialDriveFolders],
    [COLLECTIONS.announcements, initialAnnouncements],
    [COLLECTIONS.loginHistory, initialLoginHistory], [COLLECTIONS.attendance, []]
  ] as const;
  for (const [collection, items] of defaults) await persistSnapshot(collection, items);
  await persistSnapshot(COLLECTIONS.onlineMeeting, initialOnlineMeeting);
}

function writeLocalCache(storageKey: string, value: any) {
  isSyncingFromSupabase = true;
  try { localStorage.setItem(storageKey, JSON.stringify(value)); }
  finally { isSyncingFromSupabase = false; }
}

function readLocalCache(storageKey: string): any {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch { return null; }
}

function processSnapshotData(collectionName: string, storageKey: string, items: any[], initialItems: any[], seedWhenEmpty: boolean) {
  let itemsToUse = items;
  if (seedWhenEmpty && items.length === 0) {
    const localItems = readLocalCache(storageKey);
    itemsToUse = Array.isArray(localItems) && localItems.length > 0 ? localItems : initialItems;
    void saveToSupabase(collectionName, itemsToUse);
  }
  writeLocalCache(storageKey, itemsToUse);
}

export function initSupabaseListeners(onUpdate: (key: string) => void): () => void {
  if (!isSupabaseConfigured) {
    markReady();
    return () => undefined;
  }

  const collections = [
    { table: COLLECTIONS.schedules, key: STORAGE_KEYS.schedules, initial: initialSchedules },
    { table: COLLECTIONS.transactions, key: STORAGE_KEYS.transactions, initial: initialTransactions },
    { table: COLLECTIONS.teachers, key: STORAGE_KEYS.teachers, initial: initialTeachers },
    { table: COLLECTIONS.driveFolders, key: STORAGE_KEYS.driveFolders, initial: initialDriveFolders },
    { table: COLLECTIONS.announcements, key: STORAGE_KEYS.announcements, initial: initialAnnouncements },
    { table: COLLECTIONS.loginHistory, key: STORAGE_KEYS.loginHistory, initial: initialLoginHistory },
    { table: COLLECTIONS.attendance, key: STORAGE_KEYS.attendance, initial: [] }
  ];

  const refreshCollection = async (entry: typeof collections[number], seedWhenEmpty: boolean) => {
    const { data, error } = await supabase
      .from(entry.table)
      .select(SELECT_COLUMNS[entry.table] || '*');
    if (error) throw error;
    const rows = (data || []).map((row) => fromDatabaseRow(entry.table, row));
    processSnapshotData(entry.table, entry.key, rows, entry.initial, seedWhenEmpty);
    onUpdate(entry.key);
  };

  Promise.allSettled(collections.map((entry) => refreshCollection(entry, true)))
    .then(async (results) => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const table = collections[index].table;
          // Protected collections are intentionally unavailable before admin login.
          if (table !== COLLECTIONS.loginHistory) {
            console.error(`Supabase initial sync failed (${table}):`, result.reason);
          }
        }
      });
      const { data, error } = await supabase.from(COLLECTIONS.onlineMeeting)
        .select(SELECT_COLUMNS[COLLECTIONS.onlineMeeting]).eq('id', 'meet-1').maybeSingle();
      if (error) throw error;
      if (data) {
        writeLocalCache(STORAGE_KEYS.onlineMeeting, fromDatabaseRow(COLLECTIONS.onlineMeeting, data));
        onUpdate(STORAGE_KEYS.onlineMeeting);
      } else {
        await saveToSupabase(COLLECTIONS.onlineMeeting, initialOnlineMeeting);
      }
    })
    .catch((error) => console.error('Supabase initial sync failed:', error))
    .finally(markReady);

  const channels: any[] = collections.map((entry) => supabase
    .channel(`${entry.table}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table: entry.table }, () => {
      if (isSyncingFromSupabase) return;
      void refreshCollection(entry, false)
        .catch((error) => console.error(`Supabase realtime refresh error (${entry.table}):`, error));
    }).subscribe());

  channels.push(supabase.channel(`${COLLECTIONS.onlineMeeting}-changes`)
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.onlineMeeting }, async () => {
      if (isSyncingFromSupabase) return;
      const { data, error } = await supabase.from(COLLECTIONS.onlineMeeting)
        .select(SELECT_COLUMNS[COLLECTIONS.onlineMeeting]).eq('id', 'meet-1').maybeSingle();
      if (!error && data) {
        writeLocalCache(STORAGE_KEYS.onlineMeeting, fromDatabaseRow(COLLECTIONS.onlineMeeting, data));
        onUpdate(STORAGE_KEYS.onlineMeeting);
      }
    }).subscribe());

  return () => { channels.forEach((channel) => { void supabase.removeChannel(channel); }); };
}
