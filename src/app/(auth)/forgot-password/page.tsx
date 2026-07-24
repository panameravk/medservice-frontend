"use client";

import { useState } from "react";
import { ApiError, authApi } from "../../lib/api";

type ViewState = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedUsername = username.trim();
    setError(null);

    if (!normalizedUsername) {
      setError("Введите логин учётной записи.");
      setState("error");
      return;
    }

    setState("loading");

    try {
      await authApi.forgotPassword(normalizedUsername);
      setState("success");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Что-то пошло не так. Попробуйте ещё раз.");
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
              Если учётная запись с указанным логином существует, ссылка для
              восстановления отправлена на email из её профиля.
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <p className="text-[13px] leading-5 text-[#9CA3AF]">
              Введите логин учётной записи. Ссылку для восстановления отправим
              на email, указанный в её профиле.
            </p>
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
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
              {state === "loading" ? "Отправка..." : "Восстановить пароль"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 text-center">
        <a
          href="/login"
          className="text-[12px] text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
        >
          Вернуться ко входу
        </a>
      </div>
    </>
  );
}
