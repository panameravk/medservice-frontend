"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  getComplaints,
  resolveComplaint,
  type Complaint,
} from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

const PAGE_SIZE = 20;

function ComplaintSkeleton() {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="h-4 w-44 rounded bg-black/5" />
        <div className="h-5 w-20 rounded-[6px] bg-black/5" />
      </div>
      <div className="mt-2 h-3 w-28 rounded bg-black/5" />
      <div className="mt-3 h-3 w-[92%] rounded bg-black/5" />
      <div className="mt-2 h-3 w-[76%] rounded bg-black/5" />
      <div className="mt-4 h-8 w-36 rounded-[8px] bg-black/5" />
    </div>
  );
}

function StatusBadge({ resolved }: { resolved: boolean }) {
  return (
    <span
      className={[
        "inline-flex h-6 shrink-0 items-center justify-center rounded-[6px] px-2.5 text-[11px] font-medium",
        resolved
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#FEE2E2] text-[#DC2626]",
      ].join(" ")}
    >
      {resolved ? "Решена" : "Открыта"}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function fetchAllPages<T>(
  fetcher: (offset: number) => Promise<{ items: T[]; total: number }>
): Promise<T[]> {
  const first = await fetcher(0);
  if (first.total <= first.items.length) return first.items;

  const remaining = Math.ceil((first.total - first.items.length) / 500);
  const rest = await Promise.all(
    Array.from({ length: remaining }, (_, i) =>
      fetcher((i + 1) * 500).then((r) => r.items)
    )
  );
  return [...first.items, ...rest.flat()];
}

export default function InterceptedComplaintsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  // Только жалобы, оставленные пациентом через мини-приложение (clinic) —
  // негатив «директору». Спарсенные негативные отзывы с площадок сюда НЕ
  // попадают: они видны в «Опубликованных отзывах» и в аналитике.
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!selectedBranchId) {
      setComplaints([]);
      setError(null);
      setLoading(false);
      setPage(1);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setActionError(null);
        setPage(1);

        const list = await fetchAllPages<Complaint>((offset) =>
          getComplaints({ branchId: selectedBranchId, limit: 500, offset }).then(
            (r) => ({ items: r.complaints, total: r.total })
          )
        );

        if (cancelled) return;

        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setComplaints(list);
      } catch {
        if (cancelled) return;
        setComplaints([]);
        setError("Не удалось загрузить данные");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  const handleResolve = async (id: number, resolved: boolean) => {
    setActionError(null);
    setUpdatingId(id);

    try {
      const updated = await resolveComplaint(id, resolved);
      setComplaints((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setActionError("У вас недостаточно прав для изменения статуса жалобы");
      } else {
        setActionError("Не удалось обновить статус жалобы");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (!selectedBranchId) {
    return (
      <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
        Сначала выберите филиал
      </div>
    );
  }

  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  const pageItems = complaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-[420px]">
      {actionError && (
        <div className="mx-6 mt-6 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="divide-y divide-[#EEF2F7]">
          {Array.from({ length: 6 }).map((_, i) => (
            <ComplaintSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-8 text-[13px] text-[#DC2626]">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
          Нет жалоб
        </div>
      ) : (
        <>
          <div className="divide-y divide-[#EEF2F7]">
            {pageItems.map((complaint) => {
              const displayName = complaint.clientName || "Без имени";
              const isUpdating = updatingId === complaint.id;

              return (
                <div key={`c-${complaint.id}`} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold leading-5 text-[#111827]">
                        {displayName}
                      </div>
                      <div className="mt-1 text-[12px] leading-4 text-[#9CA3AF]">
                        {formatDate(complaint.createdAt)}
                        {complaint.clientPhone ? ` · ${complaint.clientPhone}` : ""}
                        {complaint.branchName ? ` · ${complaint.branchName}` : ""}
                        {complaint.rating ? ` · ★ ${complaint.rating}` : ""}
                      </div>
                    </div>
                    <StatusBadge resolved={complaint.resolved} />
                  </div>

                  <p className="mt-3 whitespace-pre-line text-[13px] leading-[20px] text-[#374151]">
                    {complaint.text}
                  </p>

                  {!complaint.resolved && (
                    <button
                      type="button"
                      onClick={() => handleResolve(complaint.id, true)}
                      disabled={isUpdating}
                      className="mt-4 inline-flex h-9 items-center justify-center rounded-[8px] border border-[#E5E7EB] px-3.5 text-[12px] font-medium text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Сохранение..." : "Отметить решённой"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#EEF2F7] px-6 py-4">
              <span className="text-[12px] text-[#9CA3AF]">
                {complaints.length} записей · страница {page} из {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E5E7EB] text-[13px] text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
                  )
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="inline-flex h-8 w-8 items-center justify-center text-[13px] text-[#9CA3AF]"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p as number)}
                        className={[
                          "inline-flex h-8 w-8 items-center justify-center rounded-[6px] border text-[13px] font-medium transition",
                          page === p
                            ? "border-[#111827] bg-[#111827] text-white"
                            : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E5E7EB] text-[13px] text-[#6B7280] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
