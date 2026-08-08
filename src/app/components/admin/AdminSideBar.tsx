"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Brand } from "../Brand";

const navItems = [
  {
    href: "/admin/branches",
    label: "Филиалы",
    icon: "/Icons/filials.svg",
  },
  {
    href: "/admin/bonuses",
    label: "Бонусы",
    icon: "/Icons/admin-bonuses.svg",
  },
  {
    // Реальный роут — /admin/access (в его версии была опечатка /accesses → 404).
    href: "/admin/access",
    label: "Доступы",
    icon: "/Icons/acesses.svg",
  },
];

export function AdminSideBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="min-h-screen w-[268px] border-r border-[#ECEDEF] bg-white">
      <div className="flex h-full flex-col px-7 pb-8 pt-[38px]">
        <div>
          <Link href="/admin/branches" className="block">
            <Brand size="sm" />
          </Link>
        </div>

        <nav className="mt-[42px] space-y-0.5">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex h-11 items-center gap-3 rounded-[9px] px-1.5 text-[16px] font-semibold text-[#262633] transition-colors",
                  active ? "bg-transparent" : "hover:bg-[#F5F5F6]",
                ].join(" ")}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] shrink-0 object-contain"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-10">
          <button
            type="button"
            onClick={() => router.push("/admin/branches?create=1")}
            className="flex h-14 w-full cursor-pointer items-center justify-center rounded-[10px] bg-black px-4 text-[16px] font-medium text-white transition hover:bg-[#262633] active:brightness-90"
          >
            Создать филиал
          </button>
        </div>
      </div>
    </aside>
  );
}
