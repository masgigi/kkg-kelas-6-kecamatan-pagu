-- Jalankan SQL ini di Supabase SQL Editor untuk menambah kolom catatan rapat
ALTER TABLE online_meetings ADD COLUMN IF NOT EXISTS meeting_notes text DEFAULT '';
