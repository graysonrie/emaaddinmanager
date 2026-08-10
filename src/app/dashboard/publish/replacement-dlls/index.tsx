"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import useTauriCommands from "@/lib/commands/getTauriCommands";
import { useReplacementDllsStore } from "./useReplacementDllsStore";

interface Props {
  destinationPath: string | null;
  addinName: string | null;
}

export default function ReplacementDllsSection({
  destinationPath,
  addinName,
}: Props) {
  const {
    replacements,
    extraYears,
    expandedYears,
    loading,
    error,
    busyYear,
    refresh,
    addExtraYear,
    toggleExpanded,
    addOrChangeDlls,
    removeYear,
    removeFile,
  } = useReplacementDllsStore();
  const { getRevitVersions } = useTauriCommands();
  const [revitVersions, setRevitVersions] = useState<string[]>([]);
  const [newYear, setNewYear] = useState("");

  useEffect(() => {
    getRevitVersions()
      .then(setRevitVersions)
      .catch((err) => console.error("Failed to get Revit versions:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  useEffect(() => {
    if (!destinationPath || !addinName) return;
    refresh(destinationPath, addinName);
  }, [destinationPath, addinName, refresh]);

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const version of revitVersions) {
      if (/^\d{4}$/.test(version)) set.add(version);
    }
    for (const replacement of replacements) {
      set.add(replacement.year);
    }
    for (const year of extraYears) {
      set.add(year);
    }
    return Array.from(set).sort();
  }, [revitVersions, replacements, extraYears]);

  const filesForYear = (year: string) =>
    replacements.find((r) => r.year === year)?.files ?? [];

  if (!destinationPath || !addinName) {
    return (
      <Card className="w-full md:col-span-2">
        <CardHeader>
          <CardTitle>Replacement DLLs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a destination and project to manage year-specific replacement
            DLLs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:col-span-2">
      <CardHeader>
        <CardTitle>Replacement DLLs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Override specific DLLs when this addin is installed for a given Revit
          year. Files are stored in{" "}
          <span className="font-mono text-xs">
            {`${addinName}_{year}`}
          </span>{" "}
          next to the published addin.
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading && (
          <p className="text-sm text-muted-foreground">Loading replacements…</p>
        )}

        <div className="flex flex-col gap-2">
          {years.map((year) => {
            const files = filesForYear(year);
            const hasReplacements = files.length > 0;
            const expanded = expandedYears.includes(year);
            const busy = busyYear === year;

            return (
              <div key={year} className="rounded-md border">
                <div className="flex items-center gap-2 p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleExpanded(year)}
                  >
                    {expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="font-medium">Revit {year}</span>
                  <Badge variant={hasReplacements ? "default" : "outline"}>
                    {hasReplacements
                      ? `${files.length} file${files.length === 1 ? "" : "s"}`
                      : "None"}
                  </Badge>
                  <div className="ml-auto flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        addOrChangeDlls(destinationPath, addinName, year)
                      }
                    >
                      <Upload className="mr-1 h-3.5 w-3.5" />
                      {hasReplacements ? "Add / Change" : "Add"}
                    </Button>
                    {hasReplacements && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() =>
                          removeYear(destinationPath, addinName, year)
                        }
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                {expanded && (
                  <div className="border-t px-3 py-2">
                    {hasReplacements ? (
                      <ul className="flex flex-col gap-1">
                        {files.map((file) => (
                          <li
                            key={file}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="font-mono text-xs">{file}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={busy}
                              onClick={() =>
                                removeFile(
                                  destinationPath,
                                  addinName,
                                  year,
                                  file,
                                )
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No replacement DLLs for this year.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="Add year (e.g. 2027)"
            className="max-w-[180px]"
            maxLength={4}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              addExtraYear(newYear);
              setNewYear("");
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Year
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
