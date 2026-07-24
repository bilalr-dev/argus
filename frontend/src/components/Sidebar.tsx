import type { View } from "../types";

interface SidebarProps {
  view: View;
  onNavigate: (v: View) => void;
}

interface NavItem {
  key: View;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { key: "new", label: "New review", icon: "ti-plus" },
  { key: "history", label: "History", icon: "ti-history" },
];

export default function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[248px] flex-shrink-0 bg-surface-1 border-r border-border sticky top-0 h-screen px-5 py-7 flex flex-col gap-9">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-accent flex items-center justify-center flex-shrink-0">
            <div className="w-[11px] h-[11px] rounded-full border-2 border-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">Argus</span>
        </div>
        <p className="text-sm text-text-secondary leading-snug mt-2">
          AI code review.
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = view === item.key || (view === "detail" && item.key === "history");
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm border-none cursor-pointer w-full text-left font-sans transition-colors ${
                isActive
                  ? "bg-accent-tint text-accent font-bold"
                  : "text-text-primary bg-transparent hover:bg-surface-0"
              }`}
            >
              <i className={`ti ${item.icon} text-base`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <p className="mt-auto text-[12px] text-text-muted leading-relaxed pt-4 border-t border-border-soft">
        Your code stays on your machine, with only what's needed for analysis leaving your device.
      </p>
    </aside>
  );
}
