"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  FiTrendingUp, 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiMinusCircle
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { ExamSubmissionItem, ExamItem } from "@/lib/types";
import { ExportModal } from "@/components/admin/ExportModal";

function RekapNilaiContent() {
  const searchParams = useSearchParams();
  const initialExamId = searchParams.get("examId") || "ALL";

  const [submissions, setSubmissions] = useState<ExamSubmissionItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId);
  const [searchQuery, setSearchQuery] = useState("");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const loadData = () => {
    setExams(DataService.getExams());
    setSubmissions(DataService.getSubmissions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubmissions = submissions
    .filter((s) => {
      if (selectedExamId !== "ALL" && s.examId !== selectedExamId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.userName.toLowerCase().includes(q) ||
          s.userEmail.toLowerCase().includes(q) ||
          s.userSchool.toLowerCase().includes(q) ||
          s.examTitle.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const currentExam = exams.find((e) => e.id === selectedExamId);

  // Statistics
  const avgScore =
    filteredSubmissions.length > 0
      ? Math.round(
          filteredSubmissions.reduce((acc, curr) => acc + curr.totalScore, 0) /
            filteredSubmissions.length
        )
      : 0;

  const highestScore =
    filteredSubmissions.length > 0
      ? Math.max(...filteredSubmissions.map((s) => s.totalScore))
      : 0;

  return (
    <div>
      <AdminHeader
        title="Rekap Nilai, Evaluasi & Leaderboard"
        subtitle="Analisis hasil pengerjaan CBT, lembar jawaban siswa, dan ekspor data nilai resmi"
        onRefresh={loadData}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Peserta Ujian
            </span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {filteredSubmissions.length} Siswa
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              {selectedExamId === "ALL" ? "Seluruh Paket Ujian" : currentExam?.title}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Skor Tertinggi (Rank 1)
            </span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {highestScore} Poin
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Passing Grade Tercapai
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Rata-Rata Skor Peserta
            </span>
            <div className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {avgScore} Poin
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Rasio Kelulusan Akumulatif
            </div>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa atau asal sekolah..."
                className="w-64 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Exam Select Filter */}
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">Semua Paket Ujian ({exams.length})</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  [{e.gradeLevel}] {e.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiDownload className="h-4 w-4" />
            <span>Ekspor Rekap Nilai</span>
          </button>
        </div>

        {/* Submissions Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="py-3.5 px-4">Peringkat</th>
                  <th className="py-3.5 px-4">Nama Siswa</th>
                  <th className="py-3.5 px-4">Asal Sekolah</th>
                  <th className="py-3.5 px-4">Paket Ujian</th>
                  <th className="py-3.5 px-4 text-center">B / S / K</th>
                  <th className="py-3.5 px-4 text-right">Total Skor</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredSubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className="transition hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                  >
                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : idx === 1
                            ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                            : "text-zinc-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {sub.userName}
                      </div>
                      <div className="text-[11px] text-zinc-400">{sub.userEmail}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {sub.userSchool}
                      </div>
                      {sub.targetPtn && (
                        <div className="text-[10px] text-zinc-500">
                          Target: {sub.targetPtn}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
                        {sub.examTitle}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Selesai: {new Date(sub.submittedAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-xs">
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {sub.correctCount}
                        </strong>{" "}
                        /{" "}
                        <strong className="text-red-600 dark:text-red-400">
                          {sub.incorrectCount}
                        </strong>{" "}
                        / <span>{sub.emptyCount}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-50">
                        {sub.totalScore}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Link
                        href={`/admin/rekap-nilai/${sub.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                        title="Tinjau Lembar Jawaban Lengkap"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                        <span>Lembar Jawaban</span>
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-zinc-500">
                      Tidak ada rekaman submission ujian yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        submissions={filteredSubmissions}
        exam={currentExam}
      />
    </div>
  );
}

export default function RekapNilaiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-zinc-500">Memuat data rekap nilai...</div>}>
      <RekapNilaiContent />
    </Suspense>
  );
}
