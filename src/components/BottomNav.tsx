import React, { useState } from 'react';
import { Home, Calendar, BookOpen, Users, Menu } from 'lucide-react';
import { PortalModal } from '../features/portal/PortalModal';
import { featureLinks } from '../features/portal/PortalHub';

export function BottomNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const [more, setMore] = useState(false);
  const items = [
    { id: 'home', label: 'Home', icon: Home, color: 'bg-yellow-300' },
    { id: 'profile', label: 'Profil', icon: Users, color: 'bg-cyan-300' },
    { id: 'program', label: 'Agenda', icon: Calendar, color: 'bg-pink-400' },
    { id: 'drive', label: 'Belajar', icon: BookOpen, color: 'bg-purple-400' }
  ];
  const navigate = (id: string) => { setMore(false); setActiveTab(id); };
  return <>
    <nav aria-label="Navigasi ponsel" className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t-4 border-black px-3 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_0_#000]">
      <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
        {items.map(item => { const Icon = item.icon; const active = activeTab === item.id || (item.id === 'program' && activeTab === 'schedule'); return <button key={item.id} onClick={() => navigate(item.id)} aria-current={active ? 'page' : undefined} className={`flex flex-col items-center justify-center min-h-12 py-1 rounded-xl border-2 ${active ? `${item.color} border-black shadow-[2px_2px_0_#000] -translate-y-1` : 'border-transparent'}`}><Icon size={19} /><span className="font-black text-[10px] mt-1">{item.label}</span></button>; })}
        <button onClick={() => setMore(true)} aria-expanded={more} className={`flex flex-col items-center justify-center rounded-xl border-2 ${!items.some(i => i.id === activeTab) && activeTab !== 'schedule' ? 'bg-orange-300 border-black shadow-[2px_2px_0_#000]' : 'border-transparent'}`}><Menu size={19} /><span className="font-black text-[10px] mt-1">Lainnya</span></button>
      </div>
    </nav>
    {more && <PortalModal title="🌈 Jelajahi KKG SIXVIBE" onClose={() => setMore(false)}><div className="grid sm:grid-cols-2 gap-3">{[...featureLinks, { id: 'schedule', title: 'Agenda & Presensi', emoji: '📅', color: 'bg-pink-200' }, { id: 'cash', title: 'Kas KKG', emoji: '💸', color: 'bg-emerald-200' }, { id: 'crew', title: 'Guru Anggota', emoji: '👩‍🏫', color: 'bg-cyan-200' }, { id: 'meeting', title: 'Rapat Online', emoji: '🎥', color: 'bg-orange-200' }, { id: 'attendance', title: 'Absensi', emoji: '✅', color: 'bg-lime-200' }].map(item => <button key={item.id} className={`portal-button !justify-start !py-4 ${item.color}`} onClick={() => navigate(item.id)}>{item.emoji} {item.title}</button>)}</div></PortalModal>}
  </>;
}
