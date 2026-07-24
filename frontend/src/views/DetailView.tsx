import ReviewPanel from "../components/ReviewPanel";
import type { Review, ReviewStatus } from "../types";

interface DetailViewProps {
  review: Review;
  onBack: () => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

export default function DetailView({
  review,
  onBack,
  onStatusChange,
}: DetailViewProps) {
  return (
    <div className="flex flex-col gap-[22px]">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-accent w-fit bg-transparent border-none cursor-pointer p-0 hover:opacity-80 transition-opacity"
      >
        <i className="ti ti-arrow-left" />
        Back to history
      </button>
      <ReviewPanel review={review} onStatusChange={onStatusChange} />
    </div>
  );
}
