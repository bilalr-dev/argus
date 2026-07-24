import { useMemo, useState } from "react";
import type { Review, ReviewStatus } from "../types";
import { parseFilesFromDiff } from "../utils/parseDiff";
import { shortRepoName } from "../utils/shortRepoName";
import DiffViewer from "./DiffViewer";
import StatusBadge from "./StatusBadge";

interface ReviewPanelProps {
  review: Review;
  selectedFileName: string | null;
  onFileSelect: (filename: string) => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

interface ParsedIssue {
  line: number;
  title: string;
  detail: string;
  severity: "warning" | "info";
  filename: string;
}

type IssuesByFile = Record<string, ParsedIssue[]>;

function parseReviewText(text: string, filenames: string[]) {
  const positives: string[] = [];
  const posSection = text.match(
    /Positive Feedback([\s\S]*?)(?=Summary|$)/i
  )?.[1];
  if (posSection) {
    const lines = posSection.split("\n");
    for (const line of lines) {
      const trimmed = line.replace(/^[\s\-•*]+/, "").trim();
      if (trimmed.length > 0) {
        positives.push(trimmed);
      }
    }
  }

  const summary = text.match(/Summary\n?([\s\S]*?)$/i)?.[1]?.trim() ?? "";

  // Parse issues and assign to files
  const allIssues: ParsedIssue[] = [];

  // Split review into file-specific sections by looking for filename references
  // The Gemini review often structures issues per file section
  const critSection = text.match(
    /Critical Issues[\s\S]*?(?=Medium Issues|Positive Feedback|Summary|$)/i
  )?.[0];
  const medSection = text.match(
    /Medium Issues[\s\S]*?(?=Positive Feedback|Summary|$)/i
  )?.[0];

  const issuePattern = /Line (\d+)[^\n]*?[—–-]\s*([^\n]+)\n([^\n]+)/g;

  if (critSection) {
    let match: RegExpExecArray | null;
    while ((match = issuePattern.exec(critSection)) !== null) {
      const lineNum = parseInt(match[1], 10);
      const assignedFile = findFileForLine(lineNum, filenames, text) ?? filenames[0] ?? "unknown";
      allIssues.push({
        line: lineNum,
        title: match[2].trim(),
        detail: match[3].trim(),
        severity: "warning",
        filename: assignedFile,
      });
    }
  }

  if (medSection) {
    issuePattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = issuePattern.exec(medSection)) !== null) {
      const lineNum = parseInt(match[1], 10);
      const assignedFile = findFileForLine(lineNum, filenames, text) ?? filenames[0] ?? "unknown";
      allIssues.push({
        line: lineNum,
        title: match[2].trim(),
        detail: match[3].trim(),
        severity: "info",
        filename: assignedFile,
      });
    }
  }

  const issuesByFile: IssuesByFile = {};
  for (const issue of allIssues) {
    if (!issuesByFile[issue.filename]) {
      issuesByFile[issue.filename] = [];
    }
    issuesByFile[issue.filename].push(issue);
  }

  return { positives, summary, issuesByFile };
}

function findFileForLine(
  _line: number,
  filenames: string[],
  _text: string
): string | undefined {
  // Simple heuristic: if there's only one file, assign to it.
  // For multi-file reviews, assign to first file by default.
  if (filenames.length === 1) return filenames[0];
  return filenames[0];
}

export default function ReviewPanel({
  review,
  selectedFileName,
  onFileSelect,
  onStatusChange,
}: ReviewPanelProps) {
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const files = useMemo(
    () => parseFilesFromDiff(review.diff),
    [review.diff]
  );

  const filenames = useMemo(() => files.map((f) => f.filename), [files]);

  const activeFile = selectedFileName ?? files[0]?.filename ?? null;
  const selectedFileDiff = files.find((f) => f.filename === activeFile);

  const { positives, summary, issuesByFile } = useMemo(
    () => parseReviewText(review.review, filenames),
    [review.review, filenames]
  );

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
      <div className="flex gap-4 min-h-0">
        {/* File list panel — 200px, independently scrollable */}
        <div className="w-[200px] flex-shrink-0 bg-surface-2 border border-border rounded-card overflow-y-auto max-h-[600px]">
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

        {/* Diff panel — flexible width */}
        <div className="flex-1 min-w-0">
          {selectedFileDiff && (
            <DiffViewer
              diff={selectedFileDiff.rawDiff}
              highlightedLine={highlightedLine}
              onLineClick={setHighlightedLine}
            />
          )}
        </div>

        {/* Feedback panel — 280px */}
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-3.5">
          {/* What's working */}
          {positives.length > 0 && (
            <div className="bg-surface-2 border border-border rounded-card p-[18px]">
              <p className="text-2xs font-extrabold text-[oklch(45%_0.13_150)] mb-2.5">
                What's working
              </p>
              <div className="flex flex-col gap-2">
                {positives.map((p, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-sm text-text-primary"
                  >
                    <i className="ti ti-circle-check flex-shrink-0 text-[oklch(55%_0.13_150)] mt-0.5" />
                    <span>{p}</span>
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
                      setHighlightedLine(issue.line);
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
                        {issue.severity === "warning" ? (
                          <i className="ti ti-alert-circle mr-0.5" />
                        ) : (
                          <i className="ti ti-info-circle mr-0.5" />
                        )}
                        {issue.severity}
                      </span>
                      <span className="text-2xs text-text-muted font-mono">
                        line {issue.line}
                      </span>
                    </div>
                    <p className="text-sm font-semibold group-hover:text-accent transition-colors">
                      {issue.title}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {issue.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* AI Summary */}
          {summary && (
            <div className="bg-accent-tint rounded-card px-[18px] py-4 text-sm text-[oklch(32%_0.05_262)] leading-relaxed">
              {summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
