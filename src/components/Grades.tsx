import { useState } from "react";
import { Save, CheckCircle, BookOpen, TrendingUp, Award, FileSpreadsheet } from "lucide-react";
import { Student, ClassItem, Subject, GradeRecord, initialGrades, initialSubjects } from "../data/classData";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface GradesProps {
  students: Student[];
  classes: ClassItem[];
}

export default function Grades({ students, classes }: GradesProps) {
  const [grades, setGrades] = useState<GradeRecord[]>(initialGrades);
  const [subjects] = useState<Subject[]>(initialSubjects);
  const [selectedClass, setSelectedClass] = useState<number>(classes[0]?.id || 1);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [selectedSemester] = useState("Ganjil");
  const [selectedYear] = useState("2024/2025");
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<"input" | "report">("input");

  const classStudents = students.filter(s => s.classId === selectedClass && s.status === "active");
  const availableSubjects = subjects;
  const activeSubject = selectedSubject || (availableSubjects[0]?.id || 0);

  const getGrade = (studentId: number, subjectId: number): GradeRecord | undefined =>
    grades.find(g => g.studentId === studentId && g.subjectId === subjectId && g.classId === selectedClass);

  const updateGrade = (studentId: number, subjectId: number, field: "uh1" | "uh2" | "uts" | "uas", value: number) => {
    const v = Math.min(100, Math.max(0, value));
    setGrades(prev => {
      const idx = prev.findIndex(g => g.studentId === studentId && g.subjectId === subjectId && g.classId === selectedClass);
      if (idx >= 0) {
        const updated = { ...prev[idx], [field]: v };
        updated.final = Math.round(((updated.uh1 + updated.uh2) / 2 * 0.2 + updated.uts * 0.35 + updated.uas * 0.45) * 100) / 100;
        return prev.map((g, i) => i === idx ? updated : g);
      }
      const newGrade: GradeRecord = {
        id: Date.now() + studentId,
        studentId, subjectId, classId: selectedClass,
        semester: selectedSemester, academicYear: selectedYear,
        uh1: field === "uh1" ? v : 0,
        uh2: field === "uh2" ? v : 0,
        uts: field === "uts" ? v : 0,
        uas: field === "uas" ? v : 0,
        final: 0,
      };
      newGrade.final = Math.round(((newGrade.uh1 + newGrade.uh2) / 2 * 0.2 + newGrade.uts * 0.35 + newGrade.uas * 0.45) * 100) / 100;
      return [...prev, newGrade];
    });
  };

  const getLetterGrade = (score: number) => {
    if (score >= 90) return { letter: "A", color: "text-green-600" };
    if (score >= 80) return { letter: "B+", color: "text-blue-600" };
    if (score >= 75) return { letter: "B", color: "text-blue-500" };
    if (score >= 65) return { letter: "C+", color: "text-yellow-600" };
    if (score >= 60) return { letter: "C", color: "text-yellow-500" };
    return { letter: "D", color: "text-red-600" };
  };

  const getPredicateColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-700";
    if (score >= 75) return "bg-blue-100 text-blue-700";
    if (score >= 65) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  // Report: all subjects for a student
  const reportStudents = students.filter(s => s.classId === selectedClass);
  const reportSubjects = subjects.slice(0, 6); // show first 6

  const getClassName = (id: number) => classes.find(c => c.id === id)?.name || "-";
  const getSubjectName = (id: number) => subjects.find(s => s.id === id)?.name || "-";

  const classAvg = (subj: number) => {
    const sg = grades.filter(g => g.subjectId === subj && g.classId === selectedClass && g.final > 0);
    if (!sg.length) return 0;
    return Math.round(sg.reduce((s, g) => s + g.final, 0) / sg.length * 10) / 10;
  };

  // Excel Export Function
  const exportToExcel = () => {
    const className = getClassName(selectedClass);
    
    // Prepare data for Excel
    const excelData = reportStudents.map((student, index) => {
      const row: any = {
        'No': index + 1,
        'NIS': student.nis,
        'Nama Santri': student.name,
        'Jenis Kelamin': student.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      };
      
      // Add subject grades
      reportSubjects.forEach(subject => {
        const grade = getGrade(student.id, subject.id);
        row[subject.name] = grade?.final ?? 0;
      });
      
      // Calculate average
      const subjectGrades = reportSubjects.map(s => getGrade(student.id, s.id)?.final ?? 0);
      const validGrades = subjectGrades.filter(v => v > 0);
      const avg = validGrades.length ? Math.round(validGrades.reduce((s, v) => s + v, 0) / validGrades.length * 10) / 10 : 0;
      const predicate = avg >= 90 ? "Sangat Baik" : avg >= 75 ? "Baik" : avg >= 65 ? "Cukup" : "Kurang";
      
      row['Rata-rata'] = avg;
      row['Predikat'] = predicate;
      
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
    reportSubjects.forEach(() => colWidths.push({ wch: 12 })); // Subject columns
    colWidths.push({ wch: 12 }, { wch: 15 }); // Average and Predicate
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');
    
    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(data, `Rekap_Nilai_${className}_${selectedSemester}_${selectedYear.replace('/', '-')}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-2 w-fit">
        <button onClick={() => setViewMode("input")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "input" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Input Nilai</button>
        <button onClick={() => setViewMode("report")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === "report" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Rekap Nilai</button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> Nilai berhasil disimpan!
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedClass} onChange={e => setSelectedClass(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700 font-medium">
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
          </select>
          {viewMode === "input" && (
            <select value={activeSubject} onChange={e => setSelectedSubject(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-white text-gray-700">
              {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">{selectedSemester} — {selectedYear}</span>
          {viewMode === "input" && (
            <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition ml-auto">
              <Save size={15} /> Simpan Nilai
            </button>
          )}
        </div>
      </div>

      {viewMode === "input" ? (
        <>
          {/* Export Button for Input Mode */}
          <div className="flex justify-end">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <FileSpreadsheet size={16} />
              Export Rekap Nilai
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Rata-rata Kelas", value: `${classAvg(activeSubject)}`, color: "bg-green-100 text-green-700", icon: <TrendingUp size={18} /> },
              { label: "Nilai Tertinggi", value: `${Math.max(...grades.filter(g => g.subjectId === activeSubject && g.classId === selectedClass).map(g => g.final), 0)}`, color: "bg-blue-100 text-blue-700", icon: <Award size={18} /> },
              { label: "Nilai Terendah", value: `${Math.min(...grades.filter(g => g.subjectId === activeSubject && g.classId === selectedClass && g.final > 0).map(g => g.final), 100)}`, color: "bg-orange-100 text-orange-700", icon: <BookOpen size={18} /> },
              { label: "Jumlah Siswa", value: `${classStudents.length}`, color: "bg-purple-100 text-purple-700", icon: <BookOpen size={18} /> },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-xl p-4 flex items-center gap-3`}>
                <div className="opacity-70">{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs font-medium opacity-80">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Grade Input Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Input Nilai — {getSubjectName(activeSubject)}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Kelas {getClassName(selectedClass)} | {selectedSemester} {selectedYear}</p>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                UH = 20% | UTS = 35% | UAS = 45%
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">No</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Nama Santri</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">UH 1</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">UH 2</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">UTS</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">UAS</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Nilai Akhir</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">Tidak ada santri di kelas ini</td></tr>
                  ) : (
                    classStudents.map((student, idx) => {
                      const g = getGrade(student.id, activeSubject);
                      const uh1 = g?.uh1 ?? 0;
                      const uh2 = g?.uh2 ?? 0;
                      const uts = g?.uts ?? 0;
                      const uas = g?.uas ?? 0;
                      const final = g?.final ?? 0;
                      const letter = getLetterGrade(final);
                      return (
                        <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${student.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`}>
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{student.name}</div>
                                <div className="text-xs text-gray-400">{student.nis}</div>
                              </div>
                            </div>
                          </td>
                          {(["uh1", "uh2", "uts", "uas"] as const).map(field => (
                            <td key={field} className="px-4 py-3 text-center">
                              <input
                                type="number" min={0} max={100}
                                value={field === "uh1" ? uh1 : field === "uh2" ? uh2 : field === "uts" ? uts : uas}
                                onChange={e => updateGrade(student.id, activeSubject, field, Number(e.target.value))}
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-center text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold text-lg ${getPredicateColor(final).split(" ")[1] || "text-gray-700"}`}>{final.toFixed(1)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold text-base ${letter.color}`}>{letter.letter}</span>
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
                <Save size={15} /> Simpan Nilai
              </button>
            </div>
          </div>
        </>
      ) : (
        // Report Mode
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Rekap Nilai — Kelas {getClassName(selectedClass)}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{selectedSemester} {selectedYear}</p>
            </div>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium sticky left-0 bg-gray-50">Nama Santri</th>
                  {reportSubjects.map(s => (
                    <th key={s.id} className="px-3 py-3 text-center text-gray-500 font-medium min-w-[80px]">{s.name}</th>
                  ))}
                  <th className="px-4 py-3 text-center text-green-600 font-semibold">Rata-rata</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-medium">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {reportStudents.map(student => {
                  const subjectGrades = reportSubjects.map(s => getGrade(student.id, s.id)?.final ?? 0);
                  const validGrades = subjectGrades.filter(v => v > 0);
                  const avg = validGrades.length ? Math.round(validGrades.reduce((s, v) => s + v, 0) / validGrades.length * 10) / 10 : 0;
                  const predicate = avg >= 90 ? "Sangat Baik" : avg >= 75 ? "Baik" : avg >= 65 ? "Cukup" : "Kurang";
                  return (
                    <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800 sticky left-0 bg-white">
                        <div>{student.name}</div>
                        <div className="text-xs text-gray-400">{student.nis}</div>
                      </td>
                      {reportSubjects.map(s => {
                        const grade = getGrade(student.id, s.id)?.final ?? 0;
                        return (
                          <td key={s.id} className="px-3 py-3 text-center">
                            {grade > 0 ? (
                              <span className={`font-semibold text-sm px-2 py-0.5 rounded ${getPredicateColor(grade)}`}>{grade.toFixed(1)}</span>
                            ) : (
                              <span className="text-gray-300 text-sm">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-base ${avg >= 85 ? "text-green-700" : avg >= 75 ? "text-blue-700" : avg >= 65 ? "text-yellow-700" : "text-red-600"}`}>{avg > 0 ? avg.toFixed(1) : "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPredicateColor(avg)}`}>{avg > 0 ? predicate : "—"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
