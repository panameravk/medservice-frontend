"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
    <aside className="flex min-h-screen flex-col bg-white px-[18px] py-[30px]">
      <Link href="/admin/branches" className="mb-[42px] block">
        <div className="text-[28px] font-black leading-none tracking-[-0.08em] text-[#111827]">
          Фидбэк
          <span className="ml-[4px] align-top text-[11px] font-black tracking-normal">
            ИИ
          </span>
        </div>
      </Link>

      <nav className="space-y-[14px]">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex h-[28px] items-center gap-[10px] rounded-[8px]",
                "text-[14px] font-semibold transition",
                active
                  ? "text-[#111827]"
                  : "text-[#1F2937] hover:text-[#111827]",
              ].join(" ")}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => router.push("/admin/branches?create=1")}
        className="mt-[54px] h-[44px] w-[166px] rounded-[7px] bg-black text-[14px] font-semibold text-white transition hover:bg-[#1F2937]"
      >
        Создать филиал
      </button>
    </aside>
  );
}
