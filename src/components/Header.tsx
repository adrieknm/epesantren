import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  breadcrumb: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export default function Header({ title, breadcrumb }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Absensi Baru',
      message: 'Absensi kelas MA 1A telah diisi',
      time: '5 menit lalu',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Nilai Diperbarui',
      message: 'Nilai UTS Matematika telah tersedia',
      time: '1 jam lalu',
      read: false,
      type: 'success'
    },
    {
      id: '3',
      title: 'Pengingat',
      message: 'Jadwal ujian semester akan dimulai minggu depan',
      time: '3 jam lalu',
      read: true,
      type: 'warning'
    },
    {
      id: '4',
      title: 'Kelas Baru',
      message: 'Kelas MA 2B telah ditambahkan',
      time: '1 hari lalu',
      read: true,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'pengelola':
        return 'Pengelola';
      case 'santri':
        return 'Santri';
      case 'wali_santri':
        return 'Wali Santri';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        <nav className="text-xs text-gray-500 flex items-center gap-1">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300">/</span>}
              <span className={i === breadcrumb.length - 1 ? "text-green-700 font-medium" : ""}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-500">
          <Search size={14} />
          <input
            type="text"
            placeholder="Cari..."
            className="bg-transparent outline-none w-40 text-sm"
          />
        </div>
        
        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{notif.title}</h4>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-200 text-center">
                  <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Lihat semua notifikasi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-semibold text-gray-800 leading-tight">{user?.name || 'Admin'}</div>
              <div className="text-gray-500 text-xs">{getRoleLabel(user?.role || 'admin')}</div>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
                <div className="font-semibold text-gray-900">{user?.name || 'Admin'}</div>
                <div className="text-sm text-gray-600">{user?.email}</div>
                <div className="text-xs text-emerald-700 mt-1 font-medium">
                  {getRoleLabel(user?.role || 'admin')}
                </div>
              </div>
              <div className="py-2">
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/pengaturan');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} />
                  <span>Profil Saya</span>
                </button>
                <button 
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/pengaturan');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  <span>Pengaturan</span>
                </button>
              </div>
              <div className="border-t border-gray-200 py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
