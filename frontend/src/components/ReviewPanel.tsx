import { useEffect, useMemo, useState } from "react";
import type { Review, ReviewStatus } from "../types";
import { parseFilesFromDiff } from "../utils/parseDiff";
import { shortRepoName } from "../utils/shortRepoName";
import { stripMarkdown } from "../utils/stripMarkdown";
import DiffViewer, { type HighlightedLine } from "./DiffViewer";
import StatusBadge from "./StatusBadge";

interface ReviewPanelProps {
  review: Review;
  selectedFileName: string | null;
  onFileSelect: (filename: string) => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

interface ParsedReview {
  criticalIssues: ParsedIssue[];
  mediumIssues: ParsedIssue[];
  lowIssues: ParsedIssue[];
  positives: string[];
  summary: string;
}

interface ParsedIssue {
  filename: string;
  line: number;
  title: string;
  detail: string;
  severity: "warning" | "info";
}

function parseReviewText(text: string): ParsedReview {
  const sections = text.split(/^##\s+/m);

  let criticalIssues: ParsedIssue[] = [];
  let mediumIssues: ParsedIssue[] = [];
  let lowIssues: ParsedIssue[] = [];
  let positives: string[] = [];
  let summary = "";

  for (const section of sections) {
    const firstLine = section.split("\n")[0].toLowerCase();
    const body = section.slice(section.indexOf("\n") + 1);

    if (firstLine.includes("critical")) {
      criticalIssues = parseIssueBlock(body, "warning");
    } else if (firstLine.includes("medium")) {
      mediumIssues = parseIssueBlock(body, "info");
    } else if (firstLine.includes("low") || firstLine.includes("info")) {
      lowIssues = parseIssueBlock(body, "info");
    } else if (firstLine.includes("positive") || firstLine.includes("what")) {
      positives = parsePositives(body);
    } else if (firstLine.includes("summary")) {
      summary = stripMarkdown(body.trim());
    }
  }

  return { criticalIssues, mediumIssues, lowIssues, positives, summary };
}

function parseIssueBlock(
  text: string,
  severity: "warning" | "info"
): ParsedIssue[] {
  const issues: ParsedIssue[] = [];

  const issueBlocks = text.split(/(?=^- \*\*)/m).filter((b) => b.trim());

  for (const block of issueBlocks) {
    const headerMatch = block.match(
      /^- \*\*([^,*]+),\s*Line\s*(\d+)\*\*:\s*(?:\[[^\]]*\]\s*)?(.*)/
    );
    if (!headerMatch) continue;

    const filename = headerMatch[1].trim();
    const line = parseInt(headerMatch[2]);
    const title = stripMarkdown(headerMatch[3].trim());

    const problemMatch = block.match(/Problem:\s*([^\n]+(?:\n(?!Fix:)[^\n]+)*)/);
    const fixMatch = block.match(/Fix:\s*([^\n]+(?:\n(?!- \*\*)[^\n]+)*)/);

    const problem = problemMatch ? stripMarkdown(problemMatch[1].trim()) : "";
    const fix = fixMatch ? stripMarkdown(fixMatch[1].trim()) : "";

    const detail = [problem, fix ? `Fix: ${fix}` : ""]
      .filter(Boolean)
      .join(" ");

    issues.push({ filename, line, title, detail, severity });
  }

  return issues;
}

function parsePositives(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .map((line) => stripMarkdown(line))
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith("#") &&
        !line.startsWith("`") &&
        !line.startsWith("//") &&
        !line.includes("typescript") &&
        !line.includes("```")
    );
}

export default function ReviewPanel({
  review,
  selectedFileName,
  onFileSelect,
  onStatusChange,
}: ReviewPanelProps) {
  const [highlightedLine, setHighlightedLine] =
    useState<HighlightedLine | null>(null);
  const [pendingLine, setPendingLine] = useState<number | null>(null);

  const files = useMemo(
    () => parseFilesFromDiff(review.diff),
    [review.diff]
  );

  const activeFile = selectedFileName ?? files[0]?.filename ?? null;
  const selectedFileDiff = files.find((f) => f.filename === activeFile);

  useEffect(() => {
    if (pendingLine !== null) {
      setHighlightedLine({ line: pendingLine, side: "new" });
      setPendingLine(null);
    }
  }, [activeFile, pendingLine]);

  const parsed = useMemo(
    () => parseReviewText(review.review),
    [review.review]
  );

  const allIssues = [
    ...parsed.criticalIssues,
    ...parsed.mediumIssues,
    ...parsed.lowIssues,
  ];

  const issuesByFile = useMemo(() => {
    return allIssues.reduce<Record<string, ParsedIssue[]>>((acc, issue) => {
      const key = issue.filename || "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    }, {});
  }, [allIssues]);

  return (
    <div className="flex flex-col gap-4">
      {/* Sticky header */}
      <div className="bg-surface-2 border border-border rounded-card px-6 py-4 flex flex-col gap-1 sticky top-0 z-10">
        {/* Breadcrumb */}
        <div className="w-full flex items-center gap-1.5 text-sm text-text-muted mb-1">
          <span>Argus</span>
          <i className="ti ti-chevron-right text-xs" />
          <span className="text-text-secondary">
            {shortRepoName(review.repo_path)}
          </span>
          <i className="ti ti-chevron-right text-xs" />
          <span className="text-text-primary font-semibold">
            {review.branch}
          </span>
        </div>
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-lg font-extrabold truncate">
              {shortRepoName(review.repo_path)}
            </p>
            <span className="text-sm text-text-muted">
              {files.length} file{files.length !== 1 ? "s" : ""} changed
            </span>
            <StatusBadge status={review.status} />
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => onStatusChange(review.id, "approved")}
              className="bg-accent text-white text-sm font-bold px-4 py-2 rounded-[9px] border-none cursor-pointer hover:bg-accent-hover transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onStatusChange(review.id, "edited")}
              className="bg-surface-2 border border-border text-text-primary text-sm font-bold px-4 py-2 rounded-[9px] cursor-pointer hover:bg-surface-0 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onStatusChange(review.id, "ignored")}
              className="bg-transparent border-none text-text-secondary text-sm font-bold px-2.5 py-2 rounded-[9px] cursor-pointer hover:bg-surface-0 transition-colors"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>

      {/* 3-column body */}
      <div
        className="grid gap-4 min-h-0"
        style={{ gridTemplateColumns: "180px 1fr 300px" }}
      >
        {/* File list panel */}
        <div className="bg-surface-2 border border-border rounded-card overflow-y-auto max-h-[600px]">
          <div className="px-3 py-2.5 border-b border-border-soft">
            <p className="text-2xs font-bold text-text-muted uppercase tracking-widest">
              Files changed
            </p>
          </div>
          {files.map((f) => (
            <button
              key={f.filename}
              onClick={() => {
                onFileSelect(f.filename);
                setHighlightedLine(null);
              }}
              className={`w-full text-left px-3 py-3 border-b border-border-subtle transition-colors bg-transparent font-sans cursor-pointer ${
                activeFile === f.filename
                  ? "border-l-2 border-l-accent bg-accent-tint"
                  : "hover:bg-surface-0 border-l-2 border-l-transparent"
              }`}
            >
              <p className="text-xs font-semibold truncate">
                {f.filename.split("/").pop()}
              </p>
              <p className="text-2xs text-text-muted font-mono mt-0.5">
                <span className="text-[oklch(38%_0.13_150)]">
                  +{f.added}
                </span>{" "}
                <span className="text-[oklch(45%_0.15_25)]">
                  -{f.removed}
                </span>
              </p>
              {(issuesByFile[f.filename]?.length ?? 0) > 0 && (
                <span className="text-2xs font-bold mt-1 inline-block bg-[oklch(94%_0.04_25)] text-[oklch(45%_0.15_25)] px-1.5 py-0.5 rounded-full">
                  {issuesByFile[f.filename].length} issue
                  {issuesByFile[f.filename].length !== 1 ? "s" : ""}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Diff panel — flexible width, scrollable */}
        <div className="flex-1 min-w-0 overflow-y-auto max-h-[700px]">
          {selectedFileDiff && (
            <DiffViewer
              diff={selectedFileDiff.rawDiff}
              highlightedLine={highlightedLine}
              onLineClick={setHighlightedLine}
            />
          )}
        </div>

        {/* Feedback panel */}
        <div className="flex flex-col gap-3.5 min-w-0 overflow-hidden">
          {/* What's working */}
          {parsed.positives.length > 0 && (
            <div className="bg-surface-2 border border-border rounded-card p-[18px] min-w-0 overflow-hidden">
              <p className="text-2xs font-extrabold text-[oklch(45%_0.13_150)] mb-2.5">
                What's working
              </p>
              <div className="flex flex-col gap-2">
                {parsed.positives.map((p, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-sm text-text-primary"
                  >
                    <i className="ti ti-circle-check flex-shrink-0 text-[oklch(55%_0.13_150)] mt-0.5" />
                    <span className="break-words">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues grouped by file */}
          {Object.entries(issuesByFile).map(([filename, issues]) => (
            <div
              key={filename}
              className="bg-surface-2 border border-border rounded-card p-[18px]"
            >
              <p className="text-2xs font-bold text-text-muted font-mono mb-3 truncate">
                {filename.split("/").pop()}
              </p>
              <div className="flex flex-col gap-3">
                {issues.map((issue, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onFileSelect(filename);
                      setPendingLine(issue.line);
                    }}
                    className="text-left w-full group bg-transparent border-none p-0 cursor-pointer font-sans"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-2xs font-bold px-1.5 py-0.5 rounded-full inline-flex items-center ${
                          issue.severity === "warning"
                            ? "bg-[oklch(94%_0.04_25)] text-[oklch(45%_0.15_25)]"
                            : "bg-[oklch(94%_0.03_262)] text-[oklch(42%_0.12_262)]"
                        }`}
                      >
                        <i
                          className={`mr-0.5 ${
                            issue.severity === "warning"
                              ? "ti ti-alert-circle"
                              : "ti ti-info-circle"
                          }`}
                        />
                        {issue.severity === "warning" ? "warning" : "info"}
                      </span>
                      <span className="text-2xs text-text-muted font-mono">
                        line {issue.line}
                      </span>
                    </div>
                    <p className="text-sm font-semibold group-hover:text-accent transition-colors">
                      {issue.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed break-words">
                      {issue.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* AI Summary */}
          {parsed.summary && (
            <div className="bg-accent-tint rounded-card px-[18px] py-4 text-sm text-[oklch(32%_0.05_262)] leading-relaxed break-words">
              {parsed.summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
