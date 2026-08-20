import React from 'react';
import { Zap, Calendar, HardDrive, Sparkles, Video, DollarSign, BellRing, HelpCircle } from 'lucide-react';
import { ScheduleItem } from '../types';

interface HeroBannerProps {
  nextSchedule?: ScheduleItem;
  setActiveTab: (tab: string) => void;
  cashBalance: number;
  onOpenHelpModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ nextSchedule, setActiveTab, cashBalance, onOpenHelpModal }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 border-4 border-black p-5 sm:p-8 shadow-[8px_8px_0_0_#000] mb-8 text-white">
      {/* Decorative Floating Pop Elements */}
      <div className="absolute top-3 right-4 bg-yellow-300 text-black border-2 border-black font-black text-xs px-3 py-1 rounded-full shadow-[2px_2px_0_0_#000] rotate-3 animate-bounce hidden sm:flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Kecamatan Pagu</span>
      </div>

      <div className="absolute -bottom-6 -right-6 w-32 h-32 sm:w-48 sm:h-48 bg-cyan-300/30 rounded-full blur-2xl pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-yellow-300 text-black border-2 border-black font-black text-xs px-3 py-1.5 rounded-full shadow-[2px_2px_0_0_#000] mb-3">
          <Zap className="w-4 h-4 fill-black" />
          <span>WELCOME TO KKG SIXVIBE!</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-none mb-2 drop-shadow-[2px_2px_0_#fff]">
          KKG6UP! <span className="text-yellow-300">⚡</span>
        </h1>

        <p className="text-sm sm:text-lg font-bold text-black/90 mb-6 max-w-xl leading-snug">
          Tempat Guru Kelas 6 Kecamatan Pagu • <span className="underline decoration-yellow-300 decoration-4">CONNECT • SHARE • GROW.</span> All info in one vibe!
        </p>

        {/* Hero Quick Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className="px-5 py-3 rounded-2xl bg-yellow-300 hover:bg-yellow-400 text-black font-black text-sm border-3 border-black shadow-[4px_4px_0_0_#000] transition-all active:scale-95 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 stroke-[3]" />
            <span>📅 Cek Jadwal KKG</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className="px-5 py-3 rounded-2xl bg-cyan-300 hover:bg-cyan-400 text-black font-black text-sm border-3 border-black shadow-[4px_4px_0_0_#000] transition-all active:scale-95 flex items-center gap-2"
          >
            <HardDrive className="w-4 h-4 stroke-[3]" />
            <span>📚 Buka SIXDRIVE</span>
          </button>

          <button
            onClick={() => setActiveTab('meeting')}
            className="px-4 py-3 rounded-2xl bg-pink-400 hover:bg-pink-500 text-black font-black text-sm border-3 border-black shadow-[4px_4px_0_0_#000] transition-all active:scale-95 flex items-center gap-2"
          >
            <Video className="w-4 h-4 stroke-[3]" />
            <span>🎥 Rapat Online</span>
          </button>

          <a
            href="https://chat.whatsapp.com/H8awmBQpl361F1XfcsE6hG?s=cl&p=a&mlu=0&amv=0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-emerald-300 hover:bg-emerald-400 text-black font-black text-sm border-3 border-black shadow-[4px_4px_0_0_#000] transition-all active:scale-95 flex items-center gap-2"
          >
            <span>💬 Grup WA</span>
          </a>

          <a
            href="https://drive.google.com/drive/folders/1baa5tRmJiob88KcN_igCr0WNNry00j2i?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-2xl bg-white hover:bg-gray-100 text-black font-black text-sm border-3 border-black shadow-[4px_4px_0_0_#000] transition-all active:scale-95 flex items-center gap-2"
          >
            <span>📂 Induk Drive</span>
          </a>

          {onOpenHelpModal && (
            <button
              onClick={onOpenHelpModal}
              className="px-4 py-3 rounded-2xl bg-orange-300 hover:bg-orange-400 text-black font-black text-sm border-3 border-black shadow-[4px_4px_0_0_#000] transition-all active:scale-95 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 stroke-[3]" />
              <span>📖 Panduan</span>
            </button>
          )}
        </div>

        {/* Next Event Ticker Card */}
        {nextSchedule && (
          <div className="bg-white/95 text-black rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 border-2 border-black text-white flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0_0_#000]">
                <BellRing className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="bg-emerald-400 text-black font-black text-[10px] px-2 py-0.5 rounded border border-black">
                    🟢 UPCOMING
                  </span>
                  <span className="text-xs font-black text-purple-700">
                    {nextSchedule.date} • {nextSchedule.time}
                  </span>
                </div>
                <h2 className="font-extrabold text-sm sm:text-base text-black line-clamp-1">
                  {nextSchedule.title}
                </h2>
                <p className="text-xs font-semibold text-gray-600">
                  📍 Tempat: <span className="font-extrabold text-black">{nextSchedule.location}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs border-2 border-black shadow-[2px_2px_0_0_#000] transition-transform active:scale-95 shrink-0 text-center"
            >
              LIHAT DETAIL →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
