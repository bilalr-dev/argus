import type { Review, ReviewRequest, ReviewsResponse } from "../types";

const BASE = "/api";

export async function postReview(data: ReviewRequest): Promise<Review> {
  const res = await fetch(`${BASE}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Review failed");
  }
  return res.json();
}

export async function getReviews(): Promise<ReviewsResponse> {
  const res = await fetch(`${BASE}/reviews`);
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function getReview(id: string): Promise<Review> {
  const res = await fetch(`${BASE}/reviews/${id}`);
  if (!res.ok) throw new Error("Review not found");
  return res.json();
}

export async function updateReviewStatus(
  id: string,
  status: string
): Promise<Review> {
  const res = await fetch(`${BASE}/reviews/${id}?status=${status}`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}
