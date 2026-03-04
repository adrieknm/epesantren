import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Settings } from 'lucide-react';
import { PaymentType, initialPaymentTypes } from '../../data/classData';

const PaymentSettings: React.FC = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PaymentType | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    period: 'bulanan' as 'bulanan' | 'tahunan' | 'sekali',
    category: 'spp' as 'spp' | 'daftar_ulang' | 'seragam' | 'kitab' | 'kegiatan' | 'lainnya',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    const saved = localStorage.getItem('paymentTypes');
    setPaymentTypes(saved ? JSON.parse(saved) : initialPaymentTypes);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newType: PaymentType = {
      id: selectedType ? selectedType.id : Date.now(),
      ...formData,
      amount: Number(formData.amount)
    };

    let updated;
    if (selectedType) {
      updated = paymentTypes.map(t => t.id === selectedType.id ? newType : t);
    } else {
      updated = [...paymentTypes, newType];
    }

    setPaymentTypes(updated);
    localStorage.setItem('paymentTypes', JSON.stringify(updated));
    
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      period: 'bulanan',
      category: 'spp',
      description: '',
      status: 'active'
    });
    setSelectedType(null);
  };

  const handleEdit = (type: PaymentType) => {
    setSelectedType(type);
    setFormData(type);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus jenis pembayaran ini?')) {
      const updated = paymentTypes.filter(t => t.id !== id);
      setPaymentTypes(updated);
      localStorage.setItem('paymentTypes', JSON.stringify(updated));
    }
  };

  const toggleStatus = (id: number) => {
    const updated = paymentTypes.map(t => 
      t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' as const : 'active' as const } : t
    );
    setPaymentTypes(updated);
    localStorage.setItem('paymentTypes', JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Setting Pembayaran</h1>
        <p className="text-gray-600">Kelola jenis dan tarif pembayaran</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jenis Pembayaran</p>
              <p className="text-2xl font-bold text-gray-800">{paymentTypes.length}</p>
            </div>
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {paymentTypes.filter(t => t.status === 'active').length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pembayaran Bulanan</p>
              <p className="text-2xl font-bold text-blue-600">
                {paymentTypes.filter(t => t.period === 'bulanan').length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pembayaran Tahunan</p>
              <p className="text-2xl font-bold text-purple-600">
                {paymentTypes.filter(t => t.period === 'tahunan').length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Jenis Pembayaran
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pembayaran</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      type.category === 'spp' ? 'bg-blue-100 text-blue-800' :
                      type.category === 'daftar_ulang' ? 'bg-purple-100 text-purple-800' :
                      type.category === 'seragam' ? 'bg-green-100 text-green-800' :
                      type.category === 'kitab' ? 'bg-yellow-100 text-yellow-800' :
                      type.category === 'kegiatan' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {type.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rp {type.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {type.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(type.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        type.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {type.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              {selectedType ? 'Edit Jenis Pembayaran' : 'Tambah Jenis Pembayaran'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembayaran *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Contoh: SPP Bulanan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="spp">SPP</option>
                      <option value="daftar_ulang">Daftar Ulang</option>
                      <option value="seragam">Seragam</option>
                      <option value="kitab">Kitab</option>
                      <option value="kegiatan">Kegiatan</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periode *</label>
                    <select
                      required
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="bulanan">Bulanan</option>
                      <option value="tahunan">Tahunan</option>
                      <option value="sekali">Sekali Bayar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Keterangan tambahan tentang pembayaran ini"
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
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
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
                  {selectedType ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings;
