"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Карточка */}
      <div className="auth-card">
        <form className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white"
          />

          {/* Кнопка */}
          <button
            type="submit"
            className="h-11 w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90"
          >
            Восстановить пароль
          </button>
        </form>
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
