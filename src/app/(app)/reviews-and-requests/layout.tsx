"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const tabs = [
  {
    href: "/reviews-and-requests/published-reviews",
    label: "Опубликованные отзывы",
  },
  {
    href: "/reviews-and-requests/intercepted-complaints",
    label: "Перехваченные жалобы",
  },
  { href: "/reviews-and-requests/request-statuses", label: "Статусы запросов" },
];

export default function ReviewsAndRequestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-[24px] font-bold text-[#111827] leading-7">
          Отзывы и запросы
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Все отзывы, их статус и история
        </p>

        {/* Tabs */}
        <div className="mt-4">
          <div className="flex items-center">
            {tabs.map((t) => {
              const active = pathname === t.href;

              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={[
                    "h-10 px-5 flex items-center justify-center",
                    "text-[13px] font-medium",
                    "border border-[#E5E7EB]",
                    "first:rounded-l-[12px] last:rounded-r-[12px]",
                    "-ml-[1px] first:ml-0",
                    active
                      ? "bg-white text-[#111827]"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#ECEFF3]",
                  ].join(" ")}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Card container like screenshot */}
      <div className="rounded-[12px] border border-[#E5E7EB] bg-white">
        {children}
      </div>
    </div>
  );
}
