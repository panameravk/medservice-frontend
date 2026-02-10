"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter(); // ✅ добавляем здесь

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-md">
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Логин"
          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:bg-white"
        />

        <input
          type="password"
          placeholder="Пароль"
          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:bg-white"
        />

        <div className="flex items-center gap-4 pt-2">
          {/* Кнопка входа */}
          <button
            type="button"
            onClick={() => router.push("/branches")}
            className="w-[170px] rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Войти
          </button>

          <Link
            href="/forgot-password"
            className="text-sm text-gray-500 hover:underline"
          >
            Забыли пароль
          </Link>
        </div>
      </form>
    </div>
  );
}
