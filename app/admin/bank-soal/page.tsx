"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiLayers, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2, 
  FiArrowRight, 
  FiBookOpen,
  FiX
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { QuestionBankItem, GradeLevel, ExamCategory } from "@/lib/types";

export default function BankSoalListPage() {
  const [banks, setBanks] = useState<QuestionBankItem[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankToEdit, setBankToEdit] = useState<QuestionBankItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formGrade, setFormGrade] = useState<GradeLevel>("SMA");
  const [formCategory, setFormCategory] = useState<ExamCategory>("UTBK_SNBT");
  const [formSubject, setFormSubject] = useState("");
  const [formSubtest, setFormSubtest] = useState("");
  const [formDesc, setFormDesc] = useState("");

  const loadBanks = () => {
    setBanks(DataService.getQuestionBanks());
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const handleOpenCreateModal = () => {
    setBankToEdit(null);
    setFormTitle("");
    setFormGrade("SMA");
    setFormCategory("UTBK_SNBT");
    setFormSubject("");
    setFormSubtest("");
    setFormDesc("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bank: QuestionBankItem) => {
    setBankToEdit(bank);
    setFormTitle(bank.title);
    setFormGrade(bank.gradeLevel);
    setFormCategory(bank.category);
    setFormSubject(bank.subject);
    setFormSubtest(bank.subtest || "");
    setFormDesc(bank.description || "");
    setIsModalOpen(true);
  };

  const handleDeleteBank = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus Bank Soal ini beserta seluruh butir soal di dalamnya?")) {
      DataService.deleteQuestionBank(id);
      loadBanks();
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubject.trim()) {
      alert("Judul dan Mata Pelajaran wajib diisi.");
      return;
    }

    DataService.saveQuestionBank({
      id: bankToEdit ? bankToEdit.id : undefined,
      title: formTitle,
      gradeLevel: formGrade,
      category: formCategory,
      subject: formSubject,
      subtest: formSubtest.trim() || undefined,
      description: formDesc.trim() || "",
    });

    setIsModalOpen(false);
    loadBanks();
  };

  const filteredBanks = banks.filter((b) => {
    if (selectedGrade !== "ALL" && b.gradeLevel !== selectedGrade) return false;
    if (selectedCategory !== "ALL" && b.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        (b.subtest && b.subtest.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div>
      <AdminHeader
        title="Manajemen Bank Soal"
        subtitle="Pengelompokan repositori butir soal per jenjang, kategori, mata pelajaran, dan subtes"
        onRefresh={loadBanks}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau mata pelajaran..."
                className="w-64 rounded-lg border border-zinc-300 bg-white pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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

            {/* Kategori Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="UTBK_SNBT">UTBK / SNBT</option>
              <option value="TKA">TKA</option>
              <option value="REGULER_MAPEL">Reguler Mapel</option>
            </select>
          </div>

          {/* Action Button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiPlus className="h-4 w-4" />
            <span>Tambah Bank Soal Baru</span>
          </button>
        </div>

        {/* Bank Soal Cards Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanks.map((bank) => (
            <div
              key={bank.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      {bank.gradeLevel}
                    </span>
                    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                      {bank.category === "UTBK_SNBT" ? "UTBK / SNBT" : bank.category === "TKA" ? "TKA" : "Reguler"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(bank)}
                      className="rounded p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="Edit Info Bank"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBank(bank.id)}
                      className="rounded p-1 text-zinc-400 hover:text-red-600"
                      title="Hapus Bank Soal"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="mt-3 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {bank.title}
                </h3>

                <div className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {bank.subject} {bank.subtest ? `• ${bank.subtest}` : ""}
                </div>

                <p className="mt-2 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                  {bank.description || "Tidak ada deskripsi tambahan."}
                </p>
              </div>

              <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <FiLayers className="h-4 w-4 text-zinc-500" />
                    <span>{bank.totalQuestions} Butir Soal</span>
                  </div>

                  <Link
                    href={`/admin/bank-soal/${bank.id}`}
                    className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    <span>Kelola Butir Soal</span>
                    <FiArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredBanks.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-zinc-500">
              Tidak ada Bank Soal yang cocok dengan kriteria pencarian / filter.
            </div>
          )}
        </div>
      </div>

      {/* Modal Create / Edit Bank */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {bankToEdit ? "Edit Informasi Bank Soal" : "Buat Bank Soal Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Judul Bank Soal
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Bank Soal UTBK - TPS Penalaran Umum"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  required
                />
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
                    Kategori Ujian
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExamCategory)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="UTBK_SNBT">UTBK / SNBT</option>
                    <option value="TKA">TKA</option>
                    <option value="REGULER_MAPEL">Reguler Mapel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Matematika, Fisika, TPS"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Subtes / Pokok Bahasan
                  </label>
                  <input
                    type="text"
                    value={formSubtest}
                    onChange={(e) => setFormSubtest(e.target.value)}
                    placeholder="e.g. Penalaran Kuantitatif"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Keterangan peruntukan materi atau kurikulum..."
                  className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
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
                  {bankToEdit ? "Simpan Perubahan" : "Buat Bank Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
