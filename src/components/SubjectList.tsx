import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, RefreshCw, BookOpen, X, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Subject, Teacher, initialSubjects, initialTeachers, levels, grades } from "../data/classData";

interface SubjectListProps {
  teachers: Teacher[];
}

export default function SubjectList({ teachers: propTeachers }: SubjectListProps) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [teachers] = useState<Teacher[]>(propTeachers.length ? propTeachers : initialTeachers);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState<Omit<Subject, "id">>({
    code: "", name: "", level: "MTs", grade: "VII", hours: 2, teacherId: 0, category: "umum", description: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const itemsPerPage = 8;

  const categoryLabels: Record<string, string> = { umum: "Umum", agama: "Agama", kitab: "Kitab" };
  const categoryColors: Record<string, string> = {
    umum: "bg-blue-100 text-blue-700",
    agama: "bg-green-100 text-green-700",
    kitab: "bg-amber-100 text-amber-700"
  };

  const getTeacherName = (id: number) => teachers.find(t => t.id === id)?.name || "-";

  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    const matchLevel = filterLevel ? s.level === filterLevel : true;
    const matchCat = filterCategory ? s.category === filterCategory : true;
    return matchSearch && matchLevel && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openAdd = () => {
    setEditSubject(null);
    setFormData({ code: "", name: "", level: "MTs", grade: "VII", hours: 2, teacherId: 0, category: "umum", description: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (s: Subject) => {
    setEditSubject(s);
    setFormData({ code: s.code, name: s.name, level: s.level, grade: s.grade, hours: s.hours, teacherId: s.teacherId, category: s.category, description: s.description });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.code.trim()) errs.code = "Kode mata pelajaran wajib diisi";
    if (!formData.name.trim()) errs.name = "Nama mata pelajaran wajib diisi";
    if (!formData.teacherId) errs.teacherId = "Guru pengampu wajib dipilih";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editSubject) {
      setSubjects(subjects.map(s => s.id === editSubject.id ? { ...s, ...formData } : s));
      setSuccessMsg("Mata pelajaran berhasil diperbarui!");
    } else {
      const newSubject: Subject = { id: Math.max(...subjects.map(s => s.id), 0) + 1, ...formData };
      setSubjects([...subjects, newSubject]);
      setSuccessMsg("Mata pelajaran berhasil ditambahkan!");
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const confirmDelete = () => {
    if (deleteTarget) setSubjects(subjects.filter(s => s.id !== deleteTarget));
    setShowDelete(false);
    setSuccessMsg("Mata pelajaran berhasil dihapus!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input type="text" placeholder="Cari nama atau kode mapel..." className="outline-none text-sm flex-1 bg-transparent" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setCurrentPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
            <option value="">Semua Tingkat</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
            <option value="">Semua Kategori</option>
            <option value="umum">Umum</option>
            <option value="agama">Agama</option>
            <option value="kitab">Kitab</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterLevel(""); setFilterCategory(""); }} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><RefreshCw size={15} /></button>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition ml-auto">
            <Plus size={15} /> Tambah Mapel
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total Mapel", value: subjects.length, color: "bg-green-100 text-green-700" },
          { label: "Umum", value: subjects.filter(s => s.category === "umum").length, color: "bg-blue-100 text-blue-700" },
          { label: "Agama", value: subjects.filter(s => s.category === "agama").length, color: "bg-amber-100 text-amber-700" },
          { label: "Kitab", value: subjects.filter(s => s.category === "kitab").length, color: "bg-purple-100 text-purple-700" },
        ].map((p, i) => (
          <div key={i} className={`${p.color} px-3 py-1 rounded-full text-xs font-semibold`}>{p.label}: {p.value}</div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">No</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Kode</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Nama Mata Pelajaran</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Tingkat/Kelas</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Kategori</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Guru Pengampu</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Jam/Minggu</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400"><div className="flex flex-col items-center gap-2"><BookOpen size={32} className="text-gray-300" /><p>Tidak ada mata pelajaran</p></div></td></tr>
              ) : (
                paginated.map((subj, idx) => (
                  <tr key={subj.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 bg-gray-50 rounded">{subj.code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"><BookOpen size={14} className="text-green-600" /></div>
                        <span className="font-medium text-gray-800">{subj.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{subj.level} - {subj.grade}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[subj.category]}`}>{categoryLabels[subj.category]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{getTeacherName(subj.teacherId)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">{subj.hours} jam</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setDetailSubject(subj); setShowDetail(true); }} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"><Eye size={15} /></button>
                        <button onClick={() => openEdit(subj)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition"><Edit2 size={15} /></button>
                        <button onClick={() => { setDeleteTarget(subj.id); setShowDelete(true); }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Menampilkan {paginated.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} data</span>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={15} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{page}</button>
            ))}
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">{editSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kode Mapel <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="Contoh: MTK-7" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${formErrors.code ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`} />
                {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jam per Minggu</label>
                <input type="number" min={1} max={10} value={formData.hours} onChange={e => setFormData(p => ({ ...p, hours: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Mata Pelajaran <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap mata pelajaran" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${formErrors.name ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`} />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tingkat</label>
                <select value={formData.level} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
                <select value={formData.grade} onChange={e => setFormData(p => ({ ...p, grade: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                  {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategori</label>
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                  <option value="umum">Umum</option>
                  <option value="agama">Agama</option>
                  <option value="kitab">Kitab</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Guru Pengampu <span className="text-red-500">*</span></label>
                <select value={formData.teacherId} onChange={e => setFormData(p => ({ ...p, teacherId: Number(e.target.value) }))} className={`w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 ${formErrors.teacherId ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`}>
                  <option value={0}>-- Pilih Guru --</option>
                  {teachers.filter(t => t.status === "active").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {formErrors.teacherId && <p className="text-red-500 text-xs mt-1">{formErrors.teacherId}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Deskripsi singkat mata pelajaran" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && detailSubject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Detail Mata Pelajaran</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-3 mb-4 bg-green-50 rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center"><BookOpen size={22} className="text-white" /></div>
              <div>
                <div className="font-bold text-gray-800">{detailSubject.name}</div>
                <div className="text-sm text-gray-500">Kode: {detailSubject.code}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Tingkat / Kelas", value: `${detailSubject.level} - ${detailSubject.grade}` },
                { label: "Kategori", value: categoryLabels[detailSubject.category] },
                { label: "Guru Pengampu", value: getTeacherName(detailSubject.teacherId) },
                { label: "Jam per Minggu", value: `${detailSubject.hours} Jam Pelajaran` },
                { label: "Deskripsi", value: detailSubject.description || "-" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-800 text-right max-w-[55%]">{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDetail(false)} className="w-full mt-4 border border-gray-200 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Tutup</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={18} className="text-red-500" /></div>
              <h3 className="font-bold text-gray-800">Hapus Mata Pelajaran?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Data mata pelajaran akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
