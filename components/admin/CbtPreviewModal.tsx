"use client";

import React, { useState, useEffect } from "react";
import { 
  FiX, 
  FiClock, 
  FiAlertTriangle, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCheck, 
  FiHelpCircle,
  FiAward,
  FiRotateCcw
} from "react-icons/fi";
import { ExamItem, QuestionItem } from "@/lib/types";
import { DataService } from "@/lib/dataService";
import { LatexRenderer } from "./LatexRenderer";

interface CbtPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamItem | null;
}

export const CbtPreviewModal: React.FC<CbtPreviewModalProps> = ({
  isOpen,
  onClose,
  exam,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [doubtfuls, setDoubtfuls] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{
    totalScore: number;
    correctCount: number;
    incorrectCount: number;
    emptyCount: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && exam) {
      const allQ = DataService.getQuestions();
      const examQ = exam.questionIds
        .map((id) => allQ.find((q) => q.id === id))
        .filter((q): q is QuestionItem => !!q);

      setQuestions(examQ);
      setCurrentIndex(0);
      setAnswers({});
      setDoubtfuls({});
      setTimeLeft(exam.durationMinutes * 60);
      setTabSwitchWarnings(0);
      setIsFinished(false);
      setScoreResult(null);
    }
  }, [isOpen, exam]);

  // Timer Countdown
  useEffect(() => {
    if (!isOpen || isFinished || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isFinished, timeLeft]);

  // Anti-Cheat Tab Switching Detector
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen, isFinished]);

  if (!isOpen || !exam) return null;

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (key: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: key,
    }));
  };

  const handleToggleDoubtful = () => {
    if (!currentQuestion) return;
    setDoubtfuls((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleFinishExam = () => {
    let correct = 0;
    let incorrect = 0;
    let empty = 0;
    let score = 0;

    questions.forEach((q) => {
      const userAns = answers[q.id];
      if (!userAns) {
        empty++;
      } else if (userAns === q.correctAnswer) {
        correct++;
        score += q.points;
      } else {
        incorrect++;
        if (exam.scoringSystem === "MINUS_SYSTEM") {
          score -= 1;
        }
      }
    });

    setIsFinished(true);
    setScoreResult({
      totalScore: Math.max(0, score),
      correctCount: correct,
      incorrectCount: incorrect,
      emptyCount: empty,
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex h-[94vh] w-full max-w-6xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Top CBT Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-6 py-3 text-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-mono font-semibold">
              SIMULASI CBT
            </span>
            <span className="text-sm font-semibold truncate max-w-md">{exam.title}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 font-mono text-sm font-bold tracking-wider">
              <FiClock className="h-4 w-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Anti-Cheat Warning Banner if triggered */}
        {tabSwitchWarnings > 0 && !isFinished && (
          <div className="flex items-center justify-between bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 text-xs font-medium text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>
                Peringatan Anti-Cheat: Anda telah berpindah tab sebanyak {tabSwitchWarnings} kali.
              </span>
            </div>
            <span className="font-mono text-[11px]">Sistem Pengawasan Aktif</span>
          </div>
        )}

        {/* Main Body */}
        {isFinished && scoreResult ? (
          /* Result Summary Screen */
          <div className="flex-1 overflow-y-auto p-8 text-center flex flex-col items-center justify-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <FiAward className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Simulasi Ujian Selesai!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Berikut ringkasan hasil evaluasi dan simulasi pengerjaan Anda:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {scoreResult.totalScore}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 mt-1 font-semibold">
                  Total Skor
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {scoreResult.correctCount}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 mt-1 font-semibold">
                  Jawaban Benar
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                  {scoreResult.incorrectCount}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 mt-1 font-semibold">
                  Jawaban Salah
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-2xl font-bold text-zinc-400">
                  {scoreResult.emptyCount}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 mt-1 font-semibold">
                  Kosong / Lewat
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => {
                  setIsFinished(false);
                  setTimeLeft(exam.durationMinutes * 60);
                  setAnswers({});
                  setDoubtfuls({});
                }}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <FiRotateCcw className="h-4 w-4" />
                <span>Ulangi Simulasi</span>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        ) : (
          /* Live Question Area + Sidebar Grid */
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Question Content & Options */}
            <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-8">
              {currentQuestion ? (
                <>
                  <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Soal Nomor {currentIndex + 1} dari {questions.length}
                    </span>
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {currentQuestion.points} Poin
                    </span>
                  </div>

                  {/* Question Stem */}
                  <div className="py-2 text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">
                    <LatexRenderer content={currentQuestion.content} />
                    {currentQuestion.imageUrl && (
                      <img
                        src={currentQuestion.imageUrl}
                        alt="Stimulus"
                        className="mt-4 max-h-72 rounded-lg border border-zinc-200"
                      />
                    )}
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="mt-6 space-y-3">
                    {currentQuestion.options?.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.key;

                      return (
                        <div
                          key={opt.key}
                          onClick={() => handleSelectAnswer(opt.key)}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-xs transition ${
                            isSelected
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                              : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isSelected
                                ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1 pt-0.5">
                            <LatexRenderer content={opt.text} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="mt-8 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => prev - 1)}
                      className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      <FiChevronLeft className="h-4 w-4" />
                      <span>Sebelumnya</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleDoubtful}
                      className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                        doubtfuls[currentQuestion.id]
                          ? "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      <FiHelpCircle className="h-4 w-4" />
                      <span>{doubtfuls[currentQuestion.id] ? "Ragu-Ragu (Aktif)" : "Tandai Ragu-Ragu"}</span>
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="flex items-center gap-1 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        <span>Berikutnya</span>
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinishExam}
                        className="rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        Selesai Ujian
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Tidak ada butir soal dalam paket ujian ini.
                </div>
              )}
            </div>

            {/* Right: Question Navigation Matrix */}
            <div className="hidden sm:flex w-72 flex-col border-l border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
                Nomor Soal
              </span>

              {/* Status Legend */}
              <div className="mb-4 space-y-1.5 text-[11px] text-zinc-500 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-zinc-900 dark:bg-zinc-100" />
                  <span>Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-amber-500 bg-amber-200 dark:bg-amber-800" />
                  <span>Ragu-Ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900" />
                  <span>Belum Terjawab</span>
                </div>
              </div>

              {/* Numbers Grid */}
              <div className="grid grid-cols-4 gap-2 overflow-y-auto flex-1 pr-1">
                {questions.map((q, qIdx) => {
                  const isAnswered = !!answers[q.id];
                  const isDoubtful = !!doubtfuls[q.id];
                  const isCurrent = currentIndex === qIdx;

                  let style = "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";
                  if (isDoubtful) {
                    style = "border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold";
                  } else if (isAnswered) {
                    style = "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(qIdx)}
                      className={`relative flex h-10 w-full items-center justify-center rounded-lg border text-xs font-semibold transition ${style} ${
                        isCurrent ? "ring-2 ring-zinc-500 ring-offset-2 dark:ring-offset-zinc-950" : ""
                      }`}
                    >
                      {qIdx + 1}
                      {isAnswered && (
                        <span className="absolute bottom-1 right-1 text-[9px] opacity-80">
                          {answers[q.id]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="w-full rounded-lg bg-zinc-900 py-2.5 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Kumpulkan Ujian Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
