import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Panel - SIM Bimbel Online",
  description: "Sistem Informasi Manajemen Bimbingan Belajar & CBT Engine",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased dark:bg-black dark:text-zinc-50">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area (Offset by Sidebar Width 64 / 16rem) */}
      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 pb-16">{children}</main>
      </div>
    </div>
  );
}
