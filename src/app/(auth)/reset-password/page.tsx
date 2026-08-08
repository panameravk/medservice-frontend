"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ApiError, authApi } from "../../lib/api";

type ViewState = "idle" | "loading" | "success" | "error";

export default function ResetPasswordPage() {
  const tokenRef = useRef("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    // Prefer the fragment used by new emails. Query support keeps already-sent
    // reset links valid during deployment.
    const token = fragment.get("token") ?? params.get("token") ?? "";

    // Keep the token only in memory so it does not remain in browser history,
    // screenshots, the address bar, or subsequent Referer headers.
    if (token) {
      tokenRef.current = token;
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname
      );
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = tokenRef.current;

    if (!token) {
      setError("Ссылка восстановления недействительна.");
      setState("error");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен быть не короче 8 символов.");
      setState("error");
      return;
    }

    setError(null);
    setState("loading");

    try {
      await authApi.resetPassword(token, password);
      // The password changed, so discard any session left in this browser.
      authApi.logout();
      setState("success");
      setPassword("");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не удалось обновить пароль. Попробуйте запросить новую ссылку.");
      }

      setState("error");
    }
  };

  return (
    <>
      <div className="auth-card">
        {state === "success" ? (
          <div className="rounded-[12px] bg-[#DCFCE7] px-5 py-6">
            <p className="text-center text-[20px] font-medium leading-[30px] text-[#166534]">
              Пароль обновлён. Теперь можно войти с новым паролем.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Новый пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              disabled={state === "loading"}
              className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            />

            {state === "error" && error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="h-11 w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:bg-yellow-300 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "loading" ? "Сохранение..." : "Сохранить пароль"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-[12px] text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
        >
          Вернуться ко входу
        </Link>
      </div>
    </>
  );
}
