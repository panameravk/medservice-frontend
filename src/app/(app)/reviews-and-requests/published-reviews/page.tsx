"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBranchesStore } from "../../../lib/branchesStore";
import { getReviews, type Review } from "../../../lib/api";

const PLATFORMS = [
  { label: "Яндекс.Карты", value: "yandex_maps", icon: "/Icons/platforms/yandex-maps-logo.svg" },
  { label: "Google Maps", value: "google_maps", icon: "/Icons/platforms/google-maps-sign-logo.svg" },
  { label: "2Gis", value: "2gis", icon: "/Icons/platforms/2gis-icon-logo.svg" },
  { label: "ПроДокторов", value: "prodoctorov", icon: "/Icons/platforms/prodoctorov_logo.svg" },
  { label: "НаПоправку", value: "napopravku", icon: "/Icons/platforms/napopravku_logo.svg" },
];

const RATINGS = [1, 2, 3, 4, 5];

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(1);

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
      setPage(1);
      return;
    }

    let cancelled = false;

    const loadReviews = async () => {
      try {
        setError(null);
        setLoading(true);
        setPage(1);

        const hasRating = ratingFilter.length > 0;
        const reviews = await fetchAllPages<Review>((offset) =>
          getReviews({
            branchId: selectedBranchId,
            ...(platformFilter ? { platform: platformFilter } : {}),
            ...(hasRating
              ? {
                  ratingMin: Math.min(...ratingFilter),
                  ratingMax: Math.max(...ratingFilter),
                }
              : {}),
            limit: 500,
            offset,
          }).then((r) => ({ items: r.reviews, total: r.total }))
        );

        if (cancelled) return;
        setAllReviews(reviews);
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
  }, [platformFilter, ratingFilter, selectedBranchId]);

  // Бэк фильтрует по диапазону [min..max], а конкретный набор (например, {2,5})
  // дофильтровывается здесь — так отсекаются "дыры" внутри диапазона.
  const filteredReviews = useMemo(() => {
    if (ratingFilter.length === 0) return allReviews;
    return allReviews.filter((review) => ratingFilter.includes(review.rating));
  }, [allReviews, ratingFilter]);

  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE);
  const pageItems = filteredReviews.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [page, totalPages]);

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
                    "inline-flex h-7 items-center gap-1.5 rounded-[6px] border px-2.5 text-[12px] font-medium transition",
                    active
                      ? "border-[#111827] bg-[#111827] text-white"
                      : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]",
                  ].join(" ")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={platform.icon} alt="" className="h-[14px] w-[14px] shrink-0" />
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
            {pageItems.map((review) => {
              const platformLabel =
                PLATFORMS.find((platform) => platform.value === review.platform)
                  ?.label ?? review.platform;

              return (
                <div key={review.id} className="px-6 py-5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-[14px] font-semibold leading-5 text-[#111827]">
                      {review.reviewerName || "Аноним"}
                    </span>

                    <span className="text-[12px] text-[#9CA3AF]">
                      {formatPublishedDate(review.publishedAt)}
                    </span>

                    <span className="text-[12px] text-[#6B7280]">
                      {platformLabel}
                    </span>

                    <Stars rating={review.rating} />
                  </div>

                  <p className="mt-2.5 whitespace-pre-line text-[13px] leading-[20px] text-[#374151]">
                    {review.text || "Без текста"}
                  </p>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#EEF2F7] px-6 py-4">
              <span className="text-[12px] text-[#9CA3AF]">
                {filteredReviews.length} записей · страница {page} из {totalPages}
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
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2
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
        </div>
      )}
    </div>
  );
}
