"use client";

import Sidebar from "@/app/dashboard/sidebar";
import { PageTransition } from "@/components/PageTransition";
import { useSidebarStore } from "./sidebar/store";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        console.log("CTRL+F or CMD+F pressed");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const { isOpen } = useSidebarStore();

  return (
    <div className="flex h-full w-full">
      {isOpen && <Sidebar />}
      <main className="flex-1 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
