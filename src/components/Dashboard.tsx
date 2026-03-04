import { Users, School, BookOpen, GraduationCap, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { ClassItem } from "../data/classData";

interface DashboardProps {
  classes: ClassItem[];
  setActivePage: (page: string) => void;
}

export default function Dashboard({ classes, setActivePage }: DashboardProps) {
  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
  const activeClasses = classes.filter((c) => c.status === "active").length;
  const occupancyRate = Math.round((totalStudents / totalCapacity) * 100);

  const stats = [
    {
      label: "Total Kelas",
      value: classes.length,
      icon: <School size={22} />,
      color: "bg-green-500",
      light: "bg-green-50",
      textColor: "text-green-600",
      sub: `${activeClasses} aktif`,
    },
    {
      label: "Total Santri",
      value: totalStudents,
      icon: <Users size={22} />,
      color: "bg-blue-500",
      light: "bg-blue-50",
      textColor: "text-blue-600",
      sub: `dari ${totalCapacity} kapasitas`,
    },
    {
      label: "Mata Pelajaran",
      value: 24,
      icon: <BookOpen size={22} />,
      color: "bg-purple-500",
      light: "bg-purple-50",
      textColor: "text-purple-600",
      sub: "8 pelajaran hari ini",
    },
    {
      label: "Guru / Ustadz",
      value: 18,
      icon: <GraduationCap size={22} />,
      color: "bg-orange-500",
      light: "bg-orange-50",
      textColor: "text-orange-600",
      sub: "16 hadir hari ini",
    },
  ];

  const recentClasses = classes.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Selamat Datang, Admin! 👋</h2>
            <p className="text-green-100 text-sm">Tahun Ajaran 2024/2025 — Semester Ganjil</p>
            <p className="text-green-200 text-xs mt-1">
              Tingkat hunian kelas: <span className="font-bold text-white">{occupancyRate}%</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActivePage("class-add")}
              className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
            >
              + Tambah Kelas
            </button>
            <button
              onClick={() => setActivePage("class-list")}
              className="border border-white text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
            >
              Lihat Kelas
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.light} p-3 rounded-lg`}>
                <span className={stat.textColor}>{stat.icon}</span>
              </div>
              <TrendingUp size={14} className="text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-sm font-medium text-gray-600 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Classes & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Classes */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Daftar Kelas Terbaru</h3>
            <button
              onClick={() => setActivePage("class-list")}
              className="text-green-600 text-sm hover:underline"
            >
              Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Kelas</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Tingkat</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Wali Kelas</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Santri</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClasses.map((cls) => (
                  <tr key={cls.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{cls.name}</td>
                    <td className="px-5 py-3 text-gray-600">{cls.level}</td>
                    <td className="px-5 py-3 text-gray-600 truncate max-w-[140px]">{cls.teacher}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${(cls.students / cls.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-600">{cls.students}/{cls.capacity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          cls.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {cls.status === "active" ? (
                          <CheckCircle size={10} />
                        ) : (
                          <AlertCircle size={10} />
                        )}
                        {cls.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-green-600" /> Informasi Hari Ini
            </h3>
            <div className="space-y-3">
              {[
                { label: "Hari", value: new Date().toLocaleDateString("id-ID", { weekday: "long" }) },
                { label: "Tanggal", value: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Tahun Ajaran", value: "2024/2025" },
                { label: "Semester", value: "Ganjil" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Ringkasan Kelas</h3>
            <div className="space-y-2">
              {["MA", "MTs"].map((level) => {
                const levelClasses = classes.filter((c) => c.level === level);
                const levelStudents = levelClasses.reduce((s, c) => s + c.students, 0);
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded text-center">
                      {level}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(levelStudents / totalStudents) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{levelStudents} santri</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
