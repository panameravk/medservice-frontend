"use client";

import Link from "next/link";
import Image from "next/image";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      {/* Карточка */}
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-md">
        <form className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none focus:bg-white"
          />

          {/* Кнопка */}
          <button
            type="submit"
            className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Восстановить пароль
          </button>
        </form>
      </div>

      {/* Ссылка ниже */}
      <div className="mt-6 text-center">
        <a
          href="#"
          className="text-sm text-gray-400 underline hover:text-gray-600"
        >
          Написать в техподдержку
        </a>
      </div>
    </AuthLayout>
  );
}
