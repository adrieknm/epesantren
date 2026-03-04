import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { CashFlow, initialCashFlow } from '../../data/classData';

const FinancialReports: React.FC = () => {
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [reportType, setReportType] = useState<'cashflow' | 'income' | 'expense' | 'balance'>('cashflow');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const savedCashFlow = localStorage.getItem('cashFlow');
    
    setCashFlow(savedCashFlow ? JSON.parse(savedCashFlow) : initialCashFlow);
  }, []);

  const filteredCashFlow = cashFlow.filter(cf => {
    const date = new Date(cf.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const totalIncome = filteredCashFlow
    .filter(cf => cf.category === 'income')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const totalExpense = filteredCashFlow
    .filter(cf => cf.category === 'expense')
    .reduce((sum, cf) => sum + cf.amount, 0);

  const balance = totalIncome - totalExpense;

  const incomeByType = filteredCashFlow
    .filter(cf => cf.category === 'income')
    .reduce((acc, cf) => {
      acc[cf.type] = (acc[cf.type] || 0) + cf.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseByType = filteredCashFlow
    .filter(cf => cf.category === 'expense')
    .reduce((acc, cf) => {
      acc[cf.type] = (acc[cf.type] || 0) + cf.amount;
      return acc;
    }, {} as Record<string, number>);

  const exportCashFlowReport = () => {
    const dataToExport = filteredCashFlow.map(cf => ({
      'Tanggal': cf.date,
      'Kategori': cf.category === 'income' ? 'PEMASUKAN' : 'PENGELUARAN',
      'Jenis': cf.type,
      'Jumlah': cf.amount,
      'Deskripsi': cf.description,
      'Referensi': cf.referenceNo,
      'Diterima/Dibayar': cf.receivedBy || cf.paidTo || '-'
    }));

    // Add summary
    dataToExport.push({} as any);
    dataToExport.push({
      'Tanggal': 'RINGKASAN',
      'Kategori': '',
      'Jenis': '',
      'Jumlah': '',
      'Deskripsi': '',
      'Referensi': '',
      'Diterima/Dibayar': ''
    } as any);
    dataToExport.push({
      'Tanggal': 'Total Pemasukan',
      'Kategori': '',
      'Jenis': '',
      'Jumlah': totalIncome,
      'Deskripsi': '',
      'Referensi': '',
      'Diterima/Dibayar': ''
    } as any);
    dataToExport.push({
      'Tanggal': 'Total Pengeluaran',
      'Kategori': '',
      'Jenis': '',
      'Jumlah': totalExpense,
      'Deskripsi': '',
      'Referensi': '',
      'Diterima/Dibayar': ''
    } as any);
    dataToExport.push({
      'Tanggal': 'Saldo',
      'Kategori': '',
      'Jenis': '',
      'Jumlah': balance,
      'Deskripsi': '',
      'Referensi': '',
      'Diterima/Dibayar': ''
    } as any);

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Arus Kas');
    XLSX.writeFile(wb, `Laporan_Keuangan_${startDate}_${endDate}.xlsx`);
  };

  const exportIncomeReport = () => {
    const dataToExport = Object.entries(incomeByType).map(([type, amount]) => ({
      'Jenis Pemasukan': type,
      'Jumlah': amount,
      'Persentase': ((amount / totalIncome) * 100).toFixed(2) + '%'
    }));

    dataToExport.push({} as any);
    dataToExport.push({
      'Jenis Pemasukan': 'TOTAL PEMASUKAN',
      'Jumlah': totalIncome,
      'Persentase': '100%'
    } as any);

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pemasukan');
    XLSX.writeFile(wb, `Laporan_Pemasukan_${startDate}_${endDate}.xlsx`);
  };

  const exportExpenseReport = () => {
    const dataToExport = Object.entries(expenseByType).map(([type, amount]) => ({
      'Jenis Pengeluaran': type,
      'Jumlah': amount,
      'Persentase': ((amount / totalExpense) * 100).toFixed(2) + '%'
    }));

    dataToExport.push({} as any);
    dataToExport.push({
      'Jenis Pengeluaran': 'TOTAL PENGELUARAN',
      'Jumlah': totalExpense,
      'Persentase': '100%'
    } as any);

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pengeluaran');
    XLSX.writeFile(wb, `Laporan_Pengeluaran_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h1>
        <p className="text-gray-600">Analisis dan laporan keuangan komprehensif</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="cashflow">Arus Kas</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
              <option value="balance">Neraca</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                if (reportType === 'cashflow') exportCashFlowReport();
                else if (reportType === 'income') exportIncomeReport();
                else if (reportType === 'expense') exportExpenseReport();
                else exportCashFlowReport();
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Pemasukan</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalIncome.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredCashFlow.filter(cf => cf.category === 'income').length} transaksi
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Pengeluaran</h3>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            Rp {totalExpense.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredCashFlow.filter(cf => cf.category === 'expense').length} transaksi
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Saldo</h3>
            <DollarSign className={`w-5 h-5 ${balance >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            Rp {balance.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Periode {startDate} s/d {endDate}
          </p>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'cashflow' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Laporan Arus Kas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCashFlow.map((cf) => (
                  <tr key={cf.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cf.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        cf.category === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cf.category === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cf.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{cf.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span className={cf.category === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {cf.category === 'income' ? '+' : '-'} Rp {cf.amount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cf.referenceNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'income' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rincian Pemasukan</h2>
          <div className="space-y-3">
            {Object.entries(incomeByType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">{type}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">Rp {amount.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500">
                    {((amount / totalIncome) * 100).toFixed(1)}% dari total
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg border-2 border-green-300 mt-4">
              <span className="font-bold text-gray-800">TOTAL PEMASUKAN</span>
              <span className="font-bold text-xl text-green-600">
                Rp {totalIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {reportType === 'expense' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rincian Pengeluaran</h2>
          <div className="space-y-3">
            {Object.entries(expenseByType).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-800">{type}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">Rp {amount.toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500">
                    {((amount / totalExpense) * 100).toFixed(1)}% dari total
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border-2 border-red-300 mt-4">
              <span className="font-bold text-gray-800">TOTAL PENGELUARAN</span>
              <span className="font-bold text-xl text-red-600">
                Rp {totalExpense.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {reportType === 'balance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Neraca Keuangan</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">PEMASUKAN</h3>
                <p className="text-2xl font-bold text-green-600">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">PENGELUARAN</h3>
                <p className="text-2xl font-bold text-red-600">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className={`p-6 rounded-lg ${balance >= 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
              <h3 className="text-sm font-medium text-gray-600 mb-2">SALDO AKHIR</h3>
              <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                Rp {balance.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Periode: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
