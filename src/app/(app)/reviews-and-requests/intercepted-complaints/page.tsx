"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  getComplaints,
  resolveComplaint,
  type Complaint,
} from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

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
        "inline-flex h-6 items-center justify-center rounded-[6px] px-2.5 text-[11px] font-medium",
        resolved
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#FEE2E2] text-[#DC2626]",
      ].join(" ")}
    >
      {resolved ? "Решена" : "Открыта"}
    </span>
  );
}

function formatComplaintDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function InterceptedComplaintsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedBranchId) {
      setComplaints([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        setActionError(null);

        const response = await getComplaints({ branchId: selectedBranchId });

        if (cancelled) return;
        setComplaints(response.complaints);
      } catch {
        if (cancelled) return;
        setComplaints([]);
        setError("Не удалось загрузить жалобы");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadComplaints();

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
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
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

  return (
    <div className="min-h-[420px]">
      {actionError && (
        <div className="mx-6 mt-6 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="divide-y divide-[#EEF2F7]">
          {Array.from({ length: 6 }).map((_, index) => (
            <ComplaintSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-8 text-[13px] text-[#DC2626]">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
          Перехваченных жалоб нет
        </div>
      ) : (
        <div className="divide-y divide-[#EEF2F7]">
          {complaints.map((complaint) => {
            const displayName =
              complaint.clientName || complaint.clientPhone || "Без имени";
            const isUpdating = updatingId === complaint.id;

            return (
              <div key={complaint.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold leading-5 text-[#111827]">
                      {displayName}
                    </div>

                    <div className="mt-1 text-[12px] leading-4 text-[#9CA3AF]">
                      {formatComplaintDate(complaint.createdAt)}
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
      )}
    </div>
  );
}
