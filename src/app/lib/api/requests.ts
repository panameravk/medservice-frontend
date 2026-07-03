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

export interface RequestUsage {
  sentThisMonth: number;
  limit: number;
}

/** Monthly request-quota usage for a branch — drives the «X из Y» counter. */
export async function getRequestUsage(branchId: string): Promise<RequestUsage> {
  return apiFetch<RequestUsage>(`/requests/usage${buildQuery({ branchId })}`);
}

export interface SmsResult {
  ok: boolean;
  test: boolean;
  smsId: string | null;
  cost: number | null;
  balance: number | null;
  error: string | null;
  skippedReason: string | null;
}

export async function createRequest(data: {
  branchId: number;
  employeeId?: number;
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
  sms: SmsResult | null;
}> {
  return apiFetch("/requests", {
    method: "POST",
    body: data,
  });
}

/** Send a one-off test SMS for a branch (uses a draft template if provided). */
export async function sendTestSms(
  branchId: string,
  phone: string,
  template?: string
): Promise<SmsResult> {
  return apiFetch<SmsResult>(`/requests/test-sms${buildQuery({ branchId })}`, {
    method: "POST",
    body: { phone, template },
  });
}
