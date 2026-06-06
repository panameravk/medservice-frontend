// src/app/(auth)/layout.tsx
import Image from "next/image";
import { ReactNode } from "react";
import { Roboto_Flex } from "next/font/google";
import { Brand } from "../components/Brand";
import { Footer } from "../components/Footer";
import { PageTransition } from "../components/PageTransition";

const robotoFlex = Roboto_Flex({
  subsets: ["cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${robotoFlex.className} min-h-screen bg-[rgba(242,243,244,1)]`}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Левая часть */}
        <section className="flex min-h-screen flex-col px-6">
          {/* Лого */}
          <div className="pt-[220px] text-center">
            <div className="flex justify-center">
              <Brand size="md" />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Сервис сбора обратной связи <br />
              от клиентов/пациентов
            </p>
          </div>

          {/* Контент */}
          <div className="flex flex-1 items-start justify-center pt-10">
            <div className="w-full max-w-[420px]">
              <PageTransition>{children}</PageTransition>
            </div>
          </div>

          <Footer className="mt-auto" />
        </section>

        {/* Правая часть */}
        <section className="relative hidden lg:block">
          <Image
            src="/images/enter-picture.svg"
            alt="Иллюстрация входа"
            fill
            className="object-cover"
            priority
          />
        </section>
      </div>
    </main>
  );
}
