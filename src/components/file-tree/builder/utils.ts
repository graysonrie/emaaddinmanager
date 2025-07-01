export function findCommonRoot(paths: string[]): string {
  if (paths.length === 0) return "";

  // For single path, find the parent directory (remove the last part)
  if (paths.length === 1) {
    const pathParts = paths[0].split("\\");
    // Return everything except the last part (the addin folder itself)
    return pathParts.slice(0, -1).join("\\");
  }

  // Split the first path to get the structure
  const firstPathParts = paths[0].split("\\");
  let commonLength = firstPathParts.length;

  // Compare with other paths to find common prefix
  for (let i = 1; i < paths.length; i++) {
    const currentParts = paths[i].split("\\");
    const minLength = Math.min(commonLength, currentParts.length);

    let j = 0;
    while (j < minLength && firstPathParts[j] === currentParts[j]) {
      j++;
    }

    commonLength = j;
    if (commonLength === 0) break; // No common prefix
  }

  return firstPathParts.slice(0, commonLength).join("\\");
}
