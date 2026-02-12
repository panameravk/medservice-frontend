"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAnalytics } from "../../lib/api";
import type { AnalyticsData } from "../../types/analytics";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branchId");

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getAnalytics(branchId);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить аналитику");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Аналитика</h1>
          <div className="mt-1 text-sm text-gray-500">
            {branchId ? `Филиал ID: ${branchId}` : "Филиал не выбран"}
          </div>
        </div>

        {/* Здесь позже будут фильтры: филиал/период */}
        <div className="flex gap-3">
          <div className="h-10 w-[280px] rounded-xl bg-white border border-black/5" />
          <div className="h-10 w-[220px] rounded-xl bg-white border border-black/5" />
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Загрузка данных...</div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* KPI cards row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard title="Отправлено" value={data?.sent} loading={loading} />
        <SkeletonCard title="Отзывов" value={data?.reviews} loading={loading} />
        <SkeletonCard
          title="Перехвачено жалоб"
          value={data?.complaints}
          loading={loading}
        />
        <SkeletonCard
          title="Средняя оценка"
          value={data?.avgRating}
          loading={loading}
        />
      </div>

      {/* Layout like screenshot: main + right panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* Left: widgets */}
        <section className="space-y-6">
          {/* Table */}
          <div className="rounded-2xl bg-white border border-black/5 p-4">
            <div className="mb-4 font-medium text-[#111827]">
              Таблица (позже)
            </div>
            <div className="h-[260px] rounded-xl bg-black/5" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="mb-4 font-medium text-[#111827]">
                Удовлетворенность (позже)
              </div>
              <div className="h-[220px] rounded-xl bg-black/5" />
            </div>

            <div className="rounded-2xl bg-white border border-black/5 p-4">
              <div className="mb-4 font-medium text-[#111827]">
                Динамика NPS (позже)
              </div>
              <div className="h-[220px] rounded-xl bg-black/5" />
            </div>
          </div>

          {/* Big chart */}
          <div className="rounded-2xl bg-white border border-black/5 p-4">
            <div className="mb-4 font-medium text-[#111827]">
              Большой график (позже)
            </div>
            <div className="h-[260px] rounded-xl bg-black/5" />
          </div>
        </section>

        {/* Right: reviews feed */}
        <aside className="rounded-2xl bg-white border border-black/5 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-medium text-[#111827]">Новые отзывы</div>
            <div className="h-8 w-8 rounded-full bg-black/5" />
          </div>

          <div className="space-y-4">
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SkeletonCard({
  title,
  value,
  loading,
}: {
  title: string;
  value?: number;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 p-4">
      <div className="text-sm text-gray-500">{title}</div>

      {loading ? (
        <>
          <div className="mt-3 h-8 w-24 rounded bg-black/5" />
          <div className="mt-2 h-4 w-32 rounded bg-black/5" />
        </>
      ) : value !== undefined ? (
        <div className="mt-3 text-2xl font-semibold text-[#111827]">
          {value}
        </div>
      ) : (
        <div className="mt-3 text-sm text-gray-400">—</div>
      )}
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="rounded-xl border border-black/5 p-3">
      <div className="h-4 w-40 rounded bg-black/5" />
      <div className="mt-2 h-3 w-full rounded bg-black/5" />
      <div className="mt-2 h-3 w-4/5 rounded bg-black/5" />
      <div className="mt-3 h-3 w-24 rounded bg-black/5" />
    </div>
  );
}
