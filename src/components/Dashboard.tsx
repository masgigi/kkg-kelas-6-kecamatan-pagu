import React from 'react';
import { HeroBanner } from './HeroBanner';
import { ScheduleItem, DriveFolder, AnnouncementItem } from '../types';
import { Calendar, HardDrive, DollarSign, Users, Sparkles, MapPin, Clock, ArrowRight, Video, FileText, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../utils/export';

interface DashboardProps {
  schedules: ScheduleItem[];
  driveFolders: DriveFolder[];
  announcements: AnnouncementItem[];
  cashBalance: number;
  totalTeachersCount: number;
  setActiveTab: (tab: string) => void;
  onOpenHelpModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  schedules,
  driveFolders,
  announcements,
  cashBalance,
  totalTeachersCount,
  setActiveTab,
  onOpenHelpModal
}) => {
  const nextSchedule = schedules.find((s) => s.status === 'Akan Datang' || s.status === 'Persiapan') || schedules[0];
  const totalFiles = driveFolders.reduce((acc, f) => acc + f.fileCount, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <HeroBanner
        nextSchedule={nextSchedule}
        setActiveTab={setActiveTab}
        cashBalance={cashBalance}
        onOpenHelpModal={onOpenHelpModal}
      />

      {/* Greeting & Quick Stat Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👋</span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-black">
              Halo, Guru Hebat Kelas 6!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-gray-600">
              Semua informasi KKG Kecamatan Pagu ada di satu tempat.
            </p>
          </div>
        </div>

        {/* 4 Colorful Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: KKG Berikutnya */}
          <button
            onClick={() => setActiveTab('schedule')}
            className="p-4 rounded-2xl bg-pink-300 border-3 border-black shadow-[4px_4px_0_0_#000] text-left transition-transform active:scale-95 hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black mb-3 shadow-[2px_2px_0_0_#000] group-hover:rotate-6 transition-transform">
              <Calendar className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase text-gray-800">
              📅 KKG Berikutnya
            </p>
            <p className="text-sm sm:text-base font-black text-black leading-tight mt-0.5">
              {nextSchedule ? nextSchedule.date : 'Belum Ada'}
            </p>
            <p className="text-xs font-bold text-pink-900 mt-1 truncate">
              📍 {nextSchedule ? nextSchedule.location : 'Lokasi Belum Diatur'}
            </p>
          </button>

          {/* Card 2: File Pembelajaran */}
          <button
            onClick={() => setActiveTab('drive')}
            className="p-4 rounded-2xl bg-yellow-300 border-3 border-black shadow-[4px_4px_0_0_#000] text-left transition-transform active:scale-95 hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black mb-3 shadow-[2px_2px_0_0_#000] group-hover:rotate-6 transition-transform">
              <HardDrive className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase text-gray-800">
              📚 File Pembelajaran
            </p>
            <p className="text-sm sm:text-base font-black text-black leading-tight mt-0.5">
              {totalFiles} File
            </p>
            <p className="text-xs font-bold text-amber-900 mt-1">Google Drive SIXDRIVE</p>
          </button>

          {/* Card 3: Saldo Kas */}
          <button
            onClick={() => setActiveTab('cash')}
            className="p-4 rounded-2xl bg-emerald-300 border-3 border-black shadow-[4px_4px_0_0_#000] text-left transition-transform active:scale-95 hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black mb-3 shadow-[2px_2px_0_0_#000] group-hover:rotate-6 transition-transform">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase text-gray-800">
              💰 Saldo Kas KKG
            </p>
            <p className="text-sm sm:text-base font-black text-black leading-tight mt-0.5">
              {formatRupiah(cashBalance)}
            </p>
            <p className="text-xs font-bold text-emerald-900 mt-1">Transparan & Update</p>
          </button>

          {/* Card 4: Guru Kelas 6 */}
          <button
            onClick={() => setActiveTab('crew')}
            className="p-4 rounded-2xl bg-cyan-300 border-3 border-black shadow-[4px_4px_0_0_#000] text-left transition-transform active:scale-95 hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center font-black mb-3 shadow-[2px_2px_0_0_#000] group-hover:rotate-6 transition-transform">
              <Users className="w-5 h-5 text-cyan-700" />
            </div>
            <p className="text-[10px] sm:text-xs font-black uppercase text-gray-800">
              👩‍🏫 Database Guru
            </p>
            <p className="text-sm sm:text-base font-black text-black leading-tight mt-0.5">
              {totalTeachersCount} Guru
            </p>
            <p className="text-xs font-bold text-cyan-900 mt-1">Kecamatan Pagu</p>
          </button>
        </div>
      </div>

      {/* 🔔 What's New Feature Highlight */}
      {nextSchedule && (
        <div className="bg-white rounded-3xl border-4 border-black p-5 sm:p-6 shadow-[6px_6px_0_0_#000]">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <h3 className="text-lg font-black text-black flex items-center gap-2">
              🔔 What's New? — KKG Selanjutnya
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-xl border border-black shadow-[2px_2px_0_0_#000]">
                  📅 {nextSchedule.date}
                </span>
                <span className="bg-amber-300 text-black font-black text-xs px-3 py-1 rounded-xl border border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {nextSchedule.time || '09.00 WIB'}
                </span>
                <span className="bg-emerald-300 text-black font-black text-xs px-3 py-1 rounded-xl border border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {nextSchedule.location}
                </span>
              </div>

              <h4 className="text-xl font-black text-black">
                {nextSchedule.title}
              </h4>

              <div className="bg-gray-50 rounded-2xl border-2 border-black p-3 space-y-1.5">
                <p className="text-xs font-black text-gray-700 uppercase">Agenda Utama:</p>
                {nextSchedule.agenda.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-extrabold text-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-center h-full bg-purple-100 p-4 rounded-2xl border-2 border-black text-center">
              <p className="text-xs font-black text-purple-900">
                Siapkan administrasi & laptop Anda!
              </p>
              <button
                onClick={() => setActiveTab('schedule')}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>LIHAT DETAIL & LOKASI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('meeting')}
                className="w-full py-2 bg-pink-400 hover:bg-pink-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] transition-transform active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Video className="w-4 h-4" />
                <span>Link Rapat Online</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Drive Category Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-black flex items-center gap-2">
            <span>📚</span> SIXDRIVE Quick Access
          </h3>
          <button
            onClick={() => setActiveTab('drive')}
            className="text-xs font-extrabold text-purple-600 hover:underline flex items-center gap-1"
          >
            <span>Semua Folder →</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {driveFolders.map((folder) => (
            <a
              key={folder.id}
              href={folder.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-2xl border-2 border-black shadow-[3px_3px_0_0_#000] hover:-translate-y-1 transition-transform text-center flex flex-col items-center justify-center group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${folder.color} border-2 border-black text-white flex items-center justify-center font-black mb-2 shadow-[2px_2px_0_0_#000] group-hover:scale-110 transition-transform`}>
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-black text-xs text-black line-clamp-1">
                {folder.title}
              </h4>
              <p className="text-[10px] font-extrabold text-purple-700 mt-0.5">
                {folder.fileCount} file →
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Latest Announcements Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-black flex items-center gap-2">
            <span>📢</span> Pengumuman Terbaru
          </h3>
          <button
            onClick={() => setActiveTab('update')}
            className="text-xs font-extrabold text-purple-600 hover:underline"
          >
            Lihat Semua →
          </button>
        </div>

        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-3xl border-3 border-black p-5 shadow-[4px_4px_0_0_#000]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="bg-pink-400 text-black font-black text-xs px-2.5 py-0.5 rounded-lg border border-black shadow-[1px_1px_0_0_#000]">
                  {ann.author}
                </span>
                <span className="text-xs font-bold text-gray-500">{ann.date}</span>
              </div>
              <h4 className="text-base font-black text-black mb-2">{ann.title}</h4>
              <p className="text-xs font-medium text-gray-800 whitespace-pre-line leading-relaxed mb-3">
                {ann.content}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ann.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-yellow-200 text-black text-[10px] font-extrabold px-2 py-0.5 rounded border border-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
