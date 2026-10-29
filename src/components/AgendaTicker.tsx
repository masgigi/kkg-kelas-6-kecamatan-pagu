import { useState } from 'react';
import { ArrowRight, CalendarDays, Pause, Play } from 'lucide-react';
import type { ScheduleItem } from '../types';
import { agendaTickerContent } from '../utils/agendaTicker';

export function AgendaTicker({ schedules, onOpenSchedule }: { schedules: ScheduleItem[]; onOpenSchedule: () => void }) {
  const [paused, setPaused] = useState(false);
  const content = agendaTickerContent(schedules);
  // Keep longer agendas readable at roughly the same speed as shorter ones.
  const duration = Math.max(26, content.message.length * .19);
  return <section aria-label="Informasi agenda KKG" className={`agenda-ticker ${paused ? 'agenda-ticker-paused' : ''}`}>
    <span className="agenda-ticker-label"><CalendarDays size={15} aria-hidden="true" /><span>{content.label}</span></span>
    <div className="agenda-ticker-viewport" title={content.message}>
      <p className="sr-only">{content.message}</p>
      <div key={content.message} className="agenda-ticker-track" aria-hidden="true" style={{ animationDuration: `${duration}s` }}>
        <span className="agenda-ticker-copy">{content.message}</span>
        <span className="agenda-ticker-copy agenda-ticker-repeat">{content.message}</span>
      </div>
    </div>
    <div className="agenda-ticker-actions">
      <button type="button" aria-label={paused ? 'Jalankan teks agenda' : 'Jeda teks agenda'} aria-pressed={paused} title={paused ? 'Jalankan teks agenda' : 'Jeda dan baca agenda'} onClick={() => setPaused(value => !value)} className="agenda-ticker-motion-control">{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>
      <button type="button" onClick={onOpenSchedule} className="agenda-ticker-link"><span className="hidden sm:inline">Lihat </span>Jadwal<ArrowRight size={14} aria-hidden="true" /></button>
    </div>
  </section>;
}
