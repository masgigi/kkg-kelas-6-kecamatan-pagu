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
  loginHistory: 'login_history'
};

const STORAGE_KEYS = {
  schedules: 'kkg6up_schedules',
  transactions: 'kkg6up_transactions',
  teachers: 'kkg6up_teachers',
  driveFolders: 'kkg6up_drive_folders',
  announcements: 'kkg6up_announcements',
  onlineMeeting: 'kkg6up_online_meeting',
  schoolAccounts: 'kkg6up_school_accounts',
  loginHistory: 'kkg6up_login_history'
};

let isSyncingFromSupabase = false;

export function isSupabaseSyncing(): boolean {
  return isSyncingFromSupabase;
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

export async function saveToSupabase(collectionName: string, data: any) {
  if (isSyncingFromSupabase) return;

  try {
    if (collectionName === COLLECTIONS.onlineMeeting) {
      const payload = normalizeItem(data);
      const { error } = await supabase
        .from(COLLECTIONS.onlineMeeting)
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    } else if (Array.isArray(data)) {
      const items = data.map((item, i) => normalizeItem(item, i));
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
      const normalized = items.map((item, i) => normalizeItem(item, i));
      const { error } = await supabase.from(colName).upsert(normalized, { onConflict: 'id' });
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
  // 1. Schedules
  supabase
    .channel('schedules-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.schedules }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.schedules).select('*');
      processSnapshotData(COLLECTIONS.schedules, STORAGE_KEYS.schedules, data || [], initialSchedules);
      onUpdate(STORAGE_KEYS.schedules);
    })
    .subscribe();

  // 2. Transactions
  supabase
    .channel('transactions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.transactions }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.transactions).select('*');
      processSnapshotData(COLLECTIONS.transactions, STORAGE_KEYS.transactions, data || [], initialTransactions);
      onUpdate(STORAGE_KEYS.transactions);
    })
    .subscribe();

  // 3. Teachers
  supabase
    .channel('teachers-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.teachers }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.teachers).select('*');
      processSnapshotData(COLLECTIONS.teachers, STORAGE_KEYS.teachers, data || [], initialTeachers);
      onUpdate(STORAGE_KEYS.teachers);
    })
    .subscribe();

  // 4. Drive Folders
  supabase
    .channel('drive_folders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.driveFolders }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.driveFolders).select('*');
      processSnapshotData(COLLECTIONS.driveFolders, STORAGE_KEYS.driveFolders, data || [], initialDriveFolders);
      onUpdate(STORAGE_KEYS.driveFolders);
    })
    .subscribe();

  // 5. Announcements
  supabase
    .channel('announcements-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.announcements }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.announcements).select('*');
      processSnapshotData(COLLECTIONS.announcements, STORAGE_KEYS.announcements, data || [], initialAnnouncements);
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
      processSnapshotData(COLLECTIONS.schoolAccounts, STORAGE_KEYS.schoolAccounts, data || [], initialSchoolAccounts);
      onUpdate(STORAGE_KEYS.schoolAccounts);
    })
    .subscribe();

  // 8. Login History
  supabase
    .channel('login_history-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: COLLECTIONS.loginHistory }, async () => {
      if (isSyncingFromSupabase) return;
      const { data } = await supabase.from(COLLECTIONS.loginHistory).select('*');
      processSnapshotData(COLLECTIONS.loginHistory, STORAGE_KEYS.loginHistory, data || [], initialLoginHistory);
      onUpdate(STORAGE_KEYS.loginHistory);
    })
    .subscribe();
}
