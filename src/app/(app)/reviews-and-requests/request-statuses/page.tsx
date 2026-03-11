"use client";

import { useEffect, useState } from "react";
import {
  getRequests,
  type ReviewRequest,
  type RequestStatus,
} from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

const STATUS_TABS: { label: string; value: RequestStatus | undefined }[] = [
  { label: "Все запросы", value: undefined },
  { label: "Отзыв опубликован", value: "published" },
  { label: "Перешел на сайт отзывов", value: "visited" },
  { label: "Поставил оценку", value: "rated" },
  { label: "Открыл ссылку", value: "opened" },
  { label: "Запрос отправлен", value: "sent" },
  { label: "Жалоба", value: "complaint" },
];

const STATUS_STYLE: Record<
  string,
  { color: string; dot: string; label: string }
> = {
  published: { color: "#16A34A", dot: "bg-[#16A34A]", label: "Опубликован" },
  visited: { color: "#F59E0B", dot: "bg-[#F59E0B]", label: "Посетил площадку" },
  rated: { color: "#F59E0B", dot: "bg-[#F59E0B]", label: "Оценил" },
  opened: { color: "#6B7280", dot: "bg-[#6B7280]", label: "Открыл" },
  sent: { color: "#6B7280", dot: "bg-[#D1D5DB]", label: "Отправлен" },
  complaint: { color: "#DC2626", dot: "bg-[#DC2626]", label: "Жалоба" },
};

function StatusDot({ status }: { status: RequestStatus | null }) {
  if (!status) return <span className="text-[#9CA3AF]">—</span>;
  const s = STATUS_STYLE[status] ?? {
    color: "#6B7280",
    dot: "bg-[#D1D5DB]",
    label: status,
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${s.dot}`} />
      <span style={{ color: s.color }} className="text-[12px]">
        {s.label}
      </span>
    </span>
  );
}

export default function RequestStatusPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(
    undefined
  );

  const isLoading = loading || !selectedBranchId;

  useEffect(() => {
    if (!selectedBranchId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getRequests({ branchId: selectedBranchId, status: statusFilter })
      .then((res) => {
        if (!cancelled) setRequests(res.requests);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить запросы");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId, statusFilter]);

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] pb-4">
        <div className="text-[12px] font-semibold text-[#111827]">
          Статус запроса
        </div>

        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={[
              "inline-flex items-center rounded-[6px] border px-2 py-1 text-[12px] transition",
              statusFilter === tab.value
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-[12px] border border-[#E5E7EB]">
        <div className="grid grid-cols-[180px_1.4fr_180px_160px_180px] gap-3 bg-[#F9FAFB] px-4 py-3 text-[12px] font-semibold text-[#111827]">
          <div>Статус</div>
          <div>Имя</div>
          <div>Телефон</div>
          <div>Дата запроса</div>
          <div>Результат</div>
        </div>

        <div className="divide-y divide-[#EEF2F7]">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[180px_1.4fr_180px_160px_180px] gap-3 px-4 py-3"
              >
                <div className="h-3 w-20 rounded bg-black/5" />
                <div className="h-3 w-48 rounded bg-black/5" />
                <div className="h-3 w-28 rounded bg-black/5" />
                <div className="h-3 w-20 rounded bg-black/5" />
                <div className="h-3 w-16 rounded bg-black/5" />
              </div>
            ))
          ) : error ? (
            <div className="px-4 py-6 text-sm text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#9CA3AF]">
              Нет запросов по выбранному фильтру
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="grid grid-cols-[180px_1.4fr_180px_160px_180px] gap-3 px-4 py-3 text-[13px] text-[#111827]"
              >
                <div>
                  <StatusDot status={req.status} />
                </div>

                <div>{req.clientName}</div>

                <div className="text-[#6B7280]">{req.clientPhone}</div>

                <div className="text-[#6B7280]">
                  {new Date(req.sentAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>

                <div>
                  {req.platform === "complaint" ? (
                    <span className="inline-flex items-center gap-1 rounded-[6px] border border-[#FEE2E2] bg-[#FEF2F2] px-2 py-1 text-[12px] text-[#DC2626]">
                      Жалоба
                    </span>
                  ) : req.rating !== null ? (
                    <span className="inline-flex items-center rounded-[6px] border border-[#E5E7EB] px-2 py-1 text-[12px] text-[#6B7280]">
                      {req.platform || "Площадка"} · ★ {req.rating}
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
