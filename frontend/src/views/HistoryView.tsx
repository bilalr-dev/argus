import { useEffect, useState } from "react";
import { getReviews } from "../api/client";
import HistoryTable from "../components/HistoryTable";
import type { Review } from "../types";

interface HistoryViewProps {
  onSelectReview: (review: Review) => void;
}

export default function HistoryView({ onSelectReview }: HistoryViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews()
      .then((r) => setReviews(r.reviews))
      .catch(console.error);
  }, []);

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
      <HistoryTable reviews={reviews} onSelectReview={onSelectReview} />
    </div>
  );
}
