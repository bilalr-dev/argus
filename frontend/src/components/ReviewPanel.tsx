import { useState } from "react";
import type { Review, ReviewStatus } from "../types";
import { formatDate } from "../utils/formatDate";
import DiffViewer from "./DiffViewer";
import type { Issue } from "./IssueCard";
import IssueCard from "./IssueCard";
import StatusBadge from "./StatusBadge";

interface ReviewPanelProps {
  review: Review;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

function parseReview(text: string) {
  const critCountMatch = text.match(/Critical Issues \((\d+)\)/);
  const critCount = critCountMatch ? parseInt(critCountMatch[1], 10) : 0;

  const medCountMatch = text.match(/Medium Issues \((\d+)\)/);
  const medCount = medCountMatch ? parseInt(medCountMatch[1], 10) : 0;

  const criticalIssues: Issue[] = [];
  const mediumIssues: Issue[] = [];

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
      criticalIssues.push({
        line: parseInt(match[1], 10),
        title: match[2].trim(),
        detail: match[3].trim(),
      });
    }
  }

  if (medSection) {
    issuePattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = issuePattern.exec(medSection)) !== null) {
      mediumIssues.push({
        line: parseInt(match[1], 10),
        title: match[2].trim(),
        detail: match[3].trim(),
      });
    }
  }

  const posSection = text.match(
    /Positive Feedback([\s\S]*?)(?=Summary|$)/i
  )?.[1];
  const positives: string[] = [];
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

  return { critCount, medCount, criticalIssues, mediumIssues, positives, summary };
}

export default function ReviewPanel({
  review,
  onStatusChange,
}: ReviewPanelProps) {
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  const { critCount, medCount, criticalIssues, mediumIssues, positives, summary } =
    parseReview(review.review);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface-2 border border-border rounded-card px-[22px] py-[18px] flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <p className="text-lg font-extrabold truncate">{review.repo_path}</p>
          <p className="text-sm text-text-secondary font-mono mt-0.5">
            {review.branch} · {formatDate(review.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <StatusBadge status={review.status} />
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

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1.4fr 1fr" }}
      >
        <DiffViewer
          diff={review.diff}
          highlightedLine={highlightedLine}
          onLineClick={setHighlightedLine}
        />
        <div className="flex flex-col gap-3.5">
          {critCount > 0 && (
            <IssueCard
              severity="critical"
              count={critCount}
              issues={criticalIssues}
            />
          )}
          {medCount > 0 && (
            <IssueCard
              severity="medium"
              count={medCount}
              issues={mediumIssues}
            />
          )}
          {positives.length > 0 && (
            <IssueCard severity="positive" positives={positives} />
          )}
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
