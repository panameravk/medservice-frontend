"use client";

export default function InterceptedComplaintsPage() {
  return (
    <div className="p-4">
      <div className="border-b border-[#E5E7EB] pb-4 text-[13px] text-[#6B7280]">
        Тут будет список перехваченных жалоб (пока заготовка).
      </div>

      <div className="divide-y divide-[#EEF2F7]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="py-4">
            <div className="h-4 w-48 rounded bg-black/5" />
            <div className="mt-2 h-3 w-[85%] rounded bg-black/5" />
            <div className="mt-2 h-3 w-[60%] rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
