import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  User,
} from 'lucide-react';
import type { AttendanceItem, ScheduleItem, TeacherItem } from '../types';

interface AttendanceFormProps {
  schedules: ScheduleItem[];
  teachers: TeacherItem[];
  attendance: AttendanceItem[];
  onSubmit: (record: Omit<AttendanceItem, 'id'>) => void;
}

const ACTIVE_SCHEDULE_STATUSES: ScheduleItem['status'][] = [
  'Akan Datang',
  'Persiapan',
  'Terjadwal',
];

const formatDate = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsedDate);
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);

export default function AttendanceForm({
  schedules,
  teachers,
  attendance,
  onSubmit,
}: AttendanceFormProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null);
  const [status, setStatus] = useState<AttendanceItem['status']>('Hadir');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [teacherQuery, setTeacherQuery] = useState('');
  const [isTeacherListOpen, setIsTeacherListOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const availableSchedules = useMemo(
    () => schedules.filter((schedule) => ACTIVE_SCHEDULE_STATUSES.includes(schedule.status)),
    [schedules],
  );

  const filteredTeachers = useMemo(() => {
    const query = teacherQuery.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.school.toLowerCase().includes(query),
    );
  }, [teachers, teacherQuery]);

  const selectTeacher = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher);
    setTeacherQuery(teacher.name);
    setIsTeacherListOpen(false);
    setValidationMessage('');
    setErrorMessage('');
  };

  const handleTeacherQueryChange = (value: string) => {
    setTeacherQuery(value);
    setSelectedTeacher(null);
    setIsTeacherListOpen(true);
    setValidationMessage('');
    setErrorMessage('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!selectedSchedule || !selectedTeacher) {
      setValidationMessage('Silakan pilih jadwal dan nama guru terlebih dahulu.');
      return;
    }

    const hasDuplicate = attendance.some(
      (record) =>
        record.scheduleId === selectedSchedule.id &&
        record.teacherId === selectedTeacher.id,
    );

    if (hasDuplicate) {
      setErrorMessage('Guru ini sudah melakukan absensi untuk jadwal tersebut.');
      setIsSubmitted(false);
      return;
    }

    const now = new Date();
    onSubmit({
      scheduleId: selectedSchedule.id,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      school: selectedTeacher.school,
      status,
      checkedInAt: now.toISOString(),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    setSubmittedAt(now);
    setIsSubmitted(true);
    setValidationMessage('');
  };

  return (
    <main className="min-h-screen bg-white p-3 text-black sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-5xl flex-col border-4 border-black bg-white shadow-[8px_8px_0_#000] sm:min-h-[calc(100vh-3rem)]">
        <header className="border-b-4 border-black bg-yellow-300 px-5 py-8 sm:px-10 sm:py-10">
          <p className="mb-3 inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.2em] shadow-[3px_3px_0_#000]">
            Portal Publik
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
            Absensi KKG Guru Kelas 6
          </h1>
          <p className="mt-4 text-lg font-bold sm:text-xl">Kecamatan Pagu, Kabupaten Kediri</p>
        </header>

        <section className="flex flex-1 flex-col px-5 py-8 sm:px-10 sm:py-10">
          {isSubmitted && selectedSchedule && selectedTeacher ? (
            <div className="m-auto w-full max-w-2xl border-4 border-black bg-green-300 p-6 text-center shadow-[6px_6px_0_#000] sm:p-10">
              <CheckCircle2 className="mx-auto mb-5 h-20 w-20 stroke-[2.5]" aria-hidden="true" />
              <h2 className="text-3xl font-black sm:text-4xl">Absensi Berhasil!</h2>
              <p className="mt-3 text-lg font-bold">Data kehadiran Anda telah dicatat.</p>
              <div className="mt-7 space-y-3 border-2 border-black bg-white p-5 text-left font-bold">
                <p className="flex gap-3"><Calendar className="h-5 w-5 shrink-0" aria-hidden="true" /> {selectedSchedule.title}</p>
                <p className="flex gap-3"><User className="h-5 w-5 shrink-0" aria-hidden="true" /> {selectedTeacher.name}</p>
                <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0" aria-hidden="true" /> {submittedAt ? formatTime(submittedAt) : '-'} WIB</p>
              </div>
            </div>
          ) : (
            <form className="mx-auto w-full max-w-2xl space-y-7" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="schedule" className="mb-2 block text-base font-black">Pilih Jadwal</label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" aria-hidden="true" />
                  <select
                    id="schedule"
                    value={selectedSchedule?.id ?? ''}
                    onChange={(event) => {
                      setSelectedSchedule(availableSchedules.find((item) => item.id === event.target.value) ?? null);
                      setValidationMessage('');
                      setErrorMessage('');
                    }}
                    className="w-full appearance-none border-2 border-black bg-white py-3 pl-11 pr-4 font-bold outline-none focus:bg-yellow-100"
                  >
                    <option value="">Pilih jadwal kegiatan</option>
                    {availableSchedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.title} — {formatDate(schedule.date)} — {schedule.location}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSchedule && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" aria-hidden="true" />{formatDate(selectedSchedule.date)}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden="true" />{selectedSchedule.location}</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <label htmlFor="teacher" className="mb-2 block text-base font-black">Nama Guru</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="teacher"
                    type="search"
                    value={teacherQuery}
                    onChange={(event) => handleTeacherQueryChange(event.target.value)}
                    onFocus={() => setIsTeacherListOpen(true)}
                    placeholder="Ketik untuk mencari nama guru..."
                    autoComplete="off"
                    className="w-full border-2 border-black py-3 pl-11 pr-4 font-bold outline-none focus:bg-yellow-100"
                    aria-expanded={isTeacherListOpen}
                    aria-controls="teacher-list"
                  />
                </div>
                {isTeacherListOpen && (
                  <div id="teacher-list" role="listbox" className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border-2 border-black bg-white shadow-[4px_4px_0_#000]">
                    {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedTeacher?.id === teacher.id}
                        key={teacher.id}
                        onClick={() => selectTeacher(teacher)}
                        className="block w-full border-b-2 border-black px-4 py-3 text-left font-bold last:border-b-0 hover:bg-purple-200"
                      >
                        <span className="block">{teacher.name}</span>
                        <span className="text-sm font-medium">{teacher.school}</span>
                      </button>
                    )) : <p className="px-4 py-3 font-bold">Guru tidak ditemukan.</p>}
                  </div>
                )}
                {selectedTeacher && (
                  <p className="mt-2 flex items-center gap-2 border-2 border-black bg-blue-100 px-3 py-2 text-sm font-bold">
                    <User className="h-4 w-4" aria-hidden="true" /> Sekolah: {selectedTeacher.school}
                  </p>
                )}
              </div>

              <fieldset>
                <legend className="mb-2 block text-base font-black">Status Kehadiran</legend>
                <div className="flex flex-wrap gap-3">
                  {(['Hadir', 'Izin'] as const).map((option) => (
                    <label key={option} className={`flex cursor-pointer items-center gap-2 border-2 border-black px-5 py-3 font-black ${status === option ? 'bg-purple-200' : 'bg-white'}`}>
                      <input type="radio" name="status" value={option} checked={status === option} onChange={() => setStatus(option)} className="h-4 w-4 accent-purple-600" />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="note" className="mb-2 block text-base font-black">Catatan <span className="font-medium">(opsional)</span></label>
                <textarea id="note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Tambahkan catatan bila diperlukan..." className="w-full resize-y border-2 border-black p-3 font-medium outline-none focus:bg-yellow-100" />
              </div>

              {(validationMessage || errorMessage) && (
                <div role="alert" className="flex items-start gap-3 border-2 border-black bg-red-300 p-4 font-black shadow-[4px_4px_0_#000]">
                  <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
                  <span>{validationMessage || errorMessage}</span>
                </div>
              )}

              <button type="submit" className="w-full border-2 border-black bg-purple-600 px-6 py-4 text-lg font-black text-white shadow-[5px_5px_0_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#000] focus:outline-none focus:ring-4 focus:ring-yellow-300">
                Kirim Absensi
              </button>
            </form>
          )}

          <a href="/" className="mx-auto mt-10 inline-block border-b-2 border-black pb-1 text-center font-black hover:bg-yellow-300">
            Kembali ke Portal
          </a>
        </section>
      </div>
    </main>
  );
}
