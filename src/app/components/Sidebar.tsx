"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useBranchesStore } from "../lib/branchesStore";
import { getAnalytics } from "../lib/api";
import { Brand } from "./Brand";

const MONTHLY_LIMIT = 150;

const nav = [
  {
    href: "/analytics",
    label: "Аналитика",
    icon: "/Icons/analytics_logo.svg",
  },
  {
    href: "/reviews-and-requests",
    label: "Отзывы и запросы",
    icon: "/Icons/heart_logo.svg",
  },
  {
    href: "/bonuses",
    label: "Бонусы",
    icon: "/Icons/gift_base.svg",
  },
  {
    href: "/settings/branch",
    label: "Настройки",
    icon: "/Icons/settings_sidebar.svg",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [sent, setSent] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedBranchId) {
      setSent(null);
      return;
    }

    let cancelled = false;

    const loadUsage = async () => {
      try {
        const data = await getAnalytics(selectedBranchId, "30");
        if (!cancelled) {
          setSent(data.sent);
        }
      } catch {
        if (!cancelled) {
          setSent(null);
        }
      }
    };

    void loadUsage();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  return (
    <aside className="min-h-screen w-[260px] border-r border-black/5 bg-white">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="px-2">
          <Brand size="sm" />
        </div>

        <nav className="mt-6 space-y-1">
          {nav.map((item, i) => {
            const active =
              item.href === "/settings/branch"
                ? pathname === "/settings/branch" ||
                  pathname.startsWith("/settings/")
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${80 + i * 70}ms` }}
                className={[
                  "animate-item flex items-center gap-3 rounded-[10px] px-3 py-2 text-[16px] transition",
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

        <div className="mt-6 flex justify-center">
          <Link
            href="/request-feedback"
            className="flex h-10 w-[170px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90"
          >
            Запросить отзывы
          </Link>
        </div>

        <div className="mt-auto px-2 pt-6 text-[11px] leading-4 text-[#6B7280]">
          {selectedBranchId ? (
            sent !== null ? (
              <>
                Отправлено {sent} запросов из {MONTHLY_LIMIT} за последние 30
                дней
              </>
            ) : (
              "Загрузка..."
            )
          ) : (
            "Выберите филиал для просмотра статистики"
          )}
        </div>
      </div>
    </aside>
  );
}
