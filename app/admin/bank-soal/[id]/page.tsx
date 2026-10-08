"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiPlus, 
  FiUpload, 
  FiDownload, 
  FiSearch, 
  FiFilter, 
  FiLayers,
  FiCode,
  FiFileText
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { QuestionBankItem, QuestionItem } from "@/lib/types";
import { QuestionCard } from "@/components/admin/QuestionCard";
import { QuestionFormModal } from "@/components/admin/QuestionFormModal";

interface BankDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BankSoalDetailPage({ params }: BankDetailPageProps) {
  const resolvedParams = use(params);
  const bankId = resolvedParams.id;

  const [bank, setBank] = useState<QuestionBankItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<QuestionItem | null>(null);

  const loadData = () => {
    const currentBank = DataService.getQuestionBankById(bankId);
    if (currentBank) {
      setBank(currentBank);
      setQuestions(DataService.getQuestions(bankId));
    }
  };

  useEffect(() => {
    loadData();
  }, [bankId]);

  const handleCreateQuestion = () => {
    setQuestionToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditQuestion = (question: QuestionItem) => {
    setQuestionToEdit(question);
    setIsFormModalOpen(true);
  };

  const handleDeleteQuestion = (id: string) => {
    DataService.deleteQuestion(id);
    loadData();
  };

  const handleSaveQuestion = (
    data: Omit<QuestionItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    DataService.saveQuestion(data);
    loadData();
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BankSoal_${bank?.subject || "Soal"}_${bankId}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          importedData.forEach((q) => {
            DataService.saveQuestion({
              ...q,
              id: undefined,
              questionBankId: bankId,
            });
          });
          loadData();
          alert(`Berhasil mengimpor ${importedData.length} butir soal ke dalam Bank Soal ini.`);
        } else {
          alert("Format JSON tidak valid. Format harus berupa Array of Questions.");
        }
      } catch {
        alert("Gagal membaca berkas JSON.");
      }
    };
    reader.readAsText(file);
  };

  const filteredQuestions = questions.filter((q) => {
    if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.content.toLowerCase().includes(query) ||
        q.topicTag.toLowerCase().includes(query) ||
        (q.explanation && q.explanation.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

  if (!bank) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Bank Soal tidak ditemukan atau telah dihapus.
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title={`Bank Soal: ${bank.title}`}
        subtitle={`Pengelolaan butir soal, formula matematika LaTeX, dan solusi pembahasan`}
        onRefresh={loadData}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link
          href="/admin/bank-soal"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Bank Soal</span>
        </Link>

        {/* Bank Meta Info Header Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {bank.gradeLevel}
                </span>
                <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  {bank.category === "UTBK_SNBT" ? "UTBK / SNBT" : bank.category === "TKA" ? "TKA" : "Reguler Mapel"}
                </span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {bank.subject} {bank.subtest ? `• ${bank.subtest}` : ""}
                </span>
              </div>

              <h2 className="mt-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {bank.title}
              </h2>
              <p className="mt-1 text-xs text-zinc-500 max-w-2xl leading-relaxed">
                {bank.description || "Repositori butir soal dan pembahasan terstruktur."}
              </p>
            </div>

            {/* Stats Badge */}
            <div className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {questions.length}
                </div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400">
                  Butir Soal
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {totalPoints}
                </div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400">
                  Total Poin
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Controls & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari konten soal atau topik..."
                className="w-64 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Difficulty */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">Semua Kesulitan</option>
              <option value="MUDAH">Mudah</option>
              <option value="SEDANG">Sedang</option>
              <option value="SULIT">Sulit</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              title="Ekspor butir soal ke JSON"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ekspor JSON</span>
            </button>

            {/* Import JSON */}
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              <FiUpload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Impor JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            {/* Add Question Button */}
            <button
              onClick={handleCreateQuestion}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <FiPlus className="h-4 w-4" />
              <span>Tambah Butir Soal</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, idx) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={idx}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          ))}

          {filteredQuestions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              Belum ada butir soal di Bank Soal ini. Klik tombol <strong>Tambah Butir Soal</strong> di atas untuk membuat soal baru dengan formula LaTeX.
            </div>
          )}
        </div>
      </div>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        bankId={bankId}
        questionToEdit={questionToEdit}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
