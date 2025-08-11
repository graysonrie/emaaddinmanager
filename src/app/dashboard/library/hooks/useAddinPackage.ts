import { AddinModel } from "@/lib/models/addin.model";
import getTauriCommands from "@/lib/commands/getTauriCommands";
import { AddinPackageInfoModel } from "@/lib/models/addin-package-info.model";
import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/auth/useAuthStore";

interface useAddinPackageProps {
  addin: AddinModel | null;
}

export default function useAddinPackage({ addin }: useAddinPackageProps) {
  const [packageInfo, setPackageInfo] = useState<
    AddinPackageInfoModel | undefined
  >(undefined);
  // only allow the user to package if they are a super admin
  const [canPackage, setCanPackage] = useState(false);

  const { amIAnAdmin } = useAuthStore();

  const { createPackageForRegistryAddin, getPackageInfoForRegistryAddin } =
    getTauriCommands();

  const checkIfCanPackage = async () => {
    const adminStatus = await amIAnAdmin();
    setCanPackage(adminStatus === "super");
  };

  const getPackageInfo = useCallback(async () => {
    if (!addin) {
      setPackageInfo(undefined);
      return;
    }
    const packageInfo = await getPackageInfoForRegistryAddin(addin);
    setPackageInfo(packageInfo);
  }, [addin, getPackageInfoForRegistryAddin]);

  const refreshPackageInfo = useCallback(async () => {
    await getPackageInfo();
  }, [getPackageInfo]);

  useEffect(() => {
    getPackageInfo();
    checkIfCanPackage();
  }, [addin, getPackageInfo]);

  return { packageInfo, canPackage, refreshPackageInfo };
}
