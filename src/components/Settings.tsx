import { useState, useEffect } from "react";
import { Save, CheckCircle, School, User, Bell, Shield, Database, Palette, Globe, Lock, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("sekolah");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem("epesantren_theme") || "green";
    document.documentElement.setAttribute("data-theme", savedTheme);
    setAppearance(prev => ({ ...prev, theme: savedTheme }));
  }, []);

  const [sekolah, setSekolah] = useState({
    name: "Pesantren Modern Al-Hidayah",
    npsn: "12345678",
    address: "Jl. Pesantren No. 1, Bogor, Jawa Barat",
    phone: "0251-123456",
    email: "info@alhidayah.ac.id",
    website: "www.alhidayah.ac.id",
    headmaster: "KH. Ahmad Fauzi, M.Pd",
    vision: "Mencetak generasi Qur'ani yang berakhlak mulia, cerdas, dan berdaya saing global.",
    mission: "1. Menyelenggarakan pendidikan berbasis Al-Qur'an dan Sunnah\n2. Mengembangkan potensi santri secara holistik\n3. Membangun karakter Islami yang kuat",
    academicYear: "2024/2025",
    semester: "Ganjil",
    logo: "",
  });

  const [profile, setProfile] = useState({
    name: "Administrator",
    email: "admin@alhidayah.ac.id",
    phone: "081234567890",
    role: "Super Admin",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailAbsensi: true,
    emailNilai: true,
    emailLaporan: false,
    pushAbsensi: true,
    pushNilai: false,
    reminderHarian: true,
    reportMingguan: true,
    reportBulanan: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "green",
    language: "id",
    timezone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    itemsPerPage: "10",
  });

  const [system, setSystem] = useState({
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    sessionTimeout: "60",
    maxLoginAttempts: "5",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { key: "sekolah", label: "Profil Sekolah", icon: <School size={16} /> },
    { key: "akun", label: "Akun & Profil", icon: <User size={16} /> },
    { key: "notifikasi", label: "Notifikasi", icon: <Bell size={16} /> },
    { key: "tampilan", label: "Tampilan", icon: <Palette size={16} /> },
    { key: "sistem", label: "Sistem", icon: <Shield size={16} /> },
  ];

  const InputField = ({ label, value, onChange, type = "text", placeholder = "", disabled = false }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100 transition ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"}`}
      />
    </div>
  );

  const Toggle = ({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sidebar Tabs */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5 ${activeTab === tab.key ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {activeTab === "sekolah" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><School size={18} className="text-green-600" /> Profil Pesantren</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Informasi umum tentang pesantren Anda</p>
                </div>
                <div className="p-6 space-y-4">
                  {/* Logo */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-green-100 flex items-center justify-center border-2 border-dashed border-green-300">
                      <School size={28} className="text-green-600" />
                    </div>
                    <div>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Upload Logo</button>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG. Maks. 2MB</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nama Pesantren" value={sekolah.name} onChange={v => setSekolah(p => ({ ...p, name: v }))} />
                    <InputField label="NPSN" value={sekolah.npsn} onChange={v => setSekolah(p => ({ ...p, npsn: v }))} />
                    <InputField label="Email" value={sekolah.email} onChange={v => setSekolah(p => ({ ...p, email: v }))} type="email" />
                    <InputField label="Telepon" value={sekolah.phone} onChange={v => setSekolah(p => ({ ...p, phone: v }))} />
                    <InputField label="Website" value={sekolah.website} onChange={v => setSekolah(p => ({ ...p, website: v }))} />
                    <InputField label="Kepala Pesantren / Mudir" value={sekolah.headmaster} onChange={v => setSekolah(p => ({ ...p, headmaster: v }))} />
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Alamat</label>
                      <textarea value={sekolah.address} onChange={e => setSekolah(p => ({ ...p, address: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran Aktif</label>
                      <select value={sekolah.academicYear} onChange={e => setSekolah(p => ({ ...p, academicYear: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                        {Array.from({ length: 23 }, (_, i) => {
                          const year = 2023 + i;
                          const nextYear = year + 1;
                          return (
                            <option key={year} value={`${year}/${nextYear}`}>
                              {year}/{nextYear}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Semester Aktif</label>
                      <select value={sekolah.semester} onChange={e => setSekolah(p => ({ ...p, semester: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500 focus:ring-green-100">
                        <option value="Ganjil">Ganjil</option>
                        <option value="Genap">Genap</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Visi</label>
                      <textarea value={sekolah.vision} onChange={e => setSekolah(p => ({ ...p, vision: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100 resize-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Misi</label>
                      <textarea value={sekolah.mission} onChange={e => setSekolah(p => ({ ...p, mission: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100 resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "akun" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><User size={18} className="text-green-600" /> Akun & Profil</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Kelola informasi akun dan keamanan</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-white text-2xl font-bold">A</div>
                    <div>
                      <div className="font-semibold text-gray-800">{profile.name}</div>
                      <div className="text-sm text-gray-500">{profile.role}</div>
                      <button className="text-xs text-green-600 hover:underline mt-0.5">Ganti Foto</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nama Lengkap" value={profile.name} onChange={v => setProfile(p => ({ ...p, name: v }))} />
                    <InputField label="Email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} type="email" />
                    <InputField label="No. HP" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} />
                    <InputField label="Role" value={profile.role} onChange={() => {}} disabled />
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Lock size={15} /> Ganti Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Password Lama</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={profile.oldPassword} onChange={e => setProfile(p => ({ ...p, oldPassword: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" placeholder="••••••••" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru</label>
                        <input type="password" value={profile.newPassword} onChange={e => setProfile(p => ({ ...p, newPassword: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" placeholder="••••••••" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Konfirmasi Password Baru</label>
                        <input type="password" value={profile.confirmPassword} onChange={e => setProfile(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifikasi" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Bell size={18} className="text-green-600" /> Pengaturan Notifikasi</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Atur preferensi notifikasi Anda</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notifikasi Email</h4>
                    <div className="bg-gray-50 rounded-xl px-4">
                      <Toggle label="Absensi Santri" sub="Kirim email saat ada rekap absensi harian" checked={notifications.emailAbsensi} onChange={() => setNotifications(p => ({ ...p, emailAbsensi: !p.emailAbsensi }))} />
                      <Toggle label="Input Nilai" sub="Kirim email saat nilai baru diinput" checked={notifications.emailNilai} onChange={() => setNotifications(p => ({ ...p, emailNilai: !p.emailNilai }))} />
                      <Toggle label="Laporan Bulanan" sub="Kirim email laporan setiap bulan" checked={notifications.emailLaporan} onChange={() => setNotifications(p => ({ ...p, emailLaporan: !p.emailLaporan }))} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notifikasi Push</h4>
                    <div className="bg-gray-50 rounded-xl px-4">
                      <Toggle label="Absensi Real-time" sub="Notifikasi saat absensi diinput" checked={notifications.pushAbsensi} onChange={() => setNotifications(p => ({ ...p, pushAbsensi: !p.pushAbsensi }))} />
                      <Toggle label="Update Nilai" sub="Notifikasi saat nilai diperbarui" checked={notifications.pushNilai} onChange={() => setNotifications(p => ({ ...p, pushNilai: !p.pushNilai }))} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Pengingat Otomatis</h4>
                    <div className="bg-gray-50 rounded-xl px-4">
                      <Toggle label="Pengingat Harian" sub="Ingatkan absensi setiap hari pukul 07.00" checked={notifications.reminderHarian} onChange={() => setNotifications(p => ({ ...p, reminderHarian: !p.reminderHarian }))} />
                      <Toggle label="Rekap Mingguan" sub="Kirim rekap setiap hari Jumat" checked={notifications.reportMingguan} onChange={() => setNotifications(p => ({ ...p, reportMingguan: !p.reportMingguan }))} />
                      <Toggle label="Rekap Bulanan" sub="Kirim rekap di akhir bulan" checked={notifications.reportBulanan} onChange={() => setNotifications(p => ({ ...p, reportBulanan: !p.reportBulanan }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tampilan" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Palette size={18} className="text-green-600" /> Pengaturan Tampilan</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Kustomisasi tampilan sistem</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tema Warna</label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { key: "green", label: "Hijau (Default)", color: "bg-green-600", text: "text-green-600", ring: "focus:ring-green-500" },
                        { key: "blue", label: "Biru", color: "bg-blue-600", text: "text-blue-600", ring: "focus:ring-blue-500" },
                        { key: "purple", label: "Ungu", color: "bg-purple-600", text: "text-purple-600", ring: "focus:ring-purple-500" },
                        { key: "teal", label: "Teal", color: "bg-teal-600", text: "text-teal-600", ring: "focus:ring-teal-500" },
                      ].map(t => (
                        <button 
                          key={t.key} 
                          onClick={() => {
                            setAppearance(p => ({ ...p, theme: t.key }));
                            localStorage.setItem("epesantren_theme", t.key);
                            document.documentElement.setAttribute("data-theme", t.key);
                            setSaved(true);
                            setTimeout(() => setSaved(false), 3000);
                          }} 
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition ${appearance.theme === t.key ? `border-${t.key}-600 bg-${t.key}-50` : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <span className={`w-4 h-4 rounded-full ${t.color}`} />
                          {t.label}
                          {appearance.theme === t.key && <CheckCircle size={14} className={`${t.text} ml-1`} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1"><Globe size={13} /> Bahasa</label>
                      <select value={appearance.language} onChange={e => setAppearance(p => ({ ...p, language: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500">
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Zona Waktu</label>
                      <select value={appearance.timezone} onChange={e => setAppearance(p => ({ ...p, timezone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500">
                        <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                        <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                        <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Format Tanggal</label>
                      <select value={appearance.dateFormat} onChange={e => setAppearance(p => ({ ...p, dateFormat: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500">
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Data per Halaman</label>
                      <select value={appearance.itemsPerPage} onChange={e => setAppearance(p => ({ ...p, itemsPerPage: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sistem" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Shield size={18} className="text-green-600" /> Pengaturan Sistem</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Konfigurasi keamanan dan performa sistem</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Mode & Keamanan</h4>
                    <div className="bg-gray-50 rounded-xl px-4">
                      <Toggle label="Mode Maintenance" sub="Nonaktifkan akses user saat maintenance" checked={system.maintenanceMode} onChange={() => setSystem(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><Database size={14} /> Backup Data</h4>
                    <div className="bg-gray-50 rounded-xl px-4">
                      <Toggle label="Backup Otomatis" sub="Backup data secara berkala" checked={system.autoBackup} onChange={() => setSystem(p => ({ ...p, autoBackup: !p.autoBackup }))} />
                    </div>
                    {system.autoBackup && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Frekuensi Backup</label>
                        <select value={system.backupFrequency} onChange={e => setSystem(p => ({ ...p, backupFrequency: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white focus:ring-2 focus:border-green-500">
                          <option value="daily">Setiap Hari</option>
                          <option value="weekly">Setiap Minggu</option>
                          <option value="monthly">Setiap Bulan</option>
                        </select>
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => {setSaved(true); setTimeout(() => setSaved(false), 3000);}} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        <Database size={14} /> Backup Sekarang
                      </button>
                      <button className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition">
                        Restore Data
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Session Timeout (menit)</label>
                      <input type="number" value={system.sessionTimeout} onChange={e => setSystem(p => ({ ...p, sessionTimeout: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Maks. Percobaan Login</label>
                      <input type="number" value={system.maxLoginAttempts} onChange={e => setSystem(p => ({ ...p, maxLoginAttempts: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:border-green-500 focus:ring-green-100" />
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Zona Berbahaya</h4>
                    <p className="text-xs text-red-600 mb-3">Tindakan berikut tidak dapat dibatalkan. Harap hati-hati.</p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">Reset Semua Data</button>
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">Hapus Cache</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Save */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Reset</button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                <Save size={15} /> Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
