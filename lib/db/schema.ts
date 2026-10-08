import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("user_role", ["ADMIN", "TUTOR", "STUDENT"]);
export const gradeLevelEnum = pgEnum("grade_level", ["SD", "SMP", "SMA"]);
export const categoryEnum = pgEnum("exam_category", ["UTBK_SNBT", "TKA", "REGULER_MAPEL"]);
export const questionTypeEnum = pgEnum("question_type", ["MULTIPLE_CHOICE", "COMPLEX_MC", "SHORT_ANSWER"]);
export const difficultyEnum = pgEnum("difficulty_level", ["MUDAH", "SEDANG", "SULIT"]);
export const navModeEnum = pgEnum("nav_mode", ["FLEXIBLE", "SUBTEST_LOCKED"]);
export const scoringEnum = pgEnum("scoring_system", ["SNBT_STANDARD", "MINUS_SYSTEM", "PERCENTAGE"]);
export const examStatusEnum = pgEnum("exam_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const submissionStatusEnum = pgEnum("submission_status", ["IN_PROGRESS", "COMPLETED"]);

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role").notNull().default("STUDENT"), // "ADMIN" | "TUTOR" | "STUDENT"
  gradeLevel: text("grade_level").default("SMA"), // "SD" | "SMP" | "SMA"
  schoolName: text("school_name"),
  targetPtn: text("target_ptn"),
  targetMajor: text("target_major"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Question Banks Table
export const questionBanks = pgTable("question_banks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  gradeLevel: text("grade_level").notNull().default("SMA"), // "SD" | "SMP" | "SMA"
  category: text("category").notNull().default("UTBK_SNBT"), // "UTBK_SNBT" | "TKA" | "REGULER_MAPEL"
  subject: text("subject").notNull(), // e.g. "Penalaran Umum", "Matematika", "Fisika"
  subtest: text("subtest"), // e.g. "Penalaran Induktif", "Kuantitatif"
  description: text("description"),
  createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Questions Table
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  questionBankId: text("question_bank_id").notNull().references(() => questionBanks.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("MULTIPLE_CHOICE"), // "MULTIPLE_CHOICE" | "COMPLEX_MC" | "SHORT_ANSWER"
  content: text("content").notNull(), // Text / Markdown + LaTeX formula
  imageUrl: text("image_url"),
  options: jsonb("options").notNull().default([]), // [{ key: "A", text: "...", imageUrl: "..." }]
  complexOptions: jsonb("complex_options"), // [{ statement: "...", isCorrect: true }]
  correctAnswer: text("correct_answer").notNull(), // "A" | "B" | "C" | "D" | "E" or JSON
  explanation: text("explanation"), // Step-by-step solution with LaTeX
  explanationImageUrl: text("explanation_image_url"),
  videoUrl: text("video_url"), // YouTube / Tutor video solution URL
  topicTag: text("topic_tag").notNull().default("Umum"), // e.g. "Aljabar Linear", "Silogisme"
  difficulty: text("difficulty").notNull().default("SEDANG"), // "MUDAH" | "SEDANG" | "SULIT"
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Exams Table
export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull().unique(),
  gradeLevel: text("grade_level").notNull().default("SMA"),
  category: text("category").notNull().default("UTBK_SNBT"),
  subject: text("subject").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  navigationMode: text("navigation_mode").notNull().default("FLEXIBLE"), // "FLEXIBLE" | "SUBTEST_LOCKED"
  scoringSystem: text("scoring_system").notNull().default("SNBT_STANDARD"), // "SNBT_STANDARD" | "MINUS_SYSTEM" | "PERCENTAGE"
  status: text("status").notNull().default("PUBLISHED"), // "DRAFT" | "PUBLISHED" | "ARCHIVED"
  passingScore: integer("passing_score").notNull().default(600),
  subtestsConfig: jsonb("subtests_config"), // [{ name: "Penalaran Umum", durationMinutes: 30, questionIds: [...] }]
  createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Exam Questions (Junction Table)
export const examQuestions = pgTable("exam_questions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  subtestName: text("subtest_name"),
  orderIndex: integer("order_index").notNull().default(0),
});

// 6. Exam Submissions Table
export const examSubmissions = pgTable("exam_submissions", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  status: text("status").notNull().default("COMPLETED"), // "IN_PROGRESS" | "COMPLETED"
  totalScore: integer("total_score").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  emptyCount: integer("empty_count").notNull().default(0),
  subtestBreakdown: jsonb("subtest_breakdown"),
  attemptNumber: integer("attempt_number").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Submission Answers Table
export const submissionAnswers = pgTable("submission_answers", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => examSubmissions.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedAnswer: text("selected_answer"),
  isCorrect: boolean("is_correct").notNull().default(false),
  scoreEarned: integer("score_earned").notNull().default(0),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questionBanks: many(questionBanks),
  exams: many(exams),
  submissions: many(examSubmissions),
}));

export const questionBanksRelations = relations(questionBanks, ({ one, many }) => ({
  author: one(users, {
    fields: [questionBanks.createdById],
    references: [users.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  bank: one(questionBanks, {
    fields: [questions.questionBankId],
    references: [questionBanks.id],
  }),
  examQuestions: many(examQuestions),
  submissionAnswers: many(submissionAnswers),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  author: one(users, {
    fields: [exams.createdById],
    references: [users.id],
  }),
  examQuestions: many(examQuestions),
  submissions: many(examSubmissions),
}));

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, {
    fields: [examQuestions.examId],
    references: [exams.id],
  }),
  question: one(questions, {
    fields: [examQuestions.questionId],
    references: [questions.id],
  }),
}));

export const examSubmissionsRelations = relations(examSubmissions, ({ one, many }) => ({
  exam: one(exams, {
    fields: [examSubmissions.examId],
    references: [exams.id],
  }),
  user: one(users, {
    fields: [examSubmissions.userId],
    references: [users.id],
  }),
  answers: many(submissionAnswers),
}));

export const submissionAnswersRelations = relations(submissionAnswers, ({ one }) => ({
  submission: one(examSubmissions, {
    fields: [submissionAnswers.submissionId],
    references: [examSubmissions.id],
  }),
  question: one(questions, {
    fields: [submissionAnswers.questionId],
    references: [questions.id],
  }),
}));
