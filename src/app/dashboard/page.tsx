"use client";

import { useRouter } from "next/navigation";
import { useSidebarStore } from "./components/sidebar/store";

import PageWrapper from "@/components/PageWrapper";
import Link from "next/link";
import useUserInfoChecker from "@/lib/server/user/hooks/useUserInfoChecker";

export default function Home() {
  const { setIsOpen } = useSidebarStore();

  const router = useRouter();
  useUserInfoChecker();

  // Show main app content
  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 w-full h-full mx-auto thin-scrollbar items-center justify-center"></div>
    </PageWrapper>
  );
}
