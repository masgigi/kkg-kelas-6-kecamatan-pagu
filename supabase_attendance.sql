-- Absensi KKG: QR permanen mengarah ke halaman aplikasi dengan ?absen=1
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
