import { useEffect, useState } from "react";
import useTauriCommands from "../commands/useTauriCommands";
import { AddinModel } from "../models/addin.model";
import { useAddinRegistryStore } from "./store";

export default function useAddinRegistry() {
  const { getAddins } = useTauriCommands();
  const { localRegistryPath, setLocalRegistryPath } = useAddinRegistryStore();
  const [addins, setAddins] = useState<AddinModel[]>([]);

  useEffect(() => {
    if (localRegistryPath) {
      getAddins(localRegistryPath).then((addins) => setAddins(addins));
    }
  }, [localRegistryPath]);

  return { addins, setLocalRegistryPath };
}