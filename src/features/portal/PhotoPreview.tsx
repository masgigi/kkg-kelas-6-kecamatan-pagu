import { useState } from 'react';
import { ArrowUpRight, ImageOff } from 'lucide-react';
import { documentationMedia, safeUrl } from './model';
import { GooglePhotosPreview } from './MediaPreview';
import { photoSource } from './photo';

export function PhotoPreview({ url, title, compact = false, portrait = false }: { url: string; title: string; compact?: boolean; portrait?: boolean }) {
  const [failedSource, setFailedSource] = useState('');
  const safe = safeUrl(url);
  if (!safe) return null;
  const frame = compact
    ? `w-full h-48 border-b-3 border-black ${portrait ? 'bg-cyan-50' : 'bg-gray-100'}`
    : 'w-full h-72 sm:h-80 rounded-2xl border-2 border-black bg-cyan-50';
  if (documentationMedia(safe)?.type === 'google-photos') return <GooglePhotosPreview url={safe} title={title} frame={frame} compact={compact && !portrait} />;
  const source = photoSource(safe);
  if (!source || failedSource === source) return <div className={`${frame} flex flex-col items-center justify-center gap-3 p-4 text-center`}>
    <ImageOff size={28} aria-hidden="true" />
    <p role="status" className="text-sm font-semibold">Foto belum dapat ditampilkan. Gunakan tautan gambar atau file foto Drive yang dapat dilihat semua orang.</p>
    <a href={safe} target="_blank" rel="noopener noreferrer" className="portal-button bg-white text-sm">Buka foto asli <ArrowUpRight size={15} /></a>
  </div>;
  return <img src={source} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedSource(source)} className={`${frame} ${portrait || !compact ? 'object-contain' : 'object-cover'}`} />;
}
