import { useState } from "react";
import {
  Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight,
  CheckCircle, AlertCircle, Users, RefreshCw
} from "lucide-react";
import { ClassItem, academicYears, levels } from "../data/classData";

interface ClassListProps {
  classes: ClassItem[];
  setClasses: (classes: ClassItem[]) => void;
  setActivePage: (page: string) => void;
  setEditClass: (cls: ClassItem | null) => void;
}

export default function ClassList({ classes, setClasses, setActivePage, setEditClass }: ClassListProps) {
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYear, setFilterYear] = useState("2024/2025");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailClass, setDetailClass] = useState<ClassItem | null>(null);
  const itemsPerPage = 10;

  const filtered = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel ? c.level === filterLevel : true;
    const matchStatus = filterStatus ? c.status === filterStatus : true;
    const matchYear = filterYear ? c.academicYear === filterYear : true;
    return matchSearch && matchLevel && matchStatus && matchYear;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === paginated.length) setSelectedIds([]);
    else setSelectedIds(paginated.map((c) => c.id));
  };

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = () => {
    if (deleteTarget) {
      setClasses(classes.filter((c) => c.id !== deleteTarget));
    } else {
      setClasses(classes.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleEdit = (cls: ClassItem) => {
    setEditClass(cls);
    setActivePage("class-add");
  };

  const handleDetail = (cls: ClassItem) => {
    setDetailClass(cls);
    setShowDetailModal(true);
  };

  const toggleStatus = (id: number) => {
    setClasses(
      classes.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelas, wali kelas, ruangan..."
              className="outline-none text-sm flex-1 bg-transparent"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          {/* Filters */}
          <select
            value={filterYear}
            onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-700 bg-white"
          >
            <option value="">Semua Tahun</option>
            {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-700 bg-white"
          >
            <option value="">Semua Tingkat</option>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-700 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            onClick={() => { setSearch(""); setFilterLevel(""); setFilterStatus(""); setFilterYear("2024/2025"); }}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"
            title="Reset Filter"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => { setEditClass(null); setActivePage("class-add"); }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition ml-auto"
          >
            <Plus size={15} /> Tambah Kelas
          </button>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total Kelas", value: classes.length, color: "bg-green-100 text-green-700" },
          { label: "Aktif", value: classes.filter((c) => c.status === "active").length, color: "bg-blue-100 text-blue-700" },
          { label: "Nonaktif", value: classes.filter((c) => c.status === "inactive").length, color: "bg-red-100 text-red-600" },
          { label: "Total Santri", value: classes.reduce((s, c) => s + c.students, 0), color: "bg-purple-100 text-purple-700" },
        ].map((pill, i) => (
          <div key={i} className={`${pill.color} px-3 py-1 rounded-full text-xs font-semibold`}>
            {pill.label}: {pill.value}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {selectedIds.length > 0 && (
          <div className="bg-green-50 px-5 py-2 flex items-center gap-3 border-b border-green-100">
            <span className="text-sm text-green-700 font-medium">{selectedIds.length} kelas dipilih</span>
            <button
              onClick={() => { setDeleteTarget(null); setShowDeleteModal(true); }}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={14} /> Hapus Dipilih
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" onChange={toggleAll} checked={selectedIds.length === paginated.length && paginated.length > 0} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">No</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Nama Kelas</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Tingkat</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Ruangan</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Wali Kelas</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Santri</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Kapasitas</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <p>Tidak ada data kelas ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((cls, idx) => (
                  <tr key={cls.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(cls.id)}
                        onChange={() => toggleSelect(cls.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">{cls.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">{cls.level}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cls.room}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{cls.teacher}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${(cls.students / cls.capacity) >= 0.9 ? "bg-red-400" : "bg-green-500"}`}
                            style={{ width: `${Math.min((cls.students / cls.capacity) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-700 text-xs">{cls.students}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cls.capacity}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(cls.id)}>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            cls.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {cls.status === "active" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                          {cls.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDetail(cls)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                          title="Detail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleEdit(cls)}
                          className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Menampilkan {paginated.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} data
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Konfirmasi Hapus</h3>
                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              {deleteTarget
                ? `Apakah Anda yakin ingin menghapus kelas "${classes.find((c) => c.id === deleteTarget)?.name}"?`
                : `Apakah Anda yakin ingin menghapus ${selectedIds.length} kelas yang dipilih?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailClass && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">Detail Kelas</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="bg-green-50 rounded-xl p-4 mb-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {detailClass.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-xl">{detailClass.name}</div>
                <div className="text-green-700 font-medium">{detailClass.level} — {detailClass.grade}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Ruangan", value: detailClass.room },
                { label: "Kapasitas", value: `${detailClass.capacity} siswa` },
                { label: "Jumlah Santri", value: `${detailClass.students} siswa` },
                { label: "Hunian", value: `${Math.round((detailClass.students / detailClass.capacity) * 100)}%` },
                { label: "Wali Kelas", value: detailClass.teacher },
                { label: "Tahun Ajaran", value: detailClass.academicYear },
                { label: "Semester", value: detailClass.semester },
                { label: "Status", value: detailClass.status === "active" ? "Aktif" : "Nonaktif" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                  <div className="font-medium text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setShowDetailModal(false); handleEdit(detailClass); }}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Edit Kelas
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
