import { apiFetch, buildQuery } from "./client";

export type RequestStatus =
  | "sent"
  | "opened"
  | "rated"
  | "visited"
  | "published"
  | "complaint";

export interface ReviewRequest {
  id: number;
  branchId: number;
  branchName: string | null;
  clientName: string;
  clientPhone: string;
  status: RequestStatus;
  sentAt: string;
  openedAt: string | null;
  ratedAt: string | null;
  publishedAt: string | null;
  rating: number | null;
  platform: string | null;
  reviewUrl: string | null;
}

export async function getRequests(params: {
  branchId: string;
  status?: RequestStatus;
  limit?: number;
  offset?: number;
}): Promise<{ requests: ReviewRequest[]; total: number }> {
  return apiFetch(
    `/requests${buildQuery({
      branchId: params.branchId,
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    })}`
  );
}

export async function createRequest(data: {
  branchId: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}): Promise<{
  id: number;
  branchId: number;
  clientName: string;
  clientPhone: string;
  status: RequestStatus;
  requestLink: string | null;
  sentAt: string;
}> {
  return apiFetch("/requests", {
    method: "POST",
    body: data,
  });
}
