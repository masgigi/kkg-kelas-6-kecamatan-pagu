import React, { useState } from 'react';
import { UserSession } from '../types';
import { User, Key, CheckCircle2, AlertCircle, LogOut, Printer, School, ShieldCheck, History } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  setUserSession: (session: UserSession) => void;
  onOpenLoginHistory?: () => void;
  onRecordLoginHistory?: (entry: { role: 'teacher' | 'admin'; schoolName: string; teacherName: string }) => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  userSession,
  setUserSession,
  onOpenLoginHistory,
  onRecordLoginHistory
}) => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSchool.trim()) {
      setErrorMsg('Masukkan nama sekolah terlebih dahulu.');
      return;
    }

    const { data, error } = await supabase.rpc('verify_school_login', {
      p_school_name: selectedSchool.trim(),
      p_password: passwordInput
    });
    const verified = Array.isArray(data) ? data[0] : data;

    if (!error && verified) {
      setUserSession({
        isLoggedIn: true,
        role: 'teacher',
        schoolName: verified.school_name,
        teacherName: verified.teacher_name
      });

      if (onRecordLoginHistory) {
        onRecordLoginHistory({
          role: 'teacher',
          schoolName: verified.school_name,
          teacherName: verified.teacher_name
        });
      }

      setPasswordInput('');
      onClose();
    } else {
      setErrorMsg(error ? 'Login belum dapat diproses. Silakan coba lagi.' : 'Password sekolah salah.');
    }
  };

  const handleLogout = () => {
    setUserSession({
      isLoggedIn: false,
      role: 'guest'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[8px_8px_0_0_#000] max-w-md w-full space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-300 text-black border-2 border-black flex items-center justify-center font-black shadow-[1px_1px_0_0_#000]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Portal Akses Guru</h3>
              <p className="text-[10px] font-bold text-gray-500">
                Input password sesuai nama sekolah masing-masing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-red-400 text-black border-2 border-black font-black text-sm shadow-[1px_1px_0_0_#000]"
          >
            ✕
          </button>
        </div>

        {/* If logged in as Teacher */}
        {userSession.isLoggedIn && userSession.role === 'teacher' ? (
          <div className="space-y-4">
            <div className="bg-emerald-100 rounded-2xl border-2 border-black p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>AKUN GURU AKTIF</span>
              </div>
              <h4 className="text-lg font-black text-black">{userSession.teacherName}</h4>
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <School className="w-4 h-4 text-purple-700" />
                <span>Unit Kerja: <strong>{userSession.schoolName}</strong></span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert(`📥 Surat Keterangan Keanggotaan KKG untuk ${userSession.teacherName} (${userSession.schoolName}) telah diunduh!`);
                }}
                className="flex-1 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Status Member</span>
              </button>

              <button
                onClick={handleLogout}
                className="py-2.5 px-4 bg-red-400 hover:bg-red-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Nama Sekolah Asal
              </label>
              <input
                type="text"
                required
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                placeholder="Contoh: SDN BULUPASAR"
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Password Sekolah
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password sekolah"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-bold mt-1">
                Password diperiksa secara aman oleh server Supabase dan tidak disimpan di halaman web.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-100 border-2 border-black text-red-900 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-cyan-300 hover:bg-cyan-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95"
            >
              MASUK KE PORTAL GURU →
            </button>
          </form>
        )}

        {onOpenLoginHistory && (
          <div className="pt-2 border-t-2 border-black flex justify-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLoginHistory();
              }}
              className="text-xs font-black text-purple-700 hover:underline flex items-center gap-1.5 py-1"
            >
              <History className="w-4 h-4" />
              <span>Lihat Riwayat Login Guru & Admin →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
