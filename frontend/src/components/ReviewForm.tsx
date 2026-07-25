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
          <label htmlFor="repo-path" className="block text-sm font-semibold text-[oklch(40%_0.02_255)] mb-1.5">
            Repository path
          </label>
          <input
            id="repo-path"
            type="text"
            value={repoPath}
            onChange={(e) => onRepoChange(e.target.value)}
            placeholder="/path/to/your/repo"
            className="border border-border rounded-input px-3 py-2.5 text-base bg-[oklch(98%_0.004_255)] outline-none w-full font-sans"
          />
        </div>
        <div>
          <label htmlFor="base-ref" className="block text-sm font-semibold text-[oklch(40%_0.02_255)] mb-1.5">
            Base ref
          </label>
          <input
            id="base-ref"
            type="text"
            value={baseRef}
            onChange={(e) => onBaseRefChange(e.target.value)}
            placeholder="main"
            className="border border-border rounded-input px-3 py-2.5 text-base bg-[oklch(98%_0.004_255)] outline-none w-full font-sans"
          />
        </div>
      </div>
      <p className="text-sm text-text-secondary mt-4">
        Argus diffs against{" "}
        <span className="font-semibold text-text-primary">{baseRef}</span>
        {" "}and reviews every changed file.
      </p>
      <div className="flex justify-end mt-[18px]">
        <button
          type="submit"
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
