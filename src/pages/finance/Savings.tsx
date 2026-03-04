import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Savings as SavingsType, Student, initialSavings } from '../../data/classData';

const Savings: React.FC = () => {
  const [savings, setSavings] = useState<SavingsType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    studentId: 0,
    amount: 0,
    type: 'setor' as 'setor' | 'tarik',
    date: new Date().toISOString().split('T')[0],
    note: '',
    processedBy: 'Admin'
  });

  useEffect(() => {
    const savedSavings = localStorage.getItem('savings');
    const savedStudents = localStorage.getItem('students');
    
    setSavings(savedSavings ? JSON.parse(savedSavings) : initialSavings);
    setStudents(savedStudents ? JSON.parse(savedStudents) : []);
  }, []);

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown';
  };

  const getStudentNIS = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nis : '-';
  };

  const getStudentBalance = (studentId: number) => {
    const studentSavings = savings.filter(s => s.studentId === studentId);
    if (studentSavings.length === 0) return 0;
    
    // Get the latest balance
    const sorted = studentSavings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0].balance;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentBalance = getStudentBalance(formData.studentId);
    let newBalance = currentBalance;
    
    if (formData.type === 'setor') {
      newBalance = currentBalance + Number(formData.amount);
    } else {
      newBalance = currentBalance - Number(formData.amount);
      if (newBalance < 0) {
        alert('Saldo tidak mencukupi!');
        return;
      }
    }

    const newSaving: SavingsType = {
      id: Date.now(),
      ...formData,
      studentId: Number(formData.studentId),
      amount: Number(formData.amount),
      balance: newBalance
    };

    const updatedSavings = [...savings, newSaving];
    setSavings(updatedSavings);
    localStorage.setItem('savings', JSON.stringify(updatedSavings));
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: 0,
      amount: 0,
      type: 'setor',
      date: new Date().toISOString().split('T')[0],
      note: '',
      processedBy: 'Admin'
    });
  };

  const exportToExcel = () => {
    const dataToExport = filteredSavings.map(saving => ({
      'Tanggal': saving.date,
      'NIS': getStudentNIS(saving.studentId),
      'Nama Santri': getStudentName(saving.studentId),
      'Jenis': saving.type === 'setor' ? 'SETOR' : 'TARIK',
      'Jumlah': saving.amount,
      'Saldo': saving.balance,
      'Keterangan': saving.note,
      'Diproses Oleh': saving.processedBy
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabungan Santri');
    
    const colWidths = [
      { wch: 12 }, { wch: 10 }, { wch: 25 }, { wch: 10 },
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `Tabungan_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredSavings = savings.filter(saving => {
    const student = students.find(s => s.id === saving.studentId);
    const studentName = student ? student.name.toLowerCase() : '';
    const studentNis = student ? student.nis.toLowerCase() : '';
    
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         studentNis.includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || saving.type === filterType;
    const matchesStudent = selectedStudent === 0 || saving.studentId === selectedStudent;
    
    return matchesSearch && matchesType && matchesStudent;
  });

  const paginatedSavings = filteredSavings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredSavings.length / itemsPerPage);

  const totalSetor = savings.filter(s => s.type === 'setor').reduce((sum, s) => sum + s.amount, 0);
  const totalTarik = savings.filter(s => s.type === 'tarik').reduce((sum, s) => sum + s.amount, 0);
  const totalSaldo = totalSetor - totalTarik;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tabungan Santri</h1>
        <p className="text-gray-600">Kelola tabungan dan mutasi saldo santri</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Saldo</p>
              <p className="text-xl font-bold text-blue-600">
                Rp {totalSaldo.toLocaleString('id-ID')}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Setor</p>
              <p className="text-xl font-bold text-green-600">
                Rp {totalSetor.toLocaleString('id-ID')}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tarik</p>
              <p className="text-xl font-bold text-red-600">
                Rp {totalTarik.toLocaleString('id-ID')}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-800">{savings.length}</p>
            </div>
            <Wallet className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari santri, NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={0}>Semua Santri</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.nis} - {student.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Transaksi</option>
            <option value="setor">Setor</option>
            <option value="tarik">Tarik</option>
          </select>

          <div className="col-span-2 flex gap-2">
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Transaksi Baru
            </button>
            <button
              onClick={exportToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Santri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diproses</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSavings.map((saving) => (
                <tr key={saving.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(saving.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getStudentName(saving.studentId)}</div>
                    <div className="text-sm text-gray-500">NIS: {getStudentNIS(saving.studentId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      saving.type === 'setor' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {saving.type === 'setor' ? 'SETOR' : 'TARIK'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={saving.type === 'setor' ? 'text-green-600' : 'text-red-600'}>
                      {saving.type === 'setor' ? '+' : '-'} Rp {saving.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    Rp {saving.balance.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {saving.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {saving.processedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> sampai{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredSavings.length)}</span> dari{' '}
                  <span className="font-medium">{filteredSavings.length}</span> hasil
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Transaksi Tabungan Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Santri *</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Pilih Santri</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.nis} - {student.name} (Saldo: Rp {getStudentBalance(student.id).toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'setor' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        formData.type === 'setor'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Setor
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'tarik' })}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        formData.type === 'tarik'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Tarik
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="50000"
                  />
                  {formData.studentId > 0 && formData.type === 'tarik' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Saldo tersedia: Rp {getStudentBalance(formData.studentId).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Keterangan transaksi..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diproses Oleh *</label>
                  <input
                    type="text"
                    required
                    value={formData.processedBy}
                    onChange={(e) => setFormData({ ...formData, processedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
