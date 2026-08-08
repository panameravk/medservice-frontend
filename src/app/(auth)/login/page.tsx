"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, authApi, getAccessToken } from "../../lib/api";
import { useBranchesStore } from "../../lib/branchesStore";

export default function LoginPage() {
  const router = useRouter();
  const resetBranchesStore = useBranchesStore((s) => s.reset);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const token = getAccessToken();

      if (!token) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const me = await authApi.me();

        if (cancelled) return;
        router.replace(me.isSuperuser ? "/admin/branches" : "/branches");
      } catch {
        if (cancelled) return;

        authApi.logout();
        resetBranchesStore();
        setChecking(false);
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [resetBranchesStore, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const data = await authApi.login(username.trim(), password);
      router.replace(data.user.isSuperuser ? "/admin/branches" : "/branches");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не удалось выполнить вход");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="text-sm text-[#6B7280]">Проверка авторизации...</div>
    );
  }

  return (
    <div className="auth-card">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          disabled={loading}
          className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          disabled={loading}
          className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-[170px] rounded-[10px] bg-yellow-400 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Вход..." : "Войти"}
          </button>

          <Link
            href="/forgot-password"
            className="text-[14px] text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
          >
            Забыли пароль
          </Link>
        </div>
      </form>
    </div>
  );
}
