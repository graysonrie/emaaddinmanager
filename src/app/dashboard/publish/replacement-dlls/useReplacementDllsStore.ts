import { create } from "zustand";
import { open } from "@tauri-apps/plugin-dialog";
import useTauriCommands from "@/lib/commands/getTauriCommands";
import { ReplacementYearModel } from "@/lib/models/replacement-year.model";

interface ReplacementDllsState {
  replacements: ReplacementYearModel[];
  extraYears: string[];
  expandedYears: string[];
  loading: boolean;
  error: string | null;
  busyYear: string | null;
  refresh: (destination: string, addinName: string) => Promise<void>;
  addExtraYear: (year: string) => void;
  toggleExpanded: (year: string) => void;
  addOrChangeDlls: (
    destination: string,
    addinName: string,
    year: string,
  ) => Promise<void>;
  removeYear: (
    destination: string,
    addinName: string,
    year: string,
  ) => Promise<void>;
  removeFile: (
    destination: string,
    addinName: string,
    year: string,
    fileName: string,
  ) => Promise<void>;
  reset: () => void;
}

const tauri = useTauriCommands();

const isValidYear = (year: string) => /^\d{4}$/.test(year);

export const useReplacementDllsStore = create<ReplacementDllsState>(
  (set, get) => ({
    replacements: [],
    extraYears: [],
    expandedYears: [],
    loading: false,
    error: null,
    busyYear: null,

    refresh: async (destination, addinName) => {
      if (!destination || !addinName) {
        set({ replacements: [], error: null });
        return;
      }
      set({ loading: true, error: null });
      try {
        const replacements = await tauri.listAddinReplacementYears(
          destination,
          addinName,
        );
        set({ replacements, loading: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load replacements";
        set({ error: message, loading: false });
      }
    },

    addExtraYear: (year) => {
      const trimmed = year.trim();
      if (!isValidYear(trimmed)) {
        set({ error: "Enter a 4-digit Revit year" });
        return;
      }
      const { extraYears, replacements } = get();
      if (
        extraYears.includes(trimmed) ||
        replacements.some((r) => r.year === trimmed)
      ) {
        set({ error: null });
        return;
      }
      set({
        extraYears: [...extraYears, trimmed].sort(),
        error: null,
        expandedYears: [...get().expandedYears, trimmed],
      });
    },

    toggleExpanded: (year) => {
      const { expandedYears } = get();
      set({
        expandedYears: expandedYears.includes(year)
          ? expandedYears.filter((y) => y !== year)
          : [...expandedYears, year],
      });
    },

    addOrChangeDlls: async (destination, addinName, year) => {
      try {
        set({ busyYear: year, error: null });
        const selected = await open({
          multiple: true,
          filters: [{ name: "DLL Files", extensions: ["dll"] }],
        });
        if (!selected) {
          set({ busyYear: null });
          return;
        }
        const sourcePaths = Array.isArray(selected) ? selected : [selected];
        if (sourcePaths.length === 0) {
          set({ busyYear: null });
          return;
        }
        await tauri.setAddinReplacementDlls(
          destination,
          addinName,
          year,
          sourcePaths,
        );
        await get().refresh(destination, addinName);
        if (!get().expandedYears.includes(year)) {
          set({ expandedYears: [...get().expandedYears, year] });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set replacement DLLs";
        set({ error: message });
      } finally {
        set({ busyYear: null });
      }
    },

    removeYear: async (destination, addinName, year) => {
      try {
        set({ busyYear: year, error: null });
        await tauri.removeAddinReplacementDlls(destination, addinName, year);
        set({
          extraYears: get().extraYears.filter((y) => y !== year),
          expandedYears: get().expandedYears.filter((y) => y !== year),
        });
        await get().refresh(destination, addinName);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to remove replacement DLLs";
        set({ error: message });
      } finally {
        set({ busyYear: null });
      }
    },

    removeFile: async (destination, addinName, year, fileName) => {
      try {
        set({ busyYear: year, error: null });
        await tauri.removeAddinReplacementDllFile(
          destination,
          addinName,
          year,
          fileName,
        );
        await get().refresh(destination, addinName);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to remove replacement file";
        set({ error: message });
      } finally {
        set({ busyYear: null });
      }
    },

    reset: () =>
      set({
        replacements: [],
        extraYears: [],
        expandedYears: [],
        loading: false,
        error: null,
        busyYear: null,
      }),
  }),
);
