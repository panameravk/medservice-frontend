import { ApiError, apiFetch, clearTokens, setTokens } from "./client";
import { clearImpersonation } from "../impersonation";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  isActive: boolean;
  isSuperuser: boolean;
}

export interface UpdateMePayload {
  fullName?: string | null;
  phone?: string | null;
  role?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { username, password },
    });

    if (!data.accessToken) {
      throw new ApiError("Некорректный ответ сервера", 500, data);
    }

    setTokens(data.accessToken, "user");
    // Свежий логин — это всегда собственная сессия, а не просмотр чужого аккаунта.
    clearImpersonation();

    // A superuser logging in from the regular page also gets admin access
    // (so they can open /admin/* without a separate /admin/login).
    if (data.user.isSuperuser) {
      setTokens(data.accessToken, "admin");
    } else {
      clearTokens("admin");
    }

    return data;
  },

  me: () => apiFetch<AuthUser>("/auth/me", { session: "user" }),

  // Профиль общий с админкой («Доступы» читают ту же запись users) —
  // сохранённое здесь сразу видно там.
  updateMe: (payload: UpdateMePayload) => {
    const body: Record<string, unknown> = {};
    if ("fullName" in payload) body.full_name = payload.fullName;
    if ("phone" in payload) body.phone = payload.phone;
    if ("role" in payload) body.role = payload.role;

    return apiFetch<AuthUser>("/auth/me", {
      method: "PATCH",
      session: "user",
      body,
    });
  },

  logout: () => {
    // Clear BOTH sessions: a superuser who logged in here also has the admin
    // token set (see login above), and leaving it behind would keep /admin/*
    // reachable after "logout" on a shared machine.
    clearTokens("user");
    clearTokens("admin");
    clearImpersonation();
  },

  forgotPassword: (username: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { username },
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      auth: false,
      body: { token, password },
    }),
};

export const adminAuthApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { username, password },
    });

    if (!data.accessToken) {
      throw new ApiError("Некорректный ответ сервера", 500, data);
    }

    if (!data.user.isSuperuser) {
      throw new ApiError("Доступ только для администраторов", 403, data);
    }

    setTokens(data.accessToken, "admin");
    setTokens(data.accessToken, "user");
    clearImpersonation();
    return data;
  },

  me: () => apiFetch<AuthUser>("/auth/me", { session: "admin" }),

  logout: () => {
    clearTokens("admin");
  },
};
