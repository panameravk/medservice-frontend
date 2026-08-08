"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminGuard } from "../components/AdminGuard";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSideBar } from "../components/admin/AdminSideBar";
import { PageTransition } from "../components/PageTransition";
import { LEGAL_LINKS } from "../lib/legal";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute =
    pathname === "/admin/login" || pathname?.startsWith("/admin/login/");

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[rgba(242,243,244,1)] text-[#111827]">
        <div className="grid min-h-screen grid-cols-[268px_1fr]">
          <AdminSideBar />

          <div className="flex min-h-screen min-w-0 flex-col">
            <header className="z-20 bg-[rgba(242,243,244,1)]">
              <AdminHeader />
            </header>

            <main className="flex-1 px-6 py-6">
              <PageTransition>{children}</PageTransition>
            </main>

            <footer className="pb-6">
              <div className="px-7">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] leading-[16px]">
                  <span className="text-[14px] font-semibold text-[#111827]">
                  Все права защищены © ООО «Фидбэк»
                  </span>

                  <a
                    href={LEGAL_LINKS.userAgreement.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
                  >
                    {LEGAL_LINKS.userAgreement.label}
                  </a>

                  <a
                    href={LEGAL_LINKS.cookiePolicy.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
                  >
                    {LEGAL_LINKS.cookiePolicy.label}
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
