"use client";

import { useState } from "react";

export default function MailingsPage() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [template, setTemplate] = useState(
    "Здравствуйте! Будем благодарны за отзыв о визите. Ссылка: {link}"
  );
  const [monthlyLimit, setMonthlyLimit] = useState(150);

  return (
    <div className="space-y-4">
      <div className="text-[14px] font-semibold text-[#111827]">Рассылки</div>

      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 space-y-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[14px] font-semibold text-[#111827]">
              Отправка запросов
            </div>
            <div className="mt-1 text-[13px] text-[#6B7280]">
              Управляйте рассылкой запросов на отзыв
            </div>
          </div>

          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={() => setSmsEnabled((v) => !v)}
            className="h-5 w-5 accent-[#10B981] mt-1"
          />
        </div>

        <div>
          <div className="text-[12px] text-[#6B7280]">Лимит в месяц</div>
          <input
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(Number(e.target.value))}
            disabled={!smsEnabled}
            className={[
              "mt-1 h-10 w-full rounded-[10px] border px-3 text-[14px] outline-none",
              smsEnabled
                ? "border-[#E5E7EB] text-[#111827] focus:ring-2 focus:ring-black/10"
                : "border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]",
            ].join(" ")}
          />
          <div className="mt-1 text-[11px] text-[#9CA3AF]">
            Это число сейчас у тебя зашито в Sidebar как 150 — можно потом
            подтянуть из настроек
          </div>
        </div>

        <div>
          <div className="text-[12px] text-[#6B7280]">Шаблон сообщения</div>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            disabled={!smsEnabled}
            className={[
              "mt-1 min-h-[110px] w-full rounded-[10px] border px-3 py-2 text-[14px] outline-none resize-none",
              smsEnabled
                ? "border-[#E5E7EB] text-[#111827] focus:ring-2 focus:ring-black/10"
                : "border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]",
            ].join(" ")}
          />
          <div className="mt-1 text-[11px] text-[#9CA3AF]">
            Поддерживаемые плейсхолдеры:{" "}
            <span className="text-[#6B7280]">{`{link}`}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-10 rounded-[10px] border border-[#E5E7EB] text-[13px] font-semibold text-[#111827] hover:bg-[#F3F4F6]"
          >
            Отправить тест
          </button>
          <button
            type="button"
            className="h-10 rounded-[10px] bg-[#2B2E39] text-white text-[13px] font-semibold shadow-[0_10px_24px_rgba(17,24,39,0.14)] hover:opacity-90 transition"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
