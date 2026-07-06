import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUpdateStore } from "@/app/update/store";
import useAppUpdateCheck from "./useAppUpdateCheck";

export function useAppUpdateRedirect() {
  const { update } = useAppUpdateCheck();
  const setUpdate = useUpdateStore((state) => state.setUpdate);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!update || pathname === "/update") return;

    setUpdate(update);
    router.replace("/update");
  }, [update, pathname, setUpdate, router]);
}
