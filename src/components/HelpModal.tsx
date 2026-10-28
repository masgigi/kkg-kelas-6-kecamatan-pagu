import React, { useState } from 'react';
import { BookOpen, HelpCircle, Shield, ArrowUpRight } from 'lucide-react';
import { PortalModal } from '../features/portal/PortalModal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminModal: () => void;
}

const guides = [
  { title: 'Profil & Pengurus', emoji: '👥', text: 'Baca profil KKG, daftar pengurus yang telah diterbitkan, dan jumlah guru anggota.' },
  { title: 'Program & Agenda', emoji: '🎯', text: 'Lihat program kerja yang diterbitkan. Tombol Buka agenda & jadwal menampilkan waktu, lokasi, rincian kegiatan, dan tautan undangan jika tersedia.' },
  { title: 'Informasi KKG', emoji: '📢', text: 'Baca pengumuman, lampiran, dan masa berlakunya. Pengumuman yang telah kedaluwarsa tidak ditampilkan kepada pengunjung.' },
  { title: 'Dokumentasi & Praktik Baik', emoji: '📸', text: 'Jelajahi dokumentasi kegiatan dan praktik baik. Guru dapat mengirim cerita praktik baik tanpa login untuk ditinjau pengurus.' },
  { title: 'Perangkat & Sumber Belajar', emoji: '📚', text: 'Cari bahan ajar pada katalog atau buka folder SIXDRIVE. Guru dapat mengusulkan tautan sumber belajar tanpa login.' },
  { title: 'Layanan Anggota', emoji: '🗂️', text: 'Buka arsip dan tautan layanan, lihat kas serta data guru, dan kirim usulan kepada pengurus.' }
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onOpenAdminModal }) => {
  const [tab, setTab] = useState<'fitur' | 'akses' | 'faq'>('fitur');
  if (!isOpen) return null;

  return <PortalModal title="📖 Panduan KKG6UP!" onClose={onClose}>
    <div className="space-y-5 text-sm">
      <p className="font-semibold">Temukan informasi KKG Kelas 6 Kecamatan Pagu, lalu pilih menu sesuai kebutuhan Anda.</p>
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Bagian panduan">
        {[
          { id: 'fitur', label: 'Menu & fitur', icon: BookOpen },
          { id: 'akses', label: 'Akses', icon: Shield },
          { id: 'faq', label: 'Tanya jawab', icon: HelpCircle }
        ].map(item => { const Icon = item.icon; return <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id as typeof tab)} className={`portal-button !px-2 ${tab === item.id ? 'bg-purple-600 text-white' : 'bg-white'}`}><Icon size={16} /><span>{item.label}</span></button>; })}
      </div>

      {tab === 'fitur' && <div role="tabpanel" className="grid sm:grid-cols-2 gap-3">
        {guides.map((guide, index) => <section key={guide.title} className={`${['bg-purple-100', 'bg-orange-100', 'bg-cyan-100', 'bg-pink-100', 'bg-yellow-100', 'bg-lime-100'][index]} border-2 border-black rounded-2xl p-4`}>
          <h3 className="font-black text-base">{guide.emoji} {guide.title}</h3><p className="mt-2 leading-relaxed">{guide.text}</p>
        </section>)}
        <section className="sm:col-span-2 bg-gray-100 border-2 border-black rounded-2xl p-4"><h3 className="font-black text-base">📅 Jadwal, presensi, dan rapat</h3><p className="mt-2 leading-relaxed">Menu Jadwal menampilkan agenda kegiatan. Presensi dibuka dari halaman Program & Agenda. Menu Rapat Online menampilkan tautan rapat yang diatur pengurus.</p></section>
      </div>}

      {tab === 'akses' && <div role="tabpanel" className="space-y-3">
        <section className="bg-cyan-100 border-2 border-black rounded-2xl p-4"><h3 className="font-black text-base">👤 Pengunjung dan guru</h3><p className="mt-2 leading-relaxed">Dapat membaca informasi yang diterbitkan dan mengirim praktik baik, sumber belajar, atau usulan tanpa login. Kiriman tidak langsung muncul di website.</p></section>
        <section className="bg-purple-100 border-2 border-black rounded-2xl p-4"><h3 className="font-black text-base">🛡️ Pengurus / admin</h3><p className="mt-2 leading-relaxed">Masuk melalui Kelola Web untuk menambah atau mengubah konten, mengelola jadwal dan pengumuman, serta meninjau kiriman guru sebelum diterbitkan.</p><button type="button" className="portal-button bg-yellow-300 mt-3" onClick={() => { onClose(); onOpenAdminModal(); }}>Buka Kelola Web <ArrowUpRight size={16} /></button></section>
      </div>}

      {tab === 'faq' && <div role="tabpanel" className="space-y-3">
        <section className="bg-white border-2 border-black rounded-2xl p-4"><h3 className="font-black">Bagaimana mengirim praktik baik atau bahan ajar?</h3><p className="mt-2">Buka Dokumentasi & Praktik Baik atau Perangkat & Sumber Belajar, lalu pilih tombol Bagikan. Isi identitas dan tautan bahan pendukung. Simpan nomor referensi setelah pengiriman.</p></section>
        <section className="bg-white border-2 border-black rounded-2xl p-4"><h3 className="font-black">Kapan kiriman saya tampil?</h3><p className="mt-2">Pengurus memeriksa kiriman lebih dahulu. Praktik baik dan sumber belajar tampil setelah disetujui dan diterbitkan oleh admin.</p></section>
        <section className="bg-white border-2 border-black rounded-2xl p-4"><h3 className="font-black">Di mana melihat berkas dan undangan?</h3><p className="mt-2">Buka katalog Sumber Belajar atau Folder SIXDRIVE untuk berkas. Tautan undangan hanya muncul pada detail jadwal jika pengurus telah menambahkannya.</p></section>
      </div>}
    </div>
  </PortalModal>;
};
