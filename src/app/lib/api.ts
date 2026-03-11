import type { AnalyticsData } from "../types/analytics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setTokens(access: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", access);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const url = `${BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  let data: unknown = null;

  try {
    if (res.status !== 204) {
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }
    }
  } catch {
    // ignore parse errors
  }

  if (res.status === 401) {
    clearTokens();
    throw new ApiError("Unauthorized", 401, data);
  }

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as { detail?: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : typeof data === "string" && data.trim()
        ? data
        : res.statusText || "API Error";

    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  isSuperuser: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof (data as { detail?: unknown }).detail === "string"
          ? (data as { detail: string }).detail
          : "Неверный логин или пароль";

      throw new ApiError(message, res.status, data);
    }

    if (
      !data ||
      typeof data !== "object" ||
      !("accessToken" in data) ||
      typeof (data as { accessToken?: unknown }).accessToken !== "string"
    ) {
      throw new ApiError("Некорректный ответ сервера", 500, data);
    }

    setTokens((data as { accessToken: string }).accessToken);
    return data as LoginResponse;
  },

  me: () => apiFetch<AuthUser>("/auth/me"),

  logout: () => clearTokens(),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// ─── Branches ────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  timezone?: string;
  specialization?: string;
  requestFrequencyDays?: number;
  complaintEmails?: string[];
  reminderEmails?: string[];
  avgRating?: number;
  npsScore?: number;
}

export async function getBranches(): Promise<Branch[]> {
  const data = await apiFetch<{
    branches: Array<{
      id: number;
      name: string;
      address: string | null;
      city: string | null;
      phone: string | null;
      timezone: string;
      specialization: string;
      requestFrequencyDays: number;
      complaintEmails: string[];
      reminderEmails: string[];
      avgRating: number;
      npsScore: number;
    }>;
    total: number;
  }>("/branches");

  return data.branches.map((b) => ({
    ...b,
    id: String(b.id),
  }));
}

export async function updateBranch(
  branchId: string,
  data: Partial<{
    name: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    timezone: string;
    specialization: string;
    requestFrequencyDays: number;
    complaintEmails: string[];
    reminderEmails: string[];
  }>
): Promise<Branch> {
  const res = await apiFetch<{
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    timezone: string;
    specialization: string;
    requestFrequencyDays: number;
    complaintEmails: string[];
    reminderEmails: string[];
    avgRating: number;
    npsScore: number;
  }>(`/branches/${branchId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return {
    ...res,
    id: String(res.id),
  };
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export type Period = "week" | "30" | "90" | "year";

export async function getAnalytics(
  branchId: string,
  period: Period = "30"
): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>(`/analytics/${branchId}?period=${period}`);
}

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
    rating: number;
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
  npsSmall: Array<{ index: number; nps: number }>;
  npsLarge: Array<{ index: number; nps: number }>;
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

export async function getDashboard(
  branchId: string,
  period: Period = "30"
): Promise<DashboardData> {
  return apiFetch<DashboardData>(
    `/analytics/${branchId}/dashboard?period=${period}`
  );
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

export async function getBranchesAnalytics(
  period: Period = "30"
): Promise<BranchAnalyticsRow[]> {
  const data = await apiFetch<{ rows: BranchAnalyticsRow[] }>(
    `/analytics/branches?period=${period}`
  );
  return data.rows;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

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
  const q = new URLSearchParams({ branchId: params.branchId });
  if (params.platform) q.set("platform", params.platform);
  if (params.ratingMin !== undefined)
    q.set("ratingMin", String(params.ratingMin));
  if (params.ratingMax !== undefined)
    q.set("ratingMax", String(params.ratingMax));
  if (params.period) q.set("period", params.period);
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.offset !== undefined) q.set("offset", String(params.offset));
  return apiFetch(`/reviews?${q.toString()}`);
}

// ─── Complaints ──────────────────────────────────────────────────────────────

export interface Complaint {
  id: number;
  branchId: number;
  branchName: string | null;
  clientName: string | null;
  clientPhone: string | null;
  rating: number;
  text: string;
  intercepted: boolean;
  resolved: boolean;
  createdAt: string;
}

export async function getComplaints(params: {
  branchId: string;
  resolved?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ complaints: Complaint[]; total: number }> {
  const q = new URLSearchParams({ branchId: params.branchId });
  if (params.resolved !== undefined) q.set("resolved", String(params.resolved));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.offset !== undefined) q.set("offset", String(params.offset));
  return apiFetch(`/complaints?${q.toString()}`);
}

export async function resolveComplaint(
  complaintId: number,
  resolved: boolean
): Promise<Complaint> {
  return apiFetch(`/complaints/${complaintId}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved }),
  });
}

// ─── Requests ────────────────────────────────────────────────────────────────

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
}

export async function getRequests(params: {
  branchId: string;
  status?: RequestStatus;
  limit?: number;
  offset?: number;
}): Promise<{ requests: ReviewRequest[]; total: number }> {
  const q = new URLSearchParams({ branchId: params.branchId });
  if (params.status) q.set("status", params.status);
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  if (params.offset !== undefined) q.set("offset", String(params.offset));
  return apiFetch(`/requests?${q.toString()}`);
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
    body: JSON.stringify(data),
  });
}

// ─── Employees ───────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  branchId: number;
  name: string;
  active: boolean;
  profiles: string[];
}

export const employeesApi = {
  getAll: (branchId: string): Promise<Employee[]> =>
    apiFetch(`/employees?branch_id=${branchId}`),

  create: (
    branchId: string,
    data: { name: string; active: boolean; profiles: string[] }
  ): Promise<Employee> =>
    apiFetch(`/employees?branch_id=${branchId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: Partial<{ name: string; active: boolean; profiles: string[] }>
  ): Promise<Employee> =>
    apiFetch(`/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    apiFetch(`/employees/${id}`, { method: "DELETE" }),
};

// ─── Blacklist ───────────────────────────────────────────────────────────────

export interface BlacklistUser {
  id: number;
  branchId: number;
  lastName: string;
  firstName: string;
  phone: string;
  reason: string | null;
}

export const blacklistApi = {
  getAll: (branchId: string): Promise<BlacklistUser[]> =>
    apiFetch(`/blacklist?branch_id=${branchId}`),

  create: (
    branchId: string,
    data: {
      lastName: string;
      firstName: string;
      phone: string;
      reason?: string;
    }
  ): Promise<BlacklistUser> =>
    apiFetch(`/blacklist?branch_id=${branchId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: number,
    data: Partial<{
      lastName: string;
      firstName: string;
      phone: string;
      reason: string | null;
    }>
  ): Promise<BlacklistUser> =>
    apiFetch(`/blacklist/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    apiFetch(`/blacklist/${id}`, { method: "DELETE" }),
};
