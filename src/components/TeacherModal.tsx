import React, { useState, useEffect } from 'react';
import { TeacherItem } from '../types';
import { Users, X, CheckCircle2, School, User } from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Omit<TeacherItem, 'id'> | TeacherItem) => void;
  initialTeacher?: TeacherItem | null;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTeacher
}) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [nip, setNip] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (initialTeacher) {
      setName(initialTeacher.name);
      setSchool(initialTeacher.school);
      setNip(initialTeacher.nip || '');
      setRole(initialTeacher.role || 'Guru Kelas VI');
      setPhone(initialTeacher.phone || '');
      setEmail(initialTeacher.email || '');
    } else {
      setName('');
      setSchool('SDN SEMEN');
      setNip('');
      setRole('Guru Kelas VI');
      setPhone('');
      setEmail('');
    }
  }, [initialTeacher, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !school.trim()) {
      alert('Mohon isi Nama Guru dan Sekolah.');
      return;
    }

    const teacherData: TeacherItem = {
      ...(initialTeacher ? { id: initialTeacher.id } : { id: 't-' + Date.now() }),
      name: name.trim().toUpperCase(),
      school: school.trim().toUpperCase(),
      nip: nip.trim() || '-',
      role: role.trim() || 'Guru Kelas VI',
      phone: phone.trim() || '081234567890',
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`
    };

    onSave(teacherData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0_0_#000] my-8 overflow-hidden text-gray-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 p-5 border-b-4 border-black flex items-center justify-between text-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center font-black">
              👩‍🏫
            </div>
            <div>
              <h2 className="text-lg font-black text-black leading-tight">
                {initialTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h2>
              <p className="text-xs font-bold text-black/80">
                Input Nama, NIP/NIPPPK, dan Sekolah
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
          
          {/* Nama Guru */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Nama Guru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: HERMIN TRIYATI"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600 uppercase"
              />
            </div>
          </div>

          {/* NIP / NIPPPK */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              NIP / NIPPPK
            </label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Contoh: 19760317 202321 2 003"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Nama Sekolah */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Sekolah Asal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Contoh: SDN SEMEN"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600 uppercase"
              />
            </div>
          </div>

          {/* Jabatan / Peran */}
          <div>
            <label className="block text-xs font-black text-black mb-1">
              Jabatan / Peran
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Guru Kelas VI"
              className="w-full px-3 py-2.5 rounded-xl border-2 border-black font-bold text-xs shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-2 focus:ring-purple-600"
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
              className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0_0_#000] transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Data Guru</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
