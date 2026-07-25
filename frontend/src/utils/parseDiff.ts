export interface ParsedFile {
  filename: string;
  added: number;
  removed: number;
  rawDiff: string;
}

export function parseFilesFromDiff(diff: string): ParsedFile[] {
  const sections = diff.split(/(?=diff --git )/);
  return sections.reduce<ParsedFile[]>((acc, section) => {
    if (!section.trim() || !section.includes("diff --git")) return acc;
    const filenameMatch =
      section.match(/diff --git a\/.+ b\/(.+)\n/) ??
      section.match(/\+\+\+ b\/(.+)\n/) ??
      section.match(/diff --git .+ b\/(.+)/);
    const filename = filenameMatch?.[1]?.trim() ?? "unknown";
    if (filename === "unknown") return acc;
    const lines = section.split("\n");
    const added = lines.filter(
      (l) => l.startsWith("+") && !l.startsWith("+++")
    ).length;
    const removed = lines.filter(
      (l) => l.startsWith("-") && !l.startsWith("---")
    ).length;
    acc.push({ filename, added, removed, rawDiff: section });
    return acc;
  }, []);
}
