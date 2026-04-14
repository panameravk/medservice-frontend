import { Unbounded } from "next/font/google";
import { cn } from "../lib/cn";

const unbounded = Unbounded({
  subsets: ["cyrillic"],
  weight: ["600", "700", "800", "900"],
});

export function Brand({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const isSmall = size === "sm";

  return (
    <div className={cn("flex items-start gap-1", className)}>
      <div
        className={cn(
          unbounded.className,
          isSmall
            ? "text-[28px] font-[900] tracking-[-0.02em]"
            : "text-[42px] font-[600] tracking-[-0.01em]",
          "text-[#111827]"
        )}
      >
        Фидбэк
      </div>

      <div
        className={cn(
          unbounded.className,
          isSmall ? "mt-[6px] text-[12px]" : "mt-[9px] text-[15px]",
          "italic font-[600] text-[#111827]"
        )}
      >
        ИИ
      </div>
    </div>
  );
}
