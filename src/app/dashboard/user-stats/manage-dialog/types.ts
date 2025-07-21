export interface AddinPermission {
  relativePathToAddin: string;
  displayName: string;
  forDiscipline: string;
  emoji: string;
}

export const DEFAULT_ADDIN_PERMISSIONS: AddinPermission[] = [
  {
    relativePathToAddin: "All Versions/EMABASES",
    displayName: "EMA Bases",
    forDiscipline: "Bases",
    emoji: "🏠",
  },
  {
    relativePathToAddin: "All Versions/EMAELECTRICAL",
    displayName: "EMA Electrical",
    forDiscipline: "Electrical",
    emoji: "⚡",
  },
  {
    relativePathToAddin: "All Versions/EMALIGHTING",
    displayName: "EMA Lighting",
    forDiscipline: "Lighting",
    emoji: "💡",
  },
  {
    relativePathToAddin: "All Versions/EMAMECHANICAL",
    displayName: "EMA Mechanical",
    forDiscipline: "Mechanical",
    emoji: "⚙️",
  },
  {
    relativePathToAddin: "All Versions/EMAPLUMBING",
    displayName: "EMA Plumbing",
    forDiscipline: "Plumbing",
    emoji: "💧",
  },
  {
    relativePathToAddin: "All Versions/EMATECHNOLOGY",
    displayName: "EMA Technology",
    forDiscipline: "Technology",
    emoji: "🤖",
  },
  {
    relativePathToAddin: "All Versions/EMASHREVEPORT",
    displayName: "EMA Shreveport",
    forDiscipline: "Shreveport",
    emoji: "🏙️",
  },
];
