import type { AnalyticsData } from "../../types/analytics";
import { apiFetch, buildQuery } from "./client";

export type Period = "week" | "30" | "90" | "year";

export interface DashboardReview {
  id: number;
  reviewerName: string | null;
  rating: number;
  text: string | null;
  platform: string;
  platformLabel: string;
  publishedAt: string | null;
}

export interface DashboardData {
  sent: number;
  reviews: number;
  complaints: number;
  avgRating: number;
  periodStart: string;
  periodEnd: string;
  platforms: Array<{
    platform: string;
    label: string;
    enabled: boolean;
    rating: number | null;
    reviews: number;
    totalReviews: number;
    totalNegative: number;
    negativePercent: number;
  }>;
  satisfaction: Array<{
    stars: number;
    count: number;
    percent: number;
  }>;
  npsSmall: Array<{
    index: number;
    nps: number;
    bucketStart: string;
    bucketEnd: string;
  }>;
  npsLarge: Array<{
    index: number;
    nps: number;
    bucketStart: string;
    bucketEnd: string;
  }>;
  employees: Array<{
    name: string;
    ratingsCount: number;
    fiveStarPercent: number;
    fourStarPercent: number;
    threeStarPercent: number;
    twoStarPercent: number;
    oneStarPercent: number;
    avgRating: number;
  }>;
  recentReviews: DashboardReview[];
}

export interface BranchAnalyticsRow {
  id: number;
  name: string;
  requests: number;
  newReviews: number;
  interceptedComplaints: number;
  avgRating: number;
  nps: number;
}

export async function getAnalytics(
  branchId: string,
  period: Period = "30"
): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>(
    `/analytics/${branchId}${buildQuery({ period })}`
  );
}

export async function getDashboard(
  branchId: string,
  params: { period?: Period; start?: string; end?: string } = { period: "30" }
): Promise<DashboardData> {
  return apiFetch<DashboardData>(
    `/analytics/${branchId}/dashboard${buildQuery(params)}`
  );
}

export async function getBranchesAnalytics(
  params: { period?: Period; start?: string; end?: string } = { period: "30" }
): Promise<BranchAnalyticsRow[]> {
  const data = await apiFetch<{ rows: BranchAnalyticsRow[] }>(
    `/analytics/branches${buildQuery(params)}`
  );

  return data.rows;
}
