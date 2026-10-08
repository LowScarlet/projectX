"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiFileText, 
  FiPlus, 
  FiEye, 
  FiCopy, 
  FiEdit2, 
  FiTrash2, 
  FiClock, 
  FiSliders, 
  FiTrendingUp, 
  FiSearch,
  FiFilter
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { ExamItem, GradeLevel, ExamNavigationMode } from "@/lib/types";
import { ExamBuilderModal } from "@/components/admin/ExamBuilderModal";
import { CbtPreviewModal } from "@/components/admin/CbtPreviewModal";

export default function ManajemenUjianPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [selectedNavMode, setSelectedNavMode] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<ExamItem | null>(null);
  const [previewExam, setPreviewExam] = useState<ExamItem | null>(null);

  const loadExams = () => {
    setExams(DataService.getExams());
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleCreateExam = () => {
    setExamToEdit(null);
    setIsBuilderModalOpen(true);
  };

  const handleEditExam = (exam: ExamItem) => {
    setExamToEdit(exam);
    setIsBuilderModalOpen(true);
  };

  const handleCloneExam = (id: string) => {
    const cloned = DataService.cloneExam(id);
    if (cloned) {
      loadExams();
      alert(`Paket Ujian berhasil diduplikasi: "${cloned.title}"`);
    }
  };

  const handleDeleteExam = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus paket ujian ini?")) {
      DataService.deleteExam(id);
      loadExams();
    }
  };

  const handleSaveExam = (
    data: Omit<ExamItem, "id" | "createdAt" | "updatedAt" | "totalQuestions"> & { id?: string }
  ) => {
    DataService.saveExam(data);
    loadExams();
  };

  const filteredExams = exams.filter((e) => {
    if (selectedGrade !== "ALL" && e.gradeLevel !== selectedGrade) return false;
    if (selectedNavMode !== "ALL" && e.navigationMode !== selectedNavMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <AdminHeader
        title="Manajemen Paket Ujian CBT"
        subtitle="Penyusunan jadwal tryout, konfigurasi timer, mode navigasi subtes, dan simulasi CBT"
        onRefresh={loadExams}
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
                placeholder="Cari judul atau kode ujian..."
                className="w-64 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Jenjang Filter */}
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

            {/* Mode Navigasi Filter */}
            <select
              value={selectedNavMode}
              onChange={(e) => setSelectedNavMode(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">Semua Mode Navigasi</option>
              <option value="FLEXIBLE">Fleksibel (Waktu Bebas)</option>
              <option value="SUBTEST_LOCKED">UTBK Subtes Terkunci</option>
            </select>
          </div>

          <button
            onClick={handleCreateExam}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiPlus className="h-4 w-4" />
            <span>Buat Paket Ujian Baru</span>
          </button>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              {/* Left Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {exam.gradeLevel}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-500">
                    {exam.code}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      exam.status === "PUBLISHED"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {exam.status === "PUBLISHED" ? "Dipublikasikan" : "Draft"}
                  </span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    {exam.navigationMode === "SUBTEST_LOCKED"
                      ? "UTBK Subtes Terkunci"
                      : "Navigasi Fleksibel"}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {exam.scoringSystem === "SNBT_STANDARD"
                      ? "Standar SNBT"
                      : exam.scoringSystem === "MINUS_SYSTEM"
                      ? "Sistem Minus"
                      : "Persentase"}
                  </span>
                </div>

                <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {exam.title}
                </h3>

                <p className="text-xs text-zinc-500 max-w-3xl leading-relaxed">
                  {exam.description || "Simulasi pengerjaan ujian berbasis komputer."}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    <FiClock className="h-3.5 w-3.5" />
                    <span>{exam.durationMinutes} Menit</span>
                  </span>
                  <span>•</span>
                  <span>{exam.totalQuestions} Butir Soal</span>
                  <span>•</span>
                  <span>Mata Pelajaran: <strong>{exam.subject}</strong></span>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 lg:border-t-0 lg:pt-0">
                {/* CBT Preview Simulation */}
                <button
                  onClick={() => setPreviewExam(exam)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  title="Jalankan simulasi tampilan CBT siswa"
                >
                  <FiEye className="h-3.5 w-3.5" />
                  <span>Uji CBT</span>
                </button>

                {/* Clone Exam */}
                <button
                  onClick={() => handleCloneExam(exam.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  title="Duplikasi paket ujian ini"
                >
                  <FiCopy className="h-3.5 w-3.5" />
                  <span>Kloning</span>
                </button>

                {/* Edit Exam */}
                <button
                  onClick={() => handleEditExam(exam)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  title="Edit Pengaturan & Soal"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>

                {/* Delete Exam */}
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                  title="Hapus Paket Ujian"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>

                {/* Rekap Nilai Link */}
                <Link
                  href={`/admin/rekap-nilai?examId=${exam.id}`}
                  className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <FiTrendingUp className="h-3.5 w-3.5" />
                  <span>Rekap Nilai</span>
                </Link>
              </div>
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              Tidak ada paket ujian yang ditemukan. Klik tombol <strong>Buat Paket Ujian Baru</strong> untuk menyusun paket soal CBT.
            </div>
          )}
        </div>
      </div>

      {/* Exam Builder Modal */}
      <ExamBuilderModal
        isOpen={isBuilderModalOpen}
        onClose={() => setIsBuilderModalOpen(false)}
        examToEdit={examToEdit}
        onSave={handleSaveExam}
      />

      {/* CBT Preview Simulation Modal */}
      <CbtPreviewModal
        isOpen={!!previewExam}
        onClose={() => setPreviewExam(null)}
        exam={previewExam}
      />
    </div>
  );
}
