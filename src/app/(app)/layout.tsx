import type { ReactNode } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";
import { AuthGuard } from "../components/AuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-[rgba(242,243,244,1)]">
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
          <aside className="bg-white border-r border-black/5">
            <Sidebar />
          </aside>

          <div className="min-h-screen flex flex-col">
            <header className="z-20 bg-[rgba(242,243,244,1)]">
              <Header />
            </header>

            <div className="flex-1 px-6 py-6">{children}</div>
            <Footer />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
