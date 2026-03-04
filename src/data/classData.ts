export interface ClassItem {
  id: number;
  name: string;
  level: string;
  grade: string;
  room: string;
  capacity: number;
  students: number;
  teacher: string;
  status: "active" | "inactive";
  academicYear: string;
  semester: string;
}

export interface Teacher {
  id: number;
  nip: string;
  name: string;
  gender: "L" | "P";
  subject: string;
  phone: string;
  email: string;
  address: string;
  education: string;
  status: "active" | "inactive";
  joinDate: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  level: string;
  grade: string;
  hours: number;
  teacherId: number;
  category: "umum" | "agama" | "kitab";
  description: string;
}

export interface ScheduleItem {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  classId: number;
  date: string;
  status: "hadir" | "sakit" | "izin" | "alpha";
  note: string;
}

export interface GradeRecord {
  id: number;
  studentId: number;
  subjectId: number;
  classId: number;
  semester: string;
  academicYear: string;
  uh1: number;
  uh2: number;
  uts: number;
  uas: number;
  final: number;
}

export const initialTeachers: Teacher[] = [
  { id: 1, nip: "19850101001", name: "Ustadz Ahmad Fauzi", gender: "L", subject: "Fiqih", phone: "081234567890", email: "ahmad.fauzi@epesantren.id", address: "Jl. Mawar No. 1, Jakarta", education: "S1 Pendidikan Agama Islam", status: "active", joinDate: "2015-01-10" },
  { id: 2, nip: "19880215002", name: "Ustadzah Siti Aminah", gender: "P", subject: "Bahasa Arab", phone: "082345678901", email: "siti.aminah@epesantren.id", address: "Jl. Melati No. 2, Bogor", education: "S2 Bahasa Arab", status: "active", joinDate: "2016-07-01" },
  { id: 3, nip: "19790505003", name: "Ustadz Budi Santoso", gender: "L", subject: "Matematika", phone: "083456789012", email: "budi.santoso@epesantren.id", address: "Jl. Anggrek No. 3, Depok", education: "S1 Matematika", status: "active", joinDate: "2010-08-01" },
  { id: 4, nip: "19900320004", name: "Ustadzah Nur Hidayah", gender: "P", subject: "Bahasa Indonesia", phone: "084567890123", email: "nur.hidayah@epesantren.id", address: "Jl. Tulip No. 4, Bekasi", education: "S1 Bahasa Indonesia", status: "active", joinDate: "2018-01-02" },
  { id: 5, nip: "19830710005", name: "Ustadz Muhammad Ali", gender: "L", subject: "IPA", phone: "085678901234", email: "muhammad.ali@epesantren.id", address: "Jl. Dahlia No. 5, Tangerang", education: "S1 IPA", status: "active", joinDate: "2013-07-15" },
  { id: 6, nip: "19920812006", name: "Ustadzah Fatimah Azzahra", gender: "P", subject: "Tafsir", phone: "086789012345", email: "fatimah@epesantren.id", address: "Jl. Kenanga No. 6, Bandung", education: "S2 Tafsir Hadits", status: "active", joinDate: "2019-01-07" },
  { id: 7, nip: "19760904007", name: "Ustadz Hasan Basri", gender: "L", subject: "Nahwu Shorof", phone: "087890123456", email: "hasan.basri@epesantren.id", address: "Jl. Cempaka No. 7, Surabaya", education: "S1 Pendidikan Agama Islam", status: "active", joinDate: "2008-08-17" },
  { id: 8, nip: "19950115008", name: "Ustadzah Khadijah", gender: "P", subject: "Akidah Akhlak", phone: "088901234567", email: "khadijah@epesantren.id", address: "Jl. Flamboyan No. 8, Medan", education: "S1 Aqidah Filsafat", status: "active", joinDate: "2020-07-13" },
  { id: 9, nip: "19810623009", name: "Ustadz Zainal Abidin", gender: "L", subject: "Sejarah Islam", phone: "089012345678", email: "zainal@epesantren.id", address: "Jl. Bougenville No. 9, Makassar", education: "S2 Sejarah Peradaban Islam", status: "active", joinDate: "2012-01-03" },
  { id: 10, nip: "19870409010", name: "Ustadzah Maryam", gender: "P", subject: "PKn", phone: "081123456789", email: "maryam@epesantren.id", address: "Jl. Sakura No. 10, Yogyakarta", education: "S1 PKn", status: "active", joinDate: "2017-07-17" },
  { id: 11, nip: "19800101011", name: "Ustadz Ibrahim Khalil", gender: "L", subject: "Hadits", phone: "082234567890", email: "ibrahim@epesantren.id", address: "Jl. Mawar No. 11, Semarang", education: "S2 Hadits dan Ilmu Hadits", status: "active", joinDate: "2011-01-10" },
  { id: 12, nip: "19930725012", name: "Ustadzah Aisyah", gender: "P", subject: "Bahasa Inggris", phone: "083345678901", email: "aisyah@epesantren.id", address: "Jl. Melati No. 12, Malang", education: "S1 Bahasa Inggris", status: "inactive", joinDate: "2021-07-05" },
];

export const initialSubjects: Subject[] = [
  { id: 1, code: "FQH-7", name: "Fiqih", level: "MTs", grade: "VII", hours: 2, teacherId: 1, category: "agama", description: "Pelajaran hukum-hukum syariat Islam" },
  { id: 2, code: "ARB-7", name: "Bahasa Arab", level: "MTs", grade: "VII", hours: 3, teacherId: 2, category: "agama", description: "Bahasa Al-Quran" },
  { id: 3, code: "MTK-7", name: "Matematika", level: "MTs", grade: "VII", hours: 4, teacherId: 3, category: "umum", description: "Pelajaran matematika tingkat MTs" },
  { id: 4, code: "BIN-7", name: "Bahasa Indonesia", level: "MTs", grade: "VII", hours: 3, teacherId: 4, category: "umum", description: "Bahasa Nasional Indonesia" },
  { id: 5, code: "IPA-7", name: "IPA", level: "MTs", grade: "VII", hours: 3, teacherId: 5, category: "umum", description: "Ilmu Pengetahuan Alam" },
  { id: 6, code: "TAF-8", name: "Tafsir Al-Quran", level: "MTs", grade: "VIII", hours: 2, teacherId: 6, category: "agama", description: "Tafsir ayat-ayat Al-Quran" },
  { id: 7, code: "NHS-8", name: "Nahwu Shorof", level: "MTs", grade: "VIII", hours: 3, teacherId: 7, category: "kitab", description: "Ilmu tata bahasa Arab" },
  { id: 8, code: "AKH-9", name: "Akidah Akhlak", level: "MTs", grade: "IX", hours: 2, teacherId: 8, category: "agama", description: "Dasar-dasar akidah dan akhlak mulia" },
  { id: 9, code: "SKI-10", name: "Sejarah Islam", level: "MA", grade: "X", hours: 2, teacherId: 9, category: "agama", description: "Sejarah peradaban Islam" },
  { id: 10, code: "PKN-10", name: "PKn", level: "MA", grade: "X", hours: 2, teacherId: 10, category: "umum", description: "Pendidikan Kewarganegaraan" },
  { id: 11, code: "HDT-11", name: "Hadits", level: "MA", grade: "XI", hours: 2, teacherId: 11, category: "agama", description: "Hadits dan ilmu hadits" },
  { id: 12, code: "ENG-11", name: "Bahasa Inggris", level: "MA", grade: "XI", hours: 3, teacherId: 12, category: "umum", description: "Bahasa Inggris tingkat MA" },
];

export const initialSchedules: ScheduleItem[] = [
  { id: 1, classId: 1, subjectId: 1, teacherId: 1, day: "Senin", startTime: "07:00", endTime: "08:30", room: "Ruang 01" },
  { id: 2, classId: 1, subjectId: 2, teacherId: 2, day: "Senin", startTime: "08:30", endTime: "10:00", room: "Ruang 01" },
  { id: 3, classId: 1, subjectId: 3, teacherId: 3, day: "Selasa", startTime: "07:00", endTime: "08:30", room: "Ruang 01" },
  { id: 4, classId: 1, subjectId: 4, teacherId: 4, day: "Selasa", startTime: "08:30", endTime: "10:00", room: "Ruang 01" },
  { id: 5, classId: 2, subjectId: 1, teacherId: 1, day: "Senin", startTime: "07:00", endTime: "08:30", room: "Ruang 02" },
  { id: 6, classId: 2, subjectId: 5, teacherId: 5, day: "Rabu", startTime: "07:00", endTime: "08:30", room: "Ruang 02" },
  { id: 7, classId: 3, subjectId: 2, teacherId: 2, day: "Kamis", startTime: "07:00", endTime: "08:30", room: "Ruang 03" },
  { id: 8, classId: 4, subjectId: 6, teacherId: 6, day: "Jumat", startTime: "07:00", endTime: "08:30", room: "Ruang 04" },
  { id: 9, classId: 4, subjectId: 7, teacherId: 7, day: "Senin", startTime: "10:00", endTime: "11:30", room: "Ruang 04" },
  { id: 10, classId: 5, subjectId: 3, teacherId: 3, day: "Rabu", startTime: "10:00", endTime: "11:30", room: "Ruang 05" },
];

export const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const initialAttendance: AttendanceRecord[] = [
  { id: 1, studentId: 1, classId: 1, date: "2024-11-04", status: "hadir", note: "" },
  { id: 2, studentId: 2, classId: 1, date: "2024-11-04", status: "hadir", note: "" },
  { id: 3, studentId: 3, classId: 1, date: "2024-11-04", status: "sakit", note: "Demam" },
  { id: 4, studentId: 4, classId: 2, date: "2024-11-04", status: "hadir", note: "" },
  { id: 5, studentId: 5, classId: 2, date: "2024-11-04", status: "izin", note: "Urusan keluarga" },
  { id: 6, studentId: 6, classId: 3, date: "2024-11-04", status: "hadir", note: "" },
  { id: 7, studentId: 7, classId: 3, date: "2024-11-04", status: "alpha", note: "" },
  { id: 8, studentId: 8, classId: 4, date: "2024-11-04", status: "hadir", note: "" },
  { id: 9, studentId: 9, classId: 4, date: "2024-11-04", status: "hadir", note: "" },
  { id: 10, studentId: 10, classId: 5, date: "2024-11-04", status: "hadir", note: "" },
];

export const initialGrades: GradeRecord[] = [
  { id: 1, studentId: 1, subjectId: 1, classId: 1, semester: "Ganjil", academicYear: "2024/2025", uh1: 82, uh2: 78, uts: 80, uas: 85, final: 81.25 },
  { id: 2, studentId: 1, subjectId: 2, classId: 1, semester: "Ganjil", academicYear: "2024/2025", uh1: 75, uh2: 80, uts: 77, uas: 82, final: 78.5 },
  { id: 3, studentId: 1, subjectId: 3, classId: 1, semester: "Ganjil", academicYear: "2024/2025", uh1: 90, uh2: 88, uts: 85, uas: 92, final: 88.75 },
  { id: 4, studentId: 2, subjectId: 1, classId: 1, semester: "Ganjil", academicYear: "2024/2025", uh1: 70, uh2: 74, uts: 72, uas: 76, final: 73 },
  { id: 5, studentId: 2, subjectId: 2, classId: 1, semester: "Ganjil", academicYear: "2024/2025", uh1: 85, uh2: 87, uts: 88, uas: 90, final: 87.5 },
  { id: 6, studentId: 3, subjectId: 3, classId: 1, semester: "Ganjil", academicYear: "2024/2025", uh1: 78, uh2: 80, uts: 75, uas: 82, final: 78.75 },
  { id: 7, studentId: 4, subjectId: 1, classId: 2, semester: "Ganjil", academicYear: "2024/2025", uh1: 88, uh2: 90, uts: 86, uas: 92, final: 89 },
  { id: 8, studentId: 5, subjectId: 5, classId: 2, semester: "Ganjil", academicYear: "2024/2025", uh1: 65, uh2: 70, uts: 68, uas: 72, final: 68.75 },
  { id: 9, studentId: 6, subjectId: 2, classId: 3, semester: "Ganjil", academicYear: "2024/2025", uh1: 92, uh2: 94, uts: 90, uas: 96, final: 93 },
  { id: 10, studentId: 7, subjectId: 2, classId: 3, semester: "Ganjil", academicYear: "2024/2025", uh1: 60, uh2: 65, uts: 63, uas: 68, final: 64 },
];

export interface Student {
  id: number;
  nis: string;
  name: string;
  gender: "L" | "P";
  classId: number;
  address: string;
  phone: string;
  kamar?: string;
  status: "active" | "inactive";
}

export const academicYears = ["2024/2025", "2023/2024", "2022/2023"];
export const semesters = ["Ganjil", "Genap"];
export const levels = ["MA", "MTs", "MI", "SD", "SMP", "SMA"];
export const grades = ["VII", "VIII", "IX", "X", "XI", "XII", "I", "II", "III", "IV", "V", "VI"];

export const initialClasses: ClassItem[] = [
  { id: 1, name: "VII A", level: "MTs", grade: "VII", room: "Ruang 01", capacity: 35, students: 32, teacher: "Ustadz Ahmad Fauzi", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 2, name: "VII B", level: "MTs", grade: "VII", room: "Ruang 02", capacity: 35, students: 30, teacher: "Ustadzah Siti Aminah", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 3, name: "VII C", level: "MTs", grade: "VII", room: "Ruang 03", capacity: 35, students: 28, teacher: "Ustadz Budi Santoso", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 4, name: "VIII A", level: "MTs", grade: "VIII", room: "Ruang 04", capacity: 35, students: 33, teacher: "Ustadzah Nur Hidayah", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 5, name: "VIII B", level: "MTs", grade: "VIII", room: "Ruang 05", capacity: 35, students: 31, teacher: "Ustadz Muhammad Ali", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 6, name: "VIII C", level: "MTs", grade: "VIII", room: "Ruang 06", capacity: 35, students: 29, teacher: "Ustadzah Fatimah Azzahra", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 7, name: "IX A", level: "MTs", grade: "IX", room: "Ruang 07", capacity: 35, students: 34, teacher: "Ustadz Hasan Basri", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 8, name: "IX B", level: "MTs", grade: "IX", room: "Ruang 08", capacity: 35, students: 30, teacher: "Ustadzah Khadijah", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 9, name: "X A", level: "MA", grade: "X", room: "Ruang 09", capacity: 35, students: 27, teacher: "Ustadz Zainal Abidin", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 10, name: "X B", level: "MA", grade: "X", room: "Ruang 10", capacity: 35, students: 25, teacher: "Ustadzah Maryam", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 11, name: "XI A", level: "MA", grade: "XI", room: "Ruang 11", capacity: 35, students: 26, teacher: "Ustadz Ibrahim Khalil", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 12, name: "XI B", level: "MA", grade: "XI", room: "Ruang 12", capacity: 35, students: 24, teacher: "Ustadzah Aisyah", status: "inactive", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 13, name: "XII A", level: "MA", grade: "XII", room: "Ruang 13", capacity: 35, students: 30, teacher: "Ustadz Yusuf Al-Qardawi", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
  { id: 14, name: "XII B", level: "MA", grade: "XII", room: "Ruang 14", capacity: 35, students: 28, teacher: "Ustadzah Zainab", status: "active", academicYear: "2024/2025", semester: "Ganjil" },
];

export const initialStudents: Student[] = [
  { id: 1, nis: "2024001", name: "Ahmad Rizky Firmansyah", gender: "L", classId: 1, address: "Jl. Mawar No. 1, Jakarta", phone: "081234567890", status: "active" },
  { id: 2, nis: "2024002", name: "Siti Nurhaliza", gender: "P", classId: 1, address: "Jl. Melati No. 2, Bogor", phone: "082345678901", status: "active" },
  { id: 3, nis: "2024003", name: "Muhammad Fadhil", gender: "L", classId: 1, address: "Jl. Anggrek No. 3, Depok", phone: "083456789012", status: "active" },
  { id: 4, nis: "2024004", name: "Fatimah Azzahra", gender: "P", classId: 2, address: "Jl. Tulip No. 4, Bekasi", phone: "084567890123", status: "active" },
  { id: 5, nis: "2024005", name: "Abdullah Rahman", gender: "L", classId: 2, address: "Jl. Dahlia No. 5, Tangerang", phone: "085678901234", status: "active" },
  { id: 6, nis: "2024006", name: "Nurul Izzah", gender: "P", classId: 3, address: "Jl. Kenanga No. 6, Bandung", phone: "086789012345", status: "active" },
  { id: 7, nis: "2024007", name: "Umar bin Khattab Jr.", gender: "L", classId: 3, address: "Jl. Cempaka No. 7, Surabaya", phone: "087890123456", status: "active" },
  { id: 8, nis: "2024008", name: "Khadijah Binti Khuwailid", gender: "P", classId: 4, address: "Jl. Flamboyan No. 8, Medan", phone: "088901234567", status: "active" },
  { id: 9, nis: "2024009", name: "Ali bin Abi Thalib Jr.", gender: "L", classId: 4, address: "Jl. Bougenville No. 9, Makassar", phone: "089012345678", status: "active" },
  { id: 10, nis: "2024010", name: "Maryam binti Imran", gender: "P", classId: 5, address: "Jl. Sakura No. 10, Yogyakarta", phone: "081123456789", status: "active" },
];

// ============= KEUANGAN INTERFACES & DATA =============

export interface PaymentType {
  id: number;
  name: string;
  amount: number;
  period: "bulanan" | "tahunan" | "sekali";
  category: "spp" | "daftar_ulang" | "seragam" | "kitab" | "kegiatan" | "lainnya";
  description: string;
  status: "active" | "inactive";
}

export interface StudentPayment {
  id: number;
  studentId: number;
  paymentTypeId: number;
  amount: number;
  month?: string;
  year: string;
  paymentDate: string;
  paymentMethod: "tunai" | "transfer" | "va";
  referenceNo: string;
  receivedBy: string;
  status: "lunas" | "belum_lunas" | "cicilan";
  note: string;
}

export interface Savings {
  id: number;
  studentId: number;
  amount: number;
  type: "setor" | "tarik";
  date: string;
  balance: number;
  note: string;
  processedBy: string;
}

export interface Salary {
  id: number;
  teacherId: number;
  month: string;
  year: string;
  basicSalary: number;
  allowance: number;
  bonus: number;
  deduction: number;
  total: number;
  paymentDate: string;
  status: "dibayar" | "belum_dibayar";
  note: string;
}

export interface CashFlow {
  id: number;
  date: string;
  category: "income" | "expense";
  type: string;
  amount: number;
  description: string;
  receivedBy?: string;
  paidTo?: string;
  referenceNo: string;
}

export const initialPaymentTypes: PaymentType[] = [
  { id: 1, name: "SPP Bulanan", amount: 500000, period: "bulanan", category: "spp", description: "Sumbangan Pembinaan Pendidikan bulanan", status: "active" },
  { id: 2, name: "Daftar Ulang", amount: 2500000, period: "tahunan", category: "daftar_ulang", description: "Biaya daftar ulang tahun ajaran baru", status: "active" },
  { id: 3, name: "Seragam Lengkap", amount: 750000, period: "sekali", category: "seragam", description: "Paket seragam lengkap (putih abu-abu, batik, pramuka, olahraga)", status: "active" },
  { id: 4, name: "Kitab Kuning", amount: 300000, period: "sekali", category: "kitab", description: "Paket kitab kuning semester", status: "active" },
  { id: 5, name: "Kegiatan Ekskul", amount: 150000, period: "bulanan", category: "kegiatan", description: "Biaya kegiatan ekstrakurikuler", status: "active" },
  { id: 6, name: "Wisuda", amount: 1000000, period: "sekali", category: "kegiatan", description: "Biaya wisuda dan kenang-kenangan", status: "active" },
];

export const initialStudentPayments: StudentPayment[] = [
  { id: 1, studentId: 1, paymentTypeId: 1, amount: 500000, month: "Januari", year: "2024", paymentDate: "2024-01-05", paymentMethod: "tunai", referenceNo: "PAY-2024-0001", receivedBy: "Admin Keuangan", status: "lunas", note: "" },
  { id: 2, studentId: 1, paymentTypeId: 1, amount: 500000, month: "Februari", year: "2024", paymentDate: "2024-02-05", paymentMethod: "transfer", referenceNo: "PAY-2024-0002", receivedBy: "Admin Keuangan", status: "lunas", note: "" },
  { id: 3, studentId: 2, paymentTypeId: 1, amount: 500000, month: "Januari", year: "2024", paymentDate: "2024-01-10", paymentMethod: "tunai", referenceNo: "PAY-2024-0003", receivedBy: "Admin Keuangan", status: "lunas", note: "" },
  { id: 4, studentId: 2, paymentTypeId: 2, amount: 2500000, year: "2024", paymentDate: "2024-07-15", paymentMethod: "transfer", referenceNo: "PAY-2024-0004", receivedBy: "Admin Keuangan", status: "lunas", note: "Daftar ulang TA 2024/2025" },
  { id: 5, studentId: 3, paymentTypeId: 3, amount: 750000, year: "2024", paymentDate: "2024-07-20", paymentMethod: "tunai", referenceNo: "PAY-2024-0005", receivedBy: "Admin Keuangan", status: "lunas", note: "" },
];

export const initialSavings: Savings[] = [
  { id: 1, studentId: 1, amount: 50000, type: "setor", date: "2024-01-05", balance: 50000, note: "Setor awal", processedBy: "Admin" },
  { id: 2, studentId: 1, amount: 50000, type: "setor", date: "2024-02-05", balance: 100000, note: "Setor bulanan", processedBy: "Admin" },
  { id: 3, studentId: 1, amount: 25000, type: "tarik", date: "2024-03-10", balance: 75000, note: "Keperluan buku", processedBy: "Admin" },
  { id: 4, studentId: 2, amount: 100000, type: "setor", date: "2024-01-10", balance: 100000, note: "Setor awal", processedBy: "Admin" },
  { id: 5, studentId: 2, amount: 50000, type: "setor", date: "2024-02-10", balance: 150000, note: "Setor bulanan", processedBy: "Admin" },
];

export const initialSalaries: Salary[] = [
  { id: 1, teacherId: 1, month: "Januari", year: "2024", basicSalary: 5000000, allowance: 1000000, bonus: 500000, deduction: 200000, total: 6300000, paymentDate: "2024-02-01", status: "dibayar", note: "" },
  { id: 2, teacherId: 1, month: "Februari", year: "2024", basicSalary: 5000000, allowance: 1000000, bonus: 0, deduction: 200000, total: 5800000, paymentDate: "2024-03-01", status: "dibayar", note: "" },
  { id: 3, teacherId: 2, month: "Januari", year: "2024", basicSalary: 4500000, allowance: 800000, bonus: 300000, deduction: 150000, total: 5450000, paymentDate: "2024-02-01", status: "dibayar", note: "" },
  { id: 4, teacherId: 2, month: "Februari", year: "2024", basicSalary: 4500000, allowance: 800000, bonus: 0, deduction: 150000, total: 5150000, paymentDate: "2024-03-01", status: "dibayar", note: "" },
  { id: 5, teacherId: 3, month: "Januari", year: "2024", basicSalary: 4800000, allowance: 900000, bonus: 400000, deduction: 180000, total: 5920000, paymentDate: "2024-02-01", status: "dibayar", note: "" },
];

export const initialCashFlow: CashFlow[] = [
  { id: 1, date: "2024-01-05", category: "income", type: "SPP", amount: 500000, description: "Pembayaran SPP Ahmad Rizky", receivedBy: "Admin", referenceNo: "PAY-2024-0001" },
  { id: 2, date: "2024-01-10", category: "income", type: "SPP", amount: 500000, description: "Pembayaran SPP Siti Nurhaliza", receivedBy: "Admin", referenceNo: "PAY-2024-0003" },
  { id: 3, date: "2024-02-01", category: "expense", type: "Gaji Guru", amount: 6300000, description: "Gaji Ustadz Ahmad Fauzi - Januari", paidTo: "Ustadz Ahmad Fauzi", referenceNo: "SAL-2024-0001" },
  { id: 4, date: "2024-02-01", category: "expense", type: "Gaji Guru", amount: 5450000, description: "Gaji Ustadzah Siti Aminah - Januari", paidTo: "Ustadzah Siti Aminah", referenceNo: "SAL-2024-0003" },
  { id: 5, date: "2024-01-15", category: "expense", type: "Operasional", amount: 2000000, description: "Pembelian alat tulis dan perlengkapan", paidTo: "Toko ATK Sejahtera", referenceNo: "INV-2024-0001" },
  { id: 6, date: "2024-01-20", category: "expense", type: "Utilitas", amount: 1500000, description: "Pembayaran listrik dan air bulan Januari", paidTo: "PLN & PDAM", referenceNo: "UTIL-2024-01" },
  { id: 7, date: "2024-07-15", category: "income", type: "Daftar Ulang", amount: 2500000, description: "Daftar ulang Siti Nurhaliza", receivedBy: "Admin", referenceNo: "PAY-2024-0004" },
  { id: 8, date: "2024-07-20", category: "income", type: "Seragam", amount: 750000, description: "Pembayaran seragam Muhammad Fadhil", receivedBy: "Admin", referenceNo: "PAY-2024-0005" },
];
