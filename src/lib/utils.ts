import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileNameFromPath(path: string) {
  return path.split("\\").pop();
}

export function getFileExtensionFromPath(path: string) {
  return path.split(".").pop();
}

export function getParentDirectoryFromPath(path: string) {
  return path.split("\\").slice(0, -1).join("\\");
}