import type { ReactNode } from "react";
import { Footer } from "../components/Footer";
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSidebar } from "../components/admin/AdminSideBar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[rgba(242,243,244,1)]">
      <div className="grid min-h-screen grid-cols-[232px_1fr]">
        <aside className="border-r border-black/5 bg-white">
          <AdminSidebar />
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="z-20 bg-[rgba(242,243,244,1)]">
            <AdminHeader />
          </header>

          <div className="flex-1 px-5 py-5">{children}</div>

          <Footer />
        </div>
      </div>
    </main>
  );
}
