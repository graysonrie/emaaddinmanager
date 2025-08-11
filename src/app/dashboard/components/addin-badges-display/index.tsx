"use client";
import { useConfigValue } from "@/lib/persistence/config/useConfigValue";
import { useState, useEffect } from "react";
import AddinBadge from "./AddinBadge";
import { Loader2 } from "lucide-react";
import PongGame from "../pong-game";
import useAddinPermissions from "@/lib/addins/addin-management/useAddinPermissions";
import { AddinPermissionModel } from "@/lib/addins/addin-management/types";

interface Props {
  allowedAddins: AddinPermissionModel[];
}

export default function AddinBadgesDisplay({ allowedAddins }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-1 flex justify-center pb-8">
        <div
          className="w-full max-w-6xl"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
            alignItems: "start",
            justifyItems: "center",
          }}
        >
          {allowedAddins.map((addin) => (
            <AddinBadge
              key={addin.relativePathToAddin}
              addinPermission={addin}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
