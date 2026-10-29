import type { ScheduleItem } from '../types';
import { todayJakarta, upcomingSchedule } from '../features/portal/model';

export function agendaTickerContent(schedules: ScheduleItem[], today = todayJakarta()) {
  const available = schedules.filter(item => item.title.trim() && /^\d{4}-\d{2}-\d{2}$/.test(item.date));
  const upcoming = upcomingSchedule(available, today);
  const schedule = upcoming || available.filter(item => item.date <= today).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!schedule) return {
    label: 'Info Agenda',
    message: 'Belum ada jadwal kegiatan mendatang. Agenda KKG akan diumumkan di sini. Buka Jadwal untuk melihat informasi kegiatan.'
  };
  const date = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${schedule.date}T00:00:00+07:00`));
  const topics = schedule.agenda.flatMap(item => item.split(/\r?\n/))
    .map(item => item.trim().replace(/^(?:rincian\s+)?agenda\s*:\s*/i, '').replace(/^(?:\d+[.)]|[-•])\s*/, '').replace(/[.;]+$/, '').trim())
    .filter(item => item && item !== schedule.title.trim()).slice(0, 2).join('; ');
  const summary = `${date} • ${schedule.title.trim()} • ${schedule.time.trim() || 'Waktu menyusul'} • ${schedule.location.trim() || 'Lokasi menyusul'}${topics ? ` • Bahasan: ${topics}` : ''}`;
  return {
    label: upcoming ? (schedule.date === today ? 'Agenda Hari Ini' : 'Agenda Terdekat') : 'Agenda Terakhir',
    message: upcoming ? `${summary} • Lihat jadwal untuk rincian kegiatan.` : `${summary} • Jadwal berikutnya akan diumumkan di sini.`
  };
}
