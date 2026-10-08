"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiLayers, 
  FiFileText, 
  FiUsers, 
  FiTrendingUp, 
  FiPlus, 
  FiEye, 
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheckCircle
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { QuestionBankItem, QuestionItem, ExamItem, StudentProfile, ExamSubmissionItem } from "@/lib/types";
import { CbtPreviewModal } from "@/components/admin/CbtPreviewModal";

export default function AdminDashboardPage() {
  const [banks, setBanks] = useState<QuestionBankItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmissionItem[]>([]);
  const [previewExam, setPreviewExam] = useState<ExamItem | null>(null);

  const loadData = () => {
    setBanks(DataService.getQuestionBanks());
    setQuestions(DataService.getQuestions());
    setExams(DataService.getExams());
    setStudents(DataService.getStudents());
    setSubmissions(DataService.getSubmissions());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Metrics
  const totalBanks = banks.length;
  const totalQuestions = questions.length;
  const totalExams = exams.length;
  const publishedExams = exams.filter((e) => e.status === "PUBLISHED").length;
  const totalStudents = students.length;

  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, curr) => acc + curr.totalScore, 0) / submissions.length)
    : 0;

  // Breakdown questions by grade
  const questionsByGrade = {
    SMA: questions.filter((q) => {
      const bank = banks.find((b) => b.id === q.questionBankId);
      return bank?.gradeLevel === "SMA";
    }).length,
    SMP: questions.filter((q) => {
      const bank = banks.find((b) => b.id === q.questionBankId);
      return bank?.gradeLevel === "SMP";
    }).length,
    SD: questions.filter((q) => {
      const bank = banks.find((b) => b.id === q.questionBankId);
      return bank?.gradeLevel === "SD";
    }).length,
  };

  return (
    <div>
      <AdminHeader
        title="Dashboard Akademik & CBT"
        subtitle="Ringkasan operasional bank soal, simulasi ujian, dan evaluasi hasil belajar siswa"
        onRefresh={loadData}
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Bank Soal */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Bank Soal Aktif
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <FiLayers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {totalBanks}
              </span>
              <span className="text-xs text-zinc-500">
                ({totalQuestions} Butir Soal)
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 pt-2.5 dark:border-zinc-900">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {questionsByGrade.SMA} SMA/UTBK
              </span>
              <span>•</span>
              <span>{questionsByGrade.SMP} SMP</span>
              <span>•</span>
              <span>{questionsByGrade.SD} SD</span>
            </div>
          </div>

          {/* Card 2: Paket Ujian */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Paket Ujian CBT
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <FiFileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {totalExams}
              </span>
              <span className="text-xs text-zinc-500">
                ({publishedExams} Siap Uji)
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 pt-2.5 dark:border-zinc-900">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                UTBK Subtest & Fleksibel
              </span>
            </div>
          </div>

          {/* Card 3: Siswa Terdaftar */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Siswa
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <FiUsers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {totalStudents}
              </span>
              <span className="text-xs text-zinc-500">Siswa Aktif</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 pt-2.5 dark:border-zinc-900">
              <span>Target PTN Favorit (ITB, UI, UGM)</span>
            </div>
          </div>

          {/* Card 4: Rata-Rata Skor */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Rata-Rata Skor CBT
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                <FiTrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {avgScore}
              </span>
              <span className="text-xs text-zinc-500">
                / 1000 Poin
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 pt-2.5 dark:border-zinc-900">
              <span>{submissions.length} Total Pengerjaan Ujian</span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts Banner */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Akses Cepat Pengelolaan Akademik
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kelola butir soal ber-LaTeX, atur durasi dan navigasi CBT, atau rekap hasil nilai peserta.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/admin/bank-soal"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <FiPlus className="h-3.5 w-3.5" />
                <span>Buat Bank Soal</span>
              </Link>
              <Link
                href="/admin/ujian"
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                <FiFileText className="h-3.5 w-3.5" />
                <span>Susun Paket Ujian</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dual Section: Active Exams & Top Ranking Leaderboard */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Active Exams Table (2 cols) */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Paket Ujian & Simulasi Terkini
                </h3>
                <p className="text-xs text-zinc-500">
                  Daftar paket tryout yang aktif dan siap diuji coba
                </p>
              </div>

              <Link
                href="/admin/ujian"
                className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <span>Kelola Semua Ujian</span>
                <FiArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {exams.slice(0, 4).map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                        {exam.gradeLevel}
                      </span>
                      <span className="font-mono text-xs font-semibold text-zinc-500">
                        {exam.code}
                      </span>
                      <span className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                        {exam.navigationMode === "SUBTEST_LOCKED" ? "UTBK Terkunci" : "Fleksibel"}
                      </span>
                    </div>

                    <h4 className="mt-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {exam.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                      <span>{exam.subject}</span>
                      <span>•</span>
                      <span>{exam.durationMinutes} Menit</span>
                      <span>•</span>
                      <span>{exam.totalQuestions} Soal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setPreviewExam(exam)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      title="Uji coba simulasi CBT"
                    >
                      <FiEye className="h-3.5 w-3.5" />
                      <span>Uji CBT</span>
                    </button>

                    <Link
                      href={`/admin/rekap-nilai?examId=${exam.id}`}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      Rekap Nilai
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Ranking Leaderboard (1 col) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <FiAward className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Peringkat Tertinggi Siswa
                </h3>
              </div>

              <Link
                href="/admin/siswa"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {students
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, 4)
                .map((student, rankIdx) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          rankIdx === 0
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                            : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        {rankIdx + 1}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[140px]">
                          {student.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                          {student.schoolName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                        {student.averageScore}
                      </div>
                      <div className="text-[10px] text-zinc-400">Rata-rata</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* CBT Preview Modal */}
      <CbtPreviewModal
        isOpen={!!previewExam}
        onClose={() => setPreviewExam(null)}
        exam={previewExam}
      />
    </div>
  );
}
