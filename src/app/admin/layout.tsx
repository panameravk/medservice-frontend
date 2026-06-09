import type { ReactNode } from "react";
<<<<<<< Updated upstream
import { Footer } from "../components/Footer";
=======
>>>>>>> Stashed changes
import { AdminHeader } from "../components/admin/AdminHeader";
import { AdminSideBar } from "../components/admin/AdminSideBar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
<<<<<<< Updated upstream
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
=======
    <div className="min-h-screen bg-[#F2F3F5] text-[#111827]">
      <div className="grid min-h-screen grid-cols-[210px_1fr]">
        <AdminSideBar />

        <div className="flex min-w-0 flex-col">
          <AdminHeader />

          <main className="flex-1 px-[18px] pt-[22px]">{children}</main>

          <footer className="px-[18px] pb-[12px] pt-[12px]">
            <div className="flex items-center gap-[28px] text-[11px] leading-none">
              <span className="font-semibold text-[#111827]">
                Все права защищены © ООО «Фидбэк»
              </span>

              <a
                href="#"
                className="text-[#9CA3AF] underline decoration-dotted underline-offset-4"
              >
                Лицензия
              </a>

              <a
                href="#"
                className="text-[#9CA3AF] underline decoration-dotted underline-offset-4"
              >
                Политика конфиденциальности
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
>>>>>>> Stashed changes
  );
}
