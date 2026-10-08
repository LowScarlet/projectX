"use client";

import React, { useState, useEffect } from "react";
import { 
  FiX, 
  FiCode, 
  FiUploadCloud, 
  FiPlus, 
  FiTrash2, 
  FiCheck,
  FiEye,
  FiEdit3
} from "react-icons/fi";
import { QuestionItem, QuestionType, DifficultyLevel, QuestionOption, ComplexMCOption } from "@/lib/types";
import { LatexRenderer } from "./LatexRenderer";
import { FormulaHelperModal } from "./FormulaHelperModal";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankId: string;
  questionToEdit?: QuestionItem | null;
  onSave: (questionData: Omit<QuestionItem, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
}

const DEFAULT_OPTIONS: QuestionOption[] = [
  { key: "A", text: "" },
  { key: "B", text: "" },
  { key: "C", text: "" },
  { key: "D", text: "" },
  { key: "E", text: "" },
];

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  bankId,
  questionToEdit,
  onSave,
}) => {
  const [type, setType] = useState<QuestionType>("MULTIPLE_CHOICE");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>(DEFAULT_OPTIONS);
  const [complexOptions, setComplexOptions] = useState<ComplexMCOption[]>([
    { statement: "", isCorrect: true },
    { statement: "", isCorrect: false },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [explanationImageUrl, setExplanationImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [topicTag, setTopicTag] = useState("Umum");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("SEDANG");
  const [points, setPoints] = useState<number>(10);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isFormulaHelperOpen, setIsFormulaHelperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (questionToEdit) {
      setType(questionToEdit.type);
      setContent(questionToEdit.content);
      setImageUrl(questionToEdit.imageUrl || "");
      setOptions(questionToEdit.options && questionToEdit.options.length > 0 ? questionToEdit.options : DEFAULT_OPTIONS);
      setComplexOptions(questionToEdit.complexOptions || [{ statement: "", isCorrect: true }]);
      setCorrectAnswer(questionToEdit.correctAnswer);
      setExplanation(questionToEdit.explanation || "");
      setExplanationImageUrl(questionToEdit.explanationImageUrl || "");
      setVideoUrl(questionToEdit.videoUrl || "");
      setTopicTag(questionToEdit.topicTag);
      setDifficulty(questionToEdit.difficulty);
      setPoints(questionToEdit.points);
    } else {
      setType("MULTIPLE_CHOICE");
      setContent("");
      setImageUrl("");
      setOptions(DEFAULT_OPTIONS);
      setComplexOptions([
        { statement: "", isCorrect: true },
        { statement: "", isCorrect: false },
      ]);
      setCorrectAnswer("A");
      setExplanation("");
      setExplanationImageUrl("");
      setVideoUrl("");
      setTopicTag("Aljabar / Logika");
      setDifficulty("SEDANG");
      setPoints(10);
    }
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "question" | "explanation") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", target === "question" ? "questions" : "explanations");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (target === "question") {
          setImageUrl(data.url);
        } else {
          setExplanationImageUrl(data.url);
        }
      } else {
        // Fallback create object URL for instant preview
        const url = URL.createObjectURL(file);
        if (target === "question") setImageUrl(url);
        else setExplanationImageUrl(url);
      }
    } catch {
      const url = URL.createObjectURL(file);
      if (target === "question") setImageUrl(url);
      else setExplanationImageUrl(url);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertFormula = (formula: string) => {
    setContent((prev) => `${prev} ${formula} `);
    setIsFormulaHelperOpen(false);
  };

  const handleOptionTextChange = (key: "A" | "B" | "C" | "D" | "E", text: string) => {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));
  };

  const handleAddComplexStatement = () => {
    setComplexOptions((prev) => [...prev, { statement: "", isCorrect: true }]);
  };

  const handleRemoveComplexStatement = (idx: number) => {
    setComplexOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Konten butir soal tidak boleh kosong.");
      return;
    }

    onSave({
      id: questionToEdit ? questionToEdit.id : undefined,
      questionBankId: bankId,
      type,
      content,
      imageUrl: imageUrl || undefined,
      options,
      complexOptions: type === "COMPLEX_MC" ? complexOptions : undefined,
      correctAnswer,
      explanation,
      explanationImageUrl: explanationImageUrl || undefined,
      videoUrl: videoUrl || undefined,
      topicTag: topicTag.trim() || "Umum",
      difficulty,
      points: Number(points) || 10,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {questionToEdit ? "Edit Butir Soal" : "Tambah Butir Soal Baru"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Mendukung teks, formula matematika LaTeX (KaTeX), gambar stimulus, dan pembahasan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Toggle */}
            <div className="flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                  activeTab === "edit"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <FiEdit3 className="h-3.5 w-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                  activeTab === "preview"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <FiEye className="h-3.5 w-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "preview" ? (
              /* Live Preview Mode */
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
                <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Pratinjau Tampilan Butir Soal (Siswa View)
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {points} Poin
                  </span>
                </div>

                <div className="py-2 text-sm text-zinc-900 dark:text-zinc-100">
                  <LatexRenderer content={content || "*(Tuliskan pertanyaan pada tab Editor)*"} />
                  {imageUrl && (
                    <img src={imageUrl} alt="Stimulus" className="mt-3 max-h-64 rounded border" />
                  )}
                </div>

                {type === "MULTIPLE_CHOICE" && (
                  <div className="mt-4 space-y-2">
                    {options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-xs ${
                          opt.key === correctAnswer
                            ? "border-zinc-900 bg-white font-medium text-zinc-950 dark:border-zinc-100 dark:bg-zinc-950 dark:text-zinc-50"
                            : "border-zinc-200 bg-white/70 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${
                            opt.key === correctAnswer
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
                          }`}
                        >
                          {opt.key}
                        </span>
                        <LatexRenderer content={opt.text || `(Pilihan ${opt.key})`} />
                      </div>
                    ))}
                  </div>
                )}

                {explanation && (
                  <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-xs dark:border-zinc-800 dark:bg-zinc-950">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">Pembahasan:</span>
                    <LatexRenderer content={explanation} className="mt-1" />
                  </div>
                )}
              </div>
            ) : (
              /* Editor Mode */
              <>
                {/* Meta Configuration Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Tipe Butir Soal
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as QuestionType)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="MULTIPLE_CHOICE">Pilihan Ganda (A-E)</option>
                      <option value="COMPLEX_MC">Pilihan Ganda Kompleks</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Topik / Bab Materi
                    </label>
                    <input
                      type="text"
                      value={topicTag}
                      onChange={(e) => setTopicTag(e.target.value)}
                      placeholder="e.g. Aljabar Linear"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="MUDAH">Mudah</option>
                      <option value="SEDANG">Sedang</option>
                      <option value="SULIT">Sulit</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Bobot Poin
                    </label>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      min={1}
                      max={100}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Question Content Editor */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Isi / Pertanyaan Soal (Mendukung $Rumus$ dan $$Rumus$$)
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsFormulaHelperOpen(true)}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                    >
                      <FiCode className="h-3.5 w-3.5" />
                      <span>Sisipkan Rumus LaTeX</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan isi butir soal... Contoh: Berapakah nilai dari $\lim_{x \to 0} \frac{\sin(3x)}{x}$?"
                    className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs leading-relaxed text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    required
                  />

                  {/* Image Attachment */}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                      <FiUploadCloud className="h-4 w-4" />
                      <span>{isUploading ? "Mengunggah..." : "Upload Gambar Stimulus"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "question")}
                        className="hidden"
                      />
                    </label>

                    {imageUrl && (
                      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="truncate max-w-xs">{imageUrl}</span>
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-red-500 hover:underline"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiple Choice Options Editor */}
                {type === "MULTIPLE_CHOICE" && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Pilihan Jawaban (A - E) & Pilih Kunci Jawaban Benar
                    </label>

                    <div className="space-y-2.5">
                      {options.map((opt) => (
                        <div key={opt.key} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCorrectAnswer(opt.key)}
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                              correctAnswer === opt.key
                                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                                : "border-zinc-300 bg-zinc-50 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                            }`}
                            title={`Set ${opt.key} sebagai Kunci Jawaban`}
                          >
                            {opt.key}
                          </button>

                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(opt.key, e.target.value)}
                            placeholder={`Teks atau formula opsi ${opt.key} (misal: $x = 5$)`}
                            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />

                          {correctAnswer === opt.key && (
                            <span className="flex items-center gap-1 rounded bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                              <FiCheck className="h-3.5 w-3.5" />
                              Kunci
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complex MC Statements Editor */}
                {type === "COMPLEX_MC" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Daftar Pernyataan & Kunci Validasi (Benar / Salah)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddComplexStatement}
                        className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:underline dark:text-zinc-300"
                      >
                        <FiPlus className="h-3.5 w-3.5" />
                        <span>Tambah Pernyataan</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {complexOptions.map((statementItem, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {sIdx + 1}
                          </span>

                          <input
                            type="text"
                            value={statementItem.statement}
                            onChange={(e) => {
                              const val = e.target.value;
                              setComplexOptions((prev) =>
                                prev.map((item, i) => (i === sIdx ? { ...item, statement: val } : item))
                              );
                            }}
                            placeholder={`Pernyataan ${sIdx + 1}...`}
                            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setComplexOptions((prev) =>
                                prev.map((item, i) => (i === sIdx ? { ...item, isCorrect: !item.isCorrect } : item))
                              );
                            }}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              statementItem.isCorrect
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            {statementItem.isCorrect ? "Kunci: BENAR" : "Kunci: SALAH"}
                          </button>

                          {complexOptions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveComplexStatement(sIdx)}
                              className="p-1.5 text-zinc-400 hover:text-red-500"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explanation & Video Solution */}
                <div className="border-t border-zinc-200 pt-4 space-y-4 dark:border-zinc-800">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Pembahasan / Solusi Langkah Demi Langkah (Mendukung LaTeX)
                    </label>
                    <textarea
                      rows={3}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Tuliskan langkah penyelesaian konsep secara lengkap..."
                      className="w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        URL Video Pembahasan (YouTube / Tutor Link)
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Gambar Solusi Pembahasan (Opsional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "explanation")}
                        className="w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Perubahan akan langsung tersimpan di Bank Soal.
            </span>
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
                {questionToEdit ? "Simpan Perubahan" : "Tambahkan Soal ke Bank"}
              </button>
            </div>
          </div>
        </form>

        {/* Formula Helper */}
        <FormulaHelperModal
          isOpen={isFormulaHelperOpen}
          onClose={() => setIsFormulaHelperOpen(false)}
          onSelectFormula={handleInsertFormula}
        />
      </div>
    </div>
  );
};
