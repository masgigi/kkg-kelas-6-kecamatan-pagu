import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, LogOut, Download, Shield } from 'lucide-react';
import { UserSession } from '../types';
import { supabase } from '../lib/supabase';
import { storage } from '../utils/storage';
import { PortalModal } from '../features/portal/PortalModal';
import { featureLinks } from '../features/portal/PortalHub';

interface AdminModalProps {
  isOpen: boolean; onClose: () => void; userSession: UserSession;
  setUserSession: (session: UserSession) => void;
  onNavigate: (tab: string) => void;
  onOpenLoginHistory?: () => void;
  onRecordLoginHistory?: (entry: { role: 'teacher' | 'admin'; schoolName: string; teacherName: string }) => Promise<void>;
}

export function AdminModal({ isOpen, onClose, userSession, setUserSession, onNavigate, onOpenLoginHistory, onRecordLoginHistory }: AdminModalProps) {
  const [email, setEmail] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const close = () => { setPassword(''); setShowPassword(false); setError(''); setInfo(''); onClose(); };
  useEffect(() => {
    if (!isOpen || !userSession.isLoggedIn || userSession.role !== 'admin') return;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setActiveEmail(data.user?.email || '');
    });
    return () => { active = false; };
  }, [isOpen, userSession.isLoggedIn, userSession.role]);
  const activate = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user?.email) throw new Error('Sesi akun belum dapat diverifikasi. Silakan masuk lagi.');
    const { data, error } = await supabase.rpc('is_kkg_admin');
    if (error) throw new Error('Status akses pengurus belum dapat diperiksa. Coba lagi.');
    if (data !== true) {
      await supabase.auth.signOut();
      throw new Error('Email ini belum disetujui sebagai pengurus KKG. Hubungi pengelola akses.');
    }
    setActiveEmail(userData.user.email);
    setUserSession({ isLoggedIn: true, role: 'admin' });
    setPassword(''); setShowPassword(false);
    try {
      await onRecordLoginHistory?.({ role: 'admin', schoolName: 'Korwil Pagu (Admin KKG)', teacherName: userData.user.email });
    } catch {
      setInfo('Akses admin aktif, tetapi riwayat login belum tercatat. Periksa koneksi lalu coba masuk kembali nanti.');
    }
  };
  const authenticate = async (create = false) => {
    if (busy) return;
    setError(''); setInfo('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setError('Masukkan alamat email yang valid.'); return; }
    if (!password) { setError('Masukkan password akun Anda.'); return; }
    if (create && password.length < 8) { setError('Gunakan password minimal 8 karakter.'); return; }
    setBusy(true);
    try {
      const credentials = { email: normalizedEmail, password };
      const { data, error } = create ? await supabase.auth.signUp(credentials) : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (data.session) await activate();
      else { setPassword(''); setInfo('Jika konfirmasi email diperlukan, periksa kotak masuk Anda, lalu masuk kembali. Akses admin tetap memerlukan persetujuan pengurus.'); }
    } catch (e) {
      const message = (e as Error).message;
      setError(message === 'Invalid login credentials' ? 'Email atau password tidak cocok. Periksa kembali data akun Anda.' : message);
    } finally { setBusy(false); }
  };
  const logout = async () => {
    setBusy(true); setError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setActiveEmail('');
      setUserSession({ isLoggedIn: false, role: 'guest' });
      close(); onNavigate('home');
    } catch { setError('Belum berhasil keluar. Periksa koneksi lalu coba lagi.'); }
    finally { setBusy(false); }
  };
  if (!isOpen) return null;
  const admin = userSession.isLoggedIn && userSession.role === 'admin';
  const links = [...featureLinks,
    { id: 'schedule', title: 'Jadwal Kegiatan', emoji: '📅', color: 'bg-pink-200', note: 'Waktu, lokasi, undangan, dan agenda' },
    { id: 'crew', title: 'Data Guru', emoji: '👩‍🏫', color: 'bg-cyan-200', note: 'Tambah dan perbarui anggota' },
    { id: 'cash', title: 'Kas KKG', emoji: '💸', color: 'bg-emerald-200', note: 'Pemasukan, pengeluaran, dan laporan' },
    { id: 'meeting', title: 'Rapat Online', emoji: '🎥', color: 'bg-orange-200', note: 'Tautan rapat dan catatan pertemuan' },
    { id: 'attendance', title: 'Rekap Absensi', emoji: '✅', color: 'bg-lime-200', note: 'Kehadiran peserta kegiatan' }
  ];
  return <PortalModal title={admin ? '🌈 Pusat Pengelolaan KKG' : '🔐 Masuk Pengurus KKG'} onClose={close} busy={busy}>
    <div className="space-y-5">
      {admin ? <>
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-black rounded-2xl p-4"><p className="font-black flex gap-2 items-center"><Shield size={18} />Mode pengurus aktif</p><p className="text-xs mt-2 break-all">{activeEmail || 'Memuat email akun…'}</p><p className="text-sm mt-2">Pilih bagian, lalu gunakan tombol Tambah atau Edit pada halaman tersebut.</p></div>
        <button className="portal-button bg-yellow-300 w-full" onClick={() => { close(); onNavigate('services'); }}>📥 Tinjau kiriman guru & usulan</button>
        <nav aria-label="Menu pengelolaan admin" className="grid sm:grid-cols-2 gap-3">{links.map(link => <button key={link.id} className={`${link.color} p-4 text-left rounded-2xl border-2 border-black shadow-[3px_3px_0_#000] hover:-translate-y-0.5 transition-transform`} onClick={() => { close(); onNavigate(link.id); }}><span className="font-black block">{link.emoji} {link.title}</span><span className="text-xs font-semibold block mt-1">{link.note}</span></button>)}</nav>
        <details className="border-2 border-black rounded-xl p-4 bg-gray-50"><summary className="font-black cursor-pointer">Alat pengurus</summary><div className="space-y-3 mt-4">
          {onOpenLoginHistory && <button className="portal-button bg-purple-200" onClick={() => { close(); onOpenLoginHistory(); }}>Lihat riwayat login</button>}
          <button className="portal-button bg-emerald-200" onClick={() => storage.exportAllData()}><Download size={16} />Unduh salinan data lama</button>
          <p className="text-xs font-semibold text-gray-600">Salinan ini berasal dari cache perangkat: jadwal, kas, guru, pengumuman, folder, rapat, dan akun sekolah. Belum mencakup konten baru, kiriman, absensi, riwayat login, atau berkas unggahan.</p>
        </div></details>
        <button disabled={busy} className="portal-button bg-pink-200 w-full" onClick={() => void logout()}><LogOut size={16} />{busy ? 'Memproses…' : 'Keluar dari Admin'}</button>
      </> : <form onSubmit={e => { e.preventDefault(); void authenticate(); }} className="space-y-4">
        <p className="text-sm font-semibold">Masuk untuk mengelola informasi, kegiatan, bahan ajar, dan kiriman guru. Hanya email yang sudah disetujui pengurus yang mendapat akses admin.</p>
        <label className="portal-label">Email pengurus<input autoFocus required disabled={busy} type="email" inputMode="email" className="portal-input" autoComplete="username" placeholder="nama@sekolah.sch.id" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="portal-label">Password akun<input required disabled={busy} type={showPassword ? 'text' : 'password'} autoComplete="current-password" className="portal-input" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button type="button" className="flex gap-2 items-center text-xs font-bold" aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}{showPassword ? 'Sembunyikan password' : 'Tampilkan password'}</button>
        <button type="submit" disabled={busy} className="portal-button bg-purple-600 text-white w-full">{busy ? 'Memproses…' : 'Masuk ke Pusat Pengelolaan'}</button>
        <details className="border-2 border-black rounded-xl p-3 bg-cyan-50"><summary className="font-bold text-sm cursor-pointer">Belum punya akun?</summary><p className="text-xs mt-3 mb-3">Gunakan email Anda sendiri dan buat password minimal 8 karakter. Anda mungkin perlu mengonfirmasi email. Pendaftaran akun tidak otomatis memberikan akses admin; email Anda harus disetujui pengurus terlebih dahulu.</p><button type="button" disabled={busy} onClick={() => void authenticate(true)} className="portal-button bg-cyan-300">Daftarkan akun saya</button></details>
      </form>}
      {error && <p role="alert" className="portal-error">{error}</p>}
      {info && <p role="status" className="bg-emerald-100 border-2 border-black rounded-xl p-3 text-sm font-bold">{info}</p>}
    </div>
  </PortalModal>;
}
