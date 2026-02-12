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

  useOutsideClick([branchBtnRef, branchPopRef], () => setBranchOpen(false));

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
        <button
          type="button"
          className="h-12 w-[220px] rounded-[10px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
        >
          Сергей П.
        </button>
      </div>
    </div>
  );
}
