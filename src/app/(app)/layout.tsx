import type { ReactNode } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";
import { AuthGuard } from "../components/AuthGuard";
import { ImpersonationBanner } from "../components/ImpersonationBanner";
import { PageTransition } from "../components/PageTransition";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-[rgba(242,243,244,1)]">
        <ImpersonationBanner />
        <div className="grid min-h-screen grid-cols-[260px_1fr]">
          <aside className="border-r border-black/5 bg-white">
            <Sidebar />
          </aside>

          <div className="flex min-h-screen flex-col">
            <header className="z-20 bg-[rgba(242,243,244,1)]">
              <Header />
            </header>

            <div className="flex-1 px-6 py-6">
              <PageTransition>{children}</PageTransition>
            </div>

            <Footer />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
