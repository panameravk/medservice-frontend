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
    <div>
      <div className="mb-5">
        <h1 className="text-[24px] font-bold leading-7 text-[#111827]">
          Отзывы и запросы
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Все отзывы, их статус и история
        </p>
      </div>

      <div className="relative z-10 -mb-px inline-flex w-fit overflow-hidden rounded-t-[12px] border border-b-0 border-[#E6E6E6]">
        {tabs.map((tab, index) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "flex h-[52px] items-center justify-center px-8 text-center text-[14px] leading-[18px] transition",
                index !== tabs.length - 1 ? "border-r border-[#E6E6E6]" : "",
                active
                  ? "bg-white font-medium text-[#222222]"
                  : "border-b border-[#E6E6E6] bg-[#F7F7F7] font-normal text-[#3D3D3D] hover:bg-[#F2F2F2]",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="min-h-[520px] rounded-[14px] border border-[#E6E6E6] bg-white">
        {children}
      </div>
    </div>
  );
}
