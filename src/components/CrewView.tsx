import React, { useState } from 'react';
import { TeacherItem } from '../types';
import { Users, Phone, Mail, Search, School, LayoutGrid, Table as TableIcon, Plus, Trash2, Edit3 } from 'lucide-react';

interface CrewViewProps {
  teachers: TeacherItem[];
  isAdmin: boolean;
  onAddTeacher?: () => void;
  onEditTeacher?: (t: TeacherItem) => void;
  onDeleteTeacher?: (id: string) => void;
}

export const CrewView: React.FC<CrewViewProps> = ({
  teachers,
  isAdmin,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const schools = Array.from(new Set(teachers.map((t) => t.school)));

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.school.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSchool = selectedSchool === 'semua' || t.school === selectedSchool;

    return matchesSearch && matchesSchool;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 text-black p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
              <Users className="w-4 h-4" />
              <span>SIXCREW</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
              👩‍🏫 Database Guru Kelas 6
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-1">
              Direktori kontak & profil guru Kelas 6 se-Kecamatan Pagu, Kabupaten Kediri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Kirim via WA Group Link */}
            <a
              href="https://chat.whatsapp.com/H8awmBQpl361F1XfcsE6hG?s=cl&p=a&mlu=0&amv=0"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-emerald-400 hover:bg-emerald-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Phone className="w-4 h-4 fill-black" />
              <span>Grup WA KKG 💬</span>
            </a>

            {/* View Mode Toggle */}
            <div className="bg-white p-1 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg font-black text-xs ${
                  viewMode === 'grid' ? 'bg-yellow-300 text-black border border-black' : 'text-gray-600'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg font-black text-xs ${
                  viewMode === 'table' ? 'bg-yellow-300 text-black border border-black' : 'text-gray-600'
                }`}
                title="Tampilan Tabel"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {isAdmin && onAddTeacher && (
              <button
                onClick={onAddTeacher}
                className="px-4 py-2.5 bg-purple-600 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Guru</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔎 Cari nama guru atau sekolah..."
              className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border-3 border-black font-bold text-xs shadow-[3px_3px_0_0_#000] focus:outline-none"
            />
          </div>

          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="py-2.5 px-4 rounded-2xl bg-white border-3 border-black font-black text-xs shadow-[3px_3px_0_0_#000] focus:outline-none"
          >
            <option value="semua">🏫 Semua Sekolah</option>
            {schools.map((sch) => (
              <option key={sch} value={sch}>
                {sch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border-3 border-black p-5 shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-300 border-2 border-black flex items-center justify-center text-xl font-black shadow-[2px_2px_0_0_#000] shrink-0">
                    👩‍🏫
                  </div>
                  <div>
                    <h3 className="font-black text-base text-black leading-tight uppercase">
                      {t.name}
                    </h3>
                    {t.nip && t.nip !== '-' && (
                      <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                        NIP/NIPPPK: <span className="font-mono text-black">{t.nip}</span>
                      </p>
                    )}
                    <p className="text-xs font-black text-purple-700 mt-1 flex items-center gap-1">
                      <School className="w-3.5 h-3.5" />
                      <span>{t.school}</span>
                    </p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t-2 border-gray-100 mt-3">
                  {onEditTeacher && (
                    <button
                      onClick={() => onEditTeacher(t)}
                      className="flex-1 py-1.5 bg-amber-300 hover:bg-amber-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[1px_1px_0_0_#000] active:scale-95 transition-transform"
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteTeacher && (
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus data guru "${t.name}"?`)) {
                          onDeleteTeacher(t.id);
                        }
                      }}
                      className="flex-1 py-1.5 bg-red-400 hover:bg-red-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[1px_1px_0_0_#000] active:scale-95 transition-transform"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead>
                <tr className="bg-purple-100 border-b-2 border-black text-purple-950 uppercase text-[10px] tracking-wider">
                  <th className="p-3 border-r-2 border-black w-12 text-center">No</th>
                  <th className="p-3 border-r-2 border-black">Nama Guru</th>
                  <th className="p-3 border-r-2 border-black">NIP / NIPPPK</th>
                  <th className="p-3 border-r-2 border-black">Sekolah</th>
                  {isAdmin && <th className="p-3 text-center w-28">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredTeachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-yellow-50/50">
                    <td className="p-3 border-r-2 border-black text-center font-black">{idx + 1}</td>
                    <td className="p-3 border-r-2 border-black font-black text-black text-xs uppercase">{t.name}</td>
                    <td className="p-3 border-r-2 border-black font-mono text-gray-700">{t.nip || '-'}</td>
                    <td className="p-3 border-r-2 border-black font-bold text-gray-800">{t.school}</td>
                    {isAdmin && (
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onEditTeacher && (
                            <button
                              onClick={() => onEditTeacher(t)}
                              className="p-1.5 bg-amber-300 hover:bg-amber-400 text-black rounded-lg border border-black"
                              title="Edit Data Guru"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteTeacher && (
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus data guru "${t.name}"?`)) {
                                  onDeleteTeacher(t.id);
                                }
                              }}
                              className="p-1.5 bg-red-400 hover:bg-red-500 text-black rounded-lg border border-black"
                              title="Hapus Data Guru"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
