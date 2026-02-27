"use client";

import Link from "next/link";
import { useState } from "react";
import { authApi } from "../../lib/api";

type State = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<State>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      await authApi.forgotPassword(username);
      setState("success"); // Бэкенд всегда возвращает 200 OK
    } catch {
      setState("error");
    }
  };

  return (
    <>
      {/* Карточка */}
      <div className="auth-card">
        {state === "success" ? (
          <p className="text-sm text-gray-600">
            Если такой пользователь существует — инструкции отправлены.
          </p>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email / логин */}
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white"
            />

            {state === "error" && (
              <p className="text-sm text-red-500">
                Что-то пошло не так. Попробуйте ещё раз.
              </p>
            )}

            {/* Кнопка */}
            <button
              type="submit"
              disabled={state === "loading"}
              className="h-11 w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90 disabled:opacity-60"
            >
              {state === "loading" ? "Отправка..." : "Восстановить пароль"}
            </button>
          </form>
        )}
      </div>

      {/* Ссылка ниже */}
      <div className="mt-6 text-center">
        <Link
          href="#"
          className="text-[12px] text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
        >
          Написать в техподдержку
        </Link>
      </div>
    </>
  );
}
