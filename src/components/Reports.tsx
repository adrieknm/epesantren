import { useState } from "react";
import { BarChart3, Users, School, BookOpen, TrendingUp, Download, Calendar, CheckCircle, PieChart, FileText } from "lucide-react";
import { ClassItem, Student, initialTeachers, initialSubjects, initialAttendance, initialGrades } from "../data/classData";

interface ReportsProps {
  classes: ClassItem[];
  students: Student[];
}

export default function Reports({ classes, students }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<"overview" | "attendance" | "grades" | "class">("overview");
  const [selectedClass, setSelectedClass] = useState<number>(classes[0]?.id || 1);
  const [exportMsg, setExportMsg] = useState("");

  const teachers = initialTeachers;
  const subjects = initialSubjects;
  const attendance = initialAttendance;
  const grades = initialGrades;

  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalTeachers = teachers.length;
  const totalSubjects = subjects.length;
  const activeClasses = classes.filter(c => c.status === "active").length;
  const maleStudents = students.filter(s => s.gender === "L").length;
  const femaleStudents = students.filter(s => s.gender === "P").length;

  const attendanceSummary = {
    hadir: attendance.filter(a => a.status === "hadir").length,
    sakit: attendance.filter(a => a.status === "sakit").length,
    izin: attendance.filter(a => a.status === "izin").length,
    alpha: attendance.filter(a => a.status === "alpha").length,
  };
  const totalAttendance = Object.values(attendanceSummary).reduce((s, v) => s + v, 0);
  const attendanceRate = totalAttendance > 0 ? Math.round((attendanceSummary.hadir / totalAttendance) * 100) : 0;

  const avgGrade = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + g.final, 0) / grades.length * 10) / 10 : 0;

  const classSummary = classes.map(c => ({
    ...c,
    occupancy: Math.round((c.students / c.capacity) * 100),
    classStudents: students.filter(s => s.classId === c.id),
  }));

  const levelSummary = ["MTs", "MA", "MI", "SD", "SMP", "SMA"].map(level => {
    const levelClasses = classes.filter(c => c.level === level);
    const levelStudents = students.filter(s => levelClasses.some(c => c.id === s.classId));
    return { level, classes: levelClasses.length, students: levelStudents.length };
  }).filter(l => l.classes > 0);

  const handleExport = (type: string) => {
    setExportMsg(`Laporan ${type} berhasil diunduh!`);
    setTimeout(() => setExportMsg(""), 3000);
  };

  const BarItem = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-gray-500 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div className={`h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}>
          <span className="text-white text-xs font-bold">{value}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {exportMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> {exportMsg}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex-wrap">
        {[
          { key: "overview", label: "Ringkasan", icon: <PieChart size={15} /> },
          { key: "class", label: "Laporan Kelas", icon: <School size={15} /> },
          { key: "attendance", label: "Laporan Absensi", icon: <Calendar size={15} /> },
          { key: "grades", label: "Laporan Nilai", icon: <TrendingUp size={15} /> },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveReport(tab.key as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeReport === tab.key ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeReport === "overview" && (
        <div className="space-y-4">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Santri", value: totalStudents, sub: `${maleStudents}L / ${femaleStudents}P`, color: "bg-green-500", icon: <Users size={22} /> },
              { label: "Total Kelas", value: totalClasses, sub: `${activeClasses} kelas aktif`, color: "bg-blue-500", icon: <School size={22} /> },
              { label: "Guru & Ustadz", value: totalTeachers, sub: `${teachers.filter(t => t.status === "active").length} aktif`, color: "bg-purple-500", icon: <Users size={22} /> },
              { label: "Mata Pelajaran", value: totalSubjects, sub: `${subjects.filter(s => s.category === "agama").length} mapel agama`, color: "bg-orange-500", icon: <BookOpen size={22} /> },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-3 rounded-xl text-white`}>{stat.icon}</div>
                  <TrendingUp size={14} className="text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Calendar size={16} className="text-green-600" /> Ringkasan Absensi</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Kehadiran: {attendanceRate}%</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Hadir", value: attendanceSummary.hadir, color: "bg-green-500" },
                  { label: "Sakit", value: attendanceSummary.sakit, color: "bg-blue-500" },
                  { label: "Izin", value: attendanceSummary.izin, color: "bg-yellow-500" },
                  { label: "Alpha", value: attendanceSummary.alpha, color: "bg-red-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-12 text-xs text-gray-500">{item.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={`h-4 rounded-full ${item.color} transition-all duration-500`} style={{ width: `${totalAttendance > 0 ? (item.value / totalAttendance) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-blue-600" /> Distribusi per Tingkat</h3>
              <div className="space-y-3">
                {levelSummary.map(l => (
                  <BarItem key={l.level} label={l.level} value={l.students} max={totalStudents} color="bg-gradient-to-r from-green-500 to-green-400" />
                ))}
              </div>
            </div>

            {/* Subject Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><BookOpen size={16} className="text-purple-600" /> Kategori Mata Pelajaran</h3>
              <div className="space-y-3">
                {[
                  { label: "Umum", value: subjects.filter(s => s.category === "umum").length, color: "bg-gradient-to-r from-blue-500 to-blue-400" },
                  { label: "Agama", value: subjects.filter(s => s.category === "agama").length, color: "bg-gradient-to-r from-green-500 to-green-400" },
                  { label: "Kitab", value: subjects.filter(s => s.category === "kitab").length, color: "bg-gradient-to-r from-amber-500 to-amber-400" },
                ].map(item => (
                  <BarItem key={item.label} label={item.label} value={item.value} max={totalSubjects} color={item.color} />
                ))}
              </div>
            </div>

            {/* Grade Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-orange-600" /> Ringkasan Nilai</h3>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600">{avgGrade}</div>
                  <div className="text-sm text-gray-500 mt-1">Rata-rata Nilai Akhir</div>
                  <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${avgGrade >= 85 ? "bg-green-100 text-green-700" : avgGrade >= 75 ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {avgGrade >= 85 ? "Sangat Baik" : avgGrade >= 75 ? "Baik" : avgGrade >= 65 ? "Cukup" : "Kurang"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label: "Nilai ≥ 85", value: grades.filter(g => g.final >= 85).length, color: "bg-green-100 text-green-700" },
                  { label: "Nilai 75-84", value: grades.filter(g => g.final >= 75 && g.final < 85).length, color: "bg-blue-100 text-blue-700" },
                  { label: "Nilai < 75", value: grades.filter(g => g.final > 0 && g.final < 75).length, color: "bg-red-100 text-red-700" },
                ].map((item, i) => (
                  <div key={i} className={`${item.color} rounded-lg p-3 text-center`}>
                    <div className="font-bold text-xl">{item.value}</div>
                    <div className="text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === "class" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => handleExport("Kelas")} className="flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition">
              <Download size={15} /> Export Excel
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Laporan Data Kelas</h3>
              <p className="text-xs text-gray-400 mt-0.5">Tahun Ajaran 2024/2025</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Kelas</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Tingkat</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Wali Kelas</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Ruangan</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Kapasitas</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Santri</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Hunian</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classSummary.map(cls => (
                    <tr key={cls.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">{cls.name}</td>
                      <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{cls.level}</span></td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{cls.teacher}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{cls.room}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{cls.capacity}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-800">{cls.students}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${cls.occupancy >= 90 ? "bg-red-500" : cls.occupancy >= 75 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${cls.occupancy}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{cls.occupancy}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {cls.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 font-semibold text-gray-700">Total</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{classes.reduce((s, c) => s + c.capacity, 0)}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{classes.reduce((s, c) => s + c.students, 0)}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{Math.round(classes.reduce((s, c) => s + c.students, 0) / classes.reduce((s, c) => s + c.capacity, 0) * 100)}%</td>
                    <td className="px-4 py-3 text-center"><span className="text-xs text-gray-500">{activeClasses}/{totalClasses} aktif</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select value={selectedClass} onChange={e => setSelectedClass(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => handleExport("Absensi")} className="flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition">
              <Download size={15} /> Export
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Hadir", value: attendanceSummary.hadir, pct: `${attendanceRate}%`, color: "bg-green-50 border-green-200 text-green-700" },
              { label: "Total Sakit", value: attendanceSummary.sakit, pct: `${Math.round(attendanceSummary.sakit / Math.max(totalAttendance, 1) * 100)}%`, color: "bg-blue-50 border-blue-200 text-blue-700" },
              { label: "Total Izin", value: attendanceSummary.izin, pct: `${Math.round(attendanceSummary.izin / Math.max(totalAttendance, 1) * 100)}%`, color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
              { label: "Total Alpha", value: attendanceSummary.alpha, pct: `${Math.round(attendanceSummary.alpha / Math.max(totalAttendance, 1) * 100)}%`, color: "bg-red-50 border-red-200 text-red-700" },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl p-4 border ${item.color}`}>
                <div className="text-3xl font-bold">{item.value}</div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs opacity-70 mt-1">{item.pct} dari total</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText size={16} className="text-green-600" /> Detail Absensi per Santri</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Nama Santri</th>
                    <th className="px-4 py-3 text-center text-green-600 font-medium">Hadir</th>
                    <th className="px-4 py-3 text-center text-blue-600 font-medium">Sakit</th>
                    <th className="px-4 py-3 text-center text-yellow-600 font-medium">Izin</th>
                    <th className="px-4 py-3 text-center text-red-600 font-medium">Alpha</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.classId === selectedClass).map(student => {
                    const sa = attendance.filter(a => a.studentId === student.id);
                    const h = sa.filter(a => a.status === "hadir").length;
                    const sk = sa.filter(a => a.status === "sakit").length;
                    const iz = sa.filter(a => a.status === "izin").length;
                    const al = sa.filter(a => a.status === "alpha").length;
                    const total = sa.length || 1;
                    const pct = Math.round((h / total) * 100);
                    return (
                      <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-700">{h}</td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-700">{sk}</td>
                        <td className="px-4 py-3 text-center font-semibold text-yellow-700">{iz}</td>
                        <td className="px-4 py-3 text-center font-semibold text-red-700">{al}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pct >= 80 ? "bg-green-100 text-green-700" : pct >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{sa.length > 0 ? `${pct}%` : "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeReport === "grades" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => handleExport("Nilai")} className="flex items-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition">
              <Download size={15} /> Export PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Rata-rata Umum", value: `${avgGrade}`, sub: "Semua mata pelajaran", color: "bg-gradient-to-br from-green-600 to-green-400 text-white" },
              { label: "Nilai Tertinggi", value: `${Math.max(...grades.map(g => g.final), 0)}`, sub: "Nilai terbaik", color: "bg-gradient-to-br from-blue-600 to-blue-400 text-white" },
              { label: "Jumlah Data Nilai", value: `${grades.length}`, sub: "Total entri nilai", color: "bg-gradient-to-br from-purple-600 to-purple-400 text-white" },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl p-5 ${item.color}`}>
                <div className="text-4xl font-bold">{item.value}</div>
                <div className="font-semibold mt-1">{item.label}</div>
                <div className="text-sm opacity-80 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Distribusi Nilai per Mata Pelajaran</h3>
            <div className="space-y-3">
              {subjects.slice(0, 8).map(subj => {
                const subjGrades = grades.filter(g => g.subjectId === subj.id && g.final > 0);
                const avg = subjGrades.length > 0 ? Math.round(subjGrades.reduce((s, g) => s + g.final, 0) / subjGrades.length * 10) / 10 : 0;
                return (
                  <div key={subj.id} className="flex items-center gap-3">
                    <span className="w-32 text-xs text-gray-600 truncate">{subj.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div className={`h-5 rounded-full flex items-center justify-end pr-2 transition-all ${avg >= 85 ? "bg-gradient-to-r from-green-600 to-green-400" : avg >= 75 ? "bg-gradient-to-r from-blue-600 to-blue-400" : "bg-gradient-to-r from-yellow-600 to-yellow-400"}`} style={{ width: `${avg}%` }}>
                        {avg > 20 && <span className="text-white text-xs font-bold">{avg}</span>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold w-10 text-right ${avg >= 85 ? "text-green-700" : avg >= 75 ? "text-blue-700" : avg > 0 ? "text-yellow-700" : "text-gray-400"}`}>{avg > 0 ? avg : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
