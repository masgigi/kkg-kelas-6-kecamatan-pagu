import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { documentationMedia } from './model';

export function MediaPreview({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [failedUrl, setFailedUrl] = useState('');
  const media = documentationMedia(url);
  if (!media) return null;
  const frame = compact
    ? 'w-full h-56 border-b-3 border-black bg-orange-50'
    : 'w-full aspect-video rounded-2xl border-2 border-black bg-orange-50';
  if (media.type === 'link' || failedUrl === media.url) return <div className={`${frame} flex flex-col items-center justify-center gap-3 p-5 text-center`}>
    <p className="text-sm font-semibold">Pratinjau belum tersedia dari tautan ini.</p>
    <a href={media.url} target="_blank" rel="noopener noreferrer" className="portal-button bg-orange-200">Buka foto atau video <ArrowUpRight size={16} /></a>
  </div>;
  if (media.type === 'image') return <img src={media.url} alt={`Dokumentasi ${title}`} loading="lazy" onError={() => setFailedUrl(media.url)} className={`${frame} ${compact ? 'object-cover' : 'object-contain'}`} />;
  if (media.type === 'video') return <video controls playsInline preload="metadata" src={media.url} aria-label={`Video ${title}`} onError={() => setFailedUrl(media.url)} className={`${frame} object-contain bg-black`}>Peramban tidak mendukung pemutaran video.</video>;
  return <iframe src={media.embedUrl} title={`Pratinjau ${title}`} loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className={frame} />;
}
