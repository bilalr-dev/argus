import type { ReviewStatus } from "../types";

interface StatusBadgeProps {
  status: ReviewStatus;
}

const styles: Record<ReviewStatus, string> = {
  pending: "bg-[oklch(94%_0.03_262)] text-[oklch(42%_0.12_262)]",
  approved: "bg-[oklch(94%_0.05_150)] text-[oklch(38%_0.13_150)]",
  edited: "bg-[oklch(95%_0.06_80)] text-[oklch(45%_0.12_80)]",
  ignored: "bg-[oklch(93%_0.006_255)] text-[oklch(48%_0.01_255)]",
};

const labels: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  edited: "Edited",
  ignored: "Ignored",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-badge text-2xs font-bold px-2.5 py-1 ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
