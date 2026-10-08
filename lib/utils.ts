import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} Menit`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} Jam`;
  return `${hours} Jam ${remainingMinutes} Menit`;
}

export function formatGradeBadge(grade: string): { label: string; bg: string; text: string } {
  switch (grade) {
    case "SD":
      return { label: "SD", bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-800 dark:text-zinc-200" };
    case "SMP":
      return { label: "SMP", bg: "bg-zinc-200 dark:bg-zinc-700", text: "text-zinc-900 dark:text-zinc-100" };
    case "SMA":
      return { label: "SMA", bg: "bg-zinc-900 dark:bg-zinc-100", text: "text-zinc-50 dark:text-zinc-900" };
    default:
      return { label: grade, bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-700 dark:text-zinc-300" };
  }
}

export const LATEX_PRESETS = [
  { label: "Pecahan", formula: "\\frac{a}{b}", description: "Pecahan a per b" },
  { label: "Akar Kuadrat", formula: "\\sqrt{x}", description: "Akar kuadrat dari x" },
  { label: "Pangkat / Eksponen", formula: "x^{n}", description: "x pangkat n" },
  { label: "Subskrip", formula: "x_{1}", description: "x indeks 1" },
  { label: "Integral", formula: "\\int_{a}^{b} f(x) \\, dx", description: "Integral tentu dari a ke b" },
  { label: "Limit", formula: "\\lim_{x \\to 0} f(x)", description: "Limit x mendekati 0" },
  { label: "Sigma / Deret", formula: "\\sum_{i=1}^{n} i", description: "Penjumlahan deret dari i=1 sampai n" },
  { label: "Matriks 2x2", formula: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", description: "Matriks ordo 2x2" },
  { label: "Persamaan Kuadrat", formula: "ax^2 + bx + c = 0", description: "Bentuk umum persamaan kuadrat" },
  { label: "Rumus ABC", formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", description: "Rumus akar persamaan kuadrat" },
  { label: "Kimia / Reaksi", formula: "2H_2 + O_2 \\rightarrow 2H_2O", description: "Persamaan reaksi kimia" },
  { label: "Logaritma", formula: "^{a}\\log(b) = c", description: "Notasi logaritma basis a" },
];
