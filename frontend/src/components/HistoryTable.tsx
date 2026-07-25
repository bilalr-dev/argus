import type { Review } from "../types";
import { formatDate } from "../utils/formatDate";
import StatusBadge from "./StatusBadge";

interface HistoryTableProps {
  reviews: Review[];
  onSelectReview: (review: Review) => void;
}

export default function HistoryTable({
  reviews,
  onSelectReview,
}: HistoryTableProps) {
  return (
    <div className="bg-surface-2 border border-border rounded-card overflow-hidden">
      <div
        className="grid px-5 py-3 text-2xs font-bold text-text-secondary uppercase tracking-widest border-b border-border-soft"
        style={{ gridTemplateColumns: "2.2fr 1fr 0.7fr 0.7fr 0.5fr" }}
      >
        <div>Repo & branch</div>
        <div>Reviewed</div>
        <div>Issues</div>
        <div>Status</div>
        <div />
      </div>

      {reviews.map((r) => (
        <button
          type="button"
          key={r.id}
          onClick={() => onSelectReview(r)}
          className="w-full text-left grid items-center px-5 py-4 cursor-pointer border-b border-border-subtle hover:bg-surface-0 transition-colors group bg-transparent border-none font-sans"
          style={{ gridTemplateColumns: "2.2fr 1fr 0.7fr 0.7fr 0.5fr" }}
        >
          <div className="min-w-0">
            <p className="text-base font-bold truncate">{r.repo_path}</p>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
              {r.branch}
            </p>
          </div>
          <div className="text-sm text-text-secondary">
            {formatDate(r.created_at)}
          </div>
          <div className="text-sm font-bold">{r.issues_found}</div>
          <div>
            <StatusBadge status={r.status} />
          </div>
          <div className="flex items-center justify-end">
            <span className="text-2xs font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              View
              <i className="ti ti-arrow-right ml-1" />
            </span>
          </div>
        </button>
      ))}
      {reviews.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-text-muted">
          No reviews yet. Run your first review above.
        </div>
      )}
    </div>
  );
}
