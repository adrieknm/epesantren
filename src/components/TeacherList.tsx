import { useEffect, useState } from "react";
import {
  Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight,
  RefreshCw, GraduationCap, Phone, Mail, X, CheckCircle, XCircle, Download, Upload
} from "lucide-react";
import { Teacher, initialTeachers, initialSubjects } from "../data/classData";
import * as XLSX from "xlsx";

export default function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Teacher, "id">>({
    nip: "", name: "", gender: "L", subject: "", phone: "", email: "",
    address: "", education: "", status: "active", joinDate: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const itemsPerPage = 8;

  const subjects = initialSubjects;

  // Persist teachers to localStorage so Finance/Penggajian can use the same data
  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers));
  }, [teachers]);

  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(q) || t.nip.includes(q) || t.subject.toLowerCase().includes(q);
    const matchGender = filterGender ? t.gender === filterGender : true;
    const matchStatus = filterStatus ? t.status === filterStatus : true;
    return matchSearch && matchGender && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSubjectCount = (teacherId: number) => subjects.filter(s => s.teacherId === teacherId).length;

  const openAdd = () => {
    setEditTeacher(null);
    setFormData({ nip: "", name: "", gender: "L", subject: "", phone: "", email: "", address: "", education: "", status: "active", joinDate: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    setFormData({ nip: t.nip, name: t.name, gender: t.gender, subject: t.subject, phone: t.phone, email: t.email, address: t.address, education: t.education, status: t.status, joinDate: t.joinDate });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nip.trim()) errs.nip = "NIP wajib diisi";
    if (!formData.name.trim()) errs.name = "Nama wajib diisi";
    if (!formData.subject.trim()) errs.subject = "Mata pelajaran wajib diisi";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editTeacher) {
      setTeachers(teachers.map(t => t.id === editTeacher.id ? { ...t, ...formData } : t));
      setSuccessMsg("Data guru berhasil diperbarui!");
    } else {
      const newTeacher: Teacher = { id: Math.max(...teachers.map(t => t.id), 0) + 1, ...formData };
      setTeachers([...teachers, newTeacher]);
      setSuccessMsg("Guru baru berhasil ditambahkan!");
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id: number) => { setDeleteTarget(id); setShowDelete(true); };
  const confirmDelete = () => {
    if (deleteTarget) setTeachers(teachers.filter(t => t.id !== deleteTarget));
    setShowDelete(false);
    setSuccessMsg("Data guru berhasil dihapus!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const toggleStatus = (id: number) => {
    setTeachers(teachers.map(t => t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t));
  };

  const downloadTemplate = () => {
    const templateData = [
      ["NIP", "Nama Lengkap", "Jenis Kelamin (L/P)", "Mata Pelajaran", "No. HP", "Email", "Pendidikan Terakhir", "Tanggal Bergabung (YYYY-MM-DD)", "Alamat", "Status (active/inactive)"],
      ["19850101001", "Ustadz Ahmad Fauzi", "L", "Fiqih", "081234567890", "ahmad.fauzi@epesantren.id", "S1 Pendidikan Agama Islam", "2015-01-10", "Jl. Mawar No. 1, Jakarta", "active"],
      ["19880215002", "Ustadzah Siti Aminah", "P", "Bahasa Arab", "082345678901", "siti.aminah@epesantren.id", "S2 Bahasa Arab", "2016-07-01", "Jl. Melati No. 2, Bogor", "active"],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Guru");
    XLSX.writeFile(wb, "Template_Import_Guru.xlsx");
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
        const newTeachers: Teacher[] = [];
        const errors: string[] = [];

        rows.forEach((row, idx) => {
          if (row.length < 4) {
            errors.push(`Baris ${idx + 2}: Data tidak lengkap`);
            return;
          }

          const [nip, name, gender, subject, phone, email, education, joinDate, address, status] = row;
          
          if (!nip || !name || !gender || !subject) {
            errors.push(`Baris ${idx + 2}: NIP, Nama, Gender, dan Mapel wajib diisi`);
            return;
          }

          newTeachers.push({
            id: Math.max(...teachers.map(t => t.id), 0) + newTeachers.length + 1,
            nip: String(nip),
            name: String(name),
            gender: String(gender).toUpperCase() === "L" ? "L" : "P",
            subject: String(subject),
            phone: String(phone) || "",
            email: String(email) || "",
            education: String(education) || "",
            joinDate: String(joinDate) || "",
            address: String(address) || "",
            status: String(status).toLowerCase() === "inactive" ? "inactive" : "active",
          });
        });

        if (errors.length > 0 && newTeachers.length === 0) {
          setImportError(`Import gagal:\n${errors.join("\n")}`);
          return;
        }

        setTeachers([...teachers, ...newTeachers]);
        setImportError(null);
        
        if (errors.length > 0 && newTeachers.length > 0) {
          alert(`Berhasil mengimport ${newTeachers.length} guru.\n\nPeringatan:\n${errors.join("\n")}`);
        } else {
          alert(`Berhasil mengimport ${newTeachers.length} guru!`);
        }
      } catch (error) {
        setImportError("Gagal membaca file Excel. Pastikan format file benar.");
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    e.target.value = "";
  };

  const fields = [
    { label: "NIP", key: "nip", placeholder: "Nomor Induk Pegawai", required: true },
    { label: "Nama Lengkap", key: "name", placeholder: "Nama lengkap guru", required: true },
    { label: "Mata Pelajaran Utama", key: "subject", placeholder: "Contoh: Matematika", required: true },
    { label: "No. HP", key: "phone", placeholder: "08xxxxxxxxxx" },
    { label: "Email", key: "email", placeholder: "email@epesantren.id", type: "email" },
    { label: "Pendidikan Terakhir", key: "education", placeholder: "Contoh: S1 Pendidikan Agama Islam" },
    { label: "Tanggal Bergabung", key: "joinDate", type: "date" },
    { label: "Alamat", key: "address", placeholder: "Alamat lengkap" },
  ];

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {importError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {importError}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={15} className="text-gray-400" />
            <input type="text" placeholder="Cari nama, NIP, atau mapel..." className="outline-none text-sm flex-1 bg-transparent" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
          </div>
          <select value={filterGender} onChange={e => { setFilterGender(e.target.value); setCurrentPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
            <option value="">Semua Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterGender(""); setFilterStatus(""); }} className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"><RefreshCw size={15} /></button>
          <div className="flex gap-2 ml-auto">
            <button onClick={downloadTemplate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <Download size={15} /> Template
            </button>
            <label className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer">
              <Upload size={15} /> Import
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </label>
            <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <Plus size={15} /> Tambah Guru
            </button>
          </div>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total Guru", value: teachers.length, color: "bg-green-100 text-green-700" },
          { label: "Aktif", value: teachers.filter(t => t.status === "active").length, color: "bg-blue-100 text-blue-700" },
          { label: "Nonaktif", value: teachers.filter(t => t.status === "inactive").length, color: "bg-red-100 text-red-700" },
          { label: "Laki-laki", value: teachers.filter(t => t.gender === "L").length, color: "bg-indigo-100 text-indigo-700" },
          { label: "Perempuan", value: teachers.filter(t => t.gender === "P").length, color: "bg-pink-100 text-pink-700" },
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
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Guru / Ustadz</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">NIP</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Mapel</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Kontak</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Jml Mapel</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400"><div className="flex flex-col items-center gap-2"><GraduationCap size={32} className="text-gray-300" /><p>Tidak ada data guru</p></div></td></tr>
              ) : (
                paginated.map((teacher, idx) => (
                  <tr key={teacher.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${teacher.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`}>
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{teacher.name}</div>
                          <div className="text-xs text-gray-400">{teacher.education}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{teacher.nip}</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">{teacher.subject}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={11} />{teacher.phone}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Mail size={11} />{teacher.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{getSubjectCount(teacher.id)} mapel</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(teacher.id)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${teacher.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                        {teacher.status === "active" ? <><CheckCircle size={11} /> Aktif</> : <><XCircle size={11} /> Nonaktif</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setDetailTeacher(teacher); setShowDetail(true); }} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition"><Eye size={15} /></button>
                        <button onClick={() => openEdit(teacher)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(teacher.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={15} /></button>
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
              <h3 className="font-bold text-gray-800 text-lg">{editTeacher ? "Edit Data Guru" : "Tambah Guru Baru"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key} className={f.key === "address" || f.key === "education" ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</label>
                  <input
                    type={(f as any).type || "text"}
                    value={(formData as any)[f.key]}
                    onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={(f as any).placeholder}
                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${formErrors[f.key] ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`}
                  />
                  {formErrors[f.key] && <p className="text-red-500 text-xs mt-1">{formErrors[f.key]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                <div className="flex gap-4 mt-1">
                  {(["L", "P"] as const).map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tgender" value={g} checked={formData.gender === g} onChange={() => setFormData(p => ({ ...p, gender: g }))} className="accent-green-600" />
                      <span className="text-sm text-gray-700">{g === "L" ? "Laki-laki" : "Perempuan"}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <div className="flex gap-4 mt-1">
                  {(["active", "inactive"] as const).map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tstatus" value={s} checked={formData.status === s} onChange={() => setFormData(p => ({ ...p, status: s }))} className="accent-green-600" />
                      <span className="text-sm text-gray-700">{s === "active" ? "Aktif" : "Nonaktif"}</span>
                    </label>
                  ))}
                </div>
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
      {showDetail && detailTeacher && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Detail Guru</h3>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex items-center gap-4 mb-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${detailTeacher.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`}>
                {detailTeacher.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">{detailTeacher.name}</div>
                <div className="text-sm text-gray-500">NIP: {detailTeacher.nip}</div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${detailTeacher.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {detailTeacher.status === "active" ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: "Mata Pelajaran", value: detailTeacher.subject },
                { label: "Gender", value: detailTeacher.gender === "L" ? "Laki-laki" : "Perempuan" },
                { label: "Pendidikan", value: detailTeacher.education },
                { label: "Tgl Bergabung", value: detailTeacher.joinDate ? new Date(detailTeacher.joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-" },
                { label: "No. HP", value: detailTeacher.phone },
                { label: "Email", value: detailTeacher.email },
                { label: "Jumlah Mapel", value: `${getSubjectCount(detailTeacher.id)} Mata Pelajaran` },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-xs text-gray-400">{item.label}</div>
                  <div className="font-medium text-gray-800 text-sm mt-0.5">{item.value || "-"}</div>
                </div>
              ))}
              <div className="col-span-2 bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-xs text-gray-400">Alamat</div>
                <div className="font-medium text-gray-800 text-sm mt-0.5">{detailTeacher.address || "-"}</div>
              </div>
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
              <h3 className="font-bold text-gray-800">Hapus Data Guru?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Data guru akan dihapus secara permanen dan tidak dapat dikembalikan.</p>
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
