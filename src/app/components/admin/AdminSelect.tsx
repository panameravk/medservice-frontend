"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

export function AdminSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((item) => item.value === value) ?? options[0];

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[48px] w-full items-center justify-between rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-left text-[14px] text-[#222222] transition hover:bg-[#ECEEF1]"
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <svg
          className={open ? "rotate-180 transition" : "transition"}
          width="16"
          height="16"
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
      </button>

      {open && (
        <div className="absolute left-0 top-[54px] z-50 w-full overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white p-1.5 shadow-[0_16px_36px_rgba(17,24,39,0.16)]">
          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex min-h-[40px] w-full items-center rounded-[10px] px-3 text-left text-[14px] transition",
                    active
                      ? "bg-[#F3F4F6] font-medium text-[#222222]"
                      : "text-[#444444] hover:bg-[#F8F8F8]",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
