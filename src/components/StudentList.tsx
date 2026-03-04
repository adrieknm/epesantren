import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, RefreshCw, Users, Download, Upload } from "lucide-react";
import { Student, ClassItem } from "../data/classData";
import * as XLSX from "xlsx";

interface StudentListProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  classes: ClassItem[];
  setActivePage?: (page: string) => void;
}

export default function StudentList({ students, setStudents, classes }: StudentListProps) {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ nis: "", name: "", gender: "L" as "L" | "P", classId: "", address: "", phone: "", kamar: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [importError, setImportError] = useState<string | null>(null);

  const itemsPerPage = 10;

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    const matchClass = filterClass ? s.classId === Number(filterClass) : true;
    const matchGender = filterGender ? s.gender === filterGender : true;
    return matchSearch && matchClass && matchGender;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getClassName = (classId: number) => classes.find((c) => c.id === classId)?.name || "-";

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) setStudents(students.filter((s) => s.id !== deleteTarget));
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const openAdd = () => {
    setEditStudent(null);
    setFormData({ nis: "", name: "", gender: "L", classId: "", address: "", phone: "", kamar: "" });
    setFormErrors({});
    setShowAddModal(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setFormData({ 
      nis: s.nis, 
      name: s.name, 
      gender: s.gender, 
      classId: String(s.classId), 
      address: s.address, 
      phone: s.phone,
      kamar: (s as any).kamar || "" 
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.nis.trim()) errs.nis = "NIS wajib diisi";
    if (!formData.name.trim()) errs.name = "Nama wajib diisi";
    if (!formData.classId) errs.classId = "Kelas wajib dipilih";
    if (!formData.kamar.trim()) errs.kamar = "Kamar wajib diisi";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveStudent = () => {
    if (!validateForm()) return;
    if (editStudent) {
      setStudents(students.map((s) => s.id === editStudent.id ? { ...s, ...formData, classId: Number(formData.classId), kamar: formData.kamar } as Student : s));
    } else {
      const newStudent: Student = {
        id: Math.max(...students.map((s) => s.id), 0) + 1,
        nis: formData.nis,
        name: formData.name,
        gender: formData.gender,
        classId: Number(formData.classId),
        address: formData.address,
        phone: formData.phone,
        kamar: formData.kamar,
        status: "active",
      };
      setStudents([...students, newStudent]);
    }
    setShowAddModal(false);
  };

  const downloadTemplate = () => {
    const templateData = [
      ["NIS", "Nama Lengkap", "Jenis Kelamin (L/P)", "ID Kelas", "No. HP", "Alamat", "Kamar"],
      ["2024001", "Ahmad Fauzi", "L", "1", "081234567890", "Jl. Pesantren No. 1", "Kamar 101"],
      ["2024002", "Fatimah Zahra", "P", "1", "081234567891", "Jl. Pesantren No. 2", "Kamar 102"],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Santri");
    XLSX.writeFile(wb, "Template_Import_Santri.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        // Skip header row
        const rows = jsonData.slice(1);
        const newStudents: Student[] = [];
        const errors: string[] = [];

        rows.forEach((row, idx) => {
          if (row.length < 3) {
            errors.push(`Baris ${idx + 2}: Data tidak lengkap`);
            return;
          }

          const [nis, name, gender, classId, phone, address, kamar] = row;
          
          if (!nis || !name || !gender) {
            errors.push(`Baris ${idx + 2}: NIS, Nama, dan Gender wajib diisi`);
            return;
          }

          const existingClass = classes.find(c => c.id === Number(classId));
          if (!existingClass) {
            errors.push(`Baris ${idx + 2}: ID Kelas tidak ditemukan`);
            return;
          }

          if (!kamar) {
            errors.push(`Baris ${idx + 2}: Kamar wajib diisi`);
            return;
          }

          newStudents.push({
            id: Math.max(...students.map(s => s.id), 0) + newStudents.length + 1,
            nis: String(nis),
            name: String(name),
            gender: String(gender).toUpperCase() === "L" ? "L" : "P",
            classId: Number(classId),
            phone: String(phone) || "",
            address: String(address) || "",
            kamar: String(kamar),
            status: "active",
          });
        });

        if (errors.length > 0 && newStudents.length === 0) {
          setImportError(`Import gagal:\n${errors.join("\n")}`);
          return;
        }

        setStudents([...students, ...newStudents]);
        setImportError(null);
        
        if (errors.length > 0 && newStudents.length > 0) {
          alert(`Berhasil mengimport ${newStudents.length} santri.\n\nPeringatan:\n${errors.join("\n")}`);
        } else {
          alert(`Berhasil mengimport ${newStudents.length} santri!`);
        }
      } catch (error) {
        setImportError("Gagal membaca file Excel. Pastikan format file benar.");
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama santri atau NIS..."
              className="outline-none text-sm flex-1 bg-transparent"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-700 bg-white"
          >
            <option value="">Semua Kelas</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterGender}
            onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none text-gray-700 bg-white"
          >
            <option value="">Semua Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterClass(""); setFilterGender(""); }} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
            <RefreshCw size={15} />
          </button>
          <div className="flex gap-2 ml-auto">
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <Download size={15} /> Template
            </button>
            <label className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              <Upload size={15} /> Import
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <Plus size={15} /> Tambah Santri
            </button>
          </div>
        </div>
      </div>

      {importError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {importError}
        </div>
      )}

      {/* Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total Santri", value: students.length, color: "bg-green-100 text-green-700" },
          { label: "Laki-laki", value: students.filter((s) => s.gender === "L").length, color: "bg-blue-100 text-blue-700" },
          { label: "Perempuan", value: students.filter((s) => s.gender === "P").length, color: "bg-pink-100 text-pink-700" },
        ].map((p, i) => (
          <div key={i} className={`${p.color} px-3 py-1 rounded-full text-xs font-semibold`}>
            {p.label}: {p.value}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">No</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">NIS</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Nama Santri</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Kelas</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Kamar</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Gender</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">No. HP</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <p>Tidak ada data santri ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((student, idx) => (
                  <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{student.nis}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${student.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">{getClassName(student.classId)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(student as any).kamar || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${student.gender === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                        {student.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{student.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Aktif</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setDetailStudent(student); setShowDetail(true); }} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"><Eye size={15} /></button>
                        <button onClick={() => openEdit(student)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={15} /></button>
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
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? "bg-green-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-2">Hapus Santri?</h3>
            <p className="text-sm text-gray-500 mb-5">Data santri akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && detailStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Detail Santri</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="flex items-center gap-4 mb-4 bg-green-50 rounded-xl p-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold ${detailStudent.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`}>
                {detailStudent.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-800">{detailStudent.name}</div>
                <div className="text-sm text-gray-500">NIS: {detailStudent.nis}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Kelas", value: getClassName(detailStudent.classId) },
                { label: "Kamar", value: (detailStudent as any).kamar || "-" },
                { label: "Gender", value: detailStudent.gender === "L" ? "Laki-laki" : "Perempuan" },
                { label: "No. HP", value: detailStudent.phone || "-" },
                { label: "Alamat", value: detailStudent.address || "-" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDetail(false)} className="w-full mt-4 border border-gray-200 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Tutup</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">{editStudent ? "Edit Santri" : "Tambah Santri"}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <div className="space-y-3">
              {[
                { label: "NIS", field: "nis", type: "text", placeholder: "Nomor Induk Santri" },
                { label: "Nama Lengkap", field: "name", type: "text", placeholder: "Nama santri" },
                { label: "No. HP", field: "phone", type: "text", placeholder: "08xxxxxxxxxx" },
                { label: "Alamat", field: "address", type: "text", placeholder: "Alamat lengkap" },
                { label: "Kamar", field: "kamar", type: "text", placeholder: "Nomor/Nama Kamar" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label} {["nis","name","kamar"].includes(f.field) && <span className="text-red-500">*</span>}</label>
                  <input
                    type={f.type}
                    value={(formData as any)[f.field]}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [f.field]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${formErrors[f.field] ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`}
                  />
                  {formErrors[f.field] && <p className="text-red-500 text-xs mt-1">{formErrors[f.field]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                <div className="flex gap-4">
                  {(["L", "P"] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={() => setFormData((p) => ({ ...p, gender: g }))} className="accent-green-600" />
                      <span className="text-sm text-gray-700">{g === "L" ? "Laki-laki" : "Perempuan"}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kelas <span className="text-red-500">*</span></label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData((p) => ({ ...p, classId: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition bg-white ${formErrors.classId ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
                {formErrors.classId && <p className="text-red-500 text-xs mt-1">{formErrors.classId}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSaveStudent} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
