export interface AddinPermissionModel {
  relativePathToAddin: string;
  displayName: string;
  forDiscipline: string;
  emoji: string;
  image?: string;
  isPublic: boolean;
}

export function AllPublicAddinPermissions(): AddinPermissionModel[] {
  return GLOBAL_DEFAULT_ADDIN_PERMISSIONS.filter(
    (permission) => permission.isPublic
  );
}

// ! Prefer using AllPublicAddinPermissions() instead of this constant
export const GLOBAL_DEFAULT_ADDIN_PERMISSIONS: AddinPermissionModel[] = [
  {
    relativePathToAddin: "All Versions/EMABASES",
    displayName: "EMA Bases",
    forDiscipline: "Bases",
    emoji: "🏠",
    image: "/images/bg1.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/EMAELECTRICAL",
    displayName: "EMA Electrical",
    forDiscipline: "Electrical",
    emoji: "⚡",
    image: "/images/bg2.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/EMALIGHTING",
    displayName: "EMA Lighting",
    forDiscipline: "Lighting",
    emoji: "💡",
    image: "/images/bg3.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/EMAMECHANICAL",
    displayName: "EMA Mechanical",
    forDiscipline: "Mechanical",
    emoji: "⚙️",
    image: "/images/bg4.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/EMAPLUMBING",
    displayName: "EMA Plumbing",
    forDiscipline: "Plumbing",
    emoji: "💧",
    image: "/images/bg5.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/EMATECHNOLOGY",
    displayName: "EMA Technology",
    forDiscipline: "Technology",
    emoji: "🤖",
    image: "/images/bg6.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/EMASHREVEPORT",
    displayName: "EMA Shreveport",
    forDiscipline: "Shreveport",
    emoji: "🏙️",
    image: "/images/bg7.jpg",
    isPublic: true,
  },
  {
    relativePathToAddin: "All Versions/Misc/TabColorizer",
    displayName: "Tab Colorizer",
    forDiscipline: "Technology",
    emoji: "🏙️",
    image: "/images/paintbrush-logo.png",
    isPublic: false,
  },
];
