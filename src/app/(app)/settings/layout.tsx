"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { label: "Филиал", href: "/settings/branch" },
  { label: "Сотрудники", href: "/settings/employees" },
  { label: "Уведомления", href: "/settings/notifications" },
  { label: "Доступы", href: "/settings/access" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-bold leading-[32px] text-black">
          Настройки
        </h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
          Все параметры филиала
        </p>
      </div>

      <div className="rounded-[14px] border border-[#E6E6E6] bg-white">
        <div className="overflow-hidden rounded-t-[14px]">
          <div className="grid grid-cols-4 border-b border-[#E6E6E6] bg-[#F7F7F7]">
          {tabs.map((tab, index) => {
            const active = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "flex h-[54px] items-center justify-center text-center text-[14px] leading-[18px] transition",
                  index !== tabs.length - 1 ? "border-r border-[#E6E6E6]" : "",
                  active
                    ? "bg-white font-medium text-[#222222]"
                    : "font-normal text-[#3D3D3D] hover:bg-[#F2F2F2]",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
          </div>
        </div>

        <div className="min-h-[550px] rounded-b-[14px] p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
