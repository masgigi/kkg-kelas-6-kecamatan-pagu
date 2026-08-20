import React from 'react';
import { Sparkles, Shield, User, Bell, Video, Zap, Calendar, HardDrive, DollarSign, Users, MessageSquare, HelpCircle, History } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userSession: UserSession;
  onOpenAdminModal: () => void;
  onOpenHelpModal: () => void;
  onOpenLoginHistory?: () => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userSession,
  onOpenAdminModal,
  onOpenHelpModal,
  onOpenLoginHistory,
  unreadCount
}) => {
  const tabs = [
    { id: 'home', label: '🏠 Home', icon: Sparkles },
    { id: 'schedule', label: '📅 KKG', icon: Calendar },
    { id: 'drive', label: '📚 Drive', icon: HardDrive },
    { id: 'cash', label: '💸 Kas', icon: DollarSign },
    { id: 'crew', label: '👩‍🏫 Guru', icon: Users },
    { id: 'meeting', label: '🎥 Rapat Online', icon: Video },
    { id: 'update', label: '📢 Info', icon: MessageSquare }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-black shadow-[0_4px_0_0_#000]">
      {/* Top Ticker Accent */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 via-orange-400 to-yellow-400 text-black text-xs font-black py-1 px-3 flex items-center justify-between tracking-wider overflow-hidden">
        <div className="flex items-center gap-2 animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>KKG GURU KELAS 6 KECAMATAN PAGU • KEDIRI</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>⚡ Satu Guru, Satu Vibe, Satu Tujuan.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo Branding */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black text-xl text-black group-hover:rotate-6 transition-transform">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-black">
                KKG<span className="text-purple-600">6UP!</span>
              </span>
              <span className="bg-pink-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0_0_#000]">
                SIXVIBE
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-600 -mt-1 hidden xs:block">
              Teacher Space Kelas 6 • Pagu
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000] -translate-y-0.5'
                    : 'text-gray-800 hover:bg-gray-200 hover:text-black'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Controls: Login & Admin */}
        <div className="flex items-center gap-2">
          {/* Riwayat Login Button */}
          {onOpenLoginHistory && (
            <button
              onClick={onOpenLoginHistory}
              title="Riwayat Login"
              className="p-2 bg-purple-200 hover:bg-purple-300 text-black rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] font-black transition-transform active:scale-95 flex items-center gap-1"
            >
              <History className="w-5 h-5 text-purple-900" />
              <span className="hidden xl:inline text-xs font-black">Riwayat</span>
            </button>
          )}

          {/* Panduan / Help Modal Button */}
          <button
            onClick={onOpenHelpModal}
            title="Panduan Penggunaan App"
            className="p-2 bg-orange-300 hover:bg-orange-400 text-black rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] font-black transition-transform active:scale-95 flex items-center gap-1"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden lg:inline text-xs font-black">Panduan</span>
          </button>

          {/* Notification Button */}
          <button
            onClick={() => setActiveTab('schedule')}
            title="Notifikasi Pertemuan"
            className="relative p-2 bg-yellow-300 hover:bg-yellow-400 text-black rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] font-black transition-transform active:scale-95"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[10px] w-5 h-5 rounded-full border border-black flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin / Kelola Web Button */}
          <button
            onClick={onOpenAdminModal}
            title={userSession.role === 'admin' ? 'Mode Admin Aktif - Kelola Web' : 'Kelola Web (Admin)'}
            className={`px-3 py-2 rounded-xl font-black text-xs border-2 border-black shadow-[2px_2px_0_0_#000] transition-all flex items-center gap-1.5 active:scale-95 ${
              userSession.role === 'admin'
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-pink-400 hover:bg-pink-500 text-black'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">
              {userSession.role === 'admin' ? '🟢 Admin Aktif' : 'Kelola Web'}
            </span>
            <span className="sm:hidden">
              {userSession.role === 'admin' ? 'Admin' : 'Kelola'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
