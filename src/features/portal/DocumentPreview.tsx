import { ArrowUpRight, FileText } from 'lucide-react';
import { safeUrl } from './model';

export function documentEmbed(value: string): string {
  const url = safeUrl(value);
  if (!url) return '';
  const parsed = new URL(url);
  if (parsed.hostname === 'drive.google.com') {
    const id = parsed.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] || parsed.searchParams.get('id');
    if (id && /^[\w-]+$/.test(id)) return `https://drive.google.com/file/d/${id}/preview`;
  }
  if (parsed.hostname === 'docs.google.com') {
    const match = parsed.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([\w-]+)/);
    if (match) return `https://docs.google.com/${match[1]}/d/${match[2]}/${match[1] === 'presentation' ? 'embed' : 'preview'}`;
  }
  if (/\.pdf$/i.test(parsed.pathname)) return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
  if (/\.(docx?|xlsx?|pptx?)$/i.test(parsed.pathname)) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  return '';
}

export function DocumentPreview({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const safe = safeUrl(url);
  if (!safe) return null;
  const embed = documentEmbed(safe);
  return <div className="overflow-hidden rounded-2xl border-2 border-black bg-white">
    <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-200 to-purple-200 px-4 py-3 border-b-2 border-black"><FileText size={20} /><span className="text-sm font-black break-words">{title || 'Pratinjau dokumen'}</span></div>
    {embed ? <iframe src={embed} title={`Pratinjau dokumen ${title}`} loading="lazy" allowFullScreen className={`w-full bg-gray-100 ${compact ? 'h-60' : 'h-[65dvh] min-h-80'}`} /> : <div className="p-6 bg-purple-50 text-sm font-semibold">Pratinjau langsung belum didukung untuk tautan ini. Gunakan tombol Buka dokumen, atau pakai tautan PDF, Google Drive, Google Docs, atau Office publik.</div>}
    <a href={safe} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-yellow-200 p-3 text-sm font-black hover:bg-yellow-300">Buka dokumen lengkap <ArrowUpRight size={16} /></a>
  </div>;
}
