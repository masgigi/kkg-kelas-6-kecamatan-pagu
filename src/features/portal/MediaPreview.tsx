import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { documentationMedia } from './model';

export function GooglePhotosPreview({ url, title, frame, compact }: { url: string; title: string; frame: string; compact: boolean }) {
  const [result, setResult] = useState<{ url: string; imageUrl: string; failed: boolean } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/media-preview?url=${encodeURIComponent(url)}`, { signal: controller.signal })
        .then(async response => {
          if (!response.ok) throw new Error('Unavailable');
          const data = await response.json();
          if (!documentationMedia(data.imageUrl)?.url || documentationMedia(data.imageUrl)?.type !== 'image') throw new Error('Invalid preview');
          if (!controller.signal.aborted) setResult({ url, imageUrl: data.imageUrl, failed: false });
        }).catch(() => { if (!controller.signal.aborted) setResult({ url, imageUrl: '', failed: true }); });
    }, 400);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [url]);
  const current = result?.url === url ? result : null;
  return <div>
    {current?.imageUrl && !current.failed
      ? <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Buka ${title} di Google Foto`}><img src={current.imageUrl} alt={`Pratinjau ${title} dari Google Foto`} loading="lazy" referrerPolicy="no-referrer" onError={() => setResult({ url, imageUrl: '', failed: true })} className={`${frame} ${compact ? 'object-cover' : 'object-contain'}`} /></a>
      : <div className={`${frame} flex items-center justify-center p-5 text-center text-sm font-semibold`} role="status">{current?.failed ? 'Pratinjau tidak tersedia. Periksa akses berbagi Google Foto.' : 'Memuat pratinjau Google Foto…'}</div>}
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-orange-100 p-3 text-sm font-bold underline">Buka foto / video / album di Google Foto <ArrowUpRight size={16} /></a>
  </div>;
}

export function MediaPreview({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [failedUrl, setFailedUrl] = useState('');
  const media = documentationMedia(url);
  if (!media) return null;
  const frame = compact
    ? 'w-full h-56 border-b-3 border-black bg-orange-50'
    : 'w-full aspect-video rounded-2xl border-2 border-black bg-orange-50';
  if (media.type === 'google-photos') return <GooglePhotosPreview url={media.url} title={title} frame={frame} compact={compact} />;
  if (media.type === 'link' || failedUrl === media.url) return <div className={`${frame} flex flex-col items-center justify-center gap-3 p-5 text-center`}>
    <p className="text-sm font-semibold">Pratinjau belum tersedia dari tautan ini.</p>
    <a href={media.url} target="_blank" rel="noopener noreferrer" className="portal-button bg-orange-200">Buka foto atau video <ArrowUpRight size={16} /></a>
  </div>;
  if (media.type === 'image') return <img src={media.url} alt={`Dokumentasi ${title}`} loading="lazy" onError={() => setFailedUrl(media.url)} className={`${frame} ${compact ? 'object-cover' : 'object-contain'}`} />;
  if (media.type === 'video') return <video controls playsInline preload="metadata" src={media.url} aria-label={`Video ${title}`} onError={() => setFailedUrl(media.url)} className={`${frame} object-contain bg-black`}>Peramban tidak mendukung pemutaran video.</video>;
  return <div><iframe src={media.embedUrl} title={`Pratinjau ${title}`} loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className={media.provider === 'instagram' ? `w-full ${compact ? 'h-[440px] border-b-3' : 'h-[600px] rounded-2xl border-2'} border-black bg-white` : frame} />
    {media.provider === 'instagram' && <a href={media.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-pink-100 p-3 text-sm font-bold underline">Buka di Instagram <ArrowUpRight size={16} /></a>}
  </div>;
}
