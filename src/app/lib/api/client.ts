const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_BASE = `${API_URL}/api/v1`;

type Primitive = string | number | boolean | null | undefined;
type QueryValue = Primitive | Primitive[];

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem("access_token");
}

function buildAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 24) {
  const secure =
    isBrowser() && window.location.protocol === "https:" ? "; secure" : "";
  return `token=${token}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`;
}

export function setTokens(access: string) {
  if (!isBrowser()) return;
  localStorage.setItem("access_token", access);
  document.cookie = buildAuthCookie(access);
}

export function clearTokens() {
  if (!isBrowser()) return;
  localStorage.removeItem("access_token");
  document.cookie =
    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
}

type ValidationDetailItem = {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractApiErrorMessage(payload: unknown, fallback = "API Error") {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (!isRecord(payload)) {
    return fallback;
  }

  const detail = payload.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!isRecord(item)) return null;

        const typed = item as ValidationDetailItem;
        if (typeof typed.msg === "string" && typed.msg.trim()) {
          return typed.msg;
        }

        return null;
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join("; ");
    }
  }

  return fallback;
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

export function buildQuery(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = true, headers, body, ...rest } = options;
  const token = auth ? getAccessToken() : null;
  const url = `${API_BASE}${path}`;

  const finalHeaders = new Headers(headers ?? {});
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData && body !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
        ? (body as BodyInit)
        : JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  let payload: unknown = null;

  try {
    if (response.status !== 204) {
      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }
    }
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    clearTokens();
    throw new ApiError(
      extractApiErrorMessage(payload, "Unauthorized"),
      401,
      payload
    );
  }

  if (!response.ok) {
    throw new ApiError(
      extractApiErrorMessage(payload, response.statusText || "API Error"),
      response.status,
      payload
    );
  }

  return payload as T;
}
