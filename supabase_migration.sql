-- KKG6UP! Portal Guru Kelas 6 - Supabase Schema
-- Jalankan seluruh file ini di Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS drive_folders (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, file_count INTEGER DEFAULT 0,
  url TEXT, color TEXT, description TEXT, icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, time TEXT,
  location TEXT, agenda JSONB DEFAULT '[]', status TEXT DEFAULT 'Akan Datang',
  invitation_url TEXT, maps_url TEXT, google_meet_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY, date DATE NOT NULL, description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('masuk','keluar')), amount NUMERIC(15,2) NOT NULL,
  school_or_teacher TEXT, category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, school TEXT NOT NULL, nip TEXT,
  role TEXT DEFAULT 'Guru Kelas VI', phone TEXT, email TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, author TEXT,
  content TEXT, tags JSONB DEFAULT '[]', is_pinned BOOLEAN DEFAULT FALSE, image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS online_meetings (
  id TEXT PRIMARY KEY DEFAULT 'meet-1', title TEXT NOT NULL, scheduled_time TEXT,
  meet_url TEXT, status TEXT DEFAULT 'Mendatang', agenda_note TEXT, passcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS school_accounts (
  school_name TEXT PRIMARY KEY, password TEXT NOT NULL, teacher_name TEXT,
  has_paid_kas_current_month BOOLEAN DEFAULT FALSE, last_attendance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS login_history (
  id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK (role IN ('teacher','admin')),
  school_name TEXT NOT NULL, teacher_name TEXT NOT NULL, timestamp TEXT,
  status TEXT DEFAULT 'Berhasil Login', created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime (abaikan error "already member" bila dijalankan ulang)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE drive_folders, schedules, transactions,
    teachers, announcements, online_meetings, school_accounts, login_history;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS: kebijakan awal agar aplikasi dapat digunakan dengan anon/publishable key.
-- Sebelum aplikasi dipakai publik, sebaiknya ganti dengan Supabase Auth + policy berbasis role.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY['drive_folders','schedules','transactions','teachers','announcements','online_meetings','school_accounts','login_history'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public app access" ON %I', t);
    EXECUTE format('CREATE POLICY "Public app access" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Seed data dibuat oleh aplikasi melalui tombol seed/initial sync.
-- Ini sengaja tidak menyalin password akun sekolah ke SQL publik secara otomatis.
