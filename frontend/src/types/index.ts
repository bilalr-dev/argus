export type ReviewStatus = "pending" | "approved" | "edited" | "ignored";

export interface Review {
  id: string;
  repo_path: string;
  branch: string;
  diff: string;
  review: string;
  issues_found: number;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ReviewRequest {
  repo_path: string;
  base_ref?: string;
  max_diff_size?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
}

export type View = "new" | "history" | "detail";
