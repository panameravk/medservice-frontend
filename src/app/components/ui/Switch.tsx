"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-[16px] w-[28px] shrink-0 items-center rounded-full",
        "transition-all duration-200 ease-out",
        checked ? "bg-[#34C759]" : "bg-[#D9D9D9]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-[2px] h-[12px] w-[12px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
          "transition-transform duration-200 ease-out",
          checked ? "translate-x-[12px]" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
