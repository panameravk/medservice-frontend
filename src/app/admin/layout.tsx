"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminGuard } from "../components/AdminGuard";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSideBar } from "../components/admin/AdminSideBar";
import { PageTransition } from "../components/PageTransition";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute =
    pathname === "/admin/login" || pathname?.startsWith("/admin/login/");

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F2F3F5] text-[#111827]">
        <div className="grid min-h-screen grid-cols-[210px_1fr]">
          <AdminSideBar />

          <div className="flex min-w-0 flex-col">
            <AdminHeader />

            <main className="flex-1 px-[18px] pt-[22px]">
              <PageTransition>{children}</PageTransition>
            </main>

            <footer className="px-[18px] pb-[12px] pt-[12px]">
              <div className="flex items-center gap-[28px] text-[11px] leading-none">
                <span className="font-semibold text-[#111827]">
                  Все права защищены © ООО «Фидбэк»
                </span>

                <a
                  href="https://fdbck.ru/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9CA3AF] underline decoration-dotted underline-offset-4"
                >
                  Пользовательское соглашение
                </a>

                <a
                  href="https://fdbck.ru/cookie-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9CA3AF] underline decoration-dotted underline-offset-4"
                >
                  Политика использования файлов Cookie
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
