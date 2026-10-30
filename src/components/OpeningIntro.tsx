import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './OpeningIntro.css';

export function OpeningIntro({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const enterButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    enterButton.current?.focus({ preventScroll: true });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fadeTimer = reducedMotion ? undefined : window.setTimeout(() => setLeaving(true), 1800);
    const finishTimer = window.setTimeout(onComplete, reducedMotion ? 650 : 2100);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete]);

  return <section
    className={`kkg-opening${leaving ? ' kkg-opening-leaving' : ''}`}
    role="dialog" aria-modal="true" aria-labelledby="opening-title" aria-describedby="opening-description"
    onKeyDown={event => {
      if (event.key === 'Escape') onComplete();
      if (event.key === 'Tab') { event.preventDefault(); enterButton.current?.focus(); }
    }}
  >
    <div className="opening-aurora opening-aurora-cyan" aria-hidden="true" />
    <div className="opening-aurora opening-aurora-pink" aria-hidden="true" />
    <div className="opening-grid" aria-hidden="true" />
    <div className="opening-orbit" aria-hidden="true" />
    <div className="opening-orbit opening-orbit-inner" aria-hidden="true" />
    <div className="opening-sparks" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--spark': index, top: `${13 + (index * 17) % 73}%` } as CSSProperties} />)}
    </div>

    <div className="opening-content">
      <div className="opening-eyebrow"><Sparkles size={14} aria-hidden="true" /><span>RUANG KOLABORASI • MASA DEPAN PENDIDIKAN</span></div>
      <svg className="opening-joglo" viewBox="0 0 260 90" fill="none" aria-hidden="true">
        <defs><linearGradient id="opening-roof" x1="0" y1="45" x2="260" y2="45" gradientUnits="userSpaceOnUse"><stop stopColor="#55e8ff" /><stop offset=".5" stopColor="#ffe4a3" /><stop offset="1" stopColor="#f996ed" /></linearGradient></defs>
        <path d="M18 68 82 46 111 15h38l29 31 64 22M9 74h242M62 74v13m136-13v13M89 47h82M106 23h48" stroke="url(#opening-roof)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h1 id="opening-title" className="opening-title"><span>KKG KELAS</span> <strong>6</strong></h1>
      <div className="opening-light-line" aria-hidden="true" />
      <p id="opening-description" className="opening-subtitle">KELOMPOK KERJA GURU SD</p>
      <p className="opening-location">KECAMATAN PAGU <span aria-hidden="true">✦</span> KABUPATEN KEDIRI</p>
      <div className="opening-values" aria-hidden="true"><span>Berbagi</span><i /><span>Berkolaborasi</span><i /><span>Bertumbuh</span></div>
    </div>

    <div className="opening-footer">
      <span className="opening-brand">KKG6UP! <span>×</span> SIXVIBE</span>
      <button ref={enterButton} type="button" className="opening-enter" onClick={onComplete}>Masuk sekarang <ArrowRight size={16} aria-hidden="true" /></button>
    </div>
    <div className="opening-timeline" aria-hidden="true"><span /></div>
  </section>;
}
