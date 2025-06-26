"use client";

import Sidebar from "@/app/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full ">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
