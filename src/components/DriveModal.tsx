import React, { useState, useEffect } from 'react';
import { DriveFolder } from '../types';
import { HardDrive, X, CheckCircle2, Link, FolderPlus, FileText } from 'lucide-react';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderData: DriveFolder) => void;
  initialFolder?: DriveFolder | null;
}

export const DriveModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFolder
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fileCount, setFileCount] = useState<number>(10);

  useEffect(() => {
    if (initialFolder) {
      setTitle(initialFolder.title);
      setUrl(initialFolder.url || '');
      setDescription(initialFolder.description || '');
      setFileCount(initialFolder.fileCount || 0);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setFileCount(10);
    }
  }, [initialFolder, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi Nama/Kategori Folder.');
      return;
    }
    if (!url.trim()) {
      alert('Mohon isi Link Google Drive.');
      return;
    }

    const folderData: DriveFolder = {
      id: initialFolder ? initialFolder.id : 'df-' + Date.now(),
      title: title.trim() as any,
      url: url.trim(),
      description: description.trim() || 'Folder dokumen pembelajaran KKG SIXDRIVE',
      fileCount: Number(fileCount) || 0,
      color: initialFolder?.color || 'from-purple-500 to-indigo-600',
      iconName: initialFolder?.iconName || 'BookOpen'
    };

    onSave(folderData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] my-8 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 p-5 border-b-4 border-black flex items-center justify-between text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black leading-tight">
                {initialFolder ? `Edit Link: ${initialFolder.title}` : 'Tambah Folder SIXDRIVE'}
              </h2>
              <p className="text-xs font-bold text-black/80">
                Atur Link Google Drive untuk Akses Guru
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-gray-100 text-black rounded-xl border-2 border-black font-black shadow-[2px_2px_0_0_#000]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Title / Kategori */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Nama / Jenis Folder <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FolderPlus className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Modul Ajar, ATP & TP, Bank Soal..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Link Google Drive */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Link Google Drive <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <p className="text-[10px] font-bold text-gray-500 mt-1">
              💡 Pastikan link Google Drive sudah diatur agar memiliki akses publik/pengguna yang memiliki link.
            </p>
          </div>

          {/* Deskripsi Singular */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Keterangan / Deskripsi
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Modul ajar Kurikulum Merdeka Semester 1 & 2 lengkap..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Jumlah File ESTIMATED */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Perkiraan Jumlah File
            </label>
            <input
              type="number"
              min={0}
              value={fileCount}
              onChange={(e) => setFileCount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-black font-black text-xs rounded-xl border-2 border-black"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Link Drive</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
