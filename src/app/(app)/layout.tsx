import type { ReactNode } from "react";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer"; // твой Footer (не меняем)

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[rgba(242,243,244,1)]">
      <div className="min-h-screen grid grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="bg-white border-r border-black/5">
          <Sidebar />
        </aside>

        {/* Right column */}
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="z-20 bg-[rgba(242,243,244,1)]">
            <Header />
          </header>

          {/* Page */}
          <div className="flex-1 px-6 py-6">{children}</div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </main>
  );
}
