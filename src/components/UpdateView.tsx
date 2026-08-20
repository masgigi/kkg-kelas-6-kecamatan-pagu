import React, { useState } from 'react';
import { AnnouncementItem } from '../types';
import { MessageSquare, Pin, Send, Plus, Trash2, Tag, ThumbsUp, Heart } from 'lucide-react';

interface UpdateViewProps {
  announcements: AnnouncementItem[];
  isAdmin: boolean;
  onAddAnnouncement: (ann: Omit<AnnouncementItem, 'id'>) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const UpdateView: React.FC<UpdateViewProps> = ({
  announcements,
  isAdmin,
  onAddAnnouncement,
  onDeleteAnnouncement
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Pengurus KKG');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('#KKG6UP, #Pagu, #GuruKelas6');

  // Likes state
  const [likes, setLikes] = useState<Record<string, number>>({});

  const handleLike = (id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Mohon lengkapi judul dan isi pengumuman.');
      return;
    }

    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddAnnouncement({
      title,
      author,
      content,
      tags: tagsArr,
      date: new Date().toISOString().split('T')[0],
      isPinned: false
    });

    setTitle('');
    setContent('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 text-white p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-yellow-300 text-black font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
              <MessageSquare className="w-4 h-4" />
              <span>SIXUPDATE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              📢 Feed & Informasi KKG
            </h1>
            <p className="text-xs sm:text-sm font-bold text-pink-100 mt-1">
              Pengumuman resmi, info mendadak, & berita seputar KKG Guru Kelas 6 Kecamatan Pagu.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buat Pengumuman</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Post Form */}
      {isFormOpen && (
        <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[6px_6px_0_0_#000] space-y-3">
          <h3 className="text-lg font-black text-black border-b-2 border-black pb-2 flex items-center gap-2">
            ✍️ Buat Info Baru
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">Judul Pengumuman</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: 📣 Persiapan Lomba MAPSI Kelas 6"
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-black text-black mb-1">Penulis / Pengirim</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Hashtags (pisahkan koma)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1">Isi Pesan</label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan detail informasi di sini..."
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-gray-200 text-black font-black text-xs rounded-xl border-2 border-black"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Posting Info</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-3xl border-3 border-black p-5 sm:p-6 shadow-[4px_4px_0_0_#000] ${
              ann.isPinned ? 'ring-4 ring-yellow-300' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white border-2 border-black flex items-center justify-center font-black text-xs shadow-[1px_1px_0_0_#000]">
                  📣
                </span>
                <div>
                  <h4 className="font-black text-xs text-black">{ann.author}</h4>
                  <p className="text-[10px] font-extrabold text-gray-500">{ann.date}</p>
                </div>
              </div>

              {ann.isPinned && (
                <span className="bg-yellow-300 text-black font-black text-[10px] px-2.5 py-0.5 rounded-full border border-black flex items-center gap-1 shadow-[1px_1px_0_0_#000]">
                  <Pin className="w-3 h-3 fill-black" />
                  <span>PINNED</span>
                </span>
              )}
            </div>

            <h3 className="text-lg font-black text-black mb-2">{ann.title}</h3>

            <p className="text-xs font-semibold text-gray-800 whitespace-pre-line leading-relaxed mb-4">
              {ann.content}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-gray-100">
              <div className="flex flex-wrap gap-1.5">
                {ann.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-yellow-200 text-black text-[10px] font-black px-2 py-0.5 rounded border border-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(ann.id)}
                  className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-900 font-black text-xs rounded-xl border border-black flex items-center gap-1 transition-transform active:scale-90"
                >
                  <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-600" />
                  <span>{likes[ann.id] || 12} Like</span>
                </button>

                {isAdmin && onDeleteAnnouncement && (
                  <button
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="p-1.5 bg-red-400 text-black rounded-lg border border-black"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
