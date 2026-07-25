import { useEffect, useState } from "react";
import { getReviews, updateReviewStatus } from "./api/client";
import Sidebar from "./components/Sidebar";
import type { Review, ReviewStatus, View } from "./types";
import DetailView from "./views/DetailView";
import HistoryView from "./views/HistoryView";
import NewReviewView from "./views/NewReviewView";

export default function App() {
  const [screen, setScreen] = useState<View>("new");
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews()
      .then((r) => setRecentReviews(r.reviews.slice(0, 2)))
      .catch(console.error);
  }, []);

  function refreshRecent(review: Review) {
    setRecentReviews((prev) => {
      const filtered = prev.filter((r) => r.id !== review.id);
      return [review, ...filtered].slice(0, 2);
    });
  }

  function handleReviewComplete(review: Review) {
    setActiveReview(review);
    refreshRecent(review);
  }

  function handleOpenReview(review: Review) {
    setSelectedReview(review);
    setScreen("detail");
  }

  async function handleStatusChange(id: string, status: ReviewStatus) {
    try {
      const updated = await updateReviewStatus(id, status);
      if (activeReview?.id === id) {
        setActiveReview(updated);
      }
      if (selectedReview?.id === id) {
        setSelectedReview(updated);
      }
      refreshRecent(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar
        screen={screen}
        recentReviews={recentReviews}
        onNavigate={setScreen}
        onOpenReview={handleOpenReview}
      />
      <main className="flex-1 min-w-0 px-10 py-8 flex flex-col gap-7">
        {screen === "new" && (
          <NewReviewView
            activeReview={activeReview}
            onReviewComplete={handleReviewComplete}
          />
        )}
        {screen === "history" && (
          <HistoryView
            onSelectReview={(r) => {
              setSelectedReview(r);
              setScreen("detail");
            }}
          />
        )}
        {screen === "detail" && selectedReview && (
          <DetailView
            review={selectedReview}
            onBack={() => setScreen("history")}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </div>
  );
}
