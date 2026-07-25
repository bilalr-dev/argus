import { useEffect, useRef } from "react";
export interface HighlightedLine {
  line: number;
  side: "old" | "new" | "both";
}

interface DiffViewerProps {
  diff: string;
  highlightedLine: HighlightedLine | null;
  onLineClick: (h: HighlightedLine) => void;
}

interface DiffRow {
  kind: "context" | "add" | "remove" | "sep" | "skip";
  oldLine: number | null;
  newLine: number | null;
  content: string;
}

function parseDiff(diff: string): { filename: string; rows: DiffRow[] } {
  const lines = diff.split("\n");
  const rows: DiffRow[] = [];
  let oldLine = 0;
  let newLine = 0;
  let filename = "";

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      filename = line.slice(6).trim();
      continue;
    }
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("new file mode") ||
      line.startsWith("deleted file mode") ||
      line.startsWith("Binary files") ||
      line === "\\ No newline at end of file"
    ) continue;

    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (match) {
        oldLine = parseInt(match[1]);
        newLine = parseInt(match[2]);
      }
      rows.push({ kind: "sep", oldLine: null, newLine: null, content: line });
      continue;
    }

    if (line.startsWith("-")) {
      rows.push({
        kind: "remove",
        oldLine: oldLine++,
        newLine: null,
        content: line.slice(1),
      });
    } else if (line.startsWith("+")) {
      rows.push({
        kind: "add",
        oldLine: null,
        newLine: newLine++,
        content: line.slice(1),
      });
    } else {
      rows.push({
        kind: "context",
        oldLine: oldLine++,
        newLine: newLine++,
        content: line.slice(1) || line,
      });
    }
  }

  return { filename, rows };
}

export default function DiffViewer({
  diff,
  highlightedLine,
  onLineClick,
}: DiffViewerProps) {
  const { filename, rows } = parseDiff(diff);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedLine]);

  return (
    <div className="bg-white border border-border rounded-card
                    overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border
                      font-mono text-sm font-bold
                      text-text-secondary bg-surface-0">
        {filename}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <tbody>
            {rows.map((row) => {
              if (row.kind === "sep") {
                return (
                  <tr key={`${row.kind}-${row.oldLine ?? ""}-${row.newLine ?? ""}`}
                      className="bg-[#ddf4ff]">
                    <td colSpan={4}
                        className="px-3 py-1 font-mono text-xs
                                   text-[#0550ae] select-none">
                      {row.content}
                    </td>
                  </tr>
                );
              }

              const isHighlighted =
                highlightedLine !== null &&
                ((highlightedLine.side === "old" &&
                  row.oldLine === highlightedLine.line) ||
                  (highlightedLine.side === "new" &&
                    row.newLine === highlightedLine.line) ||
                  (highlightedLine.side === "both" &&
                    row.newLine === highlightedLine.line));

              const rowBg =
                row.kind === "remove"
                  ? "bg-[#ffd7d5]"
                  : row.kind === "add"
                  ? "bg-[#ccffd8]"
                  : "bg-white";

              const symbol =
                row.kind === "remove"
                  ? "-"
                  : row.kind === "add"
                  ? "+"
                  : " ";

              const symbolColor =
                row.kind === "remove"
                  ? "text-[#cf222e]"
                  : row.kind === "add"
                  ? "text-[#1a7f37]"
                  : "text-transparent";

              return (
                <tr key={`${row.kind}-${row.oldLine ?? ""}-${row.newLine ?? ""}`}
                    ref={isHighlighted ? highlightedRowRef : null}
                    onClick={() => {
                      if (row.kind === "remove") {
                        onLineClick({ line: row.oldLine!, side: "old" });
                      } else if (row.kind === "add") {
                        onLineClick({ line: row.newLine!, side: "new" });
                      } else {
                        onLineClick({ line: row.newLine!, side: "both" });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (row.kind === "remove") {
                          onLineClick({ line: row.oldLine!, side: "old" });
                        } else if (row.kind === "add") {
                          onLineClick({ line: row.newLine!, side: "new" });
                        } else {
                          onLineClick({ line: row.newLine!, side: "both" });
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className={`${rowBg} cursor-pointer
                      hover:brightness-95 transition-all
                      ${isHighlighted
                        ? "outline outline-2 outline-accent"
                        : ""
                      }`}>
                  <td className="w-[40px] text-right px-2 py-0.5
                                 font-mono text-xs text-text-muted
                                 select-none border-r border-border-subtle
                                 align-top">
                    {row.oldLine ?? ""}
                  </td>
                  <td className="w-[40px] text-right px-2 py-0.5
                                 font-mono text-xs text-text-muted
                                 select-none border-r border-border-subtle
                                 align-top">
                    {row.newLine ?? ""}
                  </td>
                  <td className={`w-[20px] text-center px-1 py-0.5
                                  font-mono text-xs font-bold
                                  select-none align-top ${symbolColor}`}>
                    {symbol}
                  </td>
                  <td className="px-3 py-0.5 align-top">
                    <pre className="font-mono text-xs text-[#24292f]
                                    whitespace-pre m-0 leading-[1.65]">
                      {row.content}
                    </pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
