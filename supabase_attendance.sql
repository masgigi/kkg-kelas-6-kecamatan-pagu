-- Absensi KKG: QR permanen mengarah ke halaman aplikasi dengan ?absen=1.
-- Jalankan supabase_migration.sql untuk pemasangan lengkap dan policy admin aman.
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  school TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Hadir' CHECK (status IN ('Hadir','Izin')),
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (schedule_id, teacher_id)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public attendance insert" ON attendance;
DROP POLICY IF EXISTS "Public attendance read" ON attendance;
CREATE POLICY "Public attendance insert" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public attendance read" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public attendance update" ON attendance;
DROP POLICY IF EXISTS "Public attendance delete" ON attendance;

REVOKE UPDATE, DELETE ON TABLE public.attendance FROM anon;
GRANT SELECT, INSERT ON TABLE public.attendance TO anon, authenticated;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
