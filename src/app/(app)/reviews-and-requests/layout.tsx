"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  {
    href: "/reviews-and-requests/published-reviews",
    label: "Опубликованные отзывы",
  },
  {
    href: "/reviews-and-requests/intercepted-complaints",
    label: "Перехваченные жалобы",
  },
  {
    href: "/reviews-and-requests/request-statuses",
    label: "Статусы запросов",
  },
];

export default function ReviewsAndRequestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[24px] font-bold leading-7 text-[#111827]">
          Отзывы и запросы
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Все отзывы, их статус и история
        </p>

        <div className="mt-4">
          <div className="flex items-center">
            {tabs.map((tab) => {
              const active = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "flex h-10 items-center justify-center px-5",
                    "border border-[#E5E7EB]",
                    "text-[13px] font-medium",
                    "first:ml-0 first:rounded-l-[12px] last:rounded-r-[12px]",
                    "-ml-[1px]",
                    active
                      ? "bg-white text-[#111827]"
                      : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#ECEFF3]",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-[520px] rounded-[12px] border border-[#E5E7EB] bg-white">
        {children}
      </div>
    </div>
  );
}
