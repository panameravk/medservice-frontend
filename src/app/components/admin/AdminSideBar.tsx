"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "../Brand";

const nav = [
  { href: "/admin/branches", label: "Филиалы", icon: "building" },
  { href: "/admin/bonuses", label: "Бонусы", icon: "gift" },
  { href: "/admin/faq", label: "FAQ", icon: "help" },
  { href: "/admin/access", label: "Доступы", icon: "settings" },
];

function NavIcon({
  type,
}: {
  type: "building" | "gift" | "settings" | "help";
}) {
  if (type === "building") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18" stroke="currentColor" strokeWidth="2" />
        <path
          d="M5 21V7l7-4 7 4v14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "help") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 2.5V14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (type === "gift") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 12v8H4v-8" stroke="currentColor" strokeWidth="2" />
        <path d="M2 7h20v5H2z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 22V7" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 7H8.5A2.5 2.5 0 1 1 12 3.5V7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 7h3.5A2.5 2.5 0 1 0 12 3.5V7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01A1.65 1.65 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="min-h-screen w-[232px] border-r border-black/5 bg-white">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="px-1">
          <Brand size="sm" />
        </div>

        <nav className="mt-12 space-y-3">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-[10px] px-1 py-1 text-[16px] transition",
                  active
                    ? "font-bold text-[#111827]"
                    : "font-bold text-[#111827] hover:opacity-70",
                ].join(" ")}
              >
                <span className="text-[#202330]">
                  <NavIcon
                    type={
                      item.icon as "building" | "gift" | "settings" | "help"
                    }
                  />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-14">
          <button
            type="button"
            onClick={() => router.push("/admin/branches?create=1")}
            className="flex h-[48px] w-[182px] items-center justify-center rounded-[10px] bg-black text-[14px] font-semibold text-white transition hover:opacity-90"
          >
            Создать филиал
          </button>
        </div>
      </div>
    </aside>
  );
}
