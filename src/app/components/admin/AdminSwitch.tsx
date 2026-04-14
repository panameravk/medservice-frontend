"use client";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function AdminSwitch({ checked, onChange, disabled = false }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-[14px] w-[26px] items-center rounded-full transition-all duration-200",
        checked ? "bg-[#45C16E]" : "bg-[#C9C9C9]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-[12px] w-[12px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-transform duration-200",
          checked ? "translate-x-[13px]" : "translate-x-[1px]",
        ].join(" ")}
      />
    </button>
  );
}
