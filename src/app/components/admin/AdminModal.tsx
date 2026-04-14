"use client";

import type { ReactNode } from "react";

export function AdminModal({
  children,
  onClose,
  widthClassName = "max-w-[450px]",
}: {
  children: ReactNode;
  onClose: () => void;
  widthClassName?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/10 px-4">
      <div
        className={[
          "w-full rounded-[16px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.18)]",
          widthClassName,
        ].join(" ")}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="sr-only"
        aria-label="Закрыть"
      />
    </div>
  );
}
