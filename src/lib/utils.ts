import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AddinModel } from "./models/addin.model";
import { CategoryModel } from "./models/category.model";

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

/** Removes double backslashes from the path */
function removeDoubleBackslashes(path: string) {
  return path.replace(/\\/g, "/");
}

/**  */
export function normalizePath(path: string) {
  return removeDoubleBackslashes(path).replace(/\\/g, "/");
}

/**
 * Gets the category from the addin
 * @param addin - The addin
 * @returns The category
 */
export function getCategoryFromAddin(addin: AddinModel): CategoryModel {
  const parent = getParentDirectoryFromPath(addin.pathToAddinDllFolder);
  const name = getFileNameFromPath(parent);
  if (!parent) {
    throw new Error("Parent directory not found");
  }
  if (!name) {
    throw new Error("Category name not found");
  }
  return {
    name,
    fullPath: parent,
  };
}
