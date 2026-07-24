export const shortRepoName = (path: string): string =>
  path.split("/").filter(Boolean).pop() ?? path;
