"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authApi, getAccessToken } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setChecking(false);
      return;
    }

    authApi
      .me()
      .then(() => {
        router.replace("/branches");
      })
      .catch(() => {
        setChecking(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.login(username, password);
      router.push("/branches");
    } catch (err: unknown) {
      setError((err as Error).message);
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
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white"
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-[170px] rounded-[10px] bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300 disabled:opacity-60"
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
