"use client";

import Image from "next/image";
import { UserIcon } from "../components/ui/icons/UserIcon";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBranchesStore } from "../lib/branchesStore";
import { authApi } from "../lib/api";
import { useRouter } from "next/navigation";

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useOutsideClick(
  refs: Array<React.RefObject<HTMLElement | null>>,
  onOutside: () => void
) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside = refs.some(
        (ref) => ref.current && ref.current.contains(target)
      );

      if (!inside) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside, refs]);
}

export function Header() {
  const router = useRouter();

  const branches = useBranchesStore((s) => s.branches);
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const selectBranch = useBranchesStore((s) => s.selectBranch);
  const fetchBranches = useBranchesStore((s) => s.fetchBranches);
  const resetBranchesStore = useBranchesStore((s) => s.reset);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const [userName, setUserName] = useState("...");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const user = await authApi.me();

        if (cancelled) return;

        setUserName(user.fullName || user.username);
        setUserEmail(user.email);
      } catch {
        if (cancelled) return;
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedBranch = useMemo(() => {
    if (!branches.length) return null;
    return (
      branches.find((branch) => branch.id === selectedBranchId) ?? branches[0]
    );
  }, [branches, selectedBranchId]);

  const [branchOpen, setBranchOpen] = useState(false);
  const branchBtnRef = useRef<HTMLButtonElement>(null);
  const branchPopRef = useRef<HTMLDivElement>(null);

  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userPopRef = useRef<HTMLDivElement>(null);

  const closeBranchMenu = useCallback(() => setBranchOpen(false), []);
  const closeUserMenu = useCallback(() => setUserOpen(false), []);

  useOutsideClick([branchBtnRef, branchPopRef], closeBranchMenu);
  useOutsideClick([userBtnRef, userPopRef], closeUserMenu);

  const handleLogout = () => {
    setUserOpen(false);
    authApi.logout();
    resetBranchesStore();
    router.replace("/login");
  };

  return (
    <div className="px-6 pt-5">
      <div className="relative">
        <div className="relative w-full min-w-0 pr-[0px]">
          <button
            ref={branchBtnRef}
            type="button"
            onClick={() => setBranchOpen((open) => !open)}
            className={[
              "flex h-15 w-full items-center justify-between px-4",
              "rounded-[12px] border border-[#E5E7EB] bg-white",
              "text-[15px] text-[#111827]",
              "shadow-[0_1px_0_rgba(0,0,0,0.02)]",
            ].join(" ")}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate">
                {selectedBranch?.name ?? "Выберите филиал"}
              </span>

              <ChevronDown
                className={[
                  "shrink-0 text-[#6B7280] transition-transform",
                  branchOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </div>
          </button>

          {branchOpen && branches.length > 0 && (
            <div
              ref={branchPopRef}
              className={[
                "absolute left-0 top-[64px] z-30 w-[520px]",
                "rounded-[12px] border border-[#E5E7EB] bg-white p-2",
                "shadow-[0_12px_30px_rgba(17,24,39,0.14)]",
              ].join(" ")}
            >
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => {
                    selectBranch(branch.id);
                    setBranchOpen(false);
                  }}
                  className={[
                    "w-full rounded-[10px] px-3 py-2 text-left",
                    "text-[14px] text-[#111827]",
                    "hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  {branch.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="absolute right-1.5 top-[6px] z-10">
          <button
            ref={userBtnRef}
            type="button"
            onClick={() => setUserOpen((open) => !open)}
            className="h-12 w-[220px] cursor-pointer rounded-[10px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
          >
            {userName}
          </button>

          {userOpen && (
            <div
              ref={userPopRef}
              className="absolute right-0 top-[56px] z-30 w-[280px] rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_40px_rgba(17,24,39,0.18)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex w-10 justify-center">
                    <UserIcon className="ml-[9px] h-8 w-8 text-[#111827]" />
                  </div>

                  <div>
                    <div className="text-[14px] leading-5 text-[#111827]">
                      {userName}
                    </div>
                    <div className="text-[12px] leading-4 text-[#9CA3AF]">
                      {userEmail}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUserOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
                >
                  ✕
                </button>
              </div>

              <button
                type="button"
                className="mt-4 flex h-10 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-[14px] text-[#000000] transition hover:bg-[#F3F4F6]"
              >
                <Image
                  src="/icons/setup-account_logo.svg"
                  alt="Настроить аккаунт"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                Настроить аккаунт
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 h-10 w-full cursor-pointer rounded-[10px] bg-[#2B2E39] text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.14)] transition hover:opacity-90"
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
