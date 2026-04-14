import type { ReactNode } from "react";

export function AdminShellCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white">
      <div className="min-h-[620px] bg-white px-5 py-4">{children}</div>
    </div>
  );
}
