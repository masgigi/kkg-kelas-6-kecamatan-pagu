import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { Calendar, MapPin, Clock, Download, ExternalLink, Bell, CheckCircle2, Video, Plus, Trash2, Edit3, Search } from 'lucide-react';

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  isAdmin: boolean;
  onAddSchedule?: () => void;
  onEditSchedule?: (item: ScheduleItem) => void;
  onDeleteSchedule?: (id: string) => void;
  notifEnabled: boolean;
  setNotifEnabled: (enabled: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  isAdmin,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  notifEnabled,
  setNotifEnabled,
  setActiveTab
}) => {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');

  const filteredSchedules = schedules.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.includes(searchTerm);
    const matchesStatus = statusFilter === 'semua' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'Akan Datang':
        return 'bg-emerald-300 text-black border-black';
      case 'Persiapan':
        return 'bg-amber-300 text-black border-black';
      case 'Terjadwal':
        return 'bg-cyan-300 text-black border-black';
      default:
        return 'bg-gray-200 text-gray-700 border-black';
    }
  };

  const handleToggleNotif = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          setNotifEnabled(true);
          alert('🔔 Notifikasi real-time jadwal KKG telah diaktifkan!');
        } else {
          alert('Izin notifikasi ditolak di peramban.');
        }
      });
    } else {
      setNotifEnabled(!notifEnabled);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-purple-600 text-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-yellow-300 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
            <Calendar className="w-4 h-4" />
            <span>SIXSCHEDULE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            📅 Jadwal KKG Pagu
          </h1>
          <p className="text-xs sm:text-sm font-bold text-purple-100 mt-1">
            Kalender pertemuan & workshop guru kelas 6 se-Kecamatan Pagu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Notification Toggle */}
          <button
            onClick={handleToggleNotif}
            className={`px-3 py-2 rounded-xl font-black text-xs border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95 ${
              notifEnabled
                ? 'bg-yellow-300 text-black hover:bg-yellow-400'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Bell className={`w-4 h-4 ${notifEnabled ? 'animate-bounce fill-black' : ''}`} />
            <span>{notifEnabled ? '🔔 Notif Aktif' : '🔕 Notif Matik'}</span>
          </button>

          {isAdmin && onAddSchedule && (
            <button
              onClick={onAddSchedule}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Jadwal</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 Cari jadwal, lokasi, atau tanggal..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-gray-50 border-2 border-black font-bold text-xs focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2.5 px-4 rounded-2xl bg-gray-50 border-2 border-black font-black text-xs focus:outline-none"
        >
          <option value="semua">📋 Semua Status</option>
          <option value="Akan Datang">🟢 Akan Datang</option>
          <option value="Persiapan">🟡 Persiapan</option>
          <option value="Terjadwal">🔵 Terjadwal</option>
          <option value="Selesai">⚪ Selesai</option>
        </select>
      </div>

      {/* Schedule List Cards */}
      <div className="space-y-4">
        {filteredSchedules.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[4px_4px_0_0_#000] transition-all hover:shadow-[6px_6px_0_0_#000]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-black text-xs px-3 py-0.5 rounded-full border border-black shadow-[1px_1px_0_0_#000] ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    ● {item.status}
                  </span>
                  <span className="bg-purple-100 text-purple-900 font-extrabold text-xs px-2.5 py-0.5 rounded-lg border border-black">
                    📅 {item.date}
                  </span>
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-0.5 rounded-lg border border-black flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-black">
                  {item.title}
                </h3>

                <p className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
                  <span>
                    Tempat: <strong className="text-black">{item.location}</strong>
                  </span>
                </p>
              </div>

                {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedSchedule(item)}
                  className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] transition-transform active:scale-95"
                >
                  Detail Agenda →
                </button>

                {/* Google Maps Location Button */}
                <a
                  href={item.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(item.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 bg-pink-300 hover:bg-pink-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] transition-transform active:scale-95 flex items-center gap-1.5"
                  title={`Buka Lokasi ${item.location} di Google Maps`}
                >
                  <MapPin className="w-4 h-4 fill-pink-600 text-black" />
                  <span>Google Maps 🗺️</span>
                </a>

                {item.googleMeetUrl && (
                  <button
                    onClick={() => setActiveTab('meeting')}
                    className="p-2.5 bg-cyan-300 hover:bg-cyan-400 text-black rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] transition-transform active:scale-95"
                    title="Rapat Online Google Meet"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-1 ml-2 border-l-2 border-black pl-2">
                    {onEditSchedule && (
                      <button
                        onClick={() => onEditSchedule(item)}
                        className="p-2 bg-amber-300 text-black rounded-lg border border-black"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteSchedule && (
                      <button
                        onClick={() => onDeleteSchedule(item.id)}
                        className="p-2 bg-red-400 text-black rounded-lg border border-black"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[8px_8px_0_0_#000] max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b-2 border-black pb-3">
              <div>
                <span
                  className={`font-black text-xs px-2.5 py-0.5 rounded-full border border-black ${getStatusBadge(
                    selectedSchedule.status
                  )}`}
                >
                  ● {selectedSchedule.status}
                </span>
                <h3 className="text-xl font-black text-black mt-1">
                  {selectedSchedule.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="w-8 h-8 rounded-xl bg-red-400 text-black border-2 border-black font-black text-sm shadow-[1px_1px_0_0_#000] shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-gray-800">
              <div className="bg-purple-50 p-3 rounded-2xl border-2 border-black space-y-1">
                <p>📆 <strong>Tanggal:</strong> {selectedSchedule.date}</p>
                <p>⏰ <strong>Waktu:</strong> {selectedSchedule.time}</p>
                <p>📍 <strong>Tempat:</strong> {selectedSchedule.location}</p>
              </div>

              <div>
                <h4 className="font-black text-sm text-black mb-2 uppercase">📌 Agenda Kegiatan</h4>
                <div className="space-y-1.5">
                  {selectedSchedule.agenda.map((ag, i) => (
                    <div key={i} className="flex items-start gap-2 bg-gray-50 p-2 rounded-xl border border-black">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{ag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black flex flex-wrap gap-2">
              {selectedSchedule.mapsUrl && (
                <a
                  href={selectedSchedule.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] text-center flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Buka Google Maps</span>
                </a>
              )}

              <button
                onClick={() => {
                  alert(`📥 Surat undangan ${selectedSchedule.title} telah diunduh!`);
                }}
                className="flex-1 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Undangan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
