"use client";

import React, { useState } from "react";
import { FiX, FiDownload, FiPrinter, FiFileText, FiCheck } from "react-icons/fi";
import { ExamSubmissionItem, ExamItem } from "@/lib/types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: ExamSubmissionItem[];
  exam?: ExamItem | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  submissions,
  exam,
}) => {
  const [exportType, setExportType] = useState<"csv" | "json" | "print">("csv");
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const headers = [
      "No",
      "Nama Siswa",
      "Email",
      "Asal Sekolah",
      "Jenjang",
      "Target PTN",
      "Target Jurusan",
      "Paket Ujian",
      "Waktu Selesai",
      "Benar",
      "Salah",
      "Kosong",
      "Total Skor",
    ];

    const rows = submissions.map((s, idx) => [
      idx + 1,
      `"${s.userName}"`,
      s.userEmail,
      `"${s.userSchool}"`,
      s.userGrade,
      `"${s.targetPtn || "-"}"`,
      `"${s.targetMajor || "-"}"`,
      `"${s.examTitle}"`,
      new Date(s.submittedAt).toLocaleString("id-ID"),
      s.correctCount,
      s.incorrectCount,
      s.emptyCount,
      s.totalScore,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Rekap_Nilai_${exam?.code || "Semua_Ujian"}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(submissions, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Nilai_${exam?.code || "Data"}_${Date.now()}.json`;
    link.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Ekspor Rekap Hasil Nilai Ujian
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pilih format berkas untuk mengunduh {submissions.length} rekaman pengerjaan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <div
            onClick={() => setExportType("csv")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
              exportType === "csv"
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <FiFileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  Spreadsheet CSV (.csv)
                </div>
                <div className="text-[11px] text-zinc-500">
                  Dapat dibuka langsung di Microsoft Excel, Google Sheets, & SPSS.
                </div>
              </div>
            </div>
            {exportType === "csv" && <FiCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />}
          </div>

          <div
            onClick={() => setExportType("json")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
              exportType === "json"
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <FiDownload className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  Format JSON Data (.json)
                </div>
                <div className="text-[11px] text-zinc-500">
                  Struktur data relasional lengkap beserta rincian lembar jawaban.
                </div>
              </div>
            </div>
            {exportType === "json" && <FiCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />}
          </div>

          <div
            onClick={() => setExportType("print")}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
              exportType === "print"
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <FiPrinter className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  Cetak Laporan / Simpan PDF
                </div>
                <div className="text-[11px] text-zinc-500">
                  Layout monokromatik siap cetak dokumen resmi rekap nilai.
                </div>
              </div>
            </div>
            {exportType === "print" && <FiCheck className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300"
          >
            Tutup
          </button>

          {exportType === "csv" && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span>{downloaded ? "Telah Diunduh!" : "Unduh Berkas CSV"}</span>
            </button>
          )}

          {exportType === "json" && (
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <FiDownload className="h-3.5 w-3.5" />
              <span>{downloaded ? "Telah Diunduh!" : "Unduh Berkas JSON"}</span>
            </button>
          )}

          {exportType === "print" && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <FiPrinter className="h-3.5 w-3.5" />
              <span>Buka Dialog Cetak</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
