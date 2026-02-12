"use client";

import Link from "next/link";
import { Unbounded } from "next/font/google";

const unbounded = Unbounded({
  subsets: ["cyrillic"],
  weight: ["600", "700", "800", "900"],
});

export function Sidebar() {
  return (
    <aside className="min-h-screen w-[260px] bg-white border-r border-black/5">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo like branches */}
        <div className="flex items-start gap-1 px-2">
          <div
            className={`${unbounded.className} text-[28px] font-[600] tracking-[-0.02em] text-[#111827]`}
          >
            Фидбэк
          </div>
          <div
            className={`${unbounded.className} mt-[4px] text-[12px] italic font-[600] text-[#111827]`}
          >
            ИИ
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-6 space-y-1">
          <Link
            href="/analytics"
            className="flex items-center gap-2 rounded-[10px] px-3 py-2 font-bold text-[15px] text-[#111827] hover:bg-black/5"
          >
            Аналитика
          </Link>

          <Link
            href="/branches"
            className="flex items-center gap-2 rounded-[10px] px-3 py-2 font-bold text-[15px] text-[#111827] hover:bg-black/5"
          >
            Отзывы и запросы
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-[10px] px-3 py-2 font-semibold text-[15px] text-[#111827] hover:bg-black/5"
          >
            Настройки
          </Link>
        </nav>

        {/* Center button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="h-10 w-[180px] rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90"
          >
            Запросить отзывы
          </button>
        </div>

        {/* Footer info (optional) */}
        <div className="mt-auto px-2 pt-6 text-[11px] leading-4 text-[#6B7280]">
          Отправлено 0 запросов из 150 в этом месяце
        </div>
      </div>
    </aside>
  );
}
