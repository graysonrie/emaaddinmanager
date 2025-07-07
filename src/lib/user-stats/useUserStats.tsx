import { useMemo } from "react";
import useLocalAddins from "../local-addins/useLocalAddins";

export default function useUserStats() {
  const { addins } = useLocalAddins();

  const addinNames = useMemo(() => {
    return addins
      .map((addin) => addin.name)
      .filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
  }, [addins]);

  const totalAddins = addins.length;

  return {
    totalAddins,
    addins,
    addinNames,
  };
}
