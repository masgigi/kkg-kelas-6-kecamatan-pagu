import { TransactionItem } from '../types';

export function calculateCashSummary(transactions: TransactionItem[]) {
  let totalMasuk = 0;
  let totalKeluar = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'masuk') {
      totalMasuk += tx.amount;
    } else {
      totalKeluar += tx.amount;
    }
  });

  const saldo = totalMasuk - totalKeluar;

  return {
    totalMasuk,
    totalKeluar,
    saldo
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function exportTransactionsToCSV(transactions: TransactionItem[], monthYearLabel: string = 'Agustus 2026') {
  const { totalMasuk, totalKeluar, saldo } = calculateCashSummary(transactions);

  const headers = ['No', 'Tanggal', 'Kategori', 'Keterangan / Sumber', 'Jenis', 'Nominal (Rp)'];
  const rows = transactions.map((tx, idx) => [
    idx + 1,
    tx.date,
    `"${tx.category}"`,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
    tx.amount
  ]);

  rows.push([]);
  rows.push(['', '', '', '"TOTAL PEMASUKAN"', '', totalMasuk]);
  rows.push(['', '', '', '"TOTAL PENGELUARAN"', '', totalKeluar]);
  rows.push(['', '', '', '"SALDO KAS SAAT INI"', '', saldo]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Kas_KKG6_Pagu_${monthYearLabel.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printMonthlyReport(
  transactions: TransactionItem[],
  monthLabel: string = 'Juli / Agustus 2026',
  signedByLeader: string = 'Ketua KKG',
  signedByTreasurer: string = 'Bendahara KKG'
) {
  const { totalMasuk, totalKeluar, saldo } = calculateCashSummary(transactions);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Mohon izinkan pop-up browser untuk mencetak laporan.');
    return;
  }

  const rowsHtml = transactions
    .map(
      (tx, idx) => `
    <tr>
      <td style="text-align: center;">${idx + 1}</td>
      <td>${tx.date}</td>
      <td><strong>${tx.category}</strong></td>
      <td>${tx.description}</td>
      <td style="text-align: right; color: ${tx.type === 'masuk' ? '#059669' : '#dc2626'};">
        ${tx.type === 'masuk' ? formatRupiah(tx.amount) : '-'}
      </td>
      <td style="text-align: right; color: #dc2626;">
        ${tx.type === 'keluar' ? formatRupiah(tx.amount) : '-'}
      </td>
    </tr>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Laporan Kas KKG6UP! - ${monthLabel}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #1f2937;
          }
          .header {
            text-align: center;
            border-bottom: 3px double #7c3aed;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #7c3aed;
            font-size: 24px;
          }
          .header h2 {
            margin: 5px 0 0;
            font-size: 16px;
            color: #4b5563;
          }
          .header p {
            margin: 3px 0 0;
            font-size: 13px;
            color: #6b7280;
          }
          .summary-cards {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 10px;
          }
          .card {
            flex: 1;
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background-color: #f9fafb;
          }
          .card-title { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
          .card-value { font-size: 18px; font-weight: bold; }
          .text-green { color: #059669; }
          .text-red { color: #dc2626; }
          .text-purple { color: #7c3aed; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
            font-weight: bold;
          }
          .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sig-box {
            text-align: center;
            width: 200px;
          }
          .sig-space {
            height: 60px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KELOMPOK KERJA GURU (KKG) KELAS 6</h1>
          <h2>KECAMATAN PAGU - KABUPATEN KEDIRI</h2>
          <p>Portal Digital KKG6UP! • LAPORAN KEUANGAN BULAN ${monthLabel.toUpperCase()}</p>
        </div>

        <div class="summary-cards">
          <div class="card">
            <div class="card-title">Total Pemasukan</div>
            <div class="card-value text-green">${formatRupiah(totalMasuk)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Pengeluaran</div>
            <div class="card-value text-red">${formatRupiah(totalKeluar)}</div>
          </div>
          <div class="card">
            <div class="card-title">Saldo Akhir Kas</div>
            <div class="card-value text-purple">${formatRupiah(saldo)}</div>
          </div>
        </div>

        <h3>Riwayat Transaksi</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 90px;">Tanggal</th>
              <th style="width: 130px;">Kategori</th>
              <th>Keterangan</th>
              <th style="text-align: right; width: 110px;">Masuk (Rp)</th>
              <th style="text-align: right; width: 110px;">Keluar (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            <p>Mengetahui,<br><strong>Bendahara KKG Pagu</strong></p>
            <div class="sig-space"></div>
            <p><u><strong>${signedByTreasurer}</strong></u></p>
          </div>
          <div class="sig-box">
            <p>Pagu, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br><strong>Ketua KKG Kelas 6 Pagu</strong></p>
            <div class="sig-space"></div>
            <p><u><strong>${signedByLeader}</strong></u></p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
