import Image from "next/image";
import { ReactNode } from "react";
import { Unbounded, Roboto_Flex } from "next/font/google";

const unbounded = Unbounded({
  subsets: ["cyrillic"],
  weight: ["600", "700", "800", "900"],
});

const robotoFlex = Roboto_Flex({
  subsets: ["cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className={`${robotoFlex.className} min-h-screen bg-white`}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Левая часть */}
        <section className="flex min-h-screen flex-col px-6">
          {/* Лого — не прыгает */}
          <div className="pt-[120px] text-center">
            <h1 className="flex items-start justify-center gap-[2px]">
              <span
                className={`${unbounded.className} text-[42px] font-[900] tracking-[-0.01em] text-[#111827]`}
              >
                Фидбэк
              </span>
              <span
                className={`${unbounded.className} mt-[9px] text-[15px] italic font-[600] text-[#111827]`}
              >
                ИИ
              </span>
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Сервис сбора обратной связи <br />
              от клиентов/пациентов
            </p>
          </div>

          {/* Контент страницы */}
          <div className="flex flex-1 items-start justify-center pt-10">
            <div className="w-full max-w-[420px]">{children}</div>
          </div>

          {/* Футер */}
          <footer className="mt-auto pb-6">
            <div className="mx-auto w-full max-w-[520px]">
              <div className="flex items-center gap-6 text-[12px] leading-[14px]">
                <span className="font-semibold text-[#111827]">
                  Все права защищены © ООО «Фидбэк»
                </span>
                <a
                  href="#"
                  className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
                >
                  Лицензия
                </a>
                <a
                  href="#"
                  className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
                >
                  Политика конфиденциальности
                </a>
              </div>
            </div>
          </footer>
        </section>

        {/* Правая часть */}
        <section className="relative hidden lg:block">
          <Image
            src="/images/login-hero.png"
            alt="Clinic background"
            fill
            className="object-cover"
            priority
          />
        </section>
      </div>
    </main>
  );
}
