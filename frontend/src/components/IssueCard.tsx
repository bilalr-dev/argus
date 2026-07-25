interface Issue {
  line: number;
  title: string;
  detail: string;
}

interface IssueCardProps {
  severity: "critical" | "medium" | "positive";
  count?: number;
  issues?: Issue[];
  positives?: string[];
}

export type { Issue };

export default function IssueCard({
  severity,
  count,
  issues,
  positives,
}: IssueCardProps) {
  return (
    <div className="bg-surface-2 border border-border rounded-card p-[18px]">
      {severity === "critical" && (
        <>
          <span className="text-2xs font-extrabold px-2.5 py-1 rounded-badge bg-[oklch(94%_0.04_25)] text-[oklch(45%_0.15_25)] inline-flex items-center">
            <i className="ti ti-alert-circle mr-1" />
            Critical · {count}
          </span>
          <div className="flex flex-col gap-3 mt-3">
            {issues?.map((issue, i) => (
              <div key={i}>
                <p className="text-sm font-bold">
                  Line {issue.line} — {issue.title}
                </p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed break-words">
                  {issue.detail}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {severity === "medium" && (
        <>
          <span className="text-2xs font-extrabold px-2.5 py-1 rounded-badge bg-[oklch(95%_0.05_80)] text-[oklch(48%_0.13_80)] inline-flex items-center">
            <i className="ti ti-alert-triangle mr-1" />
            Medium · {count}
          </span>
          <div className="flex flex-col gap-3 mt-3">
            {issues?.map((issue, i) => (
              <div key={i}>
                <p className="text-sm font-bold">
                  Line {issue.line} — {issue.title}
                </p>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  {issue.detail}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {severity === "positive" && (
        <>
          <p className="text-2xs font-extrabold text-[oklch(45%_0.13_150)] mb-2.5">
            What's working
          </p>
          <div className="flex flex-col gap-2">
            {positives?.map((positive, i) => (
              <div
                key={i}
                className="flex gap-2 text-sm text-text-primary"
              >
                <i className="ti ti-circle-check text-[oklch(55%_0.13_150)] flex-shrink-0 mt-0.5" />
                <span className="break-words">{positive}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
