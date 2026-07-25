export interface ParsedFile {
  filename: string;
  added: number;
  removed: number;
  rawDiff: string;
}

export function parseFilesFromDiff(diff: string): ParsedFile[] {
  const sections = diff.split(/(?=diff --git )/);
  return sections
    .filter((s) => s.trim() && s.includes("diff --git"))
    .map((section) => {
      const filenameMatch =
        section.match(/diff --git a\/.+ b\/(.+)\n/) ??
        section.match(/\+\+\+ b\/(.+)\n/) ??
        section.match(/diff --git .+ b\/(.+)/);
      const filename = filenameMatch?.[1] ?? "unknown";
      const lines = section.split("\n");
      const added = lines.filter(
        (l) => l.startsWith("+") && !l.startsWith("+++")
      ).length;
      const removed = lines.filter(
        (l) => l.startsWith("-") && !l.startsWith("---")
      ).length;
      return { filename, added, removed, rawDiff: section };
    })
    .filter((f) => f.filename !== "unknown");
}
