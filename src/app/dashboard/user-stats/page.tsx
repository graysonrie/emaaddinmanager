"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebarStore } from "../components/sidebar/store";
import { useConfigInitialization } from "@/lib/persistence/useConfigInitialization";
import StatsDisplay from "./stats-display";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";

export default function UserStatsPage() {
  // Show main app content
  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 max-w-screen-md w-full h-full mx-auto overflow-auto thin-scrollbar p-2">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-bold">User Stats</p>
        </div>
        <Separator className="w-full" />

        <StatsDisplay />
      </div>
    </PageWrapper>
  );
}
