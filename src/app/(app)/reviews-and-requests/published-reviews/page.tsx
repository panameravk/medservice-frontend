"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBranchesStore } from "../../../lib/branchesStore";
import { getReviews, type Review } from "../../../lib/api";

const PLATFORMS = [
  { label: "Яндекс.Карты", value: "yandex_maps" },
  { label: "Google Maps", value: "google_maps" },
  { label: "2GIS", value: "2gis" },
  { label: "ПроДокторов", value: "prodoctorov" },
  { label: "НаПоправку", value: "napopravku" },
];

const RATINGS = [1, 2, 3, 4, 5];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[13px] leading-none text-[#F4C21A]">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="h-4 w-36 rounded bg-black/5" />
        <div className="h-5 w-24 rounded-[6px] bg-black/5" />
        <div className="h-4 w-20 rounded bg-black/5" />
        <div className="ml-auto h-4 w-16 rounded bg-black/5" />
      </div>

      <div className="mt-3 h-3 w-[92%] rounded bg-black/5" />
      <div className="mt-2 h-3 w-[74%] rounded bg-black/5" />
    </div>
  );
}

function formatPublishedDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PublishedReviewsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ratingFilter, setRatingFilter] = useState<number[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);

  const toggleRating = useCallback((rating: number) => {
    setRatingFilter((prev) =>
      prev.includes(rating)
        ? prev.filter((item) => item !== rating)
        : [...prev, rating].sort((a, b) => a - b)
    );
  }, []);

  const togglePlatform = useCallback((platform: string) => {
    setPlatformFilter((prev) => (prev === platform ? null : platform));
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setAllReviews([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadReviews = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await getReviews({
          branchId: selectedBranchId,
          ...(platformFilter ? { platform: platformFilter } : {}),
        });

        if (cancelled) return;
        setAllReviews(response.reviews);
      } catch {
        if (cancelled) return;
        // Не очищаем список при смене фильтра — так контейнер/строки не "прыгают"
        setError("Не удалось загрузить отзывы");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [platformFilter, selectedBranchId]);

  const filteredReviews = useMemo(() => {
    if (ratingFilter.length === 0) return allReviews;
    return allReviews.filter((review) => ratingFilter.includes(review.rating));
  }, [allReviews, ratingFilter]);

  if (!selectedBranchId) {
    return (
      <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
        Выберите филиал
      </div>
    );
  }

  return (
    <div className="min-h-[420px]">
      <div className="border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-start gap-x-6 gap-y-3">
          <div className="flex items-center gap-3">
            <div className="text-[12px] font-semibold text-[#111827]">
              Оценка
            </div>

            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
              {RATINGS.map((rating) => {
                const active = ratingFilter.includes(rating);

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => toggleRating(rating)}
                    className={[
                      "flex h-7 min-w-7 items-center justify-center rounded-[6px] border px-2 text-[12px] font-medium transition",
                      active
                        ? "border-[#111827] bg-[#111827] text-white"
                        : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
                    ].join(" ")}
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
            <div className="mr-1 text-[12px] font-semibold text-[#111827]">
              Платформа
            </div>

            {PLATFORMS.map((platform) => {
              const active = platformFilter === platform.value;

              return (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => togglePlatform(platform.value)}
                  className={[
                    "inline-flex h-7 items-center rounded-[6px] border px-2.5 text-[12px] font-medium transition",
                    active
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  {platform.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && allReviews.length === 0 ? (
        <div className="divide-y divide-[#EEF2F7]">
          {Array.from({ length: 6 }).map((_, index) => (
            <ReviewsSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="px-6 py-8 text-[13px] text-[#DC2626]">{error}</div>
      ) : filteredReviews.length === 0 ? (
        <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
          Нет отзывов по выбранным фильтрам
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/55 backdrop-blur-[1px]" />
          )}

          <div className="divide-y divide-[#EEF2F7]">
            {filteredReviews.map((review) => {
              const platformLabel =
                PLATFORMS.find((platform) => platform.value === review.platform)
                  ?.label ?? review.platform;

              return (
                <div key={review.id} className="px-6 py-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-[14px] font-semibold leading-5 text-[#111827]">
                      {review.reviewerName || "Аноним"}
                    </span>

                    <span className="rounded-[6px] bg-[#F3F4F6] px-2 py-1 text-[11px] leading-none text-[#6B7280]">
                      {platformLabel}
                    </span>

                    <span className="text-[12px] text-[#9CA3AF]">
                      {formatPublishedDate(review.publishedAt)}
                    </span>

                    <div className="ml-auto">
                      <Stars rating={review.rating} />
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-[13px] leading-[20px] text-[#374151]">
                    {review.text || "Без текста"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
