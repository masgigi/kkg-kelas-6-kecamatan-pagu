<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Portal KKG Kelas 6 Kecamatan Pagu

This contains everything you need to run your app locally.

Data portal disimpan di Supabase dan disinkronkan antarlaptop/HP melalui Realtime.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Salin `.env.example` menjadi `.env.local`.
3. Isi URL dan publishable key Supabase di `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   VITE_SUPABASE_ADMIN_EMAIL=admin@example.com
   ```

4. Buka **Supabase Dashboard → SQL Editor**, lalu jalankan seluruh isi
   [`supabase_migration.sql`](./supabase_migration.sql). SQL ini membuat tabel,
   kebijakan RLS, Realtime, dan bucket `kkg-files`.
5. Jalankan aplikasi:

   `npm run dev`

## Variabel deployment

Tambahkan tiga variabel berikut pada layanan hosting (misalnya Vercel/Netlify),
kemudian lakukan deploy ulang:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_ADMIN_EMAIL`

Jangan pernah memasukkan `service_role` atau secret key ke variabel `VITE_*`.
Frontend hanya boleh memakai publishable key.

## Pemakaian pertama admin

1. Buka menu **Kelola Web**.
2. Buat password baru minimal 8 karakter.
3. Tekan **Pemakaian Pertama: Buat Akun Admin**.
4. Jika diminta, buka email admin dan tekan tautan konfirmasi Supabase.
5. Kembali ke aplikasi lalu masuk memakai password yang dibuat.

RLS membatasi perubahan data hanya untuk email admin yang dikonfigurasi. Kata
sandi admin tidak lagi disimpan di kode aplikasi.

## Data yang tersimpan

- jadwal dan agenda KKG;
- transaksi kas;
- data guru dan sekolah;
- pengumuman dan rapat daring;
- riwayat login dan absensi;
- berkas yang diunggah ke bucket `kkg-files`.

Browser tetap menyimpan cache lokal agar halaman cepat tampil. Supabase menjadi
sumber data bersama; perubahan di satu perangkat akan muncul di perangkat lain.
