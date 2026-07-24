interface ReviewFormProps {
  repoPath: string;
  baseRef: string;
  loading: boolean;
  onRepoChange: (v: string) => void;
  onBaseRefChange: (v: string) => void;
  onSubmit: () => void;
}

export default function ReviewForm({
  repoPath,
  baseRef,
  loading,
  onRepoChange,
  onBaseRefChange,
  onSubmit,
}: ReviewFormProps) {
  return (
    <div className="bg-surface-2 border border-border rounded-card p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[oklch(40%_0.02_255)] mb-1.5">
            Repository path
          </label>
          <input
            type="text"
            value={repoPath}
            onChange={(e) => onRepoChange(e.target.value)}
            placeholder="/path/to/your/repo"
            className="border border-border rounded-input px-3 py-2.5 text-base bg-[oklch(98%_0.004_255)] outline-none w-full font-sans"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[oklch(40%_0.02_255)] mb-1.5">
            Base ref
          </label>
          <input
            type="text"
            value={baseRef}
            onChange={(e) => onBaseRefChange(e.target.value)}
            placeholder="main"
            className="border border-border rounded-input px-3 py-2.5 text-base bg-[oklch(98%_0.004_255)] outline-none w-full font-sans"
          />
        </div>
      </div>
      <div className="flex justify-end mt-[18px]">
        <button
          onClick={onSubmit}
          disabled={loading || !repoPath.trim()}
          className={`bg-accent text-white font-bold rounded-btn px-[22px] py-[11px] text-base cursor-pointer border-none font-sans hover:bg-accent-hover transition-colors ${
            loading || !repoPath.trim()
              ? "opacity-60 cursor-not-allowed"
              : ""
          }`}
        >
          {loading ? "Analyzing..." : "Run review"}
        </button>
      </div>
    </div>
  );
}
