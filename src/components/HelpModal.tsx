import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Shield,
  User,
  Calendar,
  HardDrive,
  DollarSign,
  Users,
  Video,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Phone,
  FileText,
  Lock,
  ChevronRight,
  Zap
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTeacherLogin?: () => void;
  onOpenAdminModal: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onOpenTeacherLogin,
  onOpenAdminModal
}) => {
  const [activeHelpTab, setActiveHelpTab] = useState<'fitur' | 'peran' | 'faq'>('fitur');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] my-8 overflow-hidden text-gray-900">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 p-5 border-b-4 border-black text-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center text-2xl font-black">
              📖
            </div>
            <div>
              <div className="inline-flex items-center gap-1 bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-0.5">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>PANDUAN PENGGUNAAN</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-black">
                Petunjuk Lengkap KKG6UP!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white text-black hover:bg-gray-100 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] font-black transition-transform active:scale-95"
            title="Tutup Panduan"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex border-b-2 border-black bg-gray-100 p-2 gap-2 text-xs font-black">
          <button
            onClick={() => setActiveHelpTab('fitur')}
            className={`flex-1 py-2.5 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              activeHelpTab === 'fitur'
                ? 'bg-purple-600 text-white border-black shadow-[2px_2px_0_0_#000]'
                : 'border-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Fitur-Fitur Utama</span>
          </button>
          <button
            onClick={() => setActiveHelpTab('peran')}
            className={`flex-1 py-2.5 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              activeHelpTab === 'peran'
                ? 'bg-purple-600 text-white border-black shadow-[2px_2px_0_0_#000]'
                : 'border-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Akses & Hak Peran</span>
          </button>
          <button
            onClick={() => setActiveHelpTab('faq')}
            className={`flex-1 py-2.5 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              activeHelpTab === 'faq'
                ? 'bg-purple-600 text-white border-black shadow-[2px_2px_0_0_#000]'
                : 'border-transparent text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Tanya Jawab (FAQ)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-6 text-sm">
          
          {/* TAB 1: FITUR-FITUR UTAMA */}
          {activeHelpTab === 'fitur' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 rounded-2xl border-2 border-purple-300 text-purple-900 font-medium text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>
                    Portal ini dirancang untuk memudahkan seluruh Guru Kelas 6 se-Kecamatan Pagu dalam mengakses perangkat ajar, jadwal KKG, laporan kas, dan komunikasi.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href="https://drive.google.com/drive/folders/1baa5tRmJiob88KcN_igCr0WNNry00j2i?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-yellow-300 text-black font-black text-[11px] rounded-lg border border-black shadow-[1px_1px_0_0_#000]"
                  >
                    📂 Induk Drive
                  </a>
                  <a
                    href="https://chat.whatsapp.com/H8awmBQpl361F1XfcsE6hG?s=cl&p=a&mlu=0&amv=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-emerald-400 text-black font-black text-[11px] rounded-lg border border-black shadow-[1px_1px_0_0_#000]"
                  >
                    💬 Grup WA
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Home */}
                <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🏠</span>
                    <h3 className="font-black text-black">1. Dashboard Utama</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Menampilkan countdown jadwal KKG terdekat, saldo kas terkini, akses cepat ke 4 folder Drive terpopuler, dan berita terbaru.
                  </p>
                </div>

                {/* Schedule */}
                <div className="p-4 bg-cyan-50 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📅</span>
                    <h3 className="font-black text-black">2. Agenda KKG</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Melihat lokasi, tanggal, waktu, dan rincian agenda pertemuannya. Anda juga dapat mengaktifkan pengingat notifikasi pertemuan.
                  </p>
                </div>

                {/* Drive */}
                <div className="p-4 bg-pink-50 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📚</span>
                    <h3 className="font-black text-black">3. SixDrive (Bank Berkas)</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Akses langsung ke Google Drive berisi Modul Ajar, Bank Soal STS/SAS, Canva Presentasi, dan Dokumen Asesmen Kurikulum Merdeka.
                  </p>
                </div>

                {/* Cash */}
                <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">💸</span>
                    <h3 className="font-black text-black">4. SixCash (Transparansi Kas)</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Mencatat seluruh rekapitulasi iuran & pengeluaran KKG. Dilengkapi fitur <b>Cetak Laporan PDF</b> resmi untuk pertanggungjawaban.
                  </p>
                </div>

                {/* Crew */}
                <div className="p-4 bg-orange-50 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">👩‍🏫</span>
                    <h3 className="font-black text-black">5. SixCrew (Database Guru)</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Direktori lengkap kontak guru kelas 6 se-Kecamatan Pagu. Klik tombol WhatsApp untuk langsung terhubung tanpa simpan nomor manual.
                  </p>
                </div>

                {/* Meeting */}
                <div className="p-4 bg-purple-50 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎥</span>
                    <h3 className="font-black text-black">6. Rapat Online (Zoom/Meet)</h3>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Fasilitas KKG daring/virtual. Menyediakan link langsung ke Google Meet / Zoom beserta password dan jadwal pelaksanaan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AKSES & PERAN */}
          {activeHelpTab === 'peran' && (
            <div className="space-y-4">
              {/* Public Mode */}
              <div className="p-4 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0_0_#000]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 border border-black flex items-center justify-center font-bold">
                      👤
                    </div>
                    <h3 className="font-black text-base text-black">1. Tamu / Mode Publik</h3>
                  </div>
                  <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded border border-black">
                    Akses Standar
                  </span>
                </div>
                <ul className="text-xs text-gray-700 space-y-1.5 list-disc pl-5">
                  <li>Melihat seluruh agenda jadwal KKG & informasi rapat.</li>
                  <li>Membuka link Google Drive modul ajar & bank soal.</li>
                  <li>Melihat rekap kas transparan & mencetak laporan PDF.</li>
                  <li>Menghubungi rekan guru via tombol WhatsApp.</li>
                </ul>
              </div>

              {/* Teacher Mode */}
              <div className="p-4 bg-cyan-50 rounded-2xl border-2 border-black shadow-[3px_3px_0_0_#000]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-300 border border-black flex items-center justify-center font-bold">
                      🏫
                    </div>
                    <h3 className="font-black text-base text-black">2. Mode Guru Sekolah</h3>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTeacherLogin();
                    }}
                    className="bg-cyan-400 hover:bg-cyan-500 text-black text-[10px] font-black px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0_0_#000] flex items-center gap-1"
                  >
                    <span>Login Sekolah</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-700 mb-2">
                  Pilih nama SD tempat Anda mengajar (misal: <i>SDN Pagu 1</i>) untuk mengkonfirmasi kehadiran dan identitas sekolah dalam portal.
                </p>
              </div>

              {/* Admin Mode */}
              <div className="p-4 bg-purple-100 rounded-2xl border-2 border-black shadow-[3px_3px_0_0_#000]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white border border-black flex items-center justify-center font-bold">
                      🛡️
                    </div>
                    <h3 className="font-black text-base text-black">3. Pengurus / Admin KKG</h3>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminModal();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0_0_#000] flex items-center gap-1"
                  >
                    <span>Buka Panel Admin</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="bg-purple-50 border border-purple-300 rounded-xl p-2 text-xs font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-900 shrink-0" />
                  <span>Masukkan Password Admin Pengurus KKG yang telah diberikan oleh pengurus.</span>
                </div>
                <ul className="text-xs text-gray-800 space-y-1 list-disc pl-5 font-medium">
                  <li><b>Kelola Agenda:</b> Tambah / hapus jadwal pertemuan KKG.</li>
                  <li><b>Kelola Kas:</b> Catat iuran masuk & pengeluaran kas bulanan.</li>
                  <li><b>Kelola Drive:</b> Tambah link folder materi/bank soal baru.</li>
                  <li><b>Rapat Online:</b> Perbarui link Google Meet & Zoom.</li>
                  <li><b>SixUpdate:</b> Rilis pengumuman resmi & info mendadak.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ / TANYA JAWAB */}
          {activeHelpTab === 'faq' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-gray-50 rounded-2xl border-2 border-black">
                <h4 className="font-black text-black text-xs mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  Bagaimana jika saya ingin mengunduh berkas soal / modul ajar?
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Buka tab <b>Drive</b> (atau SixDrive di Dashboard), lalu klik salah satu folder (misal: Bank Soal STS). Anda akan langsung diarahkan ke Google Drive KKG untuk mengunduh berkasnya.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border-2 border-black">
                <h4 className="font-black text-black text-xs mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  Bagaimana cara mencetak rekap kas untuk Laporan Pertanggungjawaban (LPJ)?
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Masuk ke tab <b>Kas</b>, lalu klik tombol <b>"Cetak PDF Laporan"</b> di kanan atas. Laporan bersih siap cetak/simpan akan terbentuk secara otomatis.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border-2 border-black">
                <h4 className="font-black text-black text-xs mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  Apakah data yang ditambah admin akan tersimpan dan muncul di perangkat lain?
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                    Ya! Seluruh perubahan data tersimpan secara terpusat di Supabase. Informasi publik akan diperbarui di perangkat lain, sedangkan data pribadi hanya dapat dikelola oleh admin yang sudah masuk.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border-2 border-black">
                <h4 className="font-black text-black text-xs mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  Bagaimana jika lupa password Admin?
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Gunakan menu pemulihan password Supabase pada email admin resmi. Jangan membagikan password admin kepada orang lain.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-100 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-gray-700">
          <div className="flex items-center gap-1.5 text-black font-black">
            <span>⚡ KKG SIXVIBE • KKG6UP!</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] font-black transition-transform active:scale-95"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
