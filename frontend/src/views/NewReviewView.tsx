import { useState } from "react";
import { postReview, updateReviewStatus } from "../api/client";
import ReviewForm from "../components/ReviewForm";
import ReviewPanel from "../components/ReviewPanel";
import type { Review, ReviewStatus } from "../types";

interface NewReviewViewProps {
  activeReview: Review | null;
  onReviewComplete: (review: Review) => void;
}

export default function NewReviewView({
  activeReview,
  onReviewComplete,
}: NewReviewViewProps) {
  const [repoPath, setRepoPath] = useState("");
  const [baseRef, setBaseRef] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const review = await postReview({
        repo_path: repoPath,
        base_ref: baseRef,
      });
      onReviewComplete(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: ReviewStatus) {
    try {
      const updated = await updateReviewStatus(id, status);
      onReviewComplete(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Review your branch
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Point Argus at a local repo and get feedback before you open a merge request.
        </p>
      </div>

      <ReviewForm
        repoPath={repoPath}
        baseRef={baseRef}
        loading={loading}
        onRepoChange={setRepoPath}
        onBaseRefChange={setBaseRef}
        onSubmit={handleSubmit}
      />

      {error && (
        <div className="bg-[oklch(94%_0.04_25)] text-[oklch(45%_0.15_25)] rounded-card px-5 py-4 text-sm font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-surface-2 border border-border rounded-card px-8 py-8 flex items-center gap-3.5">
          <i className="ti ti-loader-2 animate-spin text-accent text-xl" />
          <span className="text-sm text-text-secondary">
            Argus is analyzing your diff...
          </span>
        </div>
      )}

      {activeReview && !loading && (
        <ReviewPanel
          review={activeReview}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
