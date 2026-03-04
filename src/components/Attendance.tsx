import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Clock, Save, RefreshCw, Users, Calendar, FileSpreadsheet, BookOpen } from "lucide-react";
import { Student, ClassItem, AttendanceRecord, initialAttendance, Subject, initialSubjects } from "../data/classData";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface AttendanceProps {
  students: Student[];
  classes: ClassItem[];
}

type AttStatus = "hadir" | "sakit" | "izin" | "alpha";

const statusConfig: Record<AttStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  hadir:  { label: "Hadir",  color: "text-green-700",  bg: "bg-green-100",  border: "border-green-300",  icon: <CheckCircle size={14} /> },
  sakit:  { label: "Sakit",  color: "text-blue-700",   bg: "bg-blue-100",   border: "border-blue-300",   icon: <AlertCircle size={14} /> },
  izin:   { label: "Izin",   color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-300", icon: <Clock size={14} /> },
  alpha:  { label: "Alpha",  color: "text-red-700",    bg: "bg-red-100",    border: "border-red-300",    icon: <XCircle size={14} /> },
};

// Extended attendance record with subject
interface AttendanceWithSubject extends AttendanceRecord {
  subjectId?: number;
}

export default function Attendance({ students, classes }: AttendanceProps) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedClass, setSelectedClass] = useState<number>(classes[0]?.id || 1);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [attendance, setAttendance] = useState<AttendanceWithSubject[]>(initialAttendance);
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<"input" | "report">("input");
  const [reportClass, setReportClass] = useState<number>(classes[0]?.id || 1);
  const [reportSubject, setReportSubject] = useState<number>(0);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));

  // Load subjects from localStorage
  useEffect(() => {
    const storedSubjects = localStorage.getItem('subjects');
    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects));
    }
  }, []);

  // Set default subject when subjects load
  useEffect(() => {
    if (subjects.length > 0 && selectedSubject === 0) {
      setSelectedSubject(subjects[0].id);
    }
    if (subjects.length > 0 && reportSubject === 0) {
      setReportSubject(subjects[0].id);
    }
  }, [subjects]);

  const classStudents = students.filter(s => s.classId === selectedClass && s.status === "active");
  const getClassName = (id: number) => classes.find(c => c.id === id)?.name || "-";
  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || "-";

  const getStudentStatus = (studentId: number): AttStatus => {
    const rec = attendance.find(a => 
      a.studentId === studentId && 
      a.date === selectedDate && 
      a.classId === selectedClass &&
      a.subjectId === selectedSubject
    );
    return rec?.status || "hadir";
  };

  const getStudentNote = (studentId: number): string => {
    const rec = attendance.find(a => 
      a.studentId === studentId && 
      a.date === selectedDate && 
      a.classId === selectedClass &&
      a.subjectId === selectedSubject
    );
    return rec?.note || "";
  };

  const updateStatus = (studentId: number, status: AttStatus) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => 
        a.studentId === studentId && 
        a.date === selectedDate && 
        a.classId === selectedClass &&
        a.subjectId === selectedSubject
      );
      if (idx >= 0) return prev.map((a, i) => i === idx ? { ...a, status } : a);
      return [...prev, { 
        id: Date.now() + studentId, 
        studentId, 
        classId: selectedClass, 
        date: selectedDate, 
        status, 
        note: "",
        subjectId: selectedSubject 
      }];
    });
  };

  const updateNote = (studentId: number, note: string) => {
    setAttendance(prev => {
      const idx = prev.findIndex(a => 
        a.studentId === studentId && 
        a.date === selectedDate && 
        a.classId === selectedClass &&
        a.subjectId === selectedSubject
      );
      if (idx >= 0) return prev.map((a, i) => i === idx ? { ...a, note } : a);
      return [...prev, { 
        id: Date.now() + studentId, 
        studentId, 
        classId: selectedClass, 
        date: selectedDate, 
        status: "hadir", 
        note,
        subjectId: selectedSubject 
      }];
    });
  };

  const setAllStatus = (status: AttStatus) => {
    classStudents.forEach(s => updateStatus(s.id, status));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const summary = {
    hadir: classStudents.filter(s => getStudentStatus(s.id) === "hadir").length,
    sakit: classStudents.filter(s => getStudentStatus(s.id) === "sakit").length,
    izin:  classStudents.filter(s => getStudentStatus(s.id) === "izin").length,
    alpha: classStudents.filter(s => getStudentStatus(s.id) === "alpha").length,
  };

  // Report mode
  const reportStudents = students.filter(s => s.classId === reportClass);
  const reportAttendance = attendance.filter(a => 
    a.date.startsWith(reportMonth) && 
    a.classId === reportClass &&
    (reportSubject === 0 || a.subjectId === reportSubject)
  );
  const uniqueDates = [...new Set(reportAttendance.map(a => a.date))].sort();

  const getStudentMonthStatus = (studentId: number, date: string): AttStatus => {
    return reportAttendance.find(a => a.studentId === studentId && a.date === date)?.status || "hadir";
  };

  // Excel Export Function
  const exportToExcel = () => {
    const className = getClassName(reportClass);
    const subjectName = reportSubject === 0 ? "Semua Mapel" : getSubjectName(reportSubject);
    const monthName = new Date(reportMonth + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    
    // Prepare data for Excel
    const excelData = reportStudents.map((student, index) => {
      const row: Record<string, string | number> = {
        'No': index + 1,
        'NIS': student.nis,
        'Nama Santri': student.name,
        'Jenis Kelamin': student.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      };
      
      if (reportSubject === 0) {
        // Rekapitulasi untuk semua mapel
        const studentRecords = reportAttendance.filter(a => a.studentId === student.id);
        const h = studentRecords.filter(a => a.status === "hadir").length;
        const s = studentRecords.filter(a => a.status === "sakit").length;
        const iz = studentRecords.filter(a => a.status === "izin").length;
        const a = studentRecords.filter(a => a.status === "alpha").length;
        const total = h + s + iz + a;
        
        row['Total Pertemuan'] = total;
        row['Total Hadir'] = h;
        row['Total Sakit'] = s;
        row['Total Izin'] = iz;
        row['Total Alpha'] = a;
        row['Persentase Kehadiran'] = total > 0 ? `${((h / total) * 100).toFixed(1)}%` : '0%';
      } else {
        // Daily attendance per mapel
        uniqueDates.forEach(date => {
          const status = getStudentMonthStatus(student.id, date);
          const dateLabel = new Date(date).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit' });
          row[dateLabel] = status.charAt(0).toUpperCase();
        });
        
        // Add summary
        const h = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "hadir").length;
        const s = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "sakit").length;
        const iz = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "izin").length;
        const a = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "alpha").length;
        
        row['Total Hadir'] = h;
        row['Total Sakit'] = s;
        row['Total Izin'] = iz;
        row['Total Alpha'] = a;
        row['Persentase Kehadiran'] = uniqueDates.length > 0 ? `${((h / uniqueDates.length) * 100).toFixed(1)}%` : '0%';
      }
      
      return row;
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 12 }, // NIS
      { wch: 25 }, // Nama
      { wch: 15 }, // Gender
    ];
    
    if (reportSubject === 0) {
      colWidths.push({ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 });
    } else {
      uniqueDates.forEach(() => colWidths.push({ wch: 8 })); // Dates
      colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }); // Summaries
    }
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Absensi');
    
    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(data, `Laporan_Absensi_${className}_${subjectName.replace(' ', '_')}_${monthName.replace(' ', '_')}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-2 w-fit">
        <button onClick={() => setViewMode("input")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "input" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          Input Absensi
        </button>
        <button onClick={() => setViewMode("report")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "report" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          Laporan Absensi
        </button>
      </div>

      {viewMode === "input" ? (
        <>
          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <CheckCircle size={16} /> Absensi berhasil disimpan!
            </div>
          )}

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Kelas:</span>
              </div>
              <select value={selectedClass} onChange={e => setSelectedClass(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700 font-medium">
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
              </select>
              
              {/* Subject Selection */}
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Mapel:</span>
              </div>
              <select 
                value={selectedSubject} 
                onChange={e => setSelectedSubject(Number(e.target.value))} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700 font-medium"
              >
                {subjects.length === 0 ? (
                  <option value={0}>-- Belum ada mapel --</option>
                ) : (
                  subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                )}
              </select>
              
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              <button onClick={() => setAllStatus("hadir")} className="px-3 py-2 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition">Semua Hadir</button>
              <button onClick={() => setAllStatus("alpha")} className="px-3 py-2 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition">Semua Alpha</button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition ml-auto">
                <Save size={15} /> Simpan
              </button>
            </div>
          </div>

          {/* Info Banner */}
          {selectedSubject > 0 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <BookOpen size={16} />
              <span>Mengisi absensi untuk mata pelajaran: <strong>{getSubjectName(selectedSubject)}</strong></span>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(statusConfig) as [AttStatus, typeof statusConfig[AttStatus]][]).map(([key, cfg]) => (
              <div key={key} className={`${cfg.bg} rounded-xl p-4 border ${cfg.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`${cfg.color} font-bold text-2xl`}>{summary[key]}</span>
                  <span className={cfg.color}>{cfg.icon}</span>
                </div>
                <div className={`${cfg.color} text-sm font-medium mt-1`}>{cfg.label}</div>
                <div className={`text-xs ${cfg.color} opacity-70 mt-0.5`}>dari {classStudents.length} siswa</div>
              </div>
            ))}
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Absensi Kelas {getClassName(selectedClass)}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {selectedSubject > 0 && <span className="ml-2">• Mapel: {getSubjectName(selectedSubject)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">{classStudents.length} santri</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">No</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Nama Santri</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">NIS</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Status Kehadiran</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">Tidak ada santri di kelas ini</td></tr>
                  ) : (
                    classStudents.map((student, idx) => {
                      const status = getStudentStatus(student.id);
                      const cfg = statusConfig[status];
                      return (
                        <tr key={student.id} className={`border-t border-gray-50 hover:bg-gray-50 transition ${cfg.bg} bg-opacity-20`}>
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${student.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`}>
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-800">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{student.nis}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {(Object.entries(statusConfig) as [AttStatus, typeof statusConfig[AttStatus]][]).map(([key, c]) => (
                                <button key={key} onClick={() => updateStatus(student.id, key)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${status === key ? `${c.bg} ${c.color} ${c.border} ring-2 ring-offset-1 ring-current` : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"}`}>
                                  {c.icon} {c.label}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input type="text" value={getStudentNote(student.id)} onChange={e => updateNote(student.id, e.target.value)} placeholder="Keterangan..." className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                <Save size={15} /> Simpan Absensi
              </button>
            </div>
          </div>
        </>
      ) : (
        // Report Mode
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Kelas:</span>
              </div>
              <select value={reportClass} onChange={e => setReportClass(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
              </select>
              
              {/* Subject filter for report */}
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Mapel:</span>
              </div>
              <select 
                value={reportSubject} 
                onChange={e => setReportSubject(Number(e.target.value))} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700"
              >
                <option value={0}>Semua Mapel</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              
              <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500" />
              <button
                onClick={exportToExcel}
                disabled={uniqueDates.length === 0}
                className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
            </div>
          </div>

          {/* Report info */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <BookOpen size={16} />
            <span>
              Menampilkan laporan absensi untuk: <strong>{reportSubject === 0 ? "Semua Mata Pelajaran" : getSubjectName(reportSubject)}</strong>
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Rekap Absensi — Kelas {getClassName(reportClass)}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(reportMonth + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                {reportSubject > 0 && <span className="ml-2">• Mapel: {getSubjectName(reportSubject)}</span>}
              </p>
            </div>
            {uniqueDates.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Belum ada data absensi pada bulan ini</p>
                <p className="text-xs mt-1">Silakan input absensi terlebih dahulu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium sticky left-0 bg-gray-50">Nama Santri</th>
                      
                      {/* Kalau Semua Mapel (reportSubject === 0), sembunyikan kolom tanggal */}
                      {reportSubject !== 0 && uniqueDates.map(d => (
                        <th key={d} className="px-2 py-3 text-center text-gray-500 font-medium min-w-[50px]">
                          {new Date(d).toLocaleDateString("id-ID", { day: "2-digit" })}
                        </th>
                      ))}
                      
                      {reportSubject === 0 && (
                        <th className="px-3 py-3 text-center text-gray-500 font-medium">Pertemuan</th>
                      )}
                      
                      <th className="px-3 py-3 text-center text-green-600 font-medium">H</th>
                      <th className="px-3 py-3 text-center text-blue-600 font-medium">S</th>
                      <th className="px-3 py-3 text-center text-yellow-600 font-medium">I</th>
                      <th className="px-3 py-3 text-center text-red-600 font-medium">A</th>
                      <th className="px-3 py-3 text-center text-gray-600 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportStudents.map(student => {
                      if (reportSubject === 0) {
                        // REKAPITULASI SEMUA MAPEL
                        const studentRecords = reportAttendance.filter(a => a.studentId === student.id);
                        const h = studentRecords.filter(a => a.status === "hadir").length;
                        const s = studentRecords.filter(a => a.status === "sakit").length;
                        const iz = studentRecords.filter(a => a.status === "izin").length;
                        const a = studentRecords.filter(a => a.status === "alpha").length;
                        const total = h + s + iz + a;
                        const percentage = total > 0 ? ((h / total) * 100).toFixed(0) : 0;
                        
                        return (
                          <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-800 sticky left-0 bg-white">{student.name}</td>
                            <td className="px-3 py-2 text-center font-medium text-gray-600">{total}</td>
                            <td className="px-3 py-2 text-center font-bold text-green-700">{h}</td>
                            <td className="px-3 py-2 text-center font-bold text-blue-700">{s}</td>
                            <td className="px-3 py-2 text-center font-bold text-yellow-700">{iz}</td>
                            <td className="px-3 py-2 text-center font-bold text-red-700">{a}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs font-bold ${Number(percentage) >= 80 ? 'text-green-600' : Number(percentage) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {percentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      } else {
                        // HARIAN PER MAPEL
                        const h = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "hadir").length;
                        const s = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "sakit").length;
                        const iz = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "izin").length;
                        const a = uniqueDates.filter(d => getStudentMonthStatus(student.id, d) === "alpha").length;
                        const percentage = uniqueDates.length > 0 ? ((h / uniqueDates.length) * 100).toFixed(0) : 0;
                        
                        return (
                          <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-800 sticky left-0 bg-white">{student.name}</td>
                            {uniqueDates.map(d => {
                              const st = getStudentMonthStatus(student.id, d);
                              const sCfg = statusConfig[st];
                              return (
                                <td key={d} className="px-2 py-2 text-center">
                                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${sCfg.bg} ${sCfg.color}`}>
                                    {st.charAt(0).toUpperCase()}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center font-bold text-green-700">{h}</td>
                            <td className="px-3 py-2 text-center font-bold text-blue-700">{s}</td>
                            <td className="px-3 py-2 text-center font-bold text-yellow-700">{iz}</td>
                            <td className="px-3 py-2 text-center font-bold text-red-700">{a}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs font-bold ${Number(percentage) >= 80 ? 'text-green-600' : Number(percentage) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {percentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-400 text-center">H = Hadir &nbsp;|&nbsp; S = Sakit &nbsp;|&nbsp; I = Izin &nbsp;|&nbsp; A = Alpha &nbsp;|&nbsp; % = Persentase Kehadiran</p>
          </div>
        </div>
      )}
    </div>
  );
}
