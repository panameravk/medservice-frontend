"use client";

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-[284px]">
      <svg
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#C4C4C4]"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      </svg>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[38px] w-full rounded-[12px] border border-transparent bg-[#F4F4F4] pl-11 pr-4 text-[14px] text-[#222222] outline-none placeholder:text-[#C4C4C4]"
      />
    </div>
  );
}
