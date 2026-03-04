import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Salary, Teacher, initialSalaries, initialTeachers } from '../../data/classData';

const Salaries: React.FC = () => {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);

  const [formData, setFormData] = useState({
    teacherId: 0,
    month: '',
    year: new Date().getFullYear().toString(),
    basicSalary: 0,
    allowance: 0,
    bonus: 0,
    deduction: 0,
    total: 0,
    paymentDate: '',
    status: 'belum_dibayar' as 'dibayar' | 'belum_dibayar',
    note: ''
  });

  useEffect(() => {
    const savedSalaries = localStorage.getItem('salaries');
    const savedTeachers = localStorage.getItem('teachers');

    setSalaries(savedSalaries ? JSON.parse(savedSalaries) : initialSalaries);
    // fallback to initialTeachers so dropdown is never empty
    setTeachers(savedTeachers ? JSON.parse(savedTeachers) : initialTeachers);
  }, []);

  useEffect(() => {
    const total = formData.basicSalary + formData.allowance + formData.bonus - formData.deduction;
    setFormData(prev => ({ ...prev, total }));
  }, [formData.basicSalary, formData.allowance, formData.bonus, formData.deduction]);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSalary: Salary = {
      id: selectedSalary ? selectedSalary.id : Date.now(),
      ...formData,
      teacherId: Number(formData.teacherId),
      basicSalary: Number(formData.basicSalary),
      allowance: Number(formData.allowance),
      bonus: Number(formData.bonus),
      deduction: Number(formData.deduction),
      total: Number(formData.total)
    };

    let updated;
    if (selectedSalary) {
      updated = salaries.map(s => s.id === selectedSalary.id ? newSalary : s);
    } else {
      updated = [...salaries, newSalary];
    }

    setSalaries(updated);
    localStorage.setItem('salaries', JSON.stringify(updated));
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      teacherId: 0,
      month: '',
      year: new Date().getFullYear().toString(),
      basicSalary: 0,
      allowance: 0,
      bonus: 0,
      deduction: 0,
      total: 0,
      paymentDate: '',
      status: 'belum_dibayar',
      note: ''
    });
    setSelectedSalary(null);
  };

  const handleEdit = (salary: Salary) => {
    setSelectedSalary(salary);
    setFormData(salary);
    setShowModal(true);
  };

  const exportToExcel = () => {
    const dataToExport = filteredSalaries.map(salary => ({
      'Bulan': salary.month,
      'Tahun': salary.year,
      'Nama Guru': getTeacherName(salary.teacherId),
      'Gaji Pokok': salary.basicSalary,
      'Tunjangan': salary.allowance,
      'Bonus': salary.bonus,
      'Potongan': salary.deduction,
      'Total': salary.total,
      'Tanggal Bayar': salary.paymentDate || '-',
      'Status': salary.status === 'dibayar' ? 'DIBAYAR' : 'BELUM DIBAYAR',
      'Keterangan': salary.note
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Penggajian');
    XLSX.writeFile(wb, `Penggajian_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredSalaries = salaries.filter(salary => {
    const teacher = teachers.find(t => t.id === salary.teacherId);
    const teacherName = teacher ? teacher.name.toLowerCase() : '';
    
    const matchesSearch = teacherName.includes(searchTerm.toLowerCase()) ||
                         salary.month.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || salary.status === filterStatus;
    const matchesMonth = filterMonth === 'all' || salary.month === filterMonth;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const totalDibayar = salaries.filter(s => s.status === 'dibayar').reduce((sum, s) => sum + s.total, 0);
  const totalBelumDibayar = salaries.filter(s => s.status === 'belum_dibayar').reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Penggajian Guru & Staff</h1>
        <p className="text-gray-600">Kelola gaji dan tunjangan guru/staff</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Penggajian</p>
              <p className="text-2xl font-bold text-gray-800">{salaries.length}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sudah Dibayar</p>
              <p className="text-lg font-bold text-green-600">
                Rp {totalDibayar.toLocaleString('id-ID')}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Belum Dibayar</p>
              <p className="text-lg font-bold text-red-600">
                Rp {totalBelumDibayar.toLocaleString('id-ID')}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Semua</p>
              <p className="text-lg font-bold text-blue-600">
                Rp {(totalDibayar + totalBelumDibayar).toLocaleString('id-ID')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari guru, bulan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Semua Status</option>
            <option value="dibayar">Sudah Dibayar</option>
            <option value="belum_dibayar">Belum Dibayar</option>
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
              Tambah Gaji
            </button>
            <button
              onClick={exportToExcel}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Guru</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gaji Pokok</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tunjangan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Potongan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSalaries.map((salary) => (
                <tr key={salary.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {salary.month} {salary.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getTeacherName(salary.teacherId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {salary.basicSalary.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {salary.allowance.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    Rp {salary.bonus.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    Rp {salary.deduction.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    Rp {salary.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      salary.status === 'dibayar' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {salary.status === 'dibayar' ? 'Dibayar' : 'Belum Dibayar'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(salary)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedSalary ? 'Edit Penggajian' : 'Tambah Penggajian'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guru/Staff *</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Pilih Guru/Staff</option>
                    {teachers.filter(t => t.status === 'active').map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan *</label>
                  <select
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tunjangan (Rp)</label>
                  <input
                    type="number"
                    value={formData.allowance}
                    onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus (Rp)</label>
                  <input
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Potongan (Rp)</label>
                  <input
                    type="number"
                    value={formData.deduction}
                    onChange={(e) => setFormData({ ...formData, deduction: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Gaji</label>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {formData.total.toLocaleString('id-ID')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembayaran</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
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
                    <option value="belum_dibayar">Belum Dibayar</option>
                    <option value="dibayar">Sudah Dibayar</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={2}
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
                  {selectedSalary ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salaries;
