"use client";

import React from "react";
import { FiX, FiCopy, FiCheck } from "react-icons/fi";
import { LATEX_PRESETS } from "@/lib/utils";
import { LatexRenderer } from "./LatexRenderer";

interface FormulaHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormula: (formula: string) => void;
}

export const FormulaHelperModal: React.FC<FormulaHelperModalProps> = ({
  isOpen,
  onClose,
  onSelectFormula,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopy = (formula: string, index: number) => {
    onSelectFormula(`$${formula}$`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Panduan Rumus LaTeX (Matematika & Sains)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Klik salah satu rumus untuk langsung menyisipkan ke dalam teks soal/pembahasan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {LATEX_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleCopy(preset.formula, idx)}
              className="group flex cursor-pointer flex-col justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-3.5 transition hover:border-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-100 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {preset.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {copiedIndex === idx ? (
                    <>
                      <FiCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Disisipkan</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-3.5 w-3.5" />
                      <span>Sisipkan</span>
                    </>
                  )}
                </span>
              </div>

              <div className="my-2 rounded bg-white py-2 text-center border border-zinc-200/60 dark:border-zinc-800/80 dark:bg-zinc-950">
                <LatexRenderer content={`$$${preset.formula}$$`} />
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                <code className="truncate max-w-[180px] bg-zinc-200/60 px-1 py-0.5 rounded dark:bg-zinc-800">
                  {`$${preset.formula}$`}
                </code>
                <span className="text-[11px] text-zinc-400">{preset.description}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
