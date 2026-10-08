"use client";

import React, { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiAward, 
  FiBookOpen, 
  FiMail, 
  FiPhone,
  FiX
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { StudentProfile, GradeLevel } from "@/lib/types";

export default function DataSiswaPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGrade, setFormGrade] = useState<GradeLevel>("SMA");
  const [formSchool, setFormSchool] = useState("");
  const [formPtn, setFormPtn] = useState("");
  const [formMajor, setFormMajor] = useState("");

  const loadStudents = () => {
    setStudents(DataService.getStudents());
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formSchool.trim()) {
      alert("Nama, Email, dan Asal Sekolah wajib diisi.");
      return;
    }

    const currentList = DataService.getStudents();
    const newStudent: StudentProfile = {
      id: `std-${Date.now()}`,
      name: formName,
      email: formEmail,
      phone: formPhone || undefined,
      gradeLevel: formGrade,
      schoolName: formSchool,
      targetPtn: formPtn || undefined,
      targetMajor: formMajor || undefined,
      totalExamsTaken: 0,
      averageScore: 0,
      createdAt: new Date().toISOString(),
    };

    currentList.unshift(newStudent);
    DataService.setStudents(currentList);
    setIsModalOpen(false);
    loadStudents();
  };

  const filteredStudents = students.filter((s) => {
    if (selectedGrade !== "ALL" && s.gradeLevel !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.schoolName.toLowerCase().includes(q) ||
        (s.targetPtn && s.targetPtn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div>
      <AdminHeader
        title="Manajemen Data Siswa & Profil Akademik"
        subtitle="Daftar siswa bimbel terdaftar, jenjang, sekolah asal, dan target program studi PTN"
        onRefresh={loadStudents}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, sekolah, target PTN..."
                className="w-72 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="SMA">SMA & Alumni</option>
              <option value="SMP">SMP</option>
              <option value="SD">SD</option>
            </select>
          </div>

          <button
            onClick={() => {
              setFormName("");
              setFormEmail("");
              setFormPhone("");
              setFormGrade("SMA");
              setFormSchool("");
              setFormPtn("");
              setFormMajor("");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiPlus className="h-4 w-4" />
            <span>Daftarkan Siswa Baru</span>
          </button>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Jenjang & Sekolah</th>
                  <th className="py-3.5 px-4">Target PTN & Jurusan</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4 text-center">Total Ujian</th>
                  <th className="py-3.5 px-4 text-right">Rata-Rata Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                  >
                    <td className="py-4 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        ID: {student.id}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                          {student.gradeLevel}
                        </span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {student.schoolName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {student.targetPtn ? (
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {student.targetPtn}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {student.targetMajor || "-"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                        <FiMail className="h-3 w-3 text-zinc-400" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
                          <FiPhone className="h-3 w-3" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center font-mono">
                      {student.totalExamsTaken}x
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">
                        {student.averageScore}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-zinc-500">
                      Tidak ada data siswa yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pendaftaran Siswa Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Budi Santoso"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Jenjang
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value as GradeLevel)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA & Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Asal Sekolah
                  </label>
                  <input
                    type="text"
                    value={formSchool}
                    onChange={(e) => setFormSchool(e.target.value)}
                    placeholder="e.g. SMAN 3 Bandung"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Target PTN Impian
                  </label>
                  <input
                    type="text"
                    value={formPtn}
                    onChange={(e) => setFormPtn(e.target.value)}
                    placeholder="e.g. ITB, UI, UGM"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Target Program Studi
                  </label>
                  <input
                    type="text"
                    value={formMajor}
                    onChange={(e) => setFormMajor(e.target.value)}
                    placeholder="e.g. Teknik Informatika"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
