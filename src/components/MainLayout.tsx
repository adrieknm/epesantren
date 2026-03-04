import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import ClassList from './ClassList';
import ClassForm from './ClassForm';
import StudentList from './StudentList';
import TeacherList from './TeacherList';
import SubjectList from './SubjectList';
import Schedule from './Schedule';
import Attendance from './Attendance';
import Grades from './Grades';
import Reports from './Reports';
import Settings from './Settings';
import UserManagement from '../pages/UserManagement';
import StudentPayments from '../pages/finance/StudentPayments';
import PaymentSettings from '../pages/finance/PaymentSettings';
import Savings from '../pages/finance/Savings';
import Salaries from '../pages/finance/Salaries';
import FinancialReports from '../pages/finance/FinancialReports';
import { initialClasses, initialStudents, initialTeachers, ClassItem, Student } from '../data/classData';

const pageConfig: Record<string, { title: string; breadcrumb: string[]; allowedRoles?: string[] }> = {
  dashboard: { title: 'Dashboard', breadcrumb: ['Home', 'Dashboard'] },
  'class-list': { title: 'Daftar Kelas', breadcrumb: ['Home', 'Manajemen Kelas', 'Daftar Kelas'], allowedRoles: ['admin', 'pengelola'] },
  'class-add': { title: 'Tambah / Edit Kelas', breadcrumb: ['Home', 'Manajemen Kelas', 'Tambah Kelas'], allowedRoles: ['admin', 'pengelola'] },
  'student-list': { title: 'Daftar Santri', breadcrumb: ['Home', 'Data Santri', 'Daftar Santri'], allowedRoles: ['admin', 'pengelola'] },
  guru: { title: 'Data Guru / Ustadz', breadcrumb: ['Home', 'Data Guru'], allowedRoles: ['admin', 'pengelola'] },
  mapel: { title: 'Mata Pelajaran', breadcrumb: ['Home', 'Mata Pelajaran'], allowedRoles: ['admin', 'pengelola'] },
  jadwal: { title: 'Jadwal Pelajaran', breadcrumb: ['Home', 'Jadwal Pelajaran'] },
  absensi: { title: 'Absensi', breadcrumb: ['Home', 'Absensi'] },
  nilai: { title: 'Penilaian & Nilai', breadcrumb: ['Home', 'Penilaian'] },
  'pembayaran-santri': { title: 'Pembayaran Santri', breadcrumb: ['Home', 'Keuangan', 'Pembayaran Santri'], allowedRoles: ['admin', 'pengelola'] },
  'setting-pembayaran': { title: 'Setting Pembayaran', breadcrumb: ['Home', 'Keuangan', 'Setting Pembayaran'], allowedRoles: ['admin', 'pengelola'] },
  tabungan: { title: 'Tabungan Santri', breadcrumb: ['Home', 'Keuangan', 'Tabungan'], allowedRoles: ['admin', 'pengelola'] },
  penggajian: { title: 'Penggajian', breadcrumb: ['Home', 'Keuangan', 'Penggajian'], allowedRoles: ['admin', 'pengelola'] },
  'laporan-keuangan': { title: 'Laporan Keuangan', breadcrumb: ['Home', 'Keuangan', 'Laporan Keuangan'], allowedRoles: ['admin', 'pengelola'] },
  laporan: { title: 'Laporan', breadcrumb: ['Home', 'Laporan'], allowedRoles: ['admin', 'pengelola'] },
  users: { title: 'Manajemen Pengguna', breadcrumb: ['Home', 'Manajemen Pengguna'], allowedRoles: ['admin'] },
  pengaturan: { title: 'Pengaturan Sistem', breadcrumb: ['Home', 'Pengaturan'], allowedRoles: ['admin', 'pengelola'] },
};

export default function MainLayout() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [editClass, setEditClass] = useState<ClassItem | null>(null);

  // Load students from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      // Save initial data to localStorage if not exists
      localStorage.setItem('students', JSON.stringify(initialStudents));
    }
  }, []);

  // Save students to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  const config = pageConfig[activePage] || pageConfig['dashboard'];

  const renderPage = () => {
    const pageContent = (() => {
      switch (activePage) {
        case 'dashboard':
          return <Dashboard classes={classes} setActivePage={setActivePage} />;
        case 'class-list':
          return (
            <ClassList
              classes={classes}
              setClasses={setClasses}
              setActivePage={setActivePage}
              setEditClass={setEditClass}
            />
          );
        case 'class-add':
          return (
            <ClassForm
              classes={classes}
              setClasses={setClasses}
              setActivePage={setActivePage}
              editClass={editClass}
              setEditClass={setEditClass}
            />
          );
        case 'student-list':
          return (
            <StudentList
              students={students}
              setStudents={setStudents}
              classes={classes}
              setActivePage={setActivePage}
            />
          );
        case 'guru':
          return <TeacherList />;
        case 'mapel':
          return <SubjectList teachers={initialTeachers} />;
        case 'jadwal':
          return <Schedule classes={classes} />;
        case 'absensi':
          return <Attendance students={students} classes={classes} />;
        case 'nilai':
          return <Grades students={students} classes={classes} />;
        case 'laporan':
          return <Reports classes={classes} students={students} />;
        case 'pembayaran-santri':
          return <StudentPayments />;
        case 'setting-pembayaran':
          return <PaymentSettings />;
        case 'tabungan':
          return <Savings />;
        case 'penggajian':
          return <Salaries />;
        case 'laporan-keuangan':
          return <FinancialReports />;
        case 'users':
          return <UserManagement />;
        case 'pengaturan':
          return <Settings />;
        default:
          return <Dashboard classes={classes} setActivePage={setActivePage} />;
      }
    })();

    // Check if page requires specific roles
    if (config.allowedRoles && user && !config.allowedRoles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Akses Ditolak</h3>
            <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        </div>
      );
    }

    return pageContent;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        <Header title={config.title} breadcrumb={config.breadcrumb} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{renderPage()}</main>
        <footer className="bg-white border-t border-gray-100 px-6 py-3 text-xs text-gray-400 flex items-center justify-between">
          <span>© 2024 ePesantren — Sistem Manajemen Pesantren Modern</span>
          <span>v2.5.0</span>
        </footer>
      </div>
    </div>
  );
}
