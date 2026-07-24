import { useMemo } from "react";

interface DiffViewerProps {
  diff: string;
  highlightedLine: number | null;
  onLineClick: (line: number) => void;
}

type DiffRow =
  | { kind: "sep"; label: string }
  | {
      kind: "ctx" | "add" | "remove";
      leftLine: number | null;
      leftText: string;
      rightLine: number | null;
      rightText: string;
    };

function parseDiff(raw: string): { filename: string; rows: DiffRow[] } {
  const lines = raw.split("\n");
  const rows: DiffRow[] = [];
  let leftCounter = 0;
  let rightCounter = 0;
  let filename = "";

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      continue;
    }

    if (line.startsWith("---")) {
      continue;
    }

    if (line.startsWith("+++")) {
      const match = line.match(/\+\+\+ [ab]\/(.+)/);
      if (match) {
        filename = match[1];
      }
      continue;
    }

    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        leftCounter = parseInt(match[1], 10);
        rightCounter = parseInt(match[2], 10);
      }
      rows.push({ kind: "sep", label: line });
      continue;
    }

    if (line.startsWith("-")) {
      rows.push({
        kind: "remove",
        leftLine: leftCounter,
        leftText: line.slice(1),
        rightLine: null,
        rightText: "",
      });
      leftCounter++;
      continue;
    }

    if (line.startsWith("+")) {
      rows.push({
        kind: "add",
        leftLine: null,
        leftText: "",
        rightLine: rightCounter,
        rightText: line.slice(1),
      });
      rightCounter++;
      continue;
    }

    const text = line.startsWith(" ") ? line.slice(1) : line;
    rows.push({
      kind: "ctx",
      leftLine: leftCounter,
      leftText: text,
      rightLine: rightCounter,
      rightText: text,
    });
    leftCounter++;
    rightCounter++;
  }

  return { filename, rows };
}

function getLeftBg(kind: DiffRow["kind"]): string {
  if (kind === "remove") return "bg-diff-removed";
  return "bg-surface-2";
}

function getRightBg(kind: DiffRow["kind"]): string {
  if (kind === "add") return "bg-diff-added";
  return "bg-surface-2";
}

export default function DiffViewer({
  diff,
  highlightedLine,
  onLineClick,
}: DiffViewerProps) {
  const { filename, rows } = useMemo(() => parseDiff(diff), [diff]);

  return (
    <div className="bg-surface-2 border border-border rounded-card overflow-hidden">
      <div className="px-[18px] py-3 border-b border-border-soft font-mono text-sm font-bold text-text-secondary">
        {filename || "diff"}
      </div>
      <div className="overflow-x-auto">
        {rows.map((row, i) => {
          if (row.kind === "sep") {
            return (
              <div
                key={i}
                className="text-center text-2xs text-text-muted py-2 bg-surface-0 border-b border-border-subtle italic"
              >
                {row.label}
              </div>
            );
          }

          const isHighlighted = row.leftLine === highlightedLine;

          return (
            <div
              key={i}
              onClick={() =>
                onLineClick(row.leftLine ?? row.rightLine ?? 0)
              }
              className="grid grid-cols-2 font-mono text-xs leading-[1.65] border-b border-border-subtle cursor-pointer"
            >
              <div
                className={`flex ${getLeftBg(row.kind)} ${
                  isHighlighted ? "border-l-2 border-accent" : ""
                }`}
              >
                <span className="w-[38px] flex-shrink-0 text-right pr-2 text-text-muted select-none">
                  {row.leftLine ?? ""}
                </span>
                <pre className="whitespace-pre text-text-primary pr-3 m-0">
                  {row.leftText}
                </pre>
              </div>
              
              <div
                className={`flex ${getRightBg(row.kind)} border-l border-border-subtle`}
              >
                <span className="w-[38px] flex-shrink-0 text-right pr-2 text-text-muted select-none">
                  {row.rightLine ?? ""}
                </span>
                <pre className="whitespace-pre text-text-primary pr-3 m-0">
                  {row.rightText}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
