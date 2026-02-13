"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBranchesStore } from "../lib/branchesStore";
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
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = refs.some((r) => r.current && r.current.contains(target));
      if (!inside) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [refs, onOutside]);
}

export function Header() {
  const branches = useBranchesStore((s) => s.branches);
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const selectBranch = useBranchesStore((s) => s.selectBranch);

  const selectedBranch = useMemo(() => {
    if (!branches.length) return null;
    return branches.find((b) => b.id === selectedBranchId) ?? branches[0];
  }, [branches, selectedBranchId]);

  const [branchOpen, setBranchOpen] = useState(false);
  const branchBtnRef = useRef<HTMLButtonElement>(null);
  const branchPopRef = useRef<HTMLDivElement>(null);

  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userPopRef = useRef<HTMLDivElement>(null);

  useOutsideClick([branchBtnRef, branchPopRef], () => setBranchOpen(false));
  useOutsideClick([userBtnRef, userPopRef], () => setUserOpen(false));

  return (
    <div className="px-6 pt-4">
      <div className="flex items-center justify-between gap-6">
        {/* Branch select */}
        <div className="relative w-full max-w-[720px]">
          <button
            ref={branchBtnRef}
            type="button"
            onClick={() => setBranchOpen((v) => !v)}
            className={[
              "w-full h-12",
              "rounded-[12px] bg-white border border-[#E5E7EB]",
              "px-4 flex items-center justify-between",
              "text-[14px] text-[#111827]",
              "shadow-[0_1px_0_rgba(0,0,0,0.02)]",
            ].join(" ")}
          >
            <span className="truncate pr-3">
              {selectedBranch?.name ?? "Выберите филиал"}
            </span>

            <ChevronDown
              className={[
                "shrink-0 text-[#6B7280] transition-transform",
                branchOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {branchOpen && branches.length > 0 && (
            <div
              ref={branchPopRef}
              className={[
                "absolute left-0 top-[56px] w-[520px]",
                "rounded-[12px] bg-white border border-[#E5E7EB]",
                "shadow-[0_12px_30px_rgba(17,24,39,0.14)]",
                "p-2",
                "z-30",
              ].join(" ")}
            >
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    selectBranch(b.id);
                    setBranchOpen(false);
                  }}
                  className={[
                    "w-full text-left",
                    "px-3 py-2 rounded-[10px]",
                    "text-[14px] text-[#111827]",
                    "hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User button (пока без меню) */}
        <div className="relative">
          <button
            ref={userBtnRef}
            type="button"
            onClick={() => setUserOpen((v) => !v)}
            className="h-12 w-[220px] rounded-[10px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
          >
            Сергей П.
          </button>

          {userOpen && (
            <div
              ref={userPopRef}
              className="absolute right-0 top-[56px] w-[280px] rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_18px_40px_rgba(17,24,39,0.18)] p-4 z-30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21a8 8 0 10-16 0"
                        stroke="#111827"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                        stroke="#111827"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <div className="text-[13px] font-semibold text-[#111827] leading-5">
                      Сергей Popov
                    </div>
                    <div className="text-[12px] text-[#9CA3AF] leading-4">
                      popov.s@yandex.ru
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUserOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
                >
                  ✕
                </button>
              </div>

              <button
                type="button"
                className="mt-4 w-full h-10 rounded-[10px] bg-[#F3F4F6] text-[#111827] text-[13px] font-medium flex items-center gap-3 px-3 hover:brightness-95"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-white border border-[#E5E7EB]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2v6h6"
                      stroke="#111827"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Настроить аккаунт
              </button>

              <button
                type="button"
                className="mt-3 w-full h-10 rounded-[10px] bg-[#2B2E39] text-white text-[13px] font-semibold shadow-[0_10px_24px_rgba(17,24,39,0.14)]"
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
