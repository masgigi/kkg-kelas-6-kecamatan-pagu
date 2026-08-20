import React, { useState, useRef } from 'react';
import { UserSession } from '../types';
import { Shield, Key, Lock, CheckCircle2, AlertCircle, LogOut, RefreshCw, Download, Upload, History } from 'lucide-react';
import { storage } from '../utils/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  setUserSession: (session: UserSession) => void;
  onOpenLoginHistory?: () => void;
  onRecordLoginHistory?: (entry: { role: 'teacher' | 'admin'; schoolName: string; teacherName: string }) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  userSession,
  setUserSession,
  onOpenLoginHistory,
  onRecordLoginHistory
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'igigih') {
      setUserSession({
        isLoggedIn: true,
        role: 'admin'
      });

      if (onRecordLoginHistory) {
        onRecordLoginHistory({
          role: 'admin',
          schoolName: 'Korwil Pagu (Admin KKG)',
          teacherName: 'Pengurus Utama KKG Pagu'
        });
      }

      setPasswordInput('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Password Admin salah!');
    }
  };

  const handleLogout = () => {
    setUserSession({
      isLoggedIn: false,
      role: 'guest'
    });
  };

  const handleBackup = () => {
    storage.exportAllData();
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Apakah Anda yakin ingin me-restore data dari file backup ini? Data aplikasi akan diperbarui.')) {
          storage.importAllData(json);
        }
      } catch (err) {
        alert('Gagal membaca file backup! Pastikan format file adalah JSON backup kkg6up yang valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[8px_8px_0_0_#000] max-w-md w-full space-y-4 text-gray-900">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white border-2 border-black flex items-center justify-center font-black shadow-[1px_1px_0_0_#000]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Mode Pengurus / Admin</h3>
              <p className="text-[10px] font-bold text-gray-500">
                Akses kelola data jadwal, kas, guru, & backup data
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

        {userSession.role === 'admin' ? (
          <div className="space-y-4">
            <div className="bg-purple-100 rounded-2xl border-2 border-black p-4 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-black text-xs">
                <CheckCircle2 className="w-5 h-5 text-purple-700" />
                <span>STATUS: ADMIN PENGURUS KKG AKTIF</span>
              </div>
              <p className="text-xs font-bold text-gray-700">
                Bapak/Ibu Pengurus dapat mengelola data, mencetak laporan, serta melakukan backup & restore seluruh data aplikasi.
              </p>
            </div>

            {/* Hidden File Input for Restore */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFile}
              accept=".json"
              className="hidden"
            />

            {/* Backup & Restore Action Section */}
            <div className="p-3 bg-yellow-50 rounded-2xl border-2 border-black space-y-2">
              <p className="text-xs font-black text-black">📦 FITUR BACKUP & RESTORE DATA</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBackup}
                  className="py-2.5 px-3 bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Backup Data</span>
                </button>

                <button
                  onClick={handleRestoreClick}
                  className="py-2.5 px-3 bg-cyan-400 hover:bg-cyan-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore Data</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-600 font-bold">
                💡 Backup mendownload file JSON data web. Restore memulihkan data dari file JSON backup.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin membangun ulang & mereset seluruh data di Firestore dan browser ke standar awal? Semua data akan disinkronkan kembali dengan struktur baru.')) {
                    await storage.resetToDefault();
                  }
                }}
                className="w-full py-2.5 bg-amber-300 hover:bg-amber-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
                <span>⚡ Atur Ulang & Bangun Data Firestore</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-400 hover:bg-red-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Mode Admin</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdminAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Masukkan Password Admin
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password admin"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-100 border-2 border-black text-red-900 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95"
            >
              MASUK MODE ADMIN →
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
