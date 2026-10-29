import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Edit2, Plus, Search } from 'lucide-react';
import { ContentKind, PortalContent, blankContent, contentConfig, documentationMedia, safeUrl } from './model';
import { ContentEditor } from './ContentEditor';
import { PortalModal } from './PortalModal';

function mediaFor(item: PortalContent) {
  return documentationMedia(item.details.media_url || item.image_url || item.details.video || (item.details.photos || '').split('\n').find(Boolean) || item.link_url);
}

function DocumentationVisual({ item, compact = false }: { item: PortalContent; compact?: boolean }) {
  const media = mediaFor(item);
  if (!media) return null;
  const className = compact ? 'w-full h-48 border-b-3 border-black object-cover bg-orange-50' : 'w-full max-h-[70vh] rounded-2xl border-2 border-black bg-orange-50';
  if (media.type === 'image') return <img src={media.url} alt={`Dokumentasi ${item.title}`} loading="lazy" className={className} />;
  if (compact) return <div className="h-48 border-b-3 border-black bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 flex items-center justify-center text-6xl" aria-label="Pratinjau video kegiatan">▶️</div>;
  if (media.type === 'video') return <video controls preload="metadata" src={media.url} className={className}>Peramban tidak mendukung pemutaran video.</video>;
  if (media.type === 'embed') return <iframe src={media.embedUrl} title={`Video atau foto ${item.title}`} loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="w-full aspect-video rounded-2xl border-2 border-black bg-black" />;
  return <a href={media.url} target="_blank" rel="noopener noreferrer" className="portal-button bg-orange-200">Buka foto atau video <ArrowUpRight size={16} /></a>;
}

function ContentDetail({ item, onClose }: { item: PortalContent; onClose: () => void }) {
  const config = contentConfig[item.kind];
  const photos = (item.details.photos || '').split('\n').map(safeUrl).filter(Boolean).slice(0, 30);
  return <PortalModal title={item.title} onClose={onClose}>
    <article className="space-y-5">
      {item.kind === 'documentation' ? <DocumentationVisual item={item} /> : safeUrl(item.image_url) && <img src={safeUrl(item.image_url)} alt={item.title} className="w-full max-h-80 object-contain rounded-2xl border-2 border-black bg-gray-100" />}
      {item.kind !== 'documentation' && item.summary && <p className="font-bold text-purple-900">{item.summary}</p>}
      {item.author_name && <p className="text-sm font-semibold">Oleh {item.author_name}</p>}
      <p className="whitespace-pre-wrap break-words leading-relaxed">{item.body}</p>
      {config.fields.filter(f => !['photos', 'video'].includes(f.key) && item.details[f.key]).map(f => <section key={f.key} className={`${config.color} border-2 border-black rounded-2xl p-4`}><h3 className="font-black mb-1">{f.label.replace(' (satu per baris)', '')}</h3><p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{item.details[f.key]}</p></section>)}
      {item.kind !== 'documentation' && !!photos.length && <div className="grid sm:grid-cols-2 gap-3">{photos.map((url, i) => <a key={`${url}-${i}`} href={url} target="_blank" rel="noopener noreferrer"><img src={url} loading="lazy" alt={`Foto kegiatan ${item.title}, ${i + 1}`} className="w-full rounded-xl border-2 border-black" /></a>)}</div>}
      {item.kind !== 'documentation' && safeUrl(item.details.video) && <a href={safeUrl(item.details.video)} target="_blank" rel="noopener noreferrer" className="portal-button bg-pink-300">Tonton video <ArrowUpRight size={16} /></a>}
      {item.kind !== 'documentation' && safeUrl(item.link_url) && <a href={safeUrl(item.link_url)} target="_blank" rel="noopener noreferrer" className="portal-button bg-yellow-300">{item.kind === 'resource' ? 'Buka / unduh sumber belajar' : 'Buka berkas / tautan'} <ArrowUpRight size={16} /></a>}
    </article>
  </PortalModal>;
}

export function ContentSection({ kind, items, isAdmin, refresh, emptyText }: { kind: ContentKind; items: PortalContent[]; isAdmin: boolean; refresh: () => Promise<void>; emptyText?: string }) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibility, setVisibility] = useState('all');
  const [limit, setLimit] = useState(12);
  const [editing, setEditing] = useState<PortalContent | null>(null);
  const [detail, setDetail] = useState<PortalContent | null>(null);
  const config = contentConfig[kind];
  const records = items.filter(i => i.kind === kind && (isAdmin || i.status === 'published'));
  const filterFields = config.fields.filter(f => ['category', 'subject', 'semester', 'period', 'progress'].includes(f.key));
  const filtered = useMemo(() => records.filter(item =>
    (visibility === 'all' || item.status === visibility) &&
    Object.entries(filters).every(([key, value]) => !value || item.details[key] === value) &&
    [item.title, item.summary, item.body, item.author_name, ...item.tags, ...Object.values(item.details)].join(' ').toLocaleLowerCase('id-ID').includes(query.toLocaleLowerCase('id-ID'))
  ), [records, filters, query, visibility]);
  return <section className="space-y-4" aria-label={config.label}>
    <div className="flex flex-wrap justify-between items-center gap-3">
      <h2 className="text-xl sm:text-2xl font-black">{config.emoji} {config.label}</h2>
      {isAdmin && <button className="portal-button bg-yellow-300" onClick={() => setEditing(blankContent(kind))}><Plus size={17} />Tambah {config.label}</button>}
    </div>
    {kind !== 'profile' && <div className="flex flex-wrap gap-3">
      <label className="relative flex-1 min-w-44"><span className="sr-only">Cari {config.label}</span><Search size={18} className="absolute left-3 top-3.5" /><input className="portal-input !pl-10" placeholder={`Cari ${config.label.toLowerCase()}…`} value={query} onChange={e => { setQuery(e.target.value); setLimit(12); }} /></label>
      {filterFields.map(field => <label key={field.key} className="min-w-32"><span className="sr-only">Filter {field.label}</span><select aria-label={`Filter ${field.label}`} className="portal-input" value={filters[field.key] || ''} onChange={e => { setFilters({ ...filters, [field.key]: e.target.value }); setLimit(12); }}><option value="">Semua {field.label.toLowerCase()}</option>{Array.from(new Set(records.map(i => i.details[field.key]).filter(Boolean))).sort().map(v => <option key={v}>{v}</option>)}</select></label>)}
    </div>}
    {isAdmin && <label className="portal-label max-w-xs">Tampilkan status<select className="portal-input" value={visibility} onChange={e => setVisibility(e.target.value)}><option value="all">Semua status</option><option value="published">Terbit</option><option value="draft">Draf</option><option value="archived">Arsip</option></select></label>}
    {!filtered.length ? <div className={`${config.color} rounded-3xl border-3 border-black p-7 shadow-[4px_4px_0_#000] text-center`}>
      <p className="text-4xl mb-3" aria-hidden="true">{config.emoji}</p>
      <p className="font-black">{records.length ? 'Belum ada hasil yang cocok.' : `Belum ada ${config.label.toLowerCase()} yang diterbitkan.`}</p>
      <p className="text-sm font-semibold mt-2">{records.length ? 'Coba kata kunci atau filter lain.' : emptyText || (isAdmin ? 'Gunakan tombol Tambah untuk menyiapkan konten pertama.' : 'Pengurus akan memperbarui informasi di sini.')}</p>
    </div> : <div className={`grid gap-5 ${kind === 'profile' ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {filtered.slice(0, limit).map(item => <article key={item.id} className="overflow-hidden bg-white rounded-3xl border-3 border-black shadow-[5px_5px_0_#000] flex flex-col">
        {kind === 'documentation' ? <DocumentationVisual item={item} compact /> : safeUrl(item.image_url) && <img src={safeUrl(item.image_url)} alt={item.title} loading="lazy" className={`w-full h-48 border-b-3 border-black ${kind === 'committee' ? 'object-contain bg-cyan-50' : 'object-cover'}`} />}
        <div className={`${config.color} border-b-2 border-black px-4 py-2 flex flex-wrap gap-2 justify-between text-xs font-black`}><span>{config.emoji} {item.details.category || item.details.position || item.details.progress || config.label}</span>{isAdmin && <span>{({ published: 'Terbit', draft: 'Draf', archived: 'Arsip' })[item.status]}</span>}</div>
        <div className="p-5 flex-1 flex flex-col gap-3">
          <h3 className="font-black text-lg break-words">{item.title}</h3>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${kind !== 'profile' ? 'line-clamp-4' : ''}`}>{kind === 'documentation' ? item.body : item.summary || item.body}</p>
          {kind === 'profile' && item.summary && <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>}
          <div className="flex flex-wrap gap-1.5">{[item.details.period, item.details.school, item.details.subject, item.details.semester && `Semester ${item.details.semester}`, item.details.date, ...item.tags].filter(Boolean).map((tag, idx) => <span key={idx} className="text-xs font-bold px-2 py-1 rounded-lg border border-black bg-gray-50 break-words">{tag}</span>)}</div>
          {item.author_name && <p className="text-xs font-bold text-gray-600">Oleh {item.author_name}</p>}
          <div className="mt-auto pt-2 flex flex-wrap gap-2">
            <button className="portal-button bg-purple-100" onClick={() => setDetail(item)}>Lihat detail</button>
            {kind === 'resource' && safeUrl(item.link_url) && <a href={safeUrl(item.link_url)} target="_blank" rel="noopener noreferrer" className="portal-button bg-yellow-300">Buka berkas <ArrowUpRight size={15} /></a>}
            {isAdmin && <button aria-label={`Edit ${item.title}`} className="portal-button bg-cyan-200" onClick={() => setEditing(item)}><Edit2 size={15} />Edit</button>}
          </div>
        </div>
      </article>)}
    </div>}
    {filtered.length > limit && <button className="portal-button bg-white" onClick={() => setLimit(v => v + 12)}>Tampilkan lebih banyak ({filtered.length - limit})</button>}
    {editing && isAdmin && <ContentEditor key={editing.id} initial={editing} onClose={() => setEditing(null)} onSaved={refresh} />}
    {detail && (detail.status === 'published' || isAdmin) && <ContentDetail item={detail} onClose={() => setDetail(null)} />}
  </section>;
}
