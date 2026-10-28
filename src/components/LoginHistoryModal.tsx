import React, { useState } from 'react';
import { LoginHistoryItem } from '../types';
import { History, X, Shield, User, Search, Download, Clock, School } from 'lucide-react';

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginHistory: LoginHistoryItem[];
  isLoading: boolean;
  error: string;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({
  isOpen,
  onClose,
  loginHistory,
  isLoading,
  error
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredLogs = loginHistory.filter(
    (log) =>
      log.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.timestamp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (loginHistory.length === 0 || isLoading) return;

    const headers = ['ID', 'Peran', 'Sekolah', 'Nama Guru', 'Waktu Login', 'Status'];
    const rows = loginHistory.map((l) => [
      l.id,
      l.role === 'admin' ? 'Pengurus Admin' : 'Guru Kelas 6',
      l.schoolName,
      l.teacherName,
      l.timestamp,
      l.status
    ]);
    const escapeCell = (value: string) => {
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Riwayat_Login_KKG_Pagu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] my-8 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-300 via-yellow-300 to-amber-400 p-5 border-b-4 border-black flex items-center justify-between text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black leading-tight">
                📜 Riwayat Login Portal KKG
              </h2>
              <p className="text-xs font-bold text-black/80">
                Catatan aktivitas login guru & pengurus KKG Pagu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup riwayat login"
            className="p-1.5 bg-white hover:bg-gray-100 text-black rounded-xl border-2 border-black font-black shadow-[2px_2px_0_0_#000]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 bg-gray-50 border-b-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Cari riwayat login"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama guru / sekolah..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-black font-bold text-xs bg-white shadow-[2px_2px_0_0_#000] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              disabled={isLoading || loginHistory.length === 0}
              className="px-3 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV</span>
            </button>

          </div>
        </div>

        {/* History List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {error && <p role="alert" className="border-2 border-black rounded-xl bg-red-100 p-3 text-sm font-bold">{error}</p>}
          {isLoading ? (
            <p role="status" className="py-10 text-center font-bold">Memuat riwayat login dari server…</p>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 bg-purple-50 rounded-2xl border-2 border-dashed border-black">
              <History className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <p className="font-black text-sm text-black">{searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat login'}</p>
              <p className="text-xs font-bold text-gray-500 mt-0.5">
                {error ? 'Coba buka kembali setelah koneksi pulih.' : searchTerm ? 'Coba kata kunci lain.' : 'Catatan login guru dan pengurus akan tampil di sini.'}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl border-2 border-black p-3.5 shadow-[3px_3px_0_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black text-[10px] px-2.5 py-0.5 rounded-full border border-black shadow-[1px_1px_0_0_#000] flex items-center gap-1 ${
                        log.role === 'admin'
                          ? 'bg-purple-600 text-white'
                          : 'bg-cyan-300 text-black'
                      }`}
                    >
                      {log.role === 'admin' ? (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>PENGURUS ADMIN</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>GURU KELAS 6</span>
                        </>
                      )}
                    </span>

                    <span className="bg-emerald-200 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded border border-black">
                      🟢 {log.status}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-black">{log.teacherName}</h4>

                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Unit Kerja: <strong>{log.schoolName}</strong></span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-extrabold text-gray-600 bg-amber-100 px-2.5 py-1 rounded-lg border border-black flex items-center gap-1 sm:justify-end">
                    <Clock className="w-3 h-3 text-amber-700" />
                    <span>{log.timestamp}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="bg-purple-100 border-t-2 border-black p-3 text-center text-[11px] font-extrabold text-purple-900">
          Riwayat login dimuat dari server untuk pengurus yang memiliki akses.
        </div>

      </div>
    </div>
  );
};
