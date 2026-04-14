import { ApiError, apiFetch, clearTokens, setTokens } from "./client";

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
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { username, password },
    });

    if (!data.accessToken) {
      throw new ApiError("Некорректный ответ сервера", 500, data);
    }

    setTokens(data.accessToken);
    return data;
  },

  me: () => apiFetch<AuthUser>("/auth/me"),

  logout: () => {
    clearTokens();
  },

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { email },
    }),
};
