import React, { useState, useEffect } from 'react';
import { OnlineMeeting } from '../types';
import { supabase } from '../lib/supabase';
import { Video, Bell, ExternalLink, Copy, Check, Clock, Edit3, ShieldAlert, Sparkles, MessageSquare, Loader2 } from 'lucide-react';

interface MeetingViewProps {
  meeting: OnlineMeeting;
  isAdmin: boolean;
  onUpdateMeeting?: (data: OnlineMeeting) => void;
  notifEnabled: boolean;
}

export const MeetingView: React.FC<MeetingViewProps> = ({
  meeting,
  isAdmin,
  onUpdateMeeting,
  notifEnabled
}) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(
    localStorage.getItem('kkg6up_meeting_notes') ||
      '• Catatan Rapat Online KKG Pagu:\n1. Kesepakatan kisi-kisi STS Semester 1.\n2. Jadwal piket pembuatan modul ajar.'
  );
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    supabase.from('online_meetings').select('meeting_notes').eq('id', meeting.id || 'meet-1').maybeSingle().then(({ data }) => {
      if (data?.meeting_notes) setNotes(data.meeting_notes);
    });
  }, [meeting.id]);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(meeting.title);
  const [editTime, setEditTime] = useState(meeting.scheduledTime);
  const [editUrl, setEditUrl] = useState(meeting.meetUrl);
  const [editAgendaNote, setEditAgendaNote] = useState(meeting.agendaNote);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meeting.meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('kkg6up_meeting_notes', val);
    setNotesSaved(false);
  };

  const handleNotesBlur = async () => {
    setNotesSaving(true);
    const { error } = await supabase.from('online_meetings').update({ meeting_notes: notes }).eq('id', meeting.id || 'meet-1');
    setNotesSaving(false);
    if (error) {
      console.error('Gagal menyimpan catatan rapat:', error);
      return;
    }
    setNotesSaved(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateMeeting) {
      onUpdateMeeting({
        ...meeting,
        title: editTitle,
        scheduledTime: editTime,
        meetUrl: editUrl,
        agendaNote: editAgendaNote
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-yellow-300 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
              <Video className="w-4 h-4" />
              <span>SIXMEET</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              🎥 Rapat Online Google Meet
            </h1>
            <p className="text-xs sm:text-sm font-bold text-pink-100 mt-1">
              Ruang tatap muka virtual KKG Guru Kelas 6 Kecamatan Pagu.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1 shrink-0"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Link Meet</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Edit Modal / Box */}
      {isEditing && (
        <div className="bg-white rounded-3xl border-4 border-black p-5 shadow-[6px_6px_0_0_#000]">
          <h3 className="font-black text-sm text-black mb-3">⚙️ Edit Konfigurasi Rapat Online</h3>
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">Judul Rapat</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Waktu Pelaksanaan</label>
              <input
                type="text"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full p-2 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Link Google Meet</label>
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full p-2 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Catatan Agenda</label>
              <textarea
                rows={3}
                value={editAgendaNote}
                onChange={(e) => setEditAgendaNote(e.target.value)}
                className="w-full p-2 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-gray-200 text-black font-black text-xs rounded-lg border border-black"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 text-white font-black text-xs rounded-lg border border-black shadow-[2px_2px_0_0_#000]"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meeting Big Join Card */}
      <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[6px_6px_0_0_#000] grid md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white font-black text-xs px-3 py-0.5 rounded-full border border-black shadow-[1px_1px_0_0_#000] animate-pulse">
              🔴 LIVE MEETING ROOM
            </span>
            <span className="text-xs font-extrabold text-purple-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {meeting.scheduledTime}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-black">{meeting.title}</h2>

          <div className="bg-purple-50 p-3 rounded-2xl border-2 border-black space-y-1 text-xs font-bold text-gray-800">
            <p className="font-black text-black uppercase">📌 Agendakan Rapat:</p>
            <p className="whitespace-pre-line text-gray-700">{meeting.agendaNote}</p>
            {meeting.passcode && (
              <p className="text-purple-900 font-extrabold mt-2">
                🔑 Kode Akses / Passcode: <span className="bg-yellow-300 px-2 py-0.5 rounded border border-black">{meeting.passcode}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center h-full bg-gradient-to-br from-yellow-300 to-amber-400 p-5 rounded-2xl border-3 border-black text-center shadow-[4px_4px_0_0_#000]">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black flex items-center justify-center font-black mx-auto shadow-[2px_2px_0_0_#000]">
            <Video className="w-6 h-6 text-purple-600" />
          </div>

          <a
            href={meeting.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>JOIN GOOGLE MEET NOW 🚀</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleCopyLink}
            className="w-full py-2 bg-white hover:bg-gray-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Link Google Meet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Notes Scratchpad during online meetings */}
      <div className="bg-white rounded-3xl border-3 border-black p-5 shadow-[4px_4px_0_0_#000]">
        <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
          <h3 className="font-black text-sm text-black flex items-center gap-2">
            <span>📝</span> Catatan & Scratchpad Rapat
          </h3>
          <div className="flex items-center gap-2">
            {notesSaving && <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Menyimpan...</span>}
            {notesSaved && <span className="text-[10px] font-bold text-emerald-600">Tersimpan ✓</span>}
            <button
              onClick={handleNotesBlur}
              className="px-3 py-1 bg-purple-600 text-white font-black text-[10px] rounded-lg border border-black shadow-[1px_1px_0_0_#000]"
            >
              Simpan Catatan
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={notes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          placeholder="Tulis ringkasan rapat atau poin penting hasil diskusi di sini..."
          className="w-full p-3 rounded-2xl border-2 border-black font-bold text-xs bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-purple-600 leading-relaxed"
        />
      </div>
    </div>
  );
};
