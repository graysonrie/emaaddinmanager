import { AddinModel } from "@/lib/models/addin.model";
import { HelpTicketPreviewModel } from "@/lib/models/help-tickets/help-ticket-preview.model";
import { HelpTicketStatus } from "@/lib/models/help-tickets/help-ticket-status";
import { useAddinRegistryStore } from "@/lib/addins/addin-registry/useAddinRegistryStore";
import { getConfigValue } from "@/lib/persistence/config/getConfigValue";
import { normalizePath, removeTrailingSlash } from "@/lib/utils";

const CLOSED_LIKE_STATUSES: HelpTicketStatus[] = [
  "Closed",
  "Resolved",
  "Rejected",
];

export function isClosedLikeStatus(status: HelpTicketStatus): boolean {
  return CLOSED_LIKE_STATUSES.includes(status);
}

/** Parses dates formatted as "2026-06-09 9:15 AM" from the help ticket service. */
export function parseHelpTicketDate(dateStr: string): number {
  const match = dateStr.match(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i,
  );
  if (!match) {
    const fallback = new Date(dateStr).getTime();
    return Number.isNaN(fallback) ? 0 : fallback;
  }

  const [, datePart, hourStr, minuteStr, ampm] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (ampm.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  }
  if (ampm.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return new Date(
    `${datePart}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`,
  ).getTime();
}

function sortByUpdatedAtDesc(
  a: HelpTicketPreviewModel,
  b: HelpTicketPreviewModel,
): number {
  return parseHelpTicketDate(b.updatedAt) - parseHelpTicketDate(a.updatedAt);
}

export function sortTicketPreviews(
  previews: HelpTicketPreviewModel[],
  isAdmin: boolean,
): HelpTicketPreviewModel[] {
  const closed = previews
    .filter((p) => isClosedLikeStatus(p.status))
    .sort(sortByUpdatedAtDesc);
  const active = previews
    .filter((p) => !isClosedLikeStatus(p.status))
    .sort(sortByUpdatedAtDesc);

  return isAdmin ? [...active, ...closed] : [...closed, ...active];
}

export function dedupeAddinsById(addins: AddinModel[]): AddinModel[] {
  const seen = new Set<string>();
  const result: AddinModel[] = [];
  for (const addin of addins) {
    if (!seen.has(addin.addinId)) {
      seen.add(addin.addinId);
      result.push(addin);
    }
  }
  return result;
}

export async function resolveForAddinPath(
  localAddin: AddinModel,
): Promise<string | null> {
  const registryPath = await getConfigValue("localAddinRegistryPath");
  if (!registryPath) {
    return null;
  }

  const registryStore = useAddinRegistryStore.getState();
  if (registryStore.addins.length === 0) {
    await registryStore.loadRegistryData();
  }

  const registryAddins = useAddinRegistryStore.getState().addins;
  const match = registryAddins.find((a) => a.addinId === localAddin.addinId);
  if (!match) {
    return null;
  }

  const normalizedRegistryPath = normalizePath(registryPath);
  const normalizedDllPath = normalizePath(match.pathToAddinDllFolder);
  const relative = removeTrailingSlash(
    normalizedDllPath.replace(normalizedRegistryPath, ""),
  );

  return relative || null;
}
