import type { ReactNode } from "react";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#303133] flex justify-center">
      <div className="min-h-screen w-full max-w-[320px] bg-white text-black">
        {children}
      </div>
    </main>
  );
}