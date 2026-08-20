import React, { useState } from 'react';
import { DriveFolder, CategoryDrive } from '../types';
import { HardDrive, ExternalLink, BookOpen, FileSpreadsheet, CheckSquare, FileText, FolderArchive, Presentation, Search, Plus, UploadCloud, Download, Edit2, Trash2 } from 'lucide-react';
import { DriveUploadModal } from './DriveUploadModal';

interface DriveViewProps {
  driveFolders: DriveFolder[];
  isAdmin: boolean;
  onAddDriveFolder?: () => void;
  onEditDriveFolder?: (folder: DriveFolder) => void;
  onDeleteDriveFolder?: (id: string) => void;
  onUploadSuccess?: (fileInfo: any) => void;
}

export const DriveView: React.FC<DriveViewProps> = ({
  driveFolders,
  isAdmin,
  onAddDriveFolder,
  onEditDriveFolder,
  onDeleteDriveFolder,
  onUploadSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredFolders = driveFolders.filter(
    (f) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFolderIcon = (title: string) => {
    switch (title) {
      case 'Modul Ajar':
        return BookOpen;
      case 'ATP & TP':
        return FileSpreadsheet;
      case 'Asesmen':
        return CheckSquare;
      case 'Soal & Kisi-Kisi':
        return FileText;
      case 'Administrasi Kelas':
        return FolderArchive;
      default:
        return Presentation;
    }
  };

  const handleUploadComplete = (fileInfo: any) => {
    if (onUploadSuccess) {
      onUploadSuccess(fileInfo);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 text-black p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
              <HardDrive className="w-4 h-4" />
              <span>SIXDRIVE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
              📚 Google Drive KKG
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-1 max-w-xl">
              File administrasi & perangkat ajar Kurikulum Merdeka terintegrasi langsung dengan Google Drive KKG Pagu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* UNGGAH DRIVE BUTTON */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>📤 Unggah File ke Drive</span>
            </button>

            {/* INDUK GOOGLE DRIVE BUTTON */}
            <a
              href="https://drive.google.com/drive/folders/1baa5tRmJiob88KcN_igCr0WNNry00j2i?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white hover:bg-gray-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Induk Drive ↗</span>
            </a>

            {isAdmin && onAddDriveFolder && (
              <button
                onClick={onAddDriveFolder}
                className="px-3 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Folder</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-md">
          <Search className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 Cari modul, ATP, asesmen, atau media..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-3 border-black font-bold text-xs shadow-[3px_3px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Admin Quick Banner Notice */}
      {isAdmin && (
        <div className="bg-amber-100 border-3 border-black p-4 rounded-2xl shadow-[3px_3px_0_0_#000] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <p className="text-xs font-black text-black">
              Mode Admin Aktif: Anda dapat mengubah/mengisi link Google Drive untuk setiap jenis folder (Modul Ajar, ATP, Soal, dll). Hasilnya langsung tersimpan ke database & dapat diakses seluruh guru.
            </p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFolders.map((folder) => {
          const IconComponent = getFolderIcon(folder.title);
          return (
            <div
              key={folder.id}
              className="bg-white rounded-3xl border-3 border-black p-5 shadow-[4px_4px_0_0_#000] flex flex-col justify-between hover:shadow-[6px_6px_0_0_#000] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${folder.color} border-2 border-black text-white flex items-center justify-center font-black shadow-[2px_2px_0_0_#000]`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-yellow-300 text-black font-black text-xs px-3 py-1 rounded-full border border-black shadow-[1px_1px_0_0_#000]">
                      {folder.fileCount} file
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-black mb-1">
                  {folder.title}
                </h3>
                <p className="text-xs font-bold text-gray-600 mb-4 line-clamp-2">
                  {folder.description}
                </p>
              </div>

              <div className="space-y-2 mt-2">
                {/* 2 Main Action Buttons: Unduh & Buka */}
                <div className="flex gap-2">
                  <a
                    href={folder.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!folder.url) {
                        e.preventDefault();
                        alert('Link Google Drive untuk kategori ini belum diatur oleh admin.');
                      }
                    }}
                    className="flex-1 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1 transition-transform active:scale-95 text-center"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Unduh File</span>
                  </a>

                  <a
                    href={folder.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!folder.url) {
                        e.preventDefault();
                        alert('Link Google Drive untuk kategori ini belum diatur oleh admin.');
                      }
                    }}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1 transition-transform active:scale-95 text-center"
                  >
                    <span>Buka Drive</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-1">
                    {onEditDriveFolder && (
                      <button
                        onClick={() => onEditDriveFolder(folder)}
                        className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Link Google Drive</span>
                      </button>
                    )}
                    {onDeleteDriveFolder && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus folder "${folder.title}"?`)) {
                            onDeleteDriveFolder(folder.id);
                          }
                        }}
                        className="p-2 bg-red-400 hover:bg-red-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] transition-transform active:scale-95"
                        title="Hapus Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Shared File Instructions Notice */}
      <div className="bg-purple-100 border-3 border-black rounded-3xl p-5 shadow-[4px_4px_0_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-black flex items-center justify-center shrink-0 font-black shadow-[2px_2px_0_0_#000]">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-black">
              Punya Modul / Perangkat Ajar Baru?
            </h4>
            <p className="text-xs font-bold text-gray-700 mt-0.5">
              Bapak/Ibu Guru dapat mengunggah file langsung ke folder SIXDRIVE atau mengirimkan tautannya.
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] text-center transition-transform active:scale-95"
          >
            📤 Unggah File Sekarang
          </button>
          <a
            href="https://chat.whatsapp.com/H8awmBQpl361F1XfcsE6hG?s=cl&p=a&mlu=0&amv=0"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] text-center"
          >
            Grup WA 💬
          </a>
        </div>
      </div>

      {/* Drive Upload Modal */}
      <DriveUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadComplete}
        categories={driveFolders.map((f) => f.title)}
      />
    </div>
  );
};


