import { useState } from "react";
import { updateReviewStatus } from "./api/client";
import Sidebar from "./components/Sidebar";
import type { Review, ReviewStatus, View } from "./types";
import DetailView from "./views/DetailView";
import HistoryView from "./views/HistoryView";
import NewReviewView from "./views/NewReviewView";

export default function App() {
  const [view, setView] = useState<View>("new");
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  async function handleStatusChange(id: string, status: ReviewStatus) {
    try {
      const updated = await updateReviewStatus(id, status);
      if (activeReview?.id === id) {
        setActiveReview(updated);
      }
      if (selectedReview?.id === id) {
        setSelectedReview(updated);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar view={view} onNavigate={setView} />
      <main className="flex-1 min-w-0 p-10 flex flex-col gap-7 max-w-[1180px]">
        {view === "new" && (
          <NewReviewView
            activeReview={activeReview}
            onReviewComplete={setActiveReview}
          />
        )}
        {view === "history" && (
          <HistoryView
            onSelectReview={(r) => {
              setSelectedReview(r);
              setView("detail");
            }}
          />
        )}
        {view === "detail" && selectedReview && (
          <DetailView
            review={selectedReview}
            onBack={() => setView("history")}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
}
