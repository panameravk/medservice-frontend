"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Roboto_Flex } from "next/font/google";
import { ApiError, adminAuthApi, getAccessToken } from "../../lib/api";
import { Brand } from "../../components/Brand";
import { Footer } from "../../components/Footer";

const robotoFlex = Roboto_Flex({
  subsets: ["cyrillic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const ADMIN_HOME = "/admin/branches";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const token = getAccessToken("admin");

      if (!token) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const user = await adminAuthApi.me();
        if (cancelled) return;

        if (user.isSuperuser) {
          router.replace(ADMIN_HOME);
          return;
        }

        adminAuthApi.logout();
        setChecking(false);
      } catch {
        if (cancelled) return;
        adminAuthApi.logout();
        setChecking(false);
      }
    };

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminAuthApi.login(username.trim(), password);
      router.replace(ADMIN_HOME);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Не удалось выполнить вход");
      }
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main
        className={`${robotoFlex.className} flex min-h-screen items-center justify-center bg-[rgba(242,243,244,1)] text-sm text-[#6B7280]`}
      >
        Проверка авторизации...
      </main>
    );
  }

  return (
    <main
      className={`${robotoFlex.className} min-h-screen bg-[rgba(242,243,244,1)]`}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <section className="flex min-h-screen flex-col px-6">
          <div className="pt-[220px] text-center">
            <div className="flex justify-center">
              <Brand size="md" />
            </div>
            <p className="mt-3 text-sm text-gray-500">Панель администратора</p>
          </div>

          <div className="flex flex-1 items-start justify-center pt-10">
            <div className="w-full max-w-[420px]">
              <div className="auth-card">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Логин администратора"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    required
                    disabled={loading}
                    className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[10px] bg-yellow-400 py-3 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Вход..." : "Войти как администратор"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <Footer className="mt-auto" />
        </section>

        <section className="relative hidden lg:block">
          <Image
            src="/images/clinic.jpg"
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
