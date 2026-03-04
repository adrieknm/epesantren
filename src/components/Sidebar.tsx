import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  School,
  BookMarked,
  UserCheck,
  Menu,
  X,
  Shield,
  DollarSign,
} from "lucide-react";
import { useAuth, UserRole } from "../contexts/AuthContext";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: { id: string; label: string }[];
  allowedRoles?: UserRole[];
}

const getMenuItems = (userRole: UserRole): MenuItem[] => {
  const allMenuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, allowedRoles: ['admin', 'pengelola'] },
    {
      id: "kelas",
      label: "Manajemen Kelas",
      icon: <School size={18} />,
      allowedRoles: ['admin', 'pengelola'],
      children: [
        { id: "class-list", label: "Daftar Kelas" },
        { id: "class-add", label: "Tambah Kelas" },
      ],
    },
    {
      id: "siswa",
      label: "Data Santri",
      icon: <Users size={18} />,
      allowedRoles: ['admin', 'pengelola'],
      children: [
        { id: "student-list", label: "Daftar Santri" },
        { id: "student-add", label: "Tambah Santri" },
      ],
    },
    { id: "guru", label: "Data Guru/Ustadz", icon: <GraduationCap size={18} />, allowedRoles: ['admin', 'pengelola'] },
    { id: "mapel", label: "Mata Pelajaran", icon: <BookOpen size={18} />, allowedRoles: ['admin', 'pengelola'] },
    { id: "jadwal", label: "Jadwal Pelajaran", icon: <Calendar size={18} />, allowedRoles: ['admin', 'pengelola'] },
    { id: "absensi", label: "Absensi", icon: <UserCheck size={18} />, allowedRoles: ['admin', 'pengelola'] },
    { id: "nilai", label: "Penilaian", icon: <ClipboardList size={18} />, allowedRoles: ['admin', 'pengelola'] },
    {
      id: "keuangan",
      label: "Keuangan",
      icon: <DollarSign size={18} />,
      allowedRoles: ['admin', 'pengelola'],
      children: [
        { id: "pembayaran-santri", label: "Pembayaran Santri" },
        { id: "setting-pembayaran", label: "Setting Pembayaran" },
        { id: "tabungan", label: "Tabungan" },
        { id: "penggajian", label: "Penggajian" },
        { id: "laporan-keuangan", label: "Laporan Keuangan" },
      ],
    },
    { id: "laporan", label: "Laporan", icon: <BarChart3 size={18} />, allowedRoles: ['admin', 'pengelola'] },
    { id: "users", label: "Manajemen Pengguna", icon: <Shield size={18} />, allowedRoles: ['admin'] },
    { id: "pengaturan", label: "Pengaturan", icon: <Settings size={18} />, allowedRoles: ['admin', 'pengelola'] },
  ];

  return allMenuItems.filter(item => !item.allowedRoles || item.allowedRoles.includes(userRole));
};

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(["kelas"]);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const menuItems = getMenuItems(user?.role || 'pengelola');

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleNav = (id: string) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-green-700">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow">
          <BookMarked size={20} className="text-green-700" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">ePesantren</div>
          <div className="text-green-200 text-xs">Sistem Manajemen</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                    openMenus.includes(item.id)
                      ? "bg-green-700 text-white"
                      : "text-green-100 hover:bg-green-700 hover:text-white"
                  }`}
                >
                  <span className="text-green-200">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {openMenus.includes(item.id) ? (
                    <ChevronDown size={15} />
                  ) : (
                    <ChevronRight size={15} />
                  )}
                </button>
                {openMenus.includes(item.id) && (
                  <div className="ml-4 mb-1 border-l-2 border-green-600 pl-3">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleNav(child.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                          activePage === child.id
                            ? "bg-white text-green-800 font-semibold"
                            : "text-green-200 hover:bg-green-600 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                  activePage === item.id
                    ? "bg-white text-green-800"
                    : "text-green-100 hover:bg-green-700 hover:text-white"
                }`}
              >
                <span className={activePage === item.id ? "text-green-700" : "text-green-300"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-green-700 text-xs text-green-300">
        ePesantren v2.0.0 © 2024
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-green-700 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-green-800 min-h-screen fixed left-0 top-0 z-40 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-green-800 flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
