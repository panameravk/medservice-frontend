"use client";

export default function PublishedReviewsPage() {
  return (
    <div className="p-4">
      {/* Filters row inside card */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[#E5E7EB] pb-4">
        <div className="flex items-center gap-2">
          <div className="text-[12px] font-semibold text-[#111827]">Оценка</div>
          <div className="flex gap-1">
            {["1", "2", "3", "4", "5"].map((x) => (
              <button
                key={x}
                type="button"
                className="h-6 w-6 rounded-[6px] border border-[#E5E7EB] text-[12px] text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[12px] font-semibold text-[#111827]">
          Платформа
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            "Яндекс.Карты",
            "Google Maps",
            "2Gis",
            "ПроДокторов",
            "НаПоправку",
          ].map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-[6px] border border-[#E5E7EB] px-2 py-1 text-[12px] text-[#6B7280]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* List skeleton */}
      <div className="divide-y divide-[#EEF2F7]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="py-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 rounded bg-black/5" />
              <div className="h-4 w-16 rounded bg-black/5" />
              <div className="ml-auto h-4 w-24 rounded bg-black/5" />
            </div>
            <div className="mt-2 h-3 w-[85%] rounded bg-black/5" />
            <div className="mt-2 h-3 w-[70%] rounded bg-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
