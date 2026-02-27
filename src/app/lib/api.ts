// lib/api.ts
import type { AnalyticsData } from "../types/analytics";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setTokens(access: string) {
  localStorage.setItem("access_token", access);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
}

// ─── Base fetch (JWT автоматически подставляется) ─────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API Error");
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  // POST /api/v1/auth/login
  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Ошибка входа" }));
      throw new Error(err.detail || "Неверный логин или пароль");
    }
    const data = await res.json();
    setTokens(data.access_token);
    return data;
  },

  // GET /api/v1/auth/me
  me: () =>
    apiFetch<{ id: number; username: string; isSuperuser: boolean }>(
      "/auth/me"
    ),

  logout: () => clearTokens(),

  // POST /api/v1/auth/forgot-password
  forgotPassword: (username: string) =>
    apiFetch<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ username }),
    }),
};

// ─── Branches ─────────────────────────────────────────────────────────────────

export interface BranchOption {
  id: string;
  name: string;
}

// GET /api/v1/branches → { branches: [...], total: number }
export async function getBranches(): Promise<BranchOption[]> {
  const data = await apiFetch<{
    branches: { id: number; name: string }[];
    total: number;
  }>("/branches");
  return data.branches.map((b) => ({ id: String(b.id), name: b.name }));
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type Period = "week" | "30" | "90" | "year";

// GET /api/v1/analytics/{branchId}?period=week|30|90|year
// Бэкенд уже возвращает { sent, reviews, complaints, avgRating } — точное совпадение с AnalyticsData
export async function getAnalytics(
  branchId: string,
  period: Period = "30"
): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>(`/analytics/${branchId}?period=${period}`);
}

export interface BranchAnalyticsRow {
  id: number;
  name: string;
  requests: number;
  newReviews: number;
  interceptedComplaints: number;
  avgRating: number | null;
  nps: number | null;
}

// GET /api/v1/analytics/branches?period=week|30|90|year
export async function getBranchesAnalytics(
  period: Period = "30"
): Promise<BranchAnalyticsRow[]> {
  const data = await apiFetch<{ rows: BranchAnalyticsRow[] }>(
    `/analytics/branches?period=${period}`
  );
  return data.rows;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  platform: string;
  rating: number;
  text: string;
  authorName: string;
  publishedAt: string;
}

// GET /api/v1/reviews?branchId=...&platform=...&ratingMin=...&ratingMax=...&period=...
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
  if (params.ratingMin) q.set("ratingMin", String(params.ratingMin));
  if (params.ratingMax) q.set("ratingMax", String(params.ratingMax));
  if (params.period) q.set("period", params.period);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));
  return apiFetch(`/reviews?${q}`);
}

// ─── Complaints ───────────────────────────────────────────────────────────────

export interface Complaint {
  id: number;
  text: string;
  authorName: string;
  createdAt: string;
  resolved: boolean;
}

// GET /api/v1/complaints?branchId=...&resolved=...
export async function getComplaints(params: {
  branchId: string;
  resolved?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ complaints: Complaint[]; total: number }> {
  const q = new URLSearchParams({ branchId: params.branchId });
  if (params.resolved !== undefined) q.set("resolved", String(params.resolved));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));
  return apiFetch(`/complaints?${q}`);
}

// PATCH /api/v1/complaints/{complaintId}
export async function resolveComplaint(
  complaintId: number,
  resolved: boolean
): Promise<Complaint> {
  return apiFetch(`/complaints/${complaintId}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved }),
  });
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export type RequestStatus =
  | "sent"
  | "opened"
  | "rated"
  | "visited"
  | "published"
  | "complaint";

export interface ReviewRequest {
  id: number;
  patientName: string;
  phone: string;
  sentAt: string;
  status: RequestStatus | null;
  reviewId: number | null;
  complaintId: number | null;
}

// GET /api/v1/requests?branchId=...&status=...
export async function getRequests(params: {
  branchId: string;
  status?: RequestStatus;
  limit?: number;
  offset?: number;
}): Promise<{ requests: ReviewRequest[]; total: number }> {
  const q = new URLSearchParams({ branchId: params.branchId });
  if (params.status) q.set("status", params.status);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.offset) q.set("offset", String(params.offset));
  return apiFetch(`/requests?${q}`);
}

// POST /api/v1/requests (требует superuser)
export async function createRequest(data: {
  branchId: string;
  patientName: string;
  phone: string;
}): Promise<{ id: number; requestLink: string }> {
  return apiFetch("/requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
