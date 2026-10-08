"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiAward, 
  FiCheckCircle, 
  FiXCircle, 
  FiMinusCircle, 
  FiUser, 
  FiClock, 
  FiPrinter,
  FiVideo
} from "react-icons/fi";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataService } from "@/lib/dataService";
import { ExamSubmissionItem, ExamItem, QuestionItem } from "@/lib/types";
import { LatexRenderer } from "@/components/admin/LatexRenderer";

interface SubmissionDetailPageProps {
  params: Promise<{ submissionId: string }>;
}

export default function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;

  const [submission, setSubmission] = useState<ExamSubmissionItem | null>(null);
  const [exam, setExam] = useState<ExamItem | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  useEffect(() => {
    const sub = DataService.getSubmissionById(submissionId);
    if (sub) {
      setSubmission(sub);
      const examData = DataService.getExamById(sub.examId);
      if (examData) {
        setExam(examData);
        const allQ = DataService.getQuestions();
        const examQuestions = examData.questionIds
          .map((id) => allQ.find((q) => q.id === id))
          .filter((q): q is QuestionItem => !!q);
        setQuestions(examQuestions);
      }
    }
  }, [submissionId]);

  if (!submission) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Data submission tidak ditemukan.
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title={`Lembar Jawaban: ${submission.userName}`}
        subtitle={`Rincian evaluasi hasil pengerjaan paket ${submission.examTitle}`}
      />

      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Print */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/rekap-nilai"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Kembali ke Rekap Nilai</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <FiPrinter className="h-3.5 w-3.5" />
            <span>Cetak Lembar Evaluasi</span>
          </button>
        </div>

        {/* Student Profile & Result Header Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {submission.userGrade}
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  {submission.userSchool}
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {submission.userName}
              </h2>
              <div className="text-xs text-zinc-500">
                {submission.userEmail} {submission.targetPtn ? `• Target: ${submission.targetPtn} (${submission.targetMajor || "-"})` : ""}
              </div>
            </div>

            {/* Score Summary Badge */}
            <div className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                  {submission.totalScore}
                </div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400">
                  Total Nilai
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="text-center">
                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {submission.correctCount}
                </div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400">
                  Benar
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-red-600 dark:text-red-400 font-mono">
                  {submission.incorrectCount}
                </div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400">
                  Salah
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-zinc-400 font-mono">
                  {submission.emptyCount}
                </div>
                <div className="text-[10px] uppercase font-semibold text-zinc-400">
                  Kosong
                </div>
              </div>
            </div>
          </div>

          {/* Subtest Breakdown if any */}
          {submission.subtestBreakdown && submission.subtestBreakdown.length > 0 && (
            <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-900">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Analisis Penguasaan per Subtes:
              </span>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {submission.subtestBreakdown.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      <span>{st.subtestName}</span>
                      <span>{st.score} Poin ({st.percentage}%)</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full bg-zinc-900 dark:bg-zinc-100"
                        style={{ width: `${st.percentage}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-zinc-500">
                      <span>{st.correctCount} Benar / {st.totalQuestions} Soal</span>
                      <span>{st.incorrectCount} Salah</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Question Reviews */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tinjauan Lembar Soal Demi Soal
          </h3>

          {questions.map((question, idx) => {
            const answerRecord = submission.answers[question.id];
            const selectedAns = answerRecord?.selectedAnswer;
            const isCorrect = answerRecord?.isCorrect;

            return (
              <div
                key={question.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
              >
                {/* Header status */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-zinc-900 px-2 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                      #{idx + 1}
                    </span>
                    <span className="text-xs text-zinc-500">{question.topicTag}</span>
                  </div>

                  <div>
                    {!selectedAns ? (
                      <span className="flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        <FiMinusCircle className="h-3.5 w-3.5" />
                        Kosong
                      </span>
                    ) : isCorrect ? (
                      <span className="flex items-center gap-1 rounded bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                        <FiCheckCircle className="h-3.5 w-3.5" />
                        Jawaban Benar (+{question.points})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                        <FiXCircle className="h-3.5 w-3.5" />
                        Jawaban Salah (0)
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Stem */}
                <div className="py-3 text-sm text-zinc-900 dark:text-zinc-100">
                  <LatexRenderer content={question.content} />
                  {question.imageUrl && (
                    <img src={question.imageUrl} alt="Stimulus" className="mt-3 max-h-60 rounded border" />
                  )}
                </div>

                {/* Options Review */}
                {question.options && (
                  <div className="space-y-2 pt-2">
                    {question.options.map((opt) => {
                      const isStudentChoice = selectedAns === opt.key;
                      const isKey = question.correctAnswer === opt.key;

                      let borderStyle = "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950";
                      if (isStudentChoice && isKey) {
                        borderStyle = "border-zinc-900 bg-zinc-50 font-bold dark:border-zinc-100 dark:bg-zinc-900";
                      } else if (isStudentChoice && !isKey) {
                        borderStyle = "border-zinc-400 bg-zinc-100 font-semibold line-through dark:border-zinc-600 dark:bg-zinc-900";
                      } else if (isKey) {
                        borderStyle = "border-zinc-900 border-dashed bg-zinc-50 dark:border-zinc-100";
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`flex items-start gap-3 rounded-lg border p-2.5 text-xs ${borderStyle}`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                              isStudentChoice
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <div className="flex-1">
                            <LatexRenderer content={opt.text} />
                          </div>
                          {isKey && (
                            <span className="text-[10px] font-bold uppercase text-zinc-900 dark:text-zinc-100">
                              [Kunci Jawaban]
                            </span>
                          )}
                          {isStudentChoice && !isKey && (
                            <span className="text-[10px] font-semibold text-zinc-500">
                              [Pilihan Siswa]
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Pembahasan Konsep:
                      </span>
                      {question.videoUrl && (
                        <a
                          href={question.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-zinc-800 hover:underline dark:text-zinc-200"
                        >
                          <FiVideo className="h-3.5 w-3.5" />
                          <span>Video Tutor</span>
                        </a>
                      )}
                    </div>
                    <LatexRenderer content={question.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
