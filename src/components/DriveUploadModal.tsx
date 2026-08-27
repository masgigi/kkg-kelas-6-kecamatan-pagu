import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CategoryDrive } from '../types';
import { UploadCloud, X, CheckCircle2, FileText, Link, Folder, Sparkles, Loader2 } from 'lucide-react';

interface DriveUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (fileInfo: {
    title: string;
    category: CategoryDrive;
    uploader: string;
    fileUrl?: string;
    fileName?: string;
  }) => void;
  categories: CategoryDrive[];
}

export const DriveUploadModal: React.FC<DriveUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  categories
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryDrive>(categories[0] || 'Modul Ajar');
  const [fileTitle, setFileTitle] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'device' | 'link'>('device');
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!fileTitle) {
        setFileTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!fileTitle.trim()) errors.fileTitle = 'Judul file wajib diisi.';
    if (uploadMode === 'link' && !driveUrl.trim()) errors.driveUrl = 'Link Google Drive wajib diisi.';
    if (uploadMode === 'device' && !selectedFile) errors.file = 'Pilih file dari HP/Laptop.';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setFormErrors({});

    const uploaderInfo = `${uploaderName.trim() || 'Guru Kelas 6'} (${schoolName.trim() || 'Kecamatan Pagu'})`;
    setIsUploading(true);

    let fileUrl = uploadMode === 'link' ? driveUrl.trim() : '';

    if (uploadMode === 'device' && selectedFile) {
      const filePath = `kkg-files/${selectedCategory}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage.from('kkg-files').upload(filePath, selectedFile);
      if (uploadError) {
        setIsUploading(false);
        alert(`Gagal mengunggah file: ${uploadError.message}`);
        return;
      }
      const { data: urlData } = supabase.storage.from('kkg-files').getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    }

    onUploadSuccess({
      title: fileTitle,
      category: selectedCategory,
      uploader: uploaderInfo,
      fileUrl,
      fileName: selectedFile ? selectedFile.name : fileTitle
    });

    alert(`Berhasil! File "${fileTitle}" telah diunggah ke folder ${selectedCategory} SIXDRIVE KKG!`);
    setIsUploading(false);
    setFileTitle('');
    setDriveUrl('');
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] my-8 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 p-5 border-b-4 border-black flex items-center justify-between text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black leading-tight">
                📤 Unggah File ke SIXDRIVE
              </h2>
              <p className="text-xs font-bold text-black/80">
                Bagikan modul, ATP, asesmen, atau media pembelajaran guru
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Mode Selector */}
          <div className="flex rounded-2xl border-2 border-black p-1 bg-gray-100 shadow-[2px_2px_0_0_#000]">
            <button
              type="button"
              onClick={() => setUploadMode('device')}
              className={`flex-1 py-2 font-black text-xs rounded-xl transition-all ${
                uploadMode === 'device'
                  ? 'bg-purple-600 text-white border-2 border-black shadow-[1px_1px_0_0_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              📁 Unggah dari Laptop/HP
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`flex-1 py-2 font-black text-xs rounded-xl transition-all ${
                uploadMode === 'link'
                  ? 'bg-purple-600 text-white border-2 border-black shadow-[1px_1px_0_0_#000]'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              🔗 Tempel Link Google Drive
            </button>
          </div>

          {/* Target Folder Category */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Pilih Kategori Folder Target <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryDrive)}
              className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs bg-white shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  📂 {cat}
                </option>
              ))}
            </select>
          </div>

          {/* File Title */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Judul File Pembelajaran <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="Contoh: Modul Ajar IPAS Bab 1 Fase C - SDN Pagu 1"
              className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Upload Input Mode */}
          {uploadMode === 'device' ? (
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Pilih Berkas File (PDF, DOCX, PPTX, ZIP, MP4, image) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-black rounded-2xl p-4 text-center bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-purple-600 mx-auto mb-1" />
                <p className="font-black text-xs text-black">
                  {selectedFile ? `📄 ${selectedFile.name}` : 'Klik atau Tarik File ke Sini'}
                </p>
                <p className="text-[10px] font-bold text-gray-500 mt-1">
                  Mendukung berkas PDF, Word, PPT, Excel, Gambar, atau ZIP.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-black text-black mb-1">
                Link Tautan Google Drive <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required={uploadMode === 'link'}
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Uploader Name & School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-black mb-1">Nama Pengunggah</label>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-black mb-1">Sekolah / Unit Kerja</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="SDN Pagu 1"
                className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
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
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirim & Unggah ke SIXDRIVE</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
