"use client";

import React, { useState } from "react";
import { FiRefreshCw, FiCode, FiUser, FiSearch, FiCheckCircle } from "react-icons/fi";
import { FormulaHelperModal } from "./FormulaHelperModal";
import { DataService } from "@/lib/dataService";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
}) => {
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleResetSeedData = () => {
    if (confirm("Reset seluruh data ke kondisi awal (Seed Data lengkap SD, SMP, SMA, UTBK, Paket Ujian, & Rekap Nilai)?")) {
      setIsSeeding(true);
      DataService.resetToSeedData();
      setTimeout(() => {
        setIsSeeding(false);
        setShowToast(true);
        if (onRefresh) onRefresh();
        setTimeout(() => setShowToast(false), 3000);
      }, 500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-8 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Formula Helper Shortcut */}
          <button
            onClick={() => setIsFormulaModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Buka panduan rumus matematika LaTeX"
          >
            <FiCode className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Panduan LaTeX</span>
          </button>

          {/* Reset Seed Data */}
          <button
            onClick={handleResetSeedData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
            title="Reset data ke data contoh lengkap"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${isSeeding ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center gap-2.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
              AD
            </div>
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                Super Admin
              </span>
              <span className="text-[10px] text-zinc-400">Tim Akademik</span>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-3 text-xs font-medium text-white shadow-xl dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 animate-in fade-in slide-in-from-bottom-5">
          <FiCheckCircle className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>Data awal (Seed Data SD/SMP/SMA/UTBK) berhasil dimuat ulang!</span>
        </div>
      )}

      {/* Formula Modal */}
      <FormulaHelperModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onSelectFormula={() => {}}
      />
    </>
  );
};
