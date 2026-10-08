import { 
  QuestionBankItem, 
  QuestionItem, 
  ExamItem, 
  ExamSubmissionItem, 
  StudentProfile 
} from "./types";
import { 
  INITIAL_QUESTION_BANKS, 
  INITIAL_QUESTIONS, 
  INITIAL_EXAMS, 
  INITIAL_STUDENTS, 
  INITIAL_SUBMISSIONS 
} from "./mockData";

const STORAGE_KEYS = {
  BANKS: "bimbel_question_banks_v1",
  QUESTIONS: "bimbel_questions_v1",
  EXAMS: "bimbel_exams_v1",
  STUDENTS: "bimbel_students_v1",
  SUBMISSIONS: "bimbel_submissions_v1",
};

export class DataService {
  private static isClient(): boolean {
    return typeof window !== "undefined";
  }

  // --- QUESTION BANKS ---
  static getQuestionBanks(): QuestionBankItem[] {
    if (!this.isClient()) return INITIAL_QUESTION_BANKS;
    const stored = localStorage.getItem(STORAGE_KEYS.BANKS);
    if (!stored) {
      this.setQuestionBanks(INITIAL_QUESTION_BANKS);
      return INITIAL_QUESTION_BANKS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_QUESTION_BANKS;
    }
  }

  static setQuestionBanks(data: QuestionBankItem[]): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(data));
    }
  }

  static getQuestionBankById(id: string): QuestionBankItem | undefined {
    return this.getQuestionBanks().find((b) => b.id === id);
  }

  static saveQuestionBank(bank: Omit<QuestionBankItem, "id" | "createdAt" | "updatedAt" | "totalQuestions"> & { id?: string }): QuestionBankItem {
    const banks = this.getQuestionBanks();
    const now = new Date().toISOString();

    if (bank.id) {
      // Update
      const index = banks.findIndex((b) => b.id === bank.id);
      if (index !== -1) {
        const updated: QuestionBankItem = {
          ...banks[index],
          ...bank,
          id: bank.id,
          updatedAt: now,
        };
        banks[index] = updated;
        this.setQuestionBanks(banks);
        return updated;
      }
    }

    // Create New
    const newBank: QuestionBankItem = {
      ...bank,
      id: `bank-${Date.now()}`,
      totalQuestions: 0,
      createdAt: now,
      updatedAt: now,
    };
    banks.unshift(newBank);
    this.setQuestionBanks(banks);
    return newBank;
  }

  static deleteQuestionBank(id: string): boolean {
    const banks = this.getQuestionBanks().filter((b) => b.id !== id);
    this.setQuestionBanks(banks);
    // Also delete associated questions
    const questions = this.getQuestions().filter((q) => q.questionBankId !== id);
    this.setQuestions(questions);
    return true;
  }

  // --- QUESTIONS ---
  static getQuestions(bankId?: string): QuestionItem[] {
    if (!this.isClient()) {
      return bankId ? INITIAL_QUESTIONS.filter((q) => q.questionBankId === bankId) : INITIAL_QUESTIONS;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    let allQuestions = INITIAL_QUESTIONS;
    if (stored) {
      try {
        allQuestions = JSON.parse(stored);
      } catch {
        allQuestions = INITIAL_QUESTIONS;
      }
    } else {
      this.setQuestions(INITIAL_QUESTIONS);
    }
    return bankId ? allQuestions.filter((q) => q.questionBankId === bankId) : allQuestions;
  }

  static setQuestions(data: QuestionItem[]): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(data));
      // Update bank question counters
      this.recountBankQuestions(data);
    }
  }

  private static recountBankQuestions(questions: QuestionItem[]): void {
    const banks = this.getQuestionBanks();
    const counts: Record<string, number> = {};
    for (const q of questions) {
      counts[q.questionBankId] = (counts[q.questionBankId] || 0) + 1;
    }
    const updatedBanks = banks.map((b) => ({
      ...b,
      totalQuestions: counts[b.id] || 0,
    }));
    this.setQuestionBanks(updatedBanks);
  }

  static getQuestionById(id: string): QuestionItem | undefined {
    return this.getQuestions().find((q) => q.id === id);
  }

  static saveQuestion(question: Omit<QuestionItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): QuestionItem {
    const questions = this.getQuestions();
    const now = new Date().toISOString();

    if (question.id) {
      const index = questions.findIndex((q) => q.id === question.id);
      if (index !== -1) {
        const updated: QuestionItem = {
          ...questions[index],
          ...question,
          id: question.id,
          updatedAt: now,
        };
        questions[index] = updated;
        this.setQuestions(questions);
        return updated;
      }
    }

    const newQuestion: QuestionItem = {
      ...question,
      id: `q-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    questions.push(newQuestion);
    this.setQuestions(questions);
    return newQuestion;
  }

  static deleteQuestion(id: string): boolean {
    const questions = this.getQuestions().filter((q) => q.id !== id);
    this.setQuestions(questions);
    return true;
  }

  // --- EXAMS ---
  static getExams(): ExamItem[] {
    if (!this.isClient()) return INITIAL_EXAMS;
    const stored = localStorage.getItem(STORAGE_KEYS.EXAMS);
    if (!stored) {
      this.setExams(INITIAL_EXAMS);
      return INITIAL_EXAMS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_EXAMS;
    }
  }

  static setExams(data: ExamItem[]): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data));
    }
  }

  static getExamById(id: string): ExamItem | undefined {
    return this.getExams().find((e) => e.id === id);
  }

  static saveExam(exam: Omit<ExamItem, "id" | "createdAt" | "updatedAt" | "totalQuestions"> & { id?: string }): ExamItem {
    const exams = this.getExams();
    const now = new Date().toISOString();

    if (exam.id) {
      const index = exams.findIndex((e) => e.id === exam.id);
      if (index !== -1) {
        const updated: ExamItem = {
          ...exams[index],
          ...exam,
          id: exam.id,
          totalQuestions: exam.questionIds.length,
          updatedAt: now,
        };
        exams[index] = updated;
        this.setExams(exams);
        return updated;
      }
    }

    const newExam: ExamItem = {
      ...exam,
      id: `exam-${Date.now()}`,
      totalQuestions: exam.questionIds.length,
      createdAt: now,
      updatedAt: now,
    };
    exams.unshift(newExam);
    this.setExams(exams);
    return newExam;
  }

  static cloneExam(id: string): ExamItem | undefined {
    const original = this.getExamById(id);
    if (!original) return undefined;

    const cloned: ExamItem = {
      ...original,
      id: `exam-${Date.now()}`,
      title: `${original.title} (Salinan)`,
      code: `${original.code}-COPY`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const exams = this.getExams();
    exams.unshift(cloned);
    this.setExams(exams);
    return cloned;
  }

  static deleteExam(id: string): boolean {
    const exams = this.getExams().filter((e) => e.id !== id);
    this.setExams(exams);
    return true;
  }

  // --- SUBMISSIONS & REKAP NILAI ---
  static getSubmissions(examId?: string): ExamSubmissionItem[] {
    if (!this.isClient()) {
      return examId ? INITIAL_SUBMISSIONS.filter((s) => s.examId === examId) : INITIAL_SUBMISSIONS;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    let all = INITIAL_SUBMISSIONS;
    if (stored) {
      try {
        all = JSON.parse(stored);
      } catch {
        all = INITIAL_SUBMISSIONS;
      }
    } else {
      this.setSubmissions(INITIAL_SUBMISSIONS);
    }
    return examId ? all.filter((s) => s.examId === examId) : all;
  }

  static setSubmissions(data: ExamSubmissionItem[]): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data));
    }
  }

  static getSubmissionById(id: string): ExamSubmissionItem | undefined {
    return this.getSubmissions().find((s) => s.id === id);
  }

  // --- STUDENTS ---
  static getStudents(): StudentProfile[] {
    if (!this.isClient()) return INITIAL_STUDENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!stored) {
      this.setStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  static setStudents(data: StudentProfile[]): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data));
    }
  }

  // --- RESET TO SEED DATA ---
  static resetToSeedData(): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(INITIAL_QUESTION_BANKS));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(INITIAL_EXAMS));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    }
  }
}
