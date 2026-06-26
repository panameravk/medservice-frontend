"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "../Brand";

function BranchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 10.5 12 4l8 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v9h12v-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 19v-5h4v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BonusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="4"
        y="8"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 8v12M4 12h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8s-4.5 0-4.5-3A2 2 0 0 1 11 3c1 1.5 1 5 1 5Zm0 0s4.5 0 4.5-3A2 2 0 0 0 13 3c-1 1.5-1 5-1 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccessIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v4l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  {
    href: "/admin/branches",
    label: "Филиалы",
    icon: BranchIcon,
  },
  {
    href: "/admin/bonuses",
    label: "Бонусы",
    icon: BonusIcon,
  },
  {
    // Реальный роут — /admin/access (в его версии была опечатка /accesses → 404).
    href: "/admin/access",
    label: "Доступы",
    icon: AccessIcon,
  },
];

export function AdminSideBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="min-h-screen w-[260px] border-r border-black/5 bg-white">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="px-2">
          <Link href="/admin/branches" className="block">
            <Brand size="sm" />
          </Link>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-[10px] px-3 py-2 text-[16px] font-bold text-[#111827] transition",
                  active ? "bg-[#F3F4F6]" : "hover:bg-black/5",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/admin/branches?create=1")}
            className="flex h-10 w-[170px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90"
          >
            Создать филиал
          </button>
        </div>
      </div>
    </aside>
  );
}
