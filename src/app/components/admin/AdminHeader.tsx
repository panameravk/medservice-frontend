"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAccountApi } from "../../lib/admin/api";
import { adminAuthApi, authApi } from "../../lib/api";
import type { AdminAccount } from "../../types/admin";

export function AdminHeader() {
  const router = useRouter();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void adminAccountApi.getMe().then(setAccount).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleAccount = () => {
    setOpen(false);
    router.push("/admin/account");
  };

  const handleLogout = () => {
    adminAuthApi.logout();
    authApi.logout();
    router.push("/login");
  };

  const displayName = account?.fullName ?? account?.username ?? "Администратор";

  return (
    <div className="px-6 pt-5">
      <div className="relative">
        <div className="flex h-15 items-center rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[15px] text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          Администраторский аккаунт
        </div>

        <div
          ref={containerRef}
          className="absolute right-1.5 top-[6px]"
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="h-12 w-[220px] cursor-pointer rounded-[10px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)] transition hover:opacity-90"
          >
            {displayName}
          </button>

          {open && account && (
            <div className="absolute right-0 top-[56px] z-30 w-[280px] rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_40px_rgba(17,24,39,0.18)]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="absolute right-3 top-3 text-[#9CA3AF] transition hover:text-[#2B2E39]"
              >
                <CloseIcon />
              </button>

              <div className="flex items-center gap-3 pr-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#2B2E39]">
                  <AvatarIcon />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-[#111827]">
                    {account.fullName ?? account.username}
                  </div>
                  <div className="truncate text-[13px] text-[#6B7280]">
                    {account.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAccount}
                className="mt-4 flex h-[48px] w-full items-center gap-3 rounded-[10px] bg-[#F3F4F6] px-4 text-[14px] font-medium text-[#111827] transition hover:bg-[#E9EAEE]"
              >
                <SettingsIcon />
                Настроить аккаунт
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 h-[48px] w-full rounded-[10px] bg-[#2B2E39] text-[14px] font-semibold text-white transition hover:opacity-90"
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AvatarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="8" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M11 12h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M3 10c0-1 .8-2 2-2M21 10c0-1-.8-2-2-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
