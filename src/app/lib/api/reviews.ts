import { apiFetch, buildQuery } from "./client";
import type { Period } from "./analytics";

export interface Review {
  id: number;
  branchId: number;
  branchName: string | null;
  reviewerName: string | null;
  rating: number;
  text: string | null;
  platform: string;
  publishedAt: string | null;
}

export async function getReviews(params: {
  branchId: string;
  platform?: string;
  ratingMin?: number;
  ratingMax?: number;
  period?: Period;
  limit?: number;
  offset?: number;
}): Promise<{ reviews: Review[]; total: number }> {
  return apiFetch(
    `/reviews${buildQuery({
      branchId: params.branchId,
      platform: params.platform,
      ratingMin: params.ratingMin,
      ratingMax: params.ratingMax,
      period: params.period,
      limit: params.limit,
      offset: params.offset,
    })}`
  );
}
