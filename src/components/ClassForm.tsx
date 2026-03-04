import { useState, useEffect } from "react";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { ClassItem, semesters } from "../data/classData";

interface ClassFormProps {
  classes: ClassItem[];
  setClasses: (classes: ClassItem[]) => void;
  setActivePage: (page: string) => void;
  editClass: ClassItem | null;
  setEditClass: (cls: ClassItem | null) => void;
}

interface FormData {
  name: string;
  level: string;
  grade: string;
  room: string;
  capacity: string;
  teacher: string;
  status: "active" | "inactive";
  academicYear: string;
  semester: string;
}

const defaultForm: FormData = {
  name: "",
  level: "MTs",
  grade: "VII",
  room: "",
  capacity: "35",
  teacher: "",
  status: "active",
  academicYear: "2024/2025",
  semester: "Ganjil",
};

export default function ClassForm({ classes, setClasses, setActivePage, editClass, setEditClass }: ClassFormProps) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [teachers, setTeachers] = useState<string[]>([]);

  // Load teachers from localStorage
  useEffect(() => {
    const storedTeachers = localStorage.getItem('teachers');
    if (storedTeachers) {
      try {
        const teachersData = JSON.parse(storedTeachers);
        const teacherNames = teachersData.map((t: any) => t.name);
        setTeachers(teacherNames);
      } catch (e) {
        console.error('Error loading teachers:', e);
        setTeachers([]);
      }
    }
  }, []);

  useEffect(() => {
    if (editClass) {
      setForm({
        name: editClass.name,
        level: editClass.level,
        grade: editClass.grade,
        room: editClass.room,
        capacity: String(editClass.capacity),
        teacher: editClass.teacher,
        status: editClass.status,
        academicYear: editClass.academicYear,
        semester: editClass.semester,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editClass]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = "Nama kelas wajib diisi";
    if (!form.room.trim()) newErrors.room = "Ruangan wajib diisi";
    if (!form.teacher) newErrors.teacher = "Wali kelas wajib dipilih";
    if (!form.capacity || Number(form.capacity) < 1) newErrors.capacity = "Kapasitas harus lebih dari 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editClass) {
      setClasses(
        classes.map((c) =>
          c.id === editClass.id
            ? { ...c, ...form, capacity: Number(form.capacity), students: c.students }
            : c
        )
      );
    } else {
      const newClass: ClassItem = {
        id: Math.max(...classes.map((c) => c.id), 0) + 1,
        ...form,
        capacity: Number(form.capacity),
        students: 0,
      };
      setClasses([...classes, newClass]);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setEditClass(null);
      setActivePage("class-list");
    }, 1500);
  };

  const handleReset = () => {
    setForm(editClass ? {
      name: editClass.name,
      level: editClass.level,
      grade: editClass.grade,
      room: editClass.room,
      capacity: String(editClass.capacity),
      teacher: editClass.teacher,
      status: editClass.status,
      academicYear: editClass.academicYear,
      semester: editClass.semester,
    } : defaultForm);
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Success Banner */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span className="font-medium text-sm">
            Kelas berhasil {editClass ? "diperbarui" : "ditambahkan"}! Mengalihkan...
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditClass(null); setActivePage("class-list"); }}
              className="text-green-200 hover:text-white transition p-1"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-white font-bold text-lg">
                {editClass ? "Edit Kelas" : "Tambah Kelas Baru"}
              </h2>
              <p className="text-green-200 text-xs">
                {editClass ? `Mengedit kelas ${editClass.name}` : "Isi form berikut untuk menambah kelas baru"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Academic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
              Informasi Tahun Ajaran
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(e) => handleChange("academicYear", e.target.value)}
                  placeholder="Contoh: 2024/2025"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Semester <span className="text-red-500">*</span></label>
                <select
                  value={form.semester}
                  onChange={(e) => handleChange("semester", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white"
                >
                  {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Class Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
              Data Kelas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tingkat <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.level}
                  onChange={(e) => handleChange("level", e.target.value)}
                  placeholder="Contoh: MTs, MA"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kelas (Grade) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.grade}
                  onChange={(e) => handleChange("grade", e.target.value)}
                  placeholder="Contoh: VII, VIII, IX, X, XI, XII"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Kelas <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Contoh: VII A, VIII Unggulan"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 transition ${
                    errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ruangan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.room}
                  onChange={(e) => handleChange("room", e.target.value)}
                  placeholder="Contoh: Ruang 01, Aula Besar"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 transition ${
                    errors.room ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.room && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.room}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kapasitas Maksimal <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  min={1}
                  max={100}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 transition ${
                    errors.capacity ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                  }`}
                />
                {errors.capacity && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.capacity}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status Kelas</label>
                <div className="flex gap-3 mt-1">
                  {(["active", "inactive"] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={form.status === s}
                        onChange={() => handleChange("status", s)}
                        className="accent-green-600"
                      />
                      <span className="text-sm text-gray-700">{s === "active" ? "Aktif" : "Nonaktif"}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Teacher */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">
              Wali Kelas
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pilih Wali Kelas <span className="text-red-500">*</span></label>
              <select
                value={form.teacher}
                onChange={(e) => handleChange("teacher", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 transition bg-white ${
                  errors.teacher ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"
                }`}
              >
                <option value="">-- Pilih Wali Kelas --</option>
                {teachers.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.teacher && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.teacher}
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Save size={15} />
              {editClass ? "Simpan Perubahan" : "Simpan Kelas"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => { setEditClass(null); setActivePage("class-list"); }}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <ArrowLeft size={15} /> Kembali
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
