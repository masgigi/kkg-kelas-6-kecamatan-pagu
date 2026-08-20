import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X, Clock } from 'lucide-react';
import { ScheduleItem } from '../types';

interface NotificationBannerProps {
  nextSchedule?: ScheduleItem;
  setActiveTab: (tab: string) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  nextSchedule,
  setActiveTab
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!nextSchedule || !isVisible) return null;

  return (
    <div className="bg-yellow-300 border-b-4 border-black text-black px-4 py-2 font-black text-xs flex items-center justify-between gap-2 shadow-[0_2px_0_0_#000]">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
        <Bell className="w-4 h-4 fill-black shrink-0" />
        <p className="line-clamp-1">
          <strong>PENGINGAT MEETING KKG:</strong> {nextSchedule.title} ({nextSchedule.date} • {nextSchedule.location})
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveTab('schedule')}
          className="bg-purple-600 text-white text-[10px] px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0_0_#000] hover:bg-purple-700"
        >
          Cek
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-black/10 rounded-lg text-black"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
