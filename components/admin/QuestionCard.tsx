"use client";

import React, { useState } from "react";
import { 
  FiEdit2, 
  FiTrash2, 
  FiChevronDown, 
  FiChevronUp, 
  FiVideo, 
  FiCheck, 
  FiCheckCircle,
  FiXCircle,
  FiTag
} from "react-icons/fi";
import { QuestionItem } from "@/lib/types";
import { LatexRenderer } from "./LatexRenderer";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: QuestionItem;
  index: number;
  onEdit: (question: QuestionItem) => void;
  onDelete: (id: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onEdit,
  onDelete,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "MUDAH":
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
      case "SEDANG":
        return "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 font-medium";
      case "SULIT":
        return "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      {/* Top Header info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-zinc-900 px-2 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            #{index + 1}
          </span>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            {question.type === "COMPLEX_MC" ? "Pilihan Ganda Kompleks" : "Pilihan Ganda (A-E)"}
          </span>
          <span className={cn("rounded-md px-2 py-0.5 text-[11px] uppercase tracking-wider", getDifficultyBadge(question.difficulty))}>
            {question.difficulty}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <FiTag className="h-3 w-3" />
            <span>{question.topicTag}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {question.points} Poin
          </span>
          <div className="flex items-center gap-1 border-l border-zinc-200 pl-2 dark:border-zinc-800">
            <button
              onClick={() => onEdit(question)}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              title="Edit Soal"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin menghapus butir soal ini?")) {
                  onDelete(question.id);
                }
              }}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              title="Hapus Soal"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="py-4 text-sm text-zinc-900 dark:text-zinc-100">
        <LatexRenderer content={question.content} />

        {/* Question Image if any */}
        {question.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <img
              src={question.imageUrl}
              alt="Stimulus Soal"
              className="max-h-80 w-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Multiple Choice Options */}
      {question.type === "MULTIPLE_CHOICE" && question.options && question.options.length > 0 && (
        <div className="space-y-2 pt-2">
          {question.options.map((opt) => {
            const isCorrect = opt.key === question.correctAnswer;

            return (
              <div
                key={opt.key}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-xs transition",
                  isCorrect
                    ? "border-zinc-900 bg-zinc-50 font-medium text-zinc-950 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-50"
                    : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold",
                    isCorrect
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {opt.key}
                </span>

                <div className="flex-1">
                  <LatexRenderer content={opt.text} />
                  {opt.imageUrl && (
                    <img src={opt.imageUrl} alt={`Opsi ${opt.key}`} className="mt-2 max-h-40 rounded" />
                  )}
                </div>

                {isCorrect && (
                  <span className="flex items-center gap-1 rounded bg-zinc-200/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                    <FiCheck className="h-3 w-3" />
                    Kunci Benar
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Complex MC Statements */}
      {question.type === "COMPLEX_MC" && question.complexOptions && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Daftar Pernyataan & Kunci Validasi:
          </div>
          {question.complexOptions.map((item, cIdx) => (
            <div
              key={cIdx}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="flex-1 pr-3">
                <LatexRenderer content={item.statement} />
              </div>
              <span
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold uppercase",
                  item.isCorrect
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {item.isCorrect ? (
                  <>
                    <FiCheckCircle className="h-3.5 w-3.5" />
                    <span>Benar</span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="h-3.5 w-3.5" />
                    <span>Salah</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Explanation Toggle */}
      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-900">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span>{showExplanation ? "Sembunyikan Pembahasan" : "Lihat Pembahasan & Solusi"}</span>
            {showExplanation ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
          </button>

          {question.videoUrl && (
            <a
              href={question.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:underline dark:text-zinc-300"
            >
              <FiVideo className="h-3.5 w-3.5" />
              <span>Video Tutor</span>
            </a>
          )}
        </div>

        {showExplanation && (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 text-xs leading-relaxed dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="mb-1.5 font-semibold text-zinc-900 dark:text-zinc-50">
              Langkah Penyelesaian / Pembahasan:
            </div>
            <LatexRenderer content={question.explanation || "Belum ada pembahasan tertulis."} />

            {question.explanationImageUrl && (
              <img
                src={question.explanationImageUrl}
                alt="Gambar Pembahasan"
                className="mt-3 max-h-60 rounded border border-zinc-200 dark:border-zinc-800"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
