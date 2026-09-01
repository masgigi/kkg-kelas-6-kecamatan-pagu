-- KKG6UP! Portal Guru Kelas 6 - secure Supabase schema

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.drive_folders (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, file_count INTEGER DEFAULT 0,
  url TEXT, color TEXT, description TEXT, icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.schedules (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, time TEXT,
  location TEXT, agenda JSONB DEFAULT '[]', status TEXT DEFAULT 'Akan Datang',
  invitation_url TEXT, maps_url TEXT, google_meet_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY, date DATE NOT NULL, description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('masuk','keluar')), amount NUMERIC(15,2) NOT NULL,
  school_or_teacher TEXT, category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, school TEXT NOT NULL, nip TEXT,
  role TEXT DEFAULT 'Guru Kelas VI', phone TEXT, email TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, date DATE NOT NULL, author TEXT,
  content TEXT, tags JSONB DEFAULT '[]', is_pinned BOOLEAN DEFAULT FALSE, image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.online_meetings (
  id TEXT PRIMARY KEY DEFAULT 'meet-1', title TEXT NOT NULL, scheduled_time TEXT,
  meet_url TEXT, status TEXT DEFAULT 'Mendatang', agenda_note TEXT, passcode TEXT,
  meeting_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.school_accounts (
  school_name TEXT PRIMARY KEY, password_hash TEXT NOT NULL, teacher_name TEXT,
  has_paid_kas_current_month BOOLEAN DEFAULT FALSE, last_attendance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.login_history (
  id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK (role IN ('teacher','admin')),
  school_name TEXT NOT NULL, teacher_name TEXT NOT NULL, timestamp TEXT,
  status TEXT DEFAULT 'Berhasil Login', created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY, schedule_id TEXT NOT NULL, teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL, school TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Hadir' CHECK (status IN ('Hadir','Izin')),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (schedule_id, teacher_id)
);

ALTER TABLE public.online_meetings ADD COLUMN IF NOT EXISTS meeting_notes TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS attendance_schedule_checked_idx
  ON public.attendance (schedule_id, checked_in_at DESC);

-- Only this verified Supabase Auth account can mutate managed data.
CREATE OR REPLACE FUNCTION public.is_kkg_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT COALESCE(LOWER((SELECT auth.jwt()->>'email')) = 'kediriacara@gmail.com', FALSE)
$$;
REVOKE ALL ON FUNCTION public.is_kkg_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_kkg_admin() TO authenticated;

-- Teacher passwords are checked server-side; password hashes never leave Postgres.
CREATE OR REPLACE FUNCTION public.verify_school_login(p_school_name TEXT, p_password TEXT)
RETURNS TABLE (
  school_name TEXT,
  teacher_name TEXT,
  has_paid_kas_current_month BOOLEAN,
  last_attendance TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT sa.school_name, sa.teacher_name, sa.has_paid_kas_current_month, sa.last_attendance
  FROM public.school_accounts AS sa
  WHERE sa.school_name = p_school_name
    AND sa.password_hash = extensions.crypt(p_password, sa.password_hash)
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.verify_school_login(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_school_login(TEXT, TEXT) TO anon, authenticated;

-- Public portal content: everyone may read; only the authorized admin may write.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'drive_folders','schedules','transactions','teachers','announcements','online_meetings'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public app access" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admin delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Admin insert" ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_kkg_admin()))', t);
    EXECUTE format('CREATE POLICY "Admin update" ON public.%I FOR UPDATE TO authenticated USING ((SELECT public.is_kkg_admin())) WITH CHECK ((SELECT public.is_kkg_admin()))', t);
    EXECUTE format('CREATE POLICY "Admin delete" ON public.%I FOR DELETE TO authenticated USING ((SELECT public.is_kkg_admin()))', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', t);
  END LOOP;
END $$;

-- Contact details and meeting passcodes remain stored, but are not readable
-- through the anonymous public client.
DROP POLICY IF EXISTS "Public read" ON public.teachers;
DROP POLICY IF EXISTS "Admin read" ON public.teachers;
CREATE POLICY "Public read" ON public.teachers FOR SELECT TO anon USING (true);
CREATE POLICY "Admin read" ON public.teachers FOR SELECT TO authenticated
  USING ((SELECT public.is_kkg_admin()));
REVOKE SELECT ON TABLE public.teachers FROM anon, authenticated;
GRANT SELECT (id, name, school, role, avatar_url) ON public.teachers TO anon;
GRANT SELECT ON TABLE public.teachers TO authenticated;

DROP POLICY IF EXISTS "Public read" ON public.online_meetings;
DROP POLICY IF EXISTS "Admin read" ON public.online_meetings;
CREATE POLICY "Public read" ON public.online_meetings FOR SELECT TO anon USING (true);
CREATE POLICY "Admin read" ON public.online_meetings FOR SELECT TO authenticated
  USING ((SELECT public.is_kkg_admin()));
REVOKE SELECT ON TABLE public.online_meetings FROM anon, authenticated;
GRANT SELECT (id, title, scheduled_time, meet_url, status, agenda_note, meeting_notes)
  ON public.online_meetings TO anon;
GRANT SELECT ON TABLE public.online_meetings TO authenticated;

-- School account passwords and login history are never publicly readable.
ALTER TABLE public.school_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public app access" ON public.school_accounts;
DROP POLICY IF EXISTS "Admin school accounts" ON public.school_accounts;
CREATE POLICY "Admin school accounts" ON public.school_accounts
  FOR ALL TO authenticated
  USING ((SELECT public.is_kkg_admin()))
  WITH CHECK ((SELECT public.is_kkg_admin()));
REVOKE ALL ON TABLE public.school_accounts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.school_accounts TO authenticated;

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public app access" ON public.login_history;
DROP POLICY IF EXISTS "Teacher login insert" ON public.login_history;
DROP POLICY IF EXISTS "Authenticated login insert" ON public.login_history;
DROP POLICY IF EXISTS "Admin login history read" ON public.login_history;
DROP POLICY IF EXISTS "Admin login history update" ON public.login_history;
DROP POLICY IF EXISTS "Admin login history delete" ON public.login_history;
CREATE POLICY "Teacher login insert" ON public.login_history
  FOR INSERT TO anon WITH CHECK (role = 'teacher');
CREATE POLICY "Authenticated login insert" ON public.login_history
  FOR INSERT TO authenticated
  WITH CHECK (role = 'teacher' OR (SELECT public.is_kkg_admin()));
CREATE POLICY "Admin login history read" ON public.login_history
  FOR SELECT TO authenticated USING ((SELECT public.is_kkg_admin()));
CREATE POLICY "Admin login history update" ON public.login_history
  FOR UPDATE TO authenticated USING ((SELECT public.is_kkg_admin()))
  WITH CHECK ((SELECT public.is_kkg_admin()));
CREATE POLICY "Admin login history delete" ON public.login_history
  FOR DELETE TO authenticated USING ((SELECT public.is_kkg_admin()));
REVOKE ALL ON TABLE public.login_history FROM anon, authenticated;
GRANT INSERT ON TABLE public.login_history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.login_history TO authenticated;

-- Attendance form stays public; editing and deletion require the admin account.
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public app access" ON public.attendance;
DROP POLICY IF EXISTS "Public attendance insert" ON public.attendance;
DROP POLICY IF EXISTS "Public attendance read" ON public.attendance;
DROP POLICY IF EXISTS "Public attendance update" ON public.attendance;
DROP POLICY IF EXISTS "Public attendance delete" ON public.attendance;
DROP POLICY IF EXISTS "Admin attendance update" ON public.attendance;
DROP POLICY IF EXISTS "Admin attendance delete" ON public.attendance;
CREATE POLICY "Public attendance read" ON public.attendance
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public attendance insert" ON public.attendance
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin attendance update" ON public.attendance
  FOR UPDATE TO authenticated USING ((SELECT public.is_kkg_admin()))
  WITH CHECK ((SELECT public.is_kkg_admin()));
CREATE POLICY "Admin attendance delete" ON public.attendance
  FOR DELETE TO authenticated USING ((SELECT public.is_kkg_admin()));
REVOKE ALL ON TABLE public.attendance FROM anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.attendance TO anon, authenticated;
GRANT UPDATE, DELETE ON TABLE public.attendance TO authenticated;

-- Realtime publication, idempotent when this migration is rerun.
DO $$ DECLARE t TEXT; BEGIN
  FOREACH t IN ARRAY ARRAY[
    'drive_folders','schedules','transactions','teachers','announcements',
    'online_meetings','school_accounts','login_history','attendance'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- SIXDRIVE bucket: public download, admin-only upload/change/delete.
INSERT INTO storage.buckets (id, name, public)
VALUES ('kkg-files', 'kkg-files', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
DROP POLICY IF EXISTS "Public read KKG files" ON storage.objects;
DROP POLICY IF EXISTS "Public upload KKG files" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload KKG files" ON storage.objects;
DROP POLICY IF EXISTS "Admin update KKG files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete KKG files" ON storage.objects;
CREATE POLICY "Public read KKG files" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'kkg-files');
CREATE POLICY "Admin upload KKG files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kkg-files' AND (SELECT public.is_kkg_admin()));
CREATE POLICY "Admin update KKG files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'kkg-files' AND (SELECT public.is_kkg_admin()))
  WITH CHECK (bucket_id = 'kkg-files' AND (SELECT public.is_kkg_admin()));
CREATE POLICY "Admin delete KKG files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'kkg-files' AND (SELECT public.is_kkg_admin()));
