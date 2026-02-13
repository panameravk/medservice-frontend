"use client";

export default function RequestStatusPage() {
  return (
    <div className="p-4">
      {/* Top filter row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] pb-4">
        <div className="text-[12px] font-semibold text-[#111827]">
          Статус запроса
        </div>

        {[
          "Все запросы",
          "Отзыв опубликован",
          "Перешел на сайт отзывов",
          "Поставил оценку",
          "Открыл ссылку",
          "Запрос отправлен",
          "Жалоба",
        ].map((s) => (
          <span
            key={s}
            className="inline-flex items-center rounded-[6px] border border-[#E5E7EB] px-2 py-1 text-[12px] text-[#6B7280]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-[12px] border border-[#E5E7EB]">
        <div className="grid grid-cols-[140px_1.4fr_180px_160px_180px] gap-3 bg-[#F9FAFB] px-4 py-3 text-[12px] font-semibold text-[#111827]">
          <div>Статус</div>
          <div>Имя</div>
          <div>Телефон</div>
          <div>Дата запроса</div>
          <div>Читать отзыв</div>
        </div>

        <div className="divide-y divide-[#EEF2F7]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[140px_1.4fr_180px_160px_180px] gap-3 px-4 py-3 text-[13px] text-[#111827]"
            >
              <div className="text-[#6B7280]">—</div>
              <div>Елена Александровна Пономарева</div>
              <div className="text-[#6B7280]">+7 (963) 323-23-XX</div>
              <div className="text-[#6B7280]">15.01.2026</div>
              <div>
                <span className="inline-flex items-center rounded-[6px] border border-[#E5E7EB] px-2 py-1 text-[12px] text-[#6B7280]">
                  —
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
