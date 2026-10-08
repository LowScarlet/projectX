"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FiGrid, 
  FiLayers, 
  FiFileText, 
  FiTrendingUp, 
  FiUsers, 
  FiDatabase,
  FiBookOpen,
  FiActivity
} from "react-icons/fi";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FiGrid,
  },
  {
    label: "Bank Soal",
    href: "/admin/bank-soal",
    icon: FiLayers,
    badge: "LaTeX Ready",
  },
  {
    label: "Paket Ujian (CBT)",
    href: "/admin/ujian",
    icon: FiFileText,
  },
  {
    label: "Rekap Nilai & Analisis",
    href: "/admin/rekap-nilai",
    icon: FiTrendingUp,
  },
  {
    label: "Data Siswa",
    href: "/admin/siswa",
    icon: FiUsers,
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <FiBookOpen className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            SIM BIMBEL ONLINE
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 dark:text-zinc-400">
            Admin Management
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Menu Akademik & Ujian
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white dark:text-zinc-900" : "text-zinc-400")} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider",
                      isActive
                        ? "bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Status & Sistem
        </div>
        <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              CBT Engine Active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
            Drizzle ORM + PostgreSQL Neon Ready
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
              v1.0.0 Monochromatic
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            Next.js 16
          </span>
        </div>
      </div>
    </aside>
  );
};
