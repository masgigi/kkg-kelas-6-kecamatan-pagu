import { FolderOpen, FileText, ArrowUpRight } from 'lucide-react';
import { DocumentPreview, documentEmbed } from './DocumentPreview';
import { MediaPreview } from './MediaPreview';
import { documentationMedia, safeUrl } from './model';

export function ResourcePreview({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const safe = safeUrl(url);
  if (!safe) return null;
  if (documentEmbed(safe)) return <DocumentPreview url={safe} title={title} compact={compact} />;
  const media = documentationMedia(safe);
  if (media && media.type !== 'link') return <MediaPreview url={safe} title={title} compact={compact} />;
  const parsed = new URL(safe);
  const folder = parsed.hostname === 'drive.google.com' && /^\/drive\/(?:u\/\d+\/)?folders\//.test(parsed.pathname);
  return <div className="border-b-2 border-black bg-gradient-to-br from-yellow-100 via-cyan-100 to-purple-100 p-5 space-y-3">
    {folder ? <FolderOpen size={36} className="text-purple-700" aria-hidden="true" /> : <FileText size={36} className="text-purple-700" aria-hidden="true" />}
    <p className="font-black text-sm">{folder ? 'Folder bahan ajar di Google Drive' : 'Bahan ajar siap dibuka'}</p>
    <p className="text-xs font-semibold">{folder ? 'Lihat dan unduh berkas yang tersedia di dalam folder.' : 'Buka tautan untuk melihat atau mengunduh sumber belajar.'}</p>
    <a href={safe} target="_blank" rel="noopener noreferrer" className="portal-button bg-white">{folder ? 'Buka Folder' : 'Buka Sumber Belajar'}<ArrowUpRight size={15} /></a>
  </div>;
}
