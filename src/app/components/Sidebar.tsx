"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Unbounded } from "next/font/google";
import Image from "next/image";

const unbounded = Unbounded({
  subsets: ["cyrillic"],
  weight: ["600", "700", "800", "900"],
});

export function Sidebar() {
  const pathname = usePathname();

  const nav = [
    {
      href: "/analytics",
      label: "Аналитика",
      icon: "/Icons/analytics_sidebar.svg",
    },
    {
      href: "/reviews-and-requests",
      label: "Отзывы и запросы",
      icon: "/Icons/reviews-and-requests_sidebar.svg",
    },
    {
      href: "/settings",
      label: "Настройки",
      icon: "/Icons/settings_sidebar.svg",
    },
  ];

  return (
    <aside className="min-h-screen w-[260px] bg-white border-r border-black/5">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo */}
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
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-[10px] px-3 py-2 text-[16px] transition",
                  active
                    ? "bg-[#F3F4F6] font-bold text-[#111827]"
                    : "font-bold text-[#111827] hover:bg-black/5",
                ].join(" ")}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={18}
                  height={18}
                  className="shrink-0"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Center button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="h-10 w-[170px] rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90"
          >
            Запросить отзывы
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-auto px-2 pt-6 text-[11px] leading-4 text-[#6B7280]">
          Отправлено 0 запросов из 150 в этом месяце
        </div>
      </div>
    </aside>
  );
}
