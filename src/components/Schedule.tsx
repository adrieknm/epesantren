import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, CheckCircle, Calendar, Clock, Download, FileSpreadsheet, Printer } from "lucide-react";
import { ScheduleItem, ClassItem, Subject, Teacher, initialSchedules, initialSubjects, initialTeachers, daysOfWeek } from "../data/classData";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ScheduleProps {
  classes: ClassItem[];
}

export default function Schedule({ classes }: ScheduleProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [filterClass, setFilterClass] = useState<number>(classes[0]?.id || 1);
  const [filterDay, setFilterDay] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [editSchedule, setEditSchedule] = useState<ScheduleItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState<Omit<ScheduleItem, "id">>({
    classId: filterClass, subjectId: 0, teacherId: 0, day: "Senin", startTime: "07:00", endTime: "08:30", room: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load from localStorage
  useEffect(() => {
    const storedSubjects = localStorage.getItem('subjects');
    const storedTeachers = localStorage.getItem('teachers');
    if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
    if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
  }, []);

  const getClassName = (id: number) => classes.find(c => c.id === id)?.name || "-";
  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || "-";
  const getTeacherName = (id: number) => teachers.find(t => t.id === id)?.name || "-";

  const dayColors: Record<string, string> = {
    Senin: "bg-blue-100 text-blue-700 border-blue-200",
    Selasa: "bg-green-100 text-green-700 border-green-200",
    Rabu: "bg-purple-100 text-purple-700 border-purple-200",
    Kamis: "bg-orange-100 text-orange-700 border-orange-200",
    Jumat: "bg-red-100 text-red-700 border-red-200",
    Sabtu: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const filtered = schedules.filter(s => {
    const matchClass = filterClass ? s.classId === filterClass : true;
    const matchDay = filterDay ? s.day === filterDay : true;
    return matchClass && matchDay;
  });

  const grouped = daysOfWeek.reduce((acc, day) => {
    acc[day] = filtered.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const openAdd = () => {
    setEditSchedule(null);
    setFormData({ classId: filterClass, subjectId: 0, teacherId: 0, day: "Senin", startTime: "07:00", endTime: "08:30", room: classes.find(c => c.id === filterClass)?.room || "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (s: ScheduleItem) => {
    setEditSchedule(s);
    setFormData({ classId: s.classId, subjectId: s.subjectId, teacherId: s.teacherId, day: s.day, startTime: s.startTime, endTime: s.endTime, room: s.room });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.subjectId) errs.subjectId = "Mata pelajaran wajib dipilih";
    if (!formData.teacherId) errs.teacherId = "Guru wajib dipilih";
    if (!formData.room.trim()) errs.room = "Ruang wajib diisi";
    if (formData.startTime >= formData.endTime) errs.endTime = "Jam selesai harus lebih besar dari jam mulai";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editSchedule) {
      setSchedules(schedules.map(s => s.id === editSchedule.id ? { ...s, ...formData } : s));
      setSuccessMsg("Jadwal berhasil diperbarui!");
    } else {
      const newSched: ScheduleItem = { id: Math.max(...schedules.map(s => s.id), 0) + 1, ...formData };
      setSchedules([...schedules, newSched]);
      setSuccessMsg("Jadwal berhasil ditambahkan!");
    }
    setShowModal(false);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const confirmDelete = () => {
    if (deleteTarget) setSchedules(schedules.filter(s => s.id !== deleteTarget));
    setShowDelete(false);
    setSuccessMsg("Jadwal berhasil dihapus!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Export to Excel
  const exportToExcel = () => {
    const className = getClassName(filterClass);
    
    const excelData = filtered
      .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
      .map((sched, index) => ({
        'No': index + 1,
        'Hari': sched.day,
        'Jam Mulai': sched.startTime,
        'Jam Selesai': sched.endTime,
        'Mata Pelajaran': getSubjectName(sched.subjectId),
        'Guru': getTeacherName(sched.teacherId),
        'Ruangan': sched.room,
      }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 10 },  // Hari
      { wch: 12 },  // Jam Mulai
      { wch: 12 },  // Jam Selesai
      { wch: 25 },  // Mata Pelajaran
      { wch: 25 },  // Guru
      { wch: 15 },  // Ruangan
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Pelajaran');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(data, `Jadwal_Pelajaran_${className}.xlsx`);
    setShowDownloadMenu(false);
    setSuccessMsg("File Excel berhasil diunduh!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Export to PDF (print format)
  const exportToPDF = () => {
    const className = getClassName(filterClass);
    const classData = classes.find(c => c.id === filterClass);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jadwal Pelajaran - ${className}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { font-size: 18px; margin-bottom: 5px; }
          .header h2 { font-size: 14px; font-weight: normal; color: #666; }
          .info { margin-bottom: 15px; }
          .info p { margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #333; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .day-header { background-color: #e0e0e0; font-weight: bold; text-align: center; }
          .footer { margin-top: 30px; text-align: right; }
          .signature { margin-top: 60px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>JADWAL PELAJARAN</h1>
          <h2>Tahun Ajaran ${classData?.academicYear || '-'}</h2>
        </div>
        
        <div class="info">
          <p><strong>Kelas:</strong> ${className}</p>
          <p><strong>Tingkat:</strong> ${classData?.level || '-'}</p>
          <p><strong>Wali Kelas:</strong> ${classData?.teacher || '-'}</p>
          <p><strong>Ruangan:</strong> ${classData?.room || '-'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">No</th>
              <th style="width: 12%;">Hari</th>
              <th style="width: 18%;">Waktu</th>
              <th style="width: 25%;">Mata Pelajaran</th>
              <th style="width: 25%;">Guru</th>
              <th style="width: 15%;">Ruangan</th>
            </tr>
          </thead>
          <tbody>
            ${daysOfWeek.map(day => {
              const daySchedules = grouped[day] || [];
              if (daySchedules.length === 0) return '';
              return `
                <tr class="day-header">
                  <td colspan="6">${day}</td>
                </tr>
                ${daySchedules.map((sched, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${sched.day}</td>
                    <td>${sched.startTime} - ${sched.endTime}</td>
                    <td>${getSubjectName(sched.subjectId)}</td>
                    <td>${getTeacherName(sched.teacherId)}</td>
                    <td>${sched.room}</td>
                  </tr>
                `).join('')}
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div class="signature">
            <p>Mengetahui,</p>
            <p>Kepala Sekolah</p>
            <br><br><br>
            <p>_______________________</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setShowDownloadMenu(false);
  };

  // Download as image
  const downloadAsImage = async () => {
    // Create a simple CSV download as fallback
    const className = getClassName(filterClass);
    
    let csvContent = "No,Hari,Jam Mulai,Jam Selesai,Mata Pelajaran,Guru,Ruangan\n";
    
    filtered
      .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
      .forEach((sched, index) => {
        csvContent += `${index + 1},${sched.day},${sched.startTime},${sched.endTime},"${getSubjectName(sched.subjectId)}","${getTeacherName(sched.teacherId)}",${sched.room}\n`;
      });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Jadwal_Pelajaran_${className}.csv`);
    setShowDownloadMenu(false);
    setSuccessMsg("File CSV berhasil diunduh!");
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
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">Kelas:</span>
          </div>
          <select value={filterClass} onChange={e => setFilterClass(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700 font-medium">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
          </select>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
            <option value="">Semua Hari</option>
            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          {/* Download Button with Dropdown */}
          <div className="relative ml-auto">
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Download size={15} /> Download
            </button>
            
            {showDownloadMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <button 
                    onClick={exportToExcel}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Download Excel
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-100"
                  >
                    <Printer size={16} className="text-blue-600" />
                    Print / PDF
                  </button>
                  <button 
                    onClick={downloadAsImage}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-100"
                  >
                    <Download size={16} className="text-purple-600" />
                    Download CSV
                  </button>
                </div>
              </>
            )}
          </div>
          
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus size={15} /> Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Kelas: {getClassName(filterClass)}</div>
        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Total Jadwal: {filtered.length}</div>
        {daysOfWeek.map(d => filtered.filter(s => s.day === d).length > 0 && (
          <div key={d} className={`px-3 py-1 rounded-full text-xs font-semibold border ${dayColors[d]}`}>{d}: {filtered.filter(s => s.day === d).length} sesi</div>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {daysOfWeek.map(day => (
          <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`px-4 py-3 border-b ${dayColors[day].split(" ").slice(0, 2).join(" ")} border-opacity-50`}>
              <h3 className="font-semibold text-sm">{day}</h3>
              <p className="text-xs opacity-75">{grouped[day]?.length || 0} sesi pelajaran</p>
            </div>
            <div className="p-3 space-y-2 min-h-[120px]">
              {(!grouped[day] || grouped[day].length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                  <Clock size={24} />
                  <p className="text-xs mt-1">Tidak ada jadwal</p>
                </div>
              ) : (
                grouped[day].map(sched => (
                  <div key={sched.id} className={`rounded-lg p-3 border ${dayColors[day].split(" ").slice(0, 1).join(" ")} bg-opacity-30 border-opacity-40 relative group`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{getSubjectName(sched.subjectId)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{getTeacherName(sched.teacherId)}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={10} />{sched.startTime} – {sched.endTime}</span>
                          <span className="text-xs text-gray-400">• {sched.room}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEdit(sched)} className="p-1 rounded text-yellow-500 hover:bg-yellow-50"><Edit2 size={12} /></button>
                        <button onClick={() => { setDeleteTarget(sched.id); setShowDelete(true); }} className="p-1 rounded text-red-500 hover:bg-red-50"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Daftar Jadwal — {getClassName(filterClass)}</h3>
          <span className="text-xs text-gray-400">{filtered.length} jadwal</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Hari</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Waktu</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Mata Pelajaran</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Guru</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Ruangan</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Belum ada jadwal untuk kelas ini</td></tr>
              ) : (
                filtered.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day) || a.startTime.localeCompare(b.startTime)).map(sched => (
                  <tr key={sched.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${dayColors[sched.day]}`}>{sched.day}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <Clock size={12} />
                        <span className="font-medium">{sched.startTime}</span>
                        <span>–</span>
                        <span className="font-medium">{sched.endTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{getSubjectName(sched.subjectId)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{getTeacherName(sched.teacherId)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{sched.room}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(sched)} className="p-1.5 rounded-lg text-yellow-500 hover:bg-yellow-50 transition"><Edit2 size={14} /></button>
                        <button onClick={() => { setDeleteTarget(sched.id); setShowDelete(true); }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-lg">{editSchedule ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
                <select value={formData.classId} onChange={e => setFormData(p => ({ ...p, classId: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                <select value={formData.subjectId} onChange={e => {
                  const subj = subjects.find(s => s.id === Number(e.target.value));
                  setFormData(p => ({ ...p, subjectId: Number(e.target.value), teacherId: subj?.teacherId || 0 }));
                }} className={`w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 ${formErrors.subjectId ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`}>
                  <option value={0}>-- Pilih Mata Pelajaran --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}
                </select>
                {formErrors.subjectId && <p className="text-red-500 text-xs mt-1">{formErrors.subjectId}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Guru <span className="text-red-500">*</span></label>
                <select value={formData.teacherId} onChange={e => setFormData(p => ({ ...p, teacherId: Number(e.target.value) }))} className={`w-full border rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 ${formErrors.teacherId ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`}>
                  <option value={0}>-- Pilih Guru --</option>
                  {teachers.filter(t => t.status === "active").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {formErrors.teacherId && <p className="text-red-500 text-xs mt-1">{formErrors.teacherId}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hari</label>
                <select value={formData.day} onChange={e => setFormData(p => ({ ...p, day: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                  {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jam Mulai</label>
                  <input type="time" value={formData.startTime} onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jam Selesai</label>
                  <input type="time" value={formData.endTime} onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${formErrors.endTime ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`} />
                  {formErrors.endTime && <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ruangan <span className="text-red-500">*</span></label>
                <input type="text" value={formData.room} onChange={e => setFormData(p => ({ ...p, room: e.target.value }))} placeholder="Contoh: Ruang 01" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${formErrors.room ? "border-red-400" : "border-gray-200 focus:border-green-500 focus:ring-green-100"}`} />
                {formErrors.room && <p className="text-red-500 text-xs mt-1">{formErrors.room}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><Trash2 size={18} className="text-red-500" /></div>
              <h3 className="font-bold text-gray-800">Hapus Jadwal?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Jadwal ini akan dihapus secara permanen.</p>
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
