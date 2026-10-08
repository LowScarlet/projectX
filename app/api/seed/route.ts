import { NextResponse } from "next/server";
import { 
  INITIAL_QUESTION_BANKS, 
  INITIAL_QUESTIONS, 
  INITIAL_EXAMS, 
  INITIAL_STUDENTS, 
  INITIAL_SUBMISSIONS 
} from "@/lib/mockData";

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      message: "Seed data siap digunakan.",
      data: {
        banksCount: INITIAL_QUESTION_BANKS.length,
        questionsCount: INITIAL_QUESTIONS.length,
        examsCount: INITIAL_EXAMS.length,
        studentsCount: INITIAL_STUDENTS.length,
        submissionsCount: INITIAL_SUBMISSIONS.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses seed data." },
      { status: 500 }
    );
  }
}
