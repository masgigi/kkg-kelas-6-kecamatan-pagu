import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../types';
import { Calendar, MapPin, Clock, X, Link as LinkIcon, Plus, CheckCircle2 } from 'lucide-react';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Omit<ScheduleItem, 'id'> | ScheduleItem) => void;
  initialSchedule?: ScheduleItem | null;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSchedule
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09.00 - 12.00 WIB');
  const [location, setLocation] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [status, setStatus] = useState<ScheduleItem['status']>('Akan Datang');
  const [agendaInput, setAgendaInput] = useState('');
  const [googleMeetUrl, setGoogleMeetUrl] = useState('');

  useEffect(() => {
    if (initialSchedule) {
      setTitle(initialSchedule.title);
      setDate(initialSchedule.date);
      setTime(initialSchedule.time || '09.00 - 12.00 WIB');
      setLocation(initialSchedule.location || '');
      setMapsUrl(initialSchedule.mapsUrl || '');
      setStatus(initialSchedule.status || 'Akan Datang');
      setAgendaInput(initialSchedule.agenda ? initialSchedule.agenda.join('\n') : '');
      setGoogleMeetUrl(initialSchedule.googleMeetUrl || '');
    } else {
      // Reset form for new schedule
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('09.00 - 12.00 WIB');
      setLocation('SDN Pagu 1');
      setMapsUrl('https://maps.google.com/?q=SDN+Pagu+1+Kediri');
      setStatus('Akan Datang');
      setAgendaInput('Evaluasi Administrasi Kurikulum Merdeka\nSharing Perangkat Ajar & Modul\nPembahasan Kas KKG');
      setGoogleMeetUrl('');
    }
  }, [initialSchedule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location) {
      alert('Mohon isi Judul, Tanggal, dan Lokasi kegiatan.');
      return;
    }

    const agendaArr = agendaInput
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const scheduleData = {
      ...(initialSchedule ? { id: initialSchedule.id } : {}),
      title,
      date,
      time,
      location,
      mapsUrl: mapsUrl.trim() ? mapsUrl.trim() : `https://maps.google.com/?q=${encodeURIComponent(location)}`,
      agenda: agendaArr.length > 0 ? agendaArr : ['Kegiatan KKG Pagu'],
      status,
      googleMeetUrl: googleMeetUrl.trim() || undefined
    };

    onSave(scheduleData as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] my-8 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 p-5 border-b-4 border-black flex items-center justify-between text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black">
              📅
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black leading-tight">
                {initialSchedule ? 'Edit Jadwal KKG' : 'Tambah Jadwal KKG Baru'}
              </h2>
              <p className="text-xs font-bold text-black/80">
                Input lokasi & link Google Maps pertemuan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-gray-100 text-black rounded-xl border-2 border-black font-black shadow-[2px_2px_0_0_#000]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Judul Kegiatan */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Judul Kegiatan / Pertemuan KKG <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: KKG Rutin #09 - Workshop Asesmen Kurikulum Merdeka"
              className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Tanggal, Waktu & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09.00 - 12.00 WIB"
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">
                Status Pertemuan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none bg-white"
              >
                <option value="Akan Datang">🟢 Akan Datang</option>
                <option value="Persiapan">🟡 Persiapan</option>
                <option value="Terjadwal">🔵 Terjadwal</option>
                <option value="Selesai">⚪ Selesai</option>
              </select>
            </div>
          </div>

          {/* LOKASI DAN LINK GOOGLE MAPS */}
          <div className="p-3.5 bg-yellow-50 rounded-2xl border-2 border-black space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-black">
              <MapPin className="w-4 h-4 text-pink-600 shrink-0" />
              <span>INFORMASI LOKASI PERTEMUAN</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-black mb-1">
                  Nama Tempat / Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: SDN Pagu 1 / Korwil Pagu"
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-black mb-1">
                  Link Lokasi Google Maps
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full pl-8 pr-2.5 py-2.5 rounded-xl border-2 border-black font-bold text-xs bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 font-bold">
              💡 Guru dapat mengklik tombol lokasi untuk langsung membuka peta lokasi di Google Maps.
            </p>
          </div>

          {/* Agenda Kegiatan */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Agenda Kegiatan (1 baris per poin agenda)
            </label>
            <textarea
              rows={3}
              value={agendaInput}
              onChange={(e) => setAgendaInput(e.target.value)}
              placeholder="Contoh:&#10;1. Evaluasi administrasi&#10;2. Penyusunan modul ajar&#10;3. Pembahasan iuran kas"
              className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
            />
          </div>

          {/* Link Rapat Online (Google Meet / Zoom) - Optional */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Link Rapat Online (Opsional - Google Meet / Zoom)
            </label>
            <input
              type="url"
              value={googleMeetUrl}
              onChange={(e) => setGoogleMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-black font-black text-xs rounded-xl border-2 border-black"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Jadwal KKG</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
