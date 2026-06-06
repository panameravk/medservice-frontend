"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "../components/Footer";
import { AdminGuard } from "../components/AdminGuard";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSidebar } from "../components/admin/AdminSideBar";
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
      <main className="min-h-screen bg-[rgba(242,243,244,1)]">
        <div className="grid min-h-screen grid-cols-[232px_1fr]">
          <aside className="border-r border-black/5 bg-white">
            <AdminSidebar />
          </aside>

          <div className="flex min-h-screen flex-col">
            <header className="z-20 bg-[rgba(242,243,244,1)]">
              <AdminHeader />
            </header>

            <div className="flex-1 px-5 py-5">
              <PageTransition>{children}</PageTransition>
            </div>

            <Footer />
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
