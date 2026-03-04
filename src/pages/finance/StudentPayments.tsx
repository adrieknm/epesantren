import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, CheckCircle, XCircle, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { StudentPayment, PaymentType, Student, initialStudentPayments, initialPaymentTypes } from '../../data/classData';

const StudentPayments: React.FC = () => {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    studentId: 0,
    paymentTypeId: 0,
    amount: 0,
    month: '',
    year: new Date().getFullYear().toString(),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'tunai' as 'tunai' | 'transfer' | 'va',
    referenceNo: '',
    receivedBy: 'Admin Keuangan',
    status: 'lunas' as 'lunas' | 'belum_lunas' | 'cicilan',
    note: ''
  });

  useEffect(() => {
    const savedPayments = localStorage.getItem('studentPayments');
    const savedPaymentTypes = localStorage.getItem('paymentTypes');
    const savedStudents = localStorage.getItem('students');
    
    setPayments(savedPayments ? JSON.parse(savedPayments) : initialStudentPayments);
    setPaymentTypes(savedPaymentTypes ? JSON.parse(savedPaymentTypes) : initialPaymentTypes);
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

  const getPaymentTypeName = (typeId: number) => {
    const type = paymentTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPayment: StudentPayment = {
      id: selectedPayment ? selectedPayment.id : Date.now(),
      ...formData,
      studentId: Number(formData.studentId),
      paymentTypeId: Number(formData.paymentTypeId),
      amount: Number(formData.amount),
    };

    let updatedPayments;
    if (selectedPayment) {
      updatedPayments = payments.map(p => p.id === selectedPayment.id ? newPayment : p);
    } else {
      updatedPayments = [...payments, newPayment];
    }

    setPayments(updatedPayments);
    localStorage.setItem('studentPayments', JSON.stringify(updatedPayments));
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: 0,
      paymentTypeId: 0,
      amount: 0,
      month: '',
      year: new Date().getFullYear().toString(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'tunai',
      referenceNo: '',
      receivedBy: 'Admin Keuangan',
      status: 'lunas',
      note: ''
    });
    setSelectedPayment(null);
  };

  const handleEdit = (payment: StudentPayment) => {
    setSelectedPayment(payment);
    setFormData({
      ...payment,
      month: payment.month || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus data pembayaran ini?')) {
      const updatedPayments = payments.filter(p => p.id !== id);
      setPayments(updatedPayments);
      localStorage.setItem('studentPayments', JSON.stringify(updatedPayments));
    }
  };

  const handleDetail = (payment: StudentPayment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handlePaymentTypeChange = (typeId: number) => {
    const type = paymentTypes.find(t => t.id === typeId);
    if (type) {
      setFormData({
        ...formData,
        paymentTypeId: typeId,
        amount: type.amount,
        month: type.period === 'bulanan' ? formData.month : ''
      });
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredPayments.map(payment => ({
      'No. Referensi': payment.referenceNo,
      'Tanggal': payment.paymentDate,
      'NIS': getStudentNIS(payment.studentId),
      'Nama Santri': getStudentName(payment.studentId),
      'Jenis Pembayaran': getPaymentTypeName(payment.paymentTypeId),
      'Bulan': payment.month || '-',
      'Tahun': payment.year,
      'Jumlah': payment.amount,
      'Metode': payment.paymentMethod.toUpperCase(),
      'Status': payment.status === 'lunas' ? 'LUNAS' : payment.status === 'cicilan' ? 'CICILAN' : 'BELUM LUNAS',
      'Diterima Oleh': payment.receivedBy,
      'Keterangan': payment.note
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pembayaran Santri');
    
    const colWidths = [
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 25 }, 
      { wch: 20 }, { wch: 10 }, { wch: 8 }, { wch: 15 },
      { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 30 }
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `Pembayaran_Santri_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredPayments = payments.filter(payment => {
    const student = students.find(s => s.id === payment.studentId);
    const paymentType = paymentTypes.find(t => t.id === payment.paymentTypeId);
    const studentName = student ? student.name.toLowerCase() : '';
    const studentNis = student ? student.nis.toLowerCase() : '';
    const typeName = paymentType ? paymentType.name.toLowerCase() : '';
    
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         studentNis.includes(searchTerm.toLowerCase()) ||
                         typeName.includes(searchTerm.toLowerCase()) ||
                         payment.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMonth = filterMonth === 'all' || payment.month === filterMonth;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pembayaran Santri</h1>
        <p className="text-gray-600">Kelola pembayaran dan transaksi keuangan santri</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pembayaran</p>
              <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lunas</p>
              <p className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'lunas').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belum Lunas</p>
              <p className="text-2xl font-bold text-red-600">
                {payments.filter(p => p.status === 'belum_lunas').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pemasukan</p>
              <p className="text-lg font-bold text-blue-600">
                Rp {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
              </p>
            </div>
            <Download className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari santri, NIS, jenis pembayaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="cicilan">Cicilan</option>
            <option value="belum_lunas">Belum Lunas</option>
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Bulan</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Pembayaran
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Santri</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pembayaran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.referenceNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getStudentName(payment.studentId)}</div>
                    <div className="text-sm text-gray-500">NIS: {getStudentNIS(payment.studentId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getPaymentTypeName(payment.paymentTypeId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.month ? `${payment.month} ${payment.year}` : payment.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'lunas' ? 'bg-green-100 text-green-800' :
                      payment.status === 'cicilan' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status === 'lunas' ? 'Lunas' : payment.status === 'cicilan' ? 'Cicilan' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDetail(payment)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => handleEdit(payment)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
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
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredPayments.length)}</span> dari{' '}
                  <span className="font-medium">{filteredPayments.length}</span> hasil
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedPayment ? 'Edit Pembayaran' : 'Tambah Pembayaran Baru'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
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
                        {student.nis} - {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pembayaran *</label>
                  <select
                    required
                    value={formData.paymentTypeId}
                    onChange={(e) => handlePaymentTypeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Pilih Jenis Pembayaran</option>
                    {paymentTypes.filter(t => t.status === 'active').map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - Rp {type.amount.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran *</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {paymentTypes.find(t => t.id === formData.paymentTypeId)?.period === 'bulanan' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Pilih Bulan</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran *</label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="tunai">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="va">Virtual Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Referensi *</label>
                  <input
                    type="text"
                    required
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    placeholder="PAY-2024-0001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diterima Oleh *</label>
                  <input
                    type="text"
                    required
                    value={formData.receivedBy}
                    onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="lunas">Lunas</option>
                    <option value="cicilan">Cicilan</option>
                    <option value="belum_lunas">Belum Lunas</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
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
                  {selectedPayment ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Detail Pembayaran</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">No. Referensi:</span>
                <span className="font-semibold">{selectedPayment.referenceNo}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-semibold">{new Date(selectedPayment.paymentDate).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Santri:</span>
                <span className="font-semibold">{getStudentName(selectedPayment.studentId)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">NIS:</span>
                <span className="font-semibold">{getStudentNIS(selectedPayment.studentId)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Jenis Pembayaran:</span>
                <span className="font-semibold">{getPaymentTypeName(selectedPayment.paymentTypeId)}</span>
              </div>
              {selectedPayment.month && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Bulan:</span>
                  <span className="font-semibold">{selectedPayment.month}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Tahun:</span>
                <span className="font-semibold">{selectedPayment.year}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Jumlah:</span>
                <span className="font-semibold text-green-600">Rp {selectedPayment.amount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Metode Pembayaran:</span>
                <span className="font-semibold">{selectedPayment.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedPayment.status === 'lunas' ? 'bg-green-100 text-green-800' :
                  selectedPayment.status === 'cicilan' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedPayment.status === 'lunas' ? 'Lunas' : selectedPayment.status === 'cicilan' ? 'Cicilan' : 'Belum Lunas'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Diterima Oleh:</span>
                <span className="font-semibold">{selectedPayment.receivedBy}</span>
              </div>
              {selectedPayment.note && (
                <div className="border-b pb-2">
                  <span className="text-gray-600">Keterangan:</span>
                  <p className="mt-1 text-gray-800">{selectedPayment.note}</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;
