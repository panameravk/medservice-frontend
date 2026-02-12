"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="auth-card">
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Логин"
          className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white"
        />

        <input
          type="password"
          placeholder="Пароль"
          className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:bg-white"
        />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/branches")}
            className="w-[170px] rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Войти
          </button>

          <Link
            href="/forgot-password"
            className="text-sm text-[#9CA3AF] hover:text-[#6B7280]"
          >
            Забыли пароль
          </Link>
        </div>
      </form>
    </div>
  );
}
