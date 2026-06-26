"use client";

import { useRef } from "react";
import { getDateRangeByPeriod, type Period } from "../lib/date";

const PRESETS: Array<{ value: Period; label: string }> = [
  { value: "week", label: "Неделя" },
  { value: "30", label: "30 дней" },
  { value: "90", label: "90 дней" },
  { value: "year", label: "Год" },
];

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 3v3M17 3v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 8h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="5"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatRu(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openCalendar = () => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  return (
    <button
      type="button"
      onClick={openCalendar}
      className="relative flex h-10 w-[150px] items-center justify-between gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]"
    >
      <span className="tabular-nums">{formatRu(value)}</span>
      <CalendarIcon className="text-[#9CA3AF]" />

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
      />
    </button>
  );
}

export function DateRangeControl({
  activePreset,
  dateFrom,
  dateTo,
  onPresetChange,
  onDateFromChange,
  onDateToChange,
  className = "",
}: {
  activePreset: Period | null;
  dateFrom: string;
  dateTo: string;
  onPresetChange: (period: Period, range: { start: string; end: string }) => void;
  onDateFromChange: (next: string) => void;
  onDateToChange: (next: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-[14px] ${className}`}>
      <div className="flex h-10 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
        {PRESETS.map((preset) => {
          const active = activePreset === preset.value;

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => {
                const range = getDateRangeByPeriod(preset.value, new Date());
                onPresetChange(preset.value, {
                  start: toISODate(range.start),
                  end: toISODate(range.end),
                });
              }}
              className={[
                "px-4 text-[13px] transition-colors",
                active
                  ? "bg-[#F3F4F6] font-medium text-[#111827]"
                  : "text-[#9CA3AF] hover:bg-black/[0.02]",
              ].join(" ")}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <DateField value={dateFrom} onChange={onDateFromChange} />
        <span className="text-[13px] text-[#9CA3AF]">—</span>
        <DateField value={dateTo} onChange={onDateToChange} />
      </div>
    </div>
  );
}
