export type GradeLevel = "SD" | "SMP" | "SMA";

export type ExamCategory = "UTBK_SNBT" | "TKA" | "REGULER_MAPEL";

export type QuestionType = "MULTIPLE_CHOICE" | "COMPLEX_MC" | "SHORT_ANSWER";

export type DifficultyLevel = "MUDAH" | "SEDANG" | "SULIT";

export type ExamNavigationMode = "FLEXIBLE" | "SUBTEST_LOCKED";

export type ScoringSystem = "SNBT_STANDARD" | "MINUS_SYSTEM" | "PERCENTAGE";

export type ExamStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type UserRole = "ADMIN" | "TUTOR" | "STUDENT";

export interface QuestionOption {
  key: "A" | "B" | "C" | "D" | "E";
  text: string;
  imageUrl?: string;
}

export interface ComplexMCOption {
  statement: string;
  isCorrect: boolean; // true = Benar / Setuju, false = Salah / Tidak Setuju
}

export interface QuestionItem {
  id: string;
  questionBankId: string;
  type: QuestionType;
  content: string; // Markdown + LaTeX math expressions e.g. $f(x) = \frac{ax+b}{cx+d}$
  imageUrl?: string;
  options: QuestionOption[];
  complexOptions?: ComplexMCOption[];
  correctAnswer: string; // "A" | "B" | "C" | "D" | "E" or JSON for complex
  explanation: string; // Solusi langkah demi langkah dengan LaTeX
  explanationImageUrl?: string;
  videoUrl?: string; // YouTube / Tutor video solution URL
  topicTag: string; // e.g. "Aljabar Linear", "Termodinamika", "Silogisme"
  difficulty: DifficultyLevel;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBankItem {
  id: string;
  title: string;
  gradeLevel: GradeLevel;
  category: ExamCategory;
  subject: string; // e.g. "Matematika", "Penalaran Umum (TPS)", "Fisika"
  subtest?: string; // e.g. "Penalaran Induktif", "Kuantitatif"
  description: string;
  totalQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamItem {
  id: string;
  title: string;
  code: string;
  gradeLevel: GradeLevel;
  category: ExamCategory;
  subject: string;
  description: string;
  durationMinutes: number;
  navigationMode: ExamNavigationMode;
  scoringSystem: ScoringSystem;
  status: ExamStatus;
  passingScore: number;
  totalQuestions: number;
  subtestsConfig?: {
    name: string;
    durationMinutes: number;
    questionIds: string[];
  }[];
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionAnswer {
  questionId: string;
  selectedAnswer: string; // e.g. "A" or JSON string
  isCorrect: boolean;
  scoreEarned: number;
}

export interface SubtestScoreBreakdown {
  subtestName: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  emptyCount: number;
  score: number;
  percentage: number;
}

export interface ExamSubmissionItem {
  id: string;
  examId: string;
  examTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userSchool: string;
  userGrade: GradeLevel;
  targetPtn?: string;
  targetMajor?: string;
  startedAt: string;
  submittedAt: string;
  status: "IN_PROGRESS" | "COMPLETED";
  totalScore: number;
  correctCount: number;
  incorrectCount: number;
  emptyCount: number;
  subtestBreakdown: SubtestScoreBreakdown[];
  answers: Record<string, SubmissionAnswer>;
  attemptNumber: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gradeLevel: GradeLevel;
  schoolName: string;
  targetPtn?: string;
  targetMajor?: string;
  totalExamsTaken: number;
  averageScore: number;
  createdAt: string;
}
