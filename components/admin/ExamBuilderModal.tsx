"use client";

import React, { useState, useEffect } from "react";
import { 
  FiX, 
  FiCheckSquare, 
  FiSquare, 
  FiClock, 
  FiSliders, 
  FiLayers, 
  FiFilter,
  FiSearch
} from "react-icons/fi";
import { 
  ExamItem, 
  GradeLevel, 
  ExamCategory, 
  ExamNavigationMode, 
  ScoringSystem, 
  ExamStatus, 
  QuestionItem, 
  QuestionBankItem 
} from "@/lib/types";
import { DataService } from "@/lib/dataService";
import { LatexRenderer } from "./LatexRenderer";

interface ExamBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: ExamItem | null;
  onSave: (examData: Omit<ExamItem, "id" | "createdAt" | "updatedAt" | "totalQuestions"> & { id?: string }) => void;
}

export const ExamBuilderModal: React.FC<ExamBuilderModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>("SMA");
  const [category, setCategory] = useState<ExamCategory>("UTBK_SNBT");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [navigationMode, setNavigationMode] = useState<ExamNavigationMode>("FLEXIBLE");
  const [scoringSystem, setScoringSystem] = useState<ScoringSystem>("SNBT_STANDARD");
  const [status, setStatus] = useState<ExamStatus>("PUBLISHED");
  const [passingScore, setPassingScore] = useState(650);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  // Bank selection & questions state
  const [allBanks, setAllBanks] = useState<QuestionBankItem[]>([]);
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([]);
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const banks = DataService.getQuestionBanks();
      const questions = DataService.getQuestions();
      setAllBanks(banks);
      setAllQuestions(questions);

      if (examToEdit) {
        setTitle(examToEdit.title);
        setCode(examToEdit.code);
        setGradeLevel(examToEdit.gradeLevel);
        setCategory(examToEdit.category);
        setSubject(examToEdit.subject);
        setDescription(examToEdit.description || "");
        setDurationMinutes(examToEdit.durationMinutes);
        setNavigationMode(examToEdit.navigationMode);
        setScoringSystem(examToEdit.scoringSystem);
        setStatus(examToEdit.status);
        setPassingScore(examToEdit.passingScore);
        setSelectedQuestionIds(examToEdit.questionIds || []);
      } else {
        const timestamp = Date.now().toString().slice(-4);
        setTitle("");
        setCode(`TO-${gradeLevel}-${timestamp}`);
        setGradeLevel("SMA");
        setCategory("UTBK_SNBT");
        setSubject("TPS & Penalaran Matematika");
        setDescription("");
        setDurationMinutes(90);
        setNavigationMode("FLEXIBLE");
        setScoringSystem("SNBT_STANDARD");
        setStatus("PUBLISHED");
        setPassingScore(650);
        setSelectedQuestionIds([]);
      }
    }
  }, [isOpen, examToEdit]);

  if (!isOpen) return null;

  const handleToggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredQuestions.map((q) => q.id);
    const allSelected = filteredIds.every((id) => selectedQuestionIds.includes(id));

    if (allSelected) {
      setSelectedQuestionIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedBankFilter !== "ALL" && q.questionBankId !== selectedBankFilter) return false;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      return (
        q.content.toLowerCase().includes(kw) ||
        q.topicTag.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !subject.trim()) {
      alert("Mohon lengkapi Judul, Kode Ujian, dan Mata Pelajaran.");
      return;
    }

    if (selectedQuestionIds.length === 0) {
      alert("Pilih minimal 1 butir soal untuk dimasukkan ke dalam paket ujian ini.");
      return;
    }

    onSave({
      id: examToEdit ? examToEdit.id : undefined,
      title,
      code,
      gradeLevel,
      category,
      subject,
      description,
      durationMinutes: Number(durationMinutes) || 60,
      navigationMode,
      scoringSystem,
      status,
      passingScore: Number(passingScore) || 500,
      questionIds: selectedQuestionIds,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {examToEdit ? "Edit Paket Ujian CBT" : "Buat Paket Ujian CBT Baru"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Konfigurasi aturan ujian, durasi, mode navigasi subtes, dan seleksi butir soal dari Bank Soal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Meta Configurations */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 text-xs font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                <FiSliders className="h-4 w-4" />
                <span>Pengaturan Inti Ujian</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Judul Paket Ujian
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Simulasi Akbar UTBK-SNBT 2026 Gelombang 1"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kode Unik Ujian
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SNBT-2026-01"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Jenjang
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA & Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kategori Ujian
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExamCategory)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="UTBK_SNBT">UTBK / SNBT</option>
                    <option value="TKA">TKA (Tes Kemampuan Akademik)</option>
                    <option value="REGULER_MAPEL">Reguler Mata Pelajaran</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Mata Pelajaran / Subtes
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. TPS & Penalaran MTK"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={5}
                    max={360}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              {/* Mode Navigasi, Scoring, & Status */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Mode Navigasi CBT
                  </label>
                  <select
                    value={navigationMode}
                    onChange={(e) => setNavigationMode(e.target.value as ExamNavigationMode)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="FLEXIBLE">Fleksibel (Waktu Total, Bebas Navigasi)</option>
                    <option value="SUBTEST_LOCKED">UTBK Ketat (Subtes Terkunci)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Sistem Penilaian (Scoring)
                  </label>
                  <select
                    value={scoringSystem}
                    onChange={(e) => setScoringSystem(e.target.value as ScoringSystem)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="SNBT_STANDARD">Standar SNBT (Benar Poin, Salah 0)</option>
                    <option value="MINUS_SYSTEM">Sistem Minus (+4 Benar, -1 Salah)</option>
                    <option value="PERCENTAGE">Persentase (0 - 100%)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Status Publikasi
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ExamStatus)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="PUBLISHED">Dipublikasikan (Aktif)</option>
                    <option value="DRAFT">Draft (Belum Tampil)</option>
                    <option value="ARCHIVED">Diarsipkan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Questions Selection Section */}
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FiLayers className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Seleksi Butir Soal dari Bank Soal
                  </span>
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {selectedQuestionIds.length} Soal Terpilih
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Bank Filter */}
                  <select
                    value={selectedBankFilter}
                    onChange={(e) => setSelectedBankFilter(e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    <option value="ALL">Semua Bank Soal ({allQuestions.length})</option>
                    {allBanks.map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.gradeLevel}] {b.title} ({b.totalQuestions})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="rounded-lg border border-zinc-300 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    Pilih / Batalkan Semua di Tampilan Ini
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {filteredQuestions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Tidak ada butir soal pada filter ini.
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIds.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        onClick={() => handleToggleQuestion(q.id)}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/60"
                            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="pt-0.5">
                          {isSelected ? (
                            <FiCheckSquare className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                          ) : (
                            <FiSquare className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                              #{idx + 1}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-500">
                              {q.topicTag}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              ({q.difficulty}) • {q.points} Poin
                            </span>
                          </div>

                          <LatexRenderer content={q.content} className="line-clamp-2" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              Total {selectedQuestionIds.length} butir soal dipilih • Estimasi pengerjaan {durationMinutes} Menit
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {examToEdit ? "Simpan Perubahan Paket" : "Terbitkan Paket Ujian"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
