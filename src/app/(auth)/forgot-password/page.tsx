"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Карточка */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0_8px_24px_rgba(17,24,39,0.08)]">
        <form className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] px-4 text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:bg-white"
          />

          {/* Кнопка */}
          <button
            type="submit"
            className="h-11 w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] hover:brightness-95 active:brightness-90"
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
