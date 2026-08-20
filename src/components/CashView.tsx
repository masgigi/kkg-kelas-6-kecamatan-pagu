import React, { useState } from 'react';
import { TransactionItem } from '../types';
import { calculateCashSummary, formatRupiah, exportTransactionsToCSV, printMonthlyReport } from '../utils/export';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileSpreadsheet, Printer, Plus, Search, Filter, Trash2, Calendar, Edit3 } from 'lucide-react';

interface CashViewProps {
  transactions: TransactionItem[];
  isAdmin: boolean;
  onAddTransaction: (tx: Omit<TransactionItem, 'id'>) => void;
  onEditTransaction?: (tx: TransactionItem) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const CashView: React.FC<CashViewProps> = ({
  transactions,
  isAdmin,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Default show all months
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionItem | null>(null);

  // Form state
  const [txDesc, setTxDesc] = useState('');
  const [txType, setTxType] = useState<'masuk' | 'keluar'>('masuk');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState<TransactionItem['category']>('Kas Anggota');
  const [txSchool, setTxSchool] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setTxDesc('');
    setTxType('masuk');
    setTxAmount('');
    setTxCategory('Kas Anggota');
    setTxSchool('Anggota KKG Pagu');
    setTxDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (tx: TransactionItem) => {
    setEditingTx(tx);
    setTxDesc(tx.description);
    setTxType(tx.type);
    setTxAmount(tx.amount.toString());
    setTxCategory(tx.category);
    setTxSchool(tx.schoolOrTeacher || '');
    setTxDate(tx.date);
    setIsAddModalOpen(true);
  };

  const { totalMasuk, totalKeluar, saldo } = calculateCashSummary(transactions);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.schoolOrTeacher && tx.schoolOrTeacher.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'semua' || tx.category === selectedCategory;
    const matchesMonth = !selectedMonth || tx.date.startsWith(selectedMonth);

    return matchesSearch && matchesCategory && matchesMonth;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc || !txAmount || Number(txAmount) <= 0) {
      alert('Mohon isi keterangan dan nominal transaksi dengan benar.');
      return;
    }

    if (editingTx && onEditTransaction) {
      onEditTransaction({
        ...editingTx,
        date: txDate,
        description: txDesc,
        type: txType,
        amount: Number(txAmount),
        category: txCategory,
        schoolOrTeacher: txSchool || 'Anggota KKG Pagu'
      });
    } else {
      onAddTransaction({
        date: txDate,
        description: txDesc,
        type: txType,
        amount: Number(txAmount),
        category: txCategory,
        schoolOrTeacher: txSchool || 'Anggota KKG Pagu'
      });
    }

    setEditingTx(null);
    setTxDesc('');
    setTxAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Saldo Big Banner */}
      <div className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-black p-6 rounded-3xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-black mb-2 shadow-[2px_2px_0_0_#000]">
              <DollarSign className="w-4 h-4" />
              <span>SIXCASH</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
              💸 Transparansi Kas KKG
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/80 mt-1">
              Pencatatan saldo, iuran anggota, dan pengeluaran kegiatan KKG Kelas 6 Pagu.
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => printMonthlyReport(filteredTransactions, 'Juli / Agustus 2026')}
              className="px-3.5 py-2.5 bg-white hover:bg-gray-100 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-purple-600" />
              <span>Cetak Laporan PDF</span>
            </button>

            <button
              onClick={() => exportTransactionsToCSV(filteredTransactions, 'Juli_Agustus_2026')}
              className="px-3.5 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Catat Transaksi</span>
              </button>
            )}
          </div>
        </div>

        {/* Big Balance Display Card */}
        <div className="mt-6 bg-white/95 rounded-2xl border-3 border-black p-5 shadow-[4px_4px_0_0_#000] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-purple-100 rounded-xl border-2 border-black">
            <p className="text-[10px] font-black uppercase text-purple-800">💰 SALDO KAS SAAT INI</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-900 mt-1">
              {formatRupiah(saldo)}
            </p>
            <p className="text-[10px] font-bold text-gray-600 mt-1">
              Formula: Total Pemasukan − Total Pengeluaran
            </p>
          </div>

          <div className="p-3 bg-emerald-100 rounded-xl border-2 border-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-black border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[1px_1px_0_0_#000]">
              <ArrowUpRight className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-800">🟢 Total Pemasukan</p>
              <p className="text-xl font-black text-emerald-900 mt-0.5">
                {formatRupiah(totalMasuk)}
              </p>
            </div>
          </div>

          <div className="p-3 bg-red-100 rounded-xl border-2 border-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-400 text-black border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[1px_1px_0_0_#000]">
              <ArrowDownRight className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-red-800">🔴 Total Pengeluaran</p>
              <p className="text-xl font-black text-red-900 mt-0.5">
                {formatRupiah(totalKeluar)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keterangan, iuran, atau sekolah..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border-2 border-black font-bold text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 rounded-xl bg-gray-50 border-2 border-black font-extrabold text-xs focus:outline-none"
          >
            <option value="semua">Semua Kategori</option>
            <option value="Kas Anggota">Kas Anggota</option>
            <option value="Konsumsi">Konsumsi</option>
            <option value="ATK">ATK</option>
            <option value="Kegiatan">Kegiatan</option>
          </select>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="py-2 px-3 rounded-xl bg-gray-50 border-2 border-black font-extrabold text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0_0_#000] overflow-hidden">
        <div className="p-4 bg-yellow-300 border-b-3 border-black flex items-center justify-between">
          <h3 className="font-black text-sm text-black flex items-center gap-2">
            <span>📜</span> Riwayat Transaksi Kas
          </h3>
          <span className="text-xs font-black text-black">
            {filteredTransactions.length} Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-black text-gray-800 uppercase text-[10px] tracking-wider">
                <th className="p-3 border-r-2 border-black w-10">No</th>
                <th className="p-3 border-r-2 border-black">Tanggal</th>
                <th className="p-3 border-r-2 border-black">Kategori</th>
                <th className="p-3 border-r-2 border-black">Keterangan / Sumber</th>
                <th className="p-3 border-r-2 border-black text-right">Pemasukan (🟢)</th>
                <th className="p-3 border-r-2 border-black text-right">Pengeluaran (🔴)</th>
                {isAdmin && <th className="p-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {filteredTransactions.map((tx, index) => (
                <tr key={tx.id} className="hover:bg-purple-50/50 transition-colors">
                  <td className="p-3 border-r-2 border-black text-center font-black">{index + 1}</td>
                  <td className="p-3 border-r-2 border-black text-gray-700 whitespace-nowrap">{tx.date}</td>
                  <td className="p-3 border-r-2 border-black">
                    <span className="bg-purple-100 text-purple-900 font-extrabold px-2 py-0.5 rounded border border-black">
                      {tx.category}
                    </span>
                  </td>
                  <td className="p-3 border-r-2 border-black">
                    <p className="font-black text-black">{tx.description}</p>
                    {tx.schoolOrTeacher && (
                      <p className="text-[10px] text-gray-500 font-semibold">{tx.schoolOrTeacher}</p>
                    )}
                  </td>
                  <td className="p-3 border-r-2 border-black text-right font-black text-emerald-700 whitespace-nowrap">
                    {tx.type === 'masuk' ? formatRupiah(tx.amount) : '-'}
                  </td>
                  <td className="p-3 border-r-2 border-black text-right font-black text-red-600 whitespace-nowrap">
                    {tx.type === 'keluar' ? formatRupiah(tx.amount) : '-'}
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onEditTransaction && (
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 bg-amber-300 hover:bg-amber-400 text-black rounded-lg border border-black shadow-[1px_1px_0_0_#000]"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteTransaction && (
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus transaksi "${tx.description}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 bg-red-400 text-black rounded-lg border border-black hover:bg-red-500 shadow-[1px_1px_0_0_#000]"
                            title="Hapus Record"
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

      {/* Add / Edit Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-black p-6 shadow-[8px_8px_0_0_#000] max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-xl font-black text-black">
                {editingTx ? '✏️ Edit Transaksi Kas' : '➕ Catat Transaksi Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-red-400 text-black border-2 border-black font-black text-sm shadow-[1px_1px_0_0_#000]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-black mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('masuk')}
                    className={`py-2 rounded-xl border-2 border-black font-black text-xs ${
                      txType === 'masuk' ? 'bg-emerald-400 text-black shadow-[2px_2px_0_0_#000]' : 'bg-gray-100'
                    }`}
                  >
                    🟢 Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('keluar')}
                    className={`py-2 rounded-xl border-2 border-black font-black text-xs ${
                      txType === 'keluar' ? 'bg-red-400 text-black shadow-[2px_2px_0_0_#000]' : 'bg-gray-100'
                    }`}
                  >
                    🔴 Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Tanggal</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Kategori</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
                >
                  <option value="Kas Anggota">Kas Anggota</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="ATK">ATK</option>
                  <option value="Kegiatan">Kegiatan</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kas Anggota Bulan Juli (SDN Pagu 1)"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 500000"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-black font-bold text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 text-white font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
