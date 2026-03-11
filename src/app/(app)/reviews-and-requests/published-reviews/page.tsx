"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useBranchesStore } from "../../../lib/branchesStore";
import { getReviews, type Review } from "../../../lib/api";

const PLATFORMS = [
  { label: "Яндекс.Карты", value: "yandex_maps" },
  { label: "Google Maps", value: "google_maps" },
  { label: "2Gis", value: "2gis" },
  { label: "ПроДокторов", value: "prodoctorov" },
  { label: "НаПоправку", value: "napopravku" },
];

const RATINGS = [1, 2, 3, 4, 5];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[13px] text-yellow-400">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

export default function PublishedReviewsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  const toggleRating = useCallback((r: number) => {
    setRatingFilter((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }, []);

  const togglePlatform = useCallback((v: string) => {
    setPlatformFilter((prev) => (prev === v ? null : v));
  }, []);

  useEffect(() => {
    if (!selectedBranchId) return;

    let isMounted = true;

    setLoading(true);
    setError(null);

    getReviews({
      branchId: selectedBranchId,
      ...(platformFilter ? { platform: platformFilter } : {}),
    })
      .then((res) => {
        if (isMounted) {
          setAllReviews(res.reviews);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Не удалось загрузить отзывы");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBranchId, platformFilter]);

  const filteredReviews = useMemo(() => {
    if (ratingFilter.length === 0) return allReviews;
    return allReviews.filter((r) => ratingFilter.includes(r.rating));
  }, [allReviews, ratingFilter]);

  if (!selectedBranchId) {
    return (
      <div className="p-6">
        <p className="text-[#9CA3AF]">Выберите филиал</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-4 border-b border-[#E5E7EB] pb-4">
        <div className="flex items-center gap-2">
          <div className="text-[12px] font-semibold text-[#111827]">Оценка</div>
          <div className="flex gap-1">
            {RATINGS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRating(r)}
                className={[
                  "h-6 w-6 rounded-[6px] border text-[12px] transition",
                  ratingFilter.includes(r)
                    ? "border-[#111827] bg-[#111827] text-white"
                    : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
                ].join(" ")}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[12px] font-semibold text-[#111827]">
          Платформа
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => togglePlatform(p.value)}
              className={[
                "inline-flex items-center rounded-[6px] border px-2 py-1 text-[12px] transition",
                platformFilter === p.value
                  ? "border-[#111827] bg-[#111827] text-white"
                  : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-[#EEF2F7]">
          {Array.from({ length: 6 }).map((_, i) => (
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
      ) : error ? (
        <p className="mt-6 text-sm text-red-500">{error}</p>
      ) : filteredReviews.length === 0 ? (
        <p className="mt-6 text-sm text-[#9CA3AF]">
          Нет отзывов по выбранным фильтрам
        </p>
      ) : (
        <div className="divide-y divide-[#EEF2F7]">
          {filteredReviews.map((r) => {
            const platformLabel =
              PLATFORMS.find((p) => p.value === r.platform)?.label ??
              r.platform;

            return (
              <div key={r.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[13px] font-semibold text-[#111827]">
                    {r.reviewerName || "Аноним"}
                  </span>

                  <span className="text-[12px] text-[#9CA3AF]">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </span>

                  <span className="rounded-[4px] bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#6B7280]">
                    {platformLabel}
                  </span>

                  <Stars rating={r.rating} />
                </div>

                <p className="mt-1.5 text-[13px] leading-[1.6] text-[#374151]">
                  {r.text || "Без текста"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
