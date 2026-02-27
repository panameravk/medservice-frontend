"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const TABS = [
  { label: "Филиал", href: "/settings/branch" },
  { label: "Сотрудники", href: "/settings/employees" },
  { label: "Уведомления", href: "/settings/notifications" },
  { label: "Рассылки", href: "/settings/mailings" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-[24px] font-bold text-[#111827] leading-7">
          Настройки
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">Все параметры филиала</p>
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
        <div className="grid grid-cols-4 divide-x divide-[#E5E7EB] border-b border-[#E5E7EB]">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "py-4 text-center text-[14px] transition",
                  active
                    ? "bg-white font-semibold text-[#111827]"
                    : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F3F4F6]",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
