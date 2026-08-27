import React from 'react';
import { Home, Calendar, HardDrive, DollarSign, Users, Video, MessageSquare, CheckCircle2 } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'bg-yellow-300' },
    { id: 'schedule', label: 'KKG', icon: Calendar, color: 'bg-pink-400' },
    { id: 'drive', label: 'Drive', icon: HardDrive, color: 'bg-purple-400' },
    { id: 'cash', label: 'Kas', icon: DollarSign, color: 'bg-emerald-400' },
    { id: 'crew', label: 'Guru', icon: Users, color: 'bg-cyan-300' },
    { id: 'meeting', label: 'Rapat', icon: Video, color: 'bg-orange-400' },
    { id: 'update', label: 'Info', icon: MessageSquare, color: 'bg-lime-400' },
    { id: 'attendance', label: 'Absen', icon: CheckCircle2, color: 'bg-violet-400' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t-4 border-black px-2 py-1.5 shadow-[0_-4px_0_0_#000]">
      <div className="grid grid-cols-8 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-transform active:scale-90 ${
                isActive
                  ? `${item.color} text-black border-2 border-black shadow-[2px_2px_0_0_#000] -translate-y-1 font-black`
                  : 'text-gray-700 hover:text-black font-extrabold'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[9px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
