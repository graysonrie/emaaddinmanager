export function findCommonRoot(paths: string[]): string {
  if (paths.length === 0) return "";
  const splitPaths = paths.map((p) => p.split("\\"));
  let i = 0;
  while (splitPaths.every((parts) => parts[i] === splitPaths[0][i])) {
    i++;
  }
  return splitPaths[0].slice(0, i).join("\\");
}
