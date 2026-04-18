"use client";

import { useEffect, type ReactNode } from "react";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminModal({
  children,
  onClose,
  widthClassName = "max-w-[450px]",
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  widthClassName?: string;
  title?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className={[
          "relative w-full rounded-[16px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.18)]",
          widthClassName,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          {title ? (
            <h2 className="text-[18px] font-semibold text-[#111827]">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[#A3A3A3] transition hover:bg-[#F3F4F6] hover:text-[#222222]"
            aria-label="Закрыть"
          >
            <XIcon />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
