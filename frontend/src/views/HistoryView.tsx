import { useEffect, useState } from "react";
import { getReviews } from "../api/client";
import HistoryTable from "../components/HistoryTable";
import type { Review, ReviewStatus } from "../types";

interface HistoryViewProps {
  onSelectReview: (review: Review) => void;
}

const STATUS_OPTIONS = ["all", "pending", "approved", "edited", "ignored"] as const;

export default function HistoryView({ onSelectReview }: HistoryViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>(
    "all"
  );

  useEffect(() => {
    getReviews()
      .then((r) => setReviews(r.reviews))
      .catch(console.error);
  }, []);

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.repo_path.toLowerCase().includes(search.toLowerCase()) ||
      r.branch.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Review history
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Everything Argus has reviewed on this machine.
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by repo or branch..."
            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-input text-sm bg-surface-2 outline-none text-text-primary placeholder:text-text-muted font-sans"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-2xs font-bold px-3 py-1.5 rounded-badge transition-colors capitalize border-none cursor-pointer font-sans ${
                statusFilter === s
                  ? "bg-accent text-white"
                  : "bg-surface-2 border border-border text-text-secondary hover:bg-surface-0"
              }`}
            >
              {s === "all"
                ? "All"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <HistoryTable reviews={filtered} onSelectReview={onSelectReview} />
    </div>
  );
}
