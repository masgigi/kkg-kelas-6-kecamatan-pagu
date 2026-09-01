import React, { useState, useMemo } from 'react';
import {
  AttendanceItem,
  ScheduleItem,
  TeacherItem,
} from '../types';
import {
  CheckCircle2,
  Search,
  Calendar,
  User,
  Clock,
  Filter,
  Trash2,
  Download,
  FileText,
  AlertTriangle,
  List,
  BarChart3,
} from 'lucide-react';

interface AttendanceAdminProps {
  attendance: AttendanceItem[];
  schedules: ScheduleItem[];
  teachers: TeacherItem[];
  isAdmin?: boolean;
  onDeleteAttendance?: (id: string) => void;
}

const formatDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

const formatCheckInTime = (isoString: string) => {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d) + ' WIB';
};

export const AttendanceAdmin: React.FC<AttendanceAdminProps> = ({
  attendance,
  schedules,
  teachers,
  isAdmin = false,
  onDeleteAttendance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScheduleId, setSelectedScheduleId] = useState('semua');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [viewMode, setViewMode] = useState<'table' | 'summary'>('table');
  const attendanceUrl = `${window.location.origin}${window.location.pathname}?absen=1`;

  /* ---- derived data ---- */

  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleItem>();
    schedules.forEach((s) => map.set(s.id, s));
    return map;
  }, [schedules]);

  const filteredAttendance = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return attendance.filter((a) => {
      const matchesSearch =
        !query ||
        a.teacherName.toLowerCase().includes(query) ||
        a.school.toLowerCase().includes(query) ||
        (a.note && a.note.toLowerCase().includes(query));

      const matchesSchedule =
        selectedScheduleId === 'semua' || a.scheduleId === selectedScheduleId;

      const matchesStatus =
        selectedStatus === 'semua' || a.status === selectedStatus;

      return matchesSearch && matchesSchedule && matchesStatus;
    });
  }, [attendance, searchTerm, selectedScheduleId, selectedStatus]);

  const stats = useMemo(() => {
    const total = filteredAttendance.length;
    const hadir = filteredAttendance.filter((a) => a.status === 'Hadir').length;
    const izin = filteredAttendance.filter((a) => a.status === 'Izin').length;
    return { total, hadir, izin };
  }, [filteredAttendance]);

  const perScheduleStats = useMemo(() => {
    const grouped = new Map<string, { hadir: number; izin: number; schedule: ScheduleItem }>();
    filteredAttendance.forEach((a) => {
      const existing = grouped.get(a.scheduleId);
      const schedule = scheduleMap.get(a.scheduleId);
      if (existing) {
        if (a.status === 'Hadir') existing.hadir += 1;
        else existing.izin += 1;
      } else if (schedule) {
        grouped.set(a.scheduleId, {
          hadir: a.status === 'Hadir' ? 1 : 0,
          izin: a.status === 'Izin' ? 1 : 0,
          schedule,
        });
      }
    });
    return Array.from(grouped.entries()).sort(
      ([, a], [, b]) => b.schedule.date.localeCompare(a.schedule.date),
    );
  }, [filteredAttendance, scheduleMap]);

  /* ---- export CSV ---- */

  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal Jadwal', 'Nama Guru', 'Sekolah', 'Status', 'Waktu Absen', 'Catatan'];
    const rows = filteredAttendance.map((a, idx) => {
      const sch = scheduleMap.get(a.scheduleId);
      return [
        idx + 1,
        sch ? `${sch.title} (${formatDate(sch.date)})` : a.scheduleId,
        a.teacherName,
        a.school,
        a.status,
        formatCheckInTime(a.checkedInAt),
        a.note || '',
      ];
    });

    const csvContent =
      '﻿' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join(
        '\r\n',
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Absensi_KKG6_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ---- print report ---- */

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up browser untuk mencetak rekap absensi.');
      return;
    }

    const rowsHtml = filteredAttendance
      .map((a, idx) => {
        const sch = scheduleMap.get(a.scheduleId);
        return `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td><strong>${sch ? sch.title : '-'}</strong><br/><small>${sch ? formatDate(sch.date) : ''}</small></td>
            <td>${a.teacherName}</td>
            <td>${a.school}</td>
            <td><strong>${a.status}</strong></td>
            <td>${formatCheckInTime(a.checkedInAt)}</td>
            <td>${a.note || '-'}</td>
          </tr>`;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap Absensi KKG6UP!</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #1f2937; }
            .header { text-align: center; border-bottom: 3px double #7c3aed; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #7c3aed; font-size: 22px; }
            .header h2 { margin: 5px 0 0; font-size: 14px; color: #4b5563; }
            .header p { margin: 3px 0 0; font-size: 12px; color: #6b7280; }
            .summary { display: flex; justify-content: center; gap: 30px; margin-bottom: 20px; }
            .summary-card { padding: 10px 20px; border-radius: 6px; border: 1px solid #e5e7eb; background: #f9fafb; text-align: center; }
            .summary-card .label { font-size: 11px; text-transform: uppercase; color: #6b7280; }
            .summary-card .value { font-size: 20px; font-weight: bold; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 6px 8px; }
            th { background-color: #f3f4f6; text-align: left; font-weight: bold; }
            .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
            .sig-box { text-align: center; width: 200px; }
            .sig-space { height: 50px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REKAP ABSENSI KKG KELAS 6</h1>
            <h2>KECAMATAN PAGU - KABUPATEN KEDIRI</h2>
            <p>Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</p>
          </div>
          <div class="summary">
            <div class="summary-card"><div class="label">Total Records</div><div class="value" style="color:#7c3aed">${stats.total}</div></div>
            <div class="summary-card"><div class="label">Hadir</div><div class="value" style="color:#059669">${stats.hadir}</div></div>
            <div class="summary-card"><div class="label">Izin</div><div class="value" style="color:#d97706">${stats.izin}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:30px">No</th>
                <th>Jadwal</th>
                <th>Nama Guru</th>
                <th>Sekolah</th>
                <th style="width:60px">Status</th>
                <th style="width:100px">Waktu Absen</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="signatures">
            <div class="sig-box">
              <p>Mengetahui,<br/><strong>Bendahara KKG Pagu</strong></p>
              <div class="sig-space"></div>
              <p><u><strong>Bendahara KKG</strong></u></p>
            </div>
            <div class="sig-box">
              <p>Pagu, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/><strong>Ketua KKG Kelas 6 Pagu</strong></p>
              <div class="sig-space"></div>
              <p><u><strong>Ketua KKG</strong></u></p>
            </div>
          </div>
          <script>
            window.onload = function() { setTimeout(function() { window.print(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /* ---- render ---- */

  return (
    <div className="space-y-6 pb-12">
      {/* -------- Header Banner -------- */}
      <div className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 text-black p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
              <CheckCircle2 className="w-4 h-4" />
              <span>SIXABSEN</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
              Rekap Absensi KKG Guru Kelas 6
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-1">
              Pantau kehadiran guru anggota KKG se-Kecamatan Pagu, Kabupaten Kediri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-white p-1 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex gap-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg font-black text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-yellow-300 text-black border border-black'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Tabel Detail"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`p-2 rounded-lg font-black text-xs transition-colors ${
                  viewMode === 'summary'
                    ? 'bg-yellow-300 text-black border border-black'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Ringkasan per Jadwal"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handlePrintReport}
              className="px-3.5 py-2.5 bg-white hover:bg-gray-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Cetak Laporan</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* ---- Stats Cards ---- */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/95 rounded-2xl border-3 border-black p-4 shadow-[3px_3px_0_0_#000] text-center">
            <p className="text-[10px] font-black uppercase text-purple-800">Total Records</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white/95 rounded-2xl border-3 border-black p-4 shadow-[3px_3px_0_0_#000] text-center">
            <p className="text-[10px] font-black uppercase text-emerald-800">Hadir</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{stats.hadir}</p>
          </div>
          <div className="bg-white/95 rounded-2xl border-3 border-black p-4 shadow-[3px_3px_0_0_#000] text-center">
            <p className="text-[10px] font-black uppercase text-amber-800">Izin</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{stats.izin}</p>
          </div>
        </div>
      </div>

      {/* -------- Filter Bar -------- */}
      <div className="bg-white rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama guru, sekolah, atau catatan..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border-2 border-black font-bold text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="py-2 pl-8 pr-3 rounded-xl bg-gray-50 border-2 border-black font-extrabold text-xs focus:outline-none appearance-none"
            >
              <option value="semua">Semua Jadwal</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} - {formatDate(s.date)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-2 px-3 rounded-xl bg-gray-50 border-2 border-black font-extrabold text-xs focus:outline-none"
          >
            <option value="semua">Semua Status</option>
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
          </select>
        </div>
      </div>

      {/* -------- Empty State -------- */}
      {filteredAttendance.length === 0 && (
        <div className="bg-white rounded-3xl border-3 border-black p-10 text-center shadow-[4px_4px_0_0_#000]">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="font-black text-lg text-gray-600">Belum ada data absensi</p>
          <p className="text-sm font-bold text-gray-400 mt-1">
            Data kehadiran guru akan muncul setelah mereka mengisi form absensi publik.
          </p>
        </div>
      )}

      {/* -------- TABLE VIEW -------- */}
      {viewMode === 'table' && filteredAttendance.length > 0 && (
        <div className="bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
          <div className="p-4 bg-purple-100 border-b-3 border-black flex items-center justify-between">
            <h3 className="font-black text-sm text-black flex items-center gap-2">
              <List className="w-4 h-4 text-purple-700" />
              Daftar Absensi
            </h3>
            <span className="text-xs font-black text-black">{filteredAttendance.length} Record</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black text-gray-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3 border-r-2 border-black w-10 text-center">No</th>
                  <th className="p-3 border-r-2 border-black">Jadwal Kegiatan</th>
                  <th className="p-3 border-r-2 border-black">Nama Guru</th>
                  <th className="p-3 border-r-2 border-black">Sekolah</th>
                  <th className="p-3 border-r-2 border-black text-center">Status</th>
                  <th className="p-3 border-r-2 border-black">Waktu Absen</th>
                  <th className="p-3 border-r-2 border-black">Catatan</th>
                  {onDeleteAttendance && <th className="p-3 text-center w-16">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {filteredAttendance.map((a, idx) => {
                  const sch = scheduleMap.get(a.scheduleId);
                  return (
                    <tr key={a.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="p-3 border-r-2 border-black text-center font-black">{idx + 1}</td>
                      <td className="p-3 border-r-2 border-black">
                        <p className="font-black text-black">{sch ? sch.title : '-'}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">
                          {sch ? `${formatDate(sch.date)} - ${sch.location}` : ''}
                        </p>
                      </td>
                      <td className="p-3 border-r-2 border-black font-black text-black uppercase text-xs">
                        {a.teacherName}
                      </td>
                      <td className="p-3 border-r-2 border-black font-bold text-gray-800">{a.school}</td>
                      <td className="p-3 border-r-2 border-black text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-black px-2.5 py-0.5 rounded-full border border-black text-[10px] ${
                            a.status === 'Hadir'
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {a.status === 'Hadir' && <CheckCircle2 className="w-3 h-3" />}
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 border-r-2 border-black text-gray-700 whitespace-nowrap">
                        <Clock className="w-3 h-3 inline-block mr-1 text-gray-400" />
                        {formatCheckInTime(a.checkedInAt)}
                      </td>
                      <td className="p-3 border-r-2 border-black text-gray-600 max-w-[180px] truncate">
                        {a.note || <span className="text-gray-300">-</span>}
                      </td>
                      {onDeleteAttendance && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus absensi ${a.teacherName} untuk jadwal "${sch?.title ?? a.scheduleId}"?`)) {
                                onDeleteAttendance(a.id);
                              }
                            }}
                            className="p-1.5 bg-red-400 text-black rounded-lg border border-black hover:bg-red-500 shadow-[1px_1px_0_0_#000] transition-colors"
                            title="Hapus Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------- SUMMARY VIEW (per schedule) -------- */}
      {viewMode === 'summary' && perScheduleStats.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
            <div className="p-4 bg-yellow-300 border-b-3 border-black flex items-center justify-between">
              <h3 className="font-black text-sm text-black flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-700" />
                Ringkasan Kehadiran per Jadwal
              </h3>
              <span className="text-xs font-black text-black">
                {perScheduleStats.length} Jadwal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black text-gray-800 uppercase text-[10px] tracking-wider">
                    <th className="p-3 border-r-2 border-black w-10 text-center">No</th>
                    <th className="p-3 border-r-2 border-black">Jadwal Kegiatan</th>
                    <th className="p-3 border-r-2 border-black">Tanggal</th>
                    <th className="p-3 border-r-2 border-black">Lokasi</th>
                    <th className="p-3 border-r-2 border-black text-center">Hadir</th>
                    <th className="p-3 border-r-2 border-black text-center">Izin</th>
                    <th className="p-3 border-r-2 border-black text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200">
                  {perScheduleStats.map(([scheduleId, data], idx) => (
                    <tr key={scheduleId} className="hover:bg-purple-50/50 transition-colors">
                      <td className="p-3 border-r-2 border-black text-center font-black">{idx + 1}</td>
                      <td className="p-3 border-r-2 border-black font-black text-black">
                        {data.schedule.title}
                      </td>
                      <td className="p-3 border-r-2 border-black text-gray-700 whitespace-nowrap">
                        {formatDate(data.schedule.date)}
                      </td>
                      <td className="p-3 border-r-2 border-black font-bold text-gray-800">
                        {data.schedule.location}
                      </td>
                      <td className="p-3 border-r-2 border-black text-center">
                        <span className="inline-block bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full border border-black text-xs">
                          {data.hadir}
                        </span>
                      </td>
                      <td className="p-3 border-r-2 border-black text-center">
                        <span className="inline-block bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full border border-black text-xs">
                          {data.izin}
                        </span>
                      </td>
                      <td className="p-3 border-r-2 border-black text-center font-black text-purple-800">
                        {data.hadir + data.izin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---- Detail List per schedule ---- */}
          {perScheduleStats.map(([scheduleId, data]) => {
            const records = filteredAttendance.filter((a) => a.scheduleId === scheduleId);
            return (
              <div key={scheduleId} className="bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
                <div className="p-4 bg-purple-100 border-b-2 border-black flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-black">{data.schedule.title}</h4>
                    <p className="text-[10px] font-bold text-gray-600">
                      {formatDate(data.schedule.date)} - {data.schedule.location}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-black">
                    <span className="bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-black">
                      {data.hadir} Hadir
                    </span>
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-black">
                      {data.izin} Izin
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-bold border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200 text-gray-600 uppercase text-[10px] tracking-wider">
                        <th className="p-3 border-r-2 border-gray-200 w-10 text-center">No</th>
                        <th className="p-3 border-r-2 border-gray-200">Nama Guru</th>
                        <th className="p-3 border-r-2 border-gray-200">Sekolah</th>
                        <th className="p-3 border-r-2 border-gray-200 text-center">Status</th>
                        <th className="p-3 border-r-2 border-gray-200">Waktu Absen</th>
                        <th className="p-3 border-gray-200">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.map((a, idx) => (
                        <tr key={a.id} className="hover:bg-yellow-50/50 transition-colors">
                          <td className="p-3 border-r-2 border-gray-100 text-center font-black text-gray-500">{idx + 1}</td>
                          <td className="p-3 border-r-2 border-gray-100 font-black text-black uppercase text-xs">
                            {a.teacherName}
                          </td>
                          <td className="p-3 border-r-2 border-gray-100 font-bold text-gray-700">{a.school}</td>
                          <td className="p-3 border-r-2 border-gray-100 text-center">
                            <span
                              className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-full border text-[10px] ${
                                a.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-3 border-r-2 border-gray-100 text-gray-600 whitespace-nowrap">
                            {formatCheckInTime(a.checkedInAt)}
                          </td>
                          <td className="p-3 text-gray-500 max-w-[150px] truncate">
                            {a.note || <span className="text-gray-300">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceAdmin;
