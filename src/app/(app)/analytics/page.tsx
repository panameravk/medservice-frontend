"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnalytics, getReviews, type Review } from "../../lib/api";
import type { AnalyticsData } from "../../types/analytics";
import { useBranchesStore } from "../../lib/branchesStore";
import { getDateRangeByPeriod, type Period } from "../../lib/date";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30");
  const rangeLabel = useMemo(
    () => getDateRangeByPeriod(period).label,
    [period]
  );

  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!selectedBranchId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAnalytics(selectedBranchId, period)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Не удалось загрузить аналитику");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBranchId, period]);

  useEffect(() => {
    if (!selectedBranchId) {
      setReviews([]);
      return;
    }
    let cancelled = false;
    setReviewsLoading(true);
    getReviews({ branchId: selectedBranchId, period, limit: 5 })
      .then((res) => {
        if (!cancelled) setReviews(res.reviews);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBranchId, period]);

  if (!selectedBranchId) {
    return <p className="text-sm text-[#9CA3AF]">Сначала выберите филиал</p>;
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* ── Title + period selector ── */}
      <div>
        <h1 className="text-[22px] font-bold text-[#111827] leading-7">
          Аналитика
        </h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Динамика рейтинга и репутации
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
            {(["week", "30", "90", "year"] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-[13px] transition-colors ${
                  period === p
                    ? "bg-[#F3F4F6] text-[#111827] font-medium"
                    : "text-[#9CA3AF] hover:bg-black/[0.02]"
                }`}
              >
                {p === "week" ? "Неделя" : p === "year" ? "Год" : `${p} дней`}
              </button>
            ))}
          </div>
          <input
            value={rangeLabel}
            readOnly
            className="h-9 w-[190px] rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[13px] text-[#9CA3AF] text-center outline-none"
          />
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div className="flex gap-4 items-start min-w-0">
        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Stats bar */}
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-6 py-4">
            {loading ? (
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-7 w-10 rounded bg-black/5" />
                    <div className="space-y-1">
                      <div className="h-3 w-14 rounded bg-black/5" />
                      <div className="h-3 w-10 rounded bg-black/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <StatCard
                  value={data?.sent}
                  label1="запросов"
                  label2="отправлено"
                  color="#111827"
                />
                <StatCard
                  value={data?.reviews}
                  label1="новых"
                  label2="отзывов"
                  color="#16A34A"
                />
                <StatCard
                  value={data?.complaints}
                  label1="перехвачено"
                  label2="жалоб"
                  color="#EF4444"
                />
                <StatCard
                  value={data?.avgRating}
                  label1="средняя оценка"
                  label2="новых отзывов"
                  color="#111827"
                />
              </div>
            )}
          </div>

          {/* Platform */}
          <div className="rounded-2xl bg-white border border-black/5 p-4">
            <div className="mb-4 text-[14px] font-medium text-[#111827]">
              Площадка (позже)
            </div>
            <div className="h-[240px] rounded-xl bg-black/5" />
          </div>

          {/* Satisfaction + NPS small */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="mb-4 text-[14px] font-medium text-[#111827]">
                Удовлетворенность (позже)
              </div>
              <div className="h-[200px] rounded-xl bg-black/5" />
            </div>
            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="mb-4 text-[14px] font-medium text-[#111827]">
                Динамика NPS (позже)
              </div>
              <div className="h-[200px] rounded-xl bg-black/5" />
            </div>
          </div>

          {/* Employees */}
          <div className="rounded-2xl bg-white border border-black/5 p-4">
            <div className="mb-4 text-[14px] font-medium text-[#111827]">
              Оценка сотрудников (позже)
            </div>
            <div className="h-[280px] rounded-xl bg-black/5" />
          </div>

          {/* NPS large */}
          <div className="rounded-2xl bg-white border border-black/5 p-4">
            <div className="mb-4 text-[14px] font-medium text-[#111827]">
              Динамика NPS большая (позже)
            </div>
            <div className="h-[420px] rounded-xl bg-black/5" />
          </div>
        </div>

        {/* ── Right column: reviews ── */}
        <div className="w-[300px] shrink-0 rounded-2xl bg-white border border-black/5 p-4 sticky top-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[14px] font-medium text-[#111827]">
              Новые отзывы
            </div>
            <div className="h-8 w-8 rounded-full bg-black/5" />
          </div>

          <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-0.5">
            {reviewsLoading ? (
              [...Array(3)].map((_, i) => <ReviewSkeleton key={i} />)
            ) : reviews.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF]">
                Нет отзывов за выбранный период
              </p>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-black/5 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-[#111827] truncate">
                      {r.reviewerName || "Аноним"}
                    </span>
                    <span className="text-[12px] text-[#6B7280] shrink-0">
                      ★ {r.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-[#6B7280] line-clamp-2">
                    {r.text || "Без текста"}
                  </p>
                  <div className="mt-2 text-[11px] text-[#9CA3AF]">
                    {r.platform}
                    {r.publishedAt
                      ? ` · ${new Date(r.publishedAt).toLocaleDateString(
                          "ru-RU"
                        )}`
                      : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label1,
  label2,
  color,
}: {
  value?: number | null;
  label1: string;
  label2: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-[22px] font-bold leading-none" style={{ color }}>
        {value ?? "—"}
      </div>
      <div className="text-[12px] leading-[14px] text-[#111827]">
        <div>{label1}</div>
        <div>{label2}</div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="rounded-xl border border-black/5 p-3">
      <div className="h-4 w-36 rounded bg-black/5" />
      <div className="mt-2 h-3 w-full rounded bg-black/5" />
      <div className="mt-1.5 h-3 w-4/5 rounded bg-black/5" />
      <div className="mt-3 h-3 w-20 rounded bg-black/5" />
    </div>
  );
}
