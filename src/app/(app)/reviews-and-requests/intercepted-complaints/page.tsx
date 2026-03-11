"use client";

import { useEffect, useState } from "react";
import {
  getComplaints,
  resolveComplaint,
  type Complaint,
} from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

export default function InterceptedComplaintsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBranchId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getComplaints({ branchId: selectedBranchId })
      .then((res) => {
        if (!cancelled) setComplaints(res.complaints);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить жалобы");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  const handleResolve = async (id: number, resolved: boolean) => {
    try {
      const updated = await resolveComplaint(id, resolved);
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      // ignore
    }
  };

  const isLoading = loading || !selectedBranchId;

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="divide-y divide-[#EEF2F7]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="py-4">
              <div className="h-4 w-48 rounded bg-black/5" />
              <div className="mt-2 h-3 w-[85%] rounded bg-black/5" />
              <div className="mt-2 h-3 w-[60%] rounded bg-black/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">Перехваченных жалоб нет</p>
      ) : (
        <div className="divide-y divide-[#EEF2F7]">
          {complaints.map((c) => (
            <div key={c.id} className="py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-[13px] font-semibold text-[#111827]">
                  {c.clientName || c.clientPhone || "Без имени"}
                </span>

                <span className="text-[12px] text-[#9CA3AF]">
                  {new Date(c.createdAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>

                <span
                  className={[
                    "rounded-[4px] px-2 py-0.5 text-[11px]",
                    c.resolved
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "bg-[#FEE2E2] text-[#DC2626]",
                  ].join(" ")}
                >
                  {c.resolved ? "Решена" : "Открыта"}
                </span>
              </div>

              <p className="mt-1.5 text-[13px] leading-[1.6] text-[#374151]">
                {c.text}
              </p>

              {!c.resolved && (
                <button
                  type="button"
                  onClick={() => handleResolve(c.id, true)}
                  className="mt-2 rounded-[6px] border border-[#E5E7EB] px-3 py-1 text-[12px] text-[#6B7280] hover:bg-[#F3F4F6] transition"
                >
                  Отметить решённой
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
