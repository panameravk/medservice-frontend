"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { getDashboard, type DashboardData, type Period } from "../../lib/api";
import { useBranchesStore } from "../../lib/branchesStore";
import { getDateRangeByPeriod } from "../../lib/date";

function EmptyState({ text }: { text: string }) {
  return <p className="text-[13px] text-[#9CA3AF]">{text}</p>;
}

function MetricStat({
  value,
  labelTop,
  labelBottom,
  valueClassName = "text-[#111827]",
}: {
  value: string | number;
  labelTop: string;
  labelBottom: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className={`text-[36px] font-[700] leading-none ${valueClassName}`}>
        {value}
      </div>
      <div className="pt-[2px] text-[12px] leading-[13px] text-[#111827]">
        <div>{labelTop}</div>
        <div>{labelBottom}</div>
      </div>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const iconMap: Record<string, string> = {
    yandex_maps: "/Icons/platforms/yandex-maps-logo.svg",
    google_maps: "/Icons/platforms/google-maps-sign-logo.svg",
    "2gis": "/Icons/platforms/2gis-icon-logo.svg",
    prodoctorov: "/Icons/platforms/prodoktorov.svg",
    napopravku: "/Icons/platforms/napopravku.svg",
  };

  const src = iconMap[platform];
  if (!src) {
    return <span className="inline-block h-5 w-5 rounded-full bg-[#D1D5DB]" />;
  }

  return <img src={src} alt="" className="h-5 w-5 shrink-0" />;
}

function PlatformToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={[
        "relative inline-flex h-[20px] w-[35px] shrink-0 items-center rounded-full",
        "transition-all duration-200 ease-out",
        enabled ? "bg-[#34C759]" : "bg-[#D9D9D9]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
          "transition-transform duration-200 ease-out",
          enabled ? "translate-x-[15px]" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function RatingBadge({ value }: { value: number }) {
  const cls =
    value >= 4.7
      ? "bg-[#DDF7E7] text-[#1F8F52]"
      : value >= 4.3
      ? "bg-[#FDE7E7] text-[#C85B5B]"
      : "bg-[#FDE7E7] text-[#C85B5B]";

  return (
    <span
      className={`inline-flex min-w-[40px] items-center justify-center rounded-[6px] px-2.5 py-[2px] text-[15px] font-medium ${cls}`}
    >
      {value.toFixed(1)}
    </span>
  );
}

function NegativeBadge({ value }: { value: number }) {
  const cls =
    value <= 2
      ? "bg-[#DDF7E7] text-[#1F8F52]"
      : value <= 10
      ? "bg-[#FDE7E7] text-[#C85B5B]"
      : "bg-[#FADDDD] text-[#B43F3F]";

  return (
    <span
      className={`inline-flex min-w-[40px] items-center justify-center rounded-[6px] px-2.5 py-[2px] text-[15px] font-medium ${cls}`}
    >
      {value}%
    </span>
  );
}

function SatisfactionSection({
  data,
}: {
  data: DashboardData["satisfaction"];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <section className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
      <div className="mb-1 flex items-baseline justify-between">
        <div className="text-[14px] font-medium text-[#111827]">
          Удовлетворённость
        </div>
        <div className="text-[12px] text-[#6B7280]">
          {totalCount} {pluralize(totalCount, "оценка", "оценки", "оценок")}
        </div>
      </div>

      {totalCount === 0 ? (
        <EmptyState text="Нет данных по оценкам" />
      ) : (
        <div className="mt-2 space-y-[8px]">
          {data.map((item) => {
            const barColor =
              item.stars === 5
                ? "#2DBE60"
                : item.stars === 4
                ? "#E7B81D"
                : "#E74C3C";

            const isHovered = hovered === item.stars;

            return (
              <div
                key={item.stars}
                onMouseEnter={() => setHovered(item.stars)}
                onMouseLeave={() => setHovered(null)}
                className="grid cursor-default grid-cols-[18px_1fr_90px] items-center gap-3"
                title={`${item.count} ${pluralize(
                  item.count,
                  "оценка",
                  "оценки",
                  "оценок"
                )}`}
              >
                <div className="text-[12px] text-[#111827]">{item.stars}</div>
                <div className="h-[3px] rounded-full bg-[#D9E1EA]">
                  <div
                    className="h-[3px] rounded-full transition-all duration-200"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: barColor,
                      opacity: hovered !== null && !isHovered ? 0.45 : 1,
                    }}
                  />
                </div>
                <div className="flex items-center justify-end gap-1 text-[12px] text-[#111827] tabular-nums">
                  <span className="text-[#6B7280]">{item.count}</span>
                  <span className="text-[#D1D5DB]">·</span>
                  <span>{Math.round(item.percent)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function NpsSmallSection({
  data,
  satisfaction,
}: {
  data: DashboardData["npsSmall"];
  satisfaction: DashboardData["satisfaction"];
}) {
  const chartData = useMemo(() => {
    if (!data.length) return [];
    return data.map((item) => ({
      index: item.index,
      nps: item.nps,
      label: formatDateShort(new Date(item.bucketStart)),
      range: `${formatDateShort(new Date(item.bucketStart))} – ${formatDateShort(
        new Date(item.bucketEnd)
      )}`,
    }));
  }, [data]);

  const aggregateNps = computeAggregateNps(satisfaction);

  return (
    <section className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
      <div className="mb-1 flex items-baseline justify-between">
        <div className="text-[14px] font-medium text-[#111827]">
          Динамика NPS
        </div>
        {aggregateNps !== null && (
          <div className="text-[20px] font-bold leading-none text-[#111827] tabular-nums">
            {aggregateNps}
          </div>
        )}
      </div>

      {aggregateNps === null ? (
        <EmptyState text="Нет данных по NPS" />
      ) : (
        <div className="h-[90px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="npsSmallFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <ReferenceLine
                y={0}
                stroke="#E5E7EB"
                strokeDasharray="2 2"
              />
              <Tooltip
                cursor={{ stroke: "#CBD5E1", strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as {
                    range: string;
                    nps: number;
                  };
                  return (
                    <div className="rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-[11px] text-[#111827] shadow-[0_4px_10px_rgba(17,24,39,0.08)]">
                      <div className="text-[#6B7280]">{row.range}</div>
                      <div className="font-semibold">
                        NPS: <span className="tabular-nums">{row.nps}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="nps"
                stroke="#3B82F6"
                strokeWidth={1.8}
                fill="url(#npsSmallFill)"
                dot={{ r: 2, fill: "#3B82F6" }}
                activeDot={{ r: 4, fill: "#1D4ED8" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function computeAggregateNps(
  satisfaction: DashboardData["satisfaction"]
): number | null {
  const total = satisfaction.reduce((acc, row) => acc + row.count, 0);
  if (total === 0) return null;
  const promoters = satisfaction.find((r) => r.stars === 5)?.count ?? 0;
  const detractors = satisfaction
    .filter((r) => r.stars <= 3)
    .reduce((acc, r) => acc + r.count, 0);
  return Math.round(((promoters - detractors) / total) * 100);
}

function pluralize(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function formatDateShort(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}`;
}

function LargeBarChart({ values }: { values: number[] }) {
  const safe = values.length ? values : [0];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const range = Math.max(max - min, 1);

  return (
    <div className="flex h-[180px] items-end gap-[8px] border-b border-l border-[#6B7280] pb-[2px] pl-[8px]">
      {safe.map((value, index) => {
        const normalized = ((value - min) / range) * 0.78 + 0.15;

        return (
          <div
            key={index}
            className="w-[10px] rounded-t-[2px] bg-[#D8E5F6]"
            style={{ height: `${Math.max(12, normalized * 180)}px` }}
          />
        );
      })}
    </div>
  );
}

function PercentBadge({
  value,
  tone,
}: {
  value: number;
  tone: "green" | "yellow" | "red";
}) {
  const cls =
    tone === "green"
      ? "bg-[#DDF7E7] text-[#1F8F52]"
      : tone === "yellow"
      ? "bg-[#FDF3CC] text-[#A57A00]"
      : "bg-[#FDE7E7] text-[#C85B5B]";

  return (
    <span
      className={`inline-flex min-w-[34px] items-center justify-center rounded-[5px] px-2 py-[1px] text-[12px] font-medium ${cls}`}
    >
      {value.toFixed(0)}%
    </span>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="text-[11px] tracking-[1px] text-[#F4C21A]">
      {"★".repeat(Math.max(0, Math.min(5, rating)))}
    </span>
  );
}

export default function AnalyticsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [period, setPeriod] = useState<Period>("30");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [dateFrom, setDateFrom] = useState(() =>
    toISODate(getDateRangeByPeriod(period, currentDate).start)
  );
  const [dateTo, setDateTo] = useState(() =>
    toISODate(getDateRangeByPeriod(period, currentDate).end)
  );

  const formatRu = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}.${m}.${y}`;
  };

  function CalendarIcon({ className = "" }: { className?: string }) {
    return (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 3v3M17 3v3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 8h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="5"
          y="5"
          width="14"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  function DateField({
    value,
    onChange,
  }: {
    value: string;
    onChange: (next: string) => void;
  }) {
    return (
      <div className="relative flex h-10 w-[150px] items-center justify-between gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <span className="tabular-nums">{formatRu(value)}</span>
        <CalendarIcon className="text-[#9CA3AF]" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // Native date inputs only open the calendar from the right-edge
          // indicator, so clicking the text/icon did nothing. Open the picker
          // programmatically on any click across the field (and suppress the
          // native double-open). Falls back to default behaviour if unsupported.
          onClick={(e) => {
            const el = e.currentTarget;
            if (typeof el.showPicker === "function") {
              e.preventDefault();
              try {
                el.showPicker();
              } catch {
                /* showPicker can throw outside a user gesture — ignore */
              }
            }
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    );
  }

  useEffect(() => {
    if (useCustomRange) return;
    const next = getDateRangeByPeriod(period, currentDate);
    setDateFrom(toISODate(next.start));
    setDateTo(toISODate(next.end));
  }, [currentDate, period, useCustomRange]);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [platformEnabledMap, setPlatformEnabledMap] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );

    const timeoutId = window.setTimeout(() => {
      setCurrentDate(new Date());
    }, nextMidnight.getTime() - now.getTime());

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentDate]);

  useEffect(() => {
    if (!selectedBranchId) {
      setDashboard(null);
      setError(null);
      setLoading(false);
      setPlatformEnabledMap({});
      return;
    }

    if (useCustomRange && dateFrom && dateTo && dateFrom > dateTo) {
      // Не делаем запрос в "перевёрнутом" диапазоне
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboard(
          selectedBranchId,
          useCustomRange ? { start: dateFrom, end: dateTo } : { period }
        );

        if (!cancelled) {
          setDashboard(data);
          setPlatformEnabledMap(
            Object.fromEntries(
              data.platforms.map((item) => [item.platform, item.enabled])
            )
          );
        }
      } catch {
        if (!cancelled) {
          setDashboard(null);
          setError("Не удалось загрузить аналитику");
          setPlatformEnabledMap({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [dateFrom, dateTo, period, selectedBranchId, useCustomRange]);

  if (!selectedBranchId) {
    return <p className="text-sm text-[#9CA3AF]">Сначала выберите филиал</p>;
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <h1 className="text-[24px] font-[700] leading-[30px] text-[#111827]">
          Аналитика
        </h1>
        <p className="mt-[2px] text-[13px] leading-[16px] text-[#6B7280]">
          Динамика рейтинга и репутации
        </p>

        <div className="mt-4 flex items-center gap-[14px]">
          <div className="flex h-10 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
            {(["week", "30", "90", "year"] as Period[]).map((value) => {
              const active = period === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setPeriod(value);
                    setUseCustomRange(false);
                  }}
                  className={[
                    "px-4 text-[13px]",
                    active
                      ? "bg-[#F3F4F6] font-medium text-[#111827]"
                      : "text-[#9CA3AF] hover:bg-black/[0.02]",
                  ].join(" ")}
                >
                  {value === "week"
                    ? "Неделя"
                    : value === "year"
                    ? "Год"
                    : `${value} дней`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <DateField
              value={dateFrom}
              onChange={(next) => {
                setUseCustomRange(true);
                setDateFrom(next);
              }}
            />
            <span className="text-[13px] text-[#9CA3AF]">—</span>
            <DateField
              value={dateTo}
              onChange={(next) => {
                setUseCustomRange(true);
                setDateTo(next);
              }}
            />
          </div>
        </div>
      </div>

      {loading && !dashboard ? (
        <div className="space-y-4">
          <div className="h-[84px] rounded-[12px] bg-white/70" />
          <div className="h-[205px] rounded-[12px] bg-white/70" />
          <div className="grid grid-cols-[1fr_1fr] gap-4">
            <div className="h-[150px] rounded-[12px] bg-white/70" />
            <div className="h-[150px] rounded-[12px] bg-white/70" />
          </div>
          <div className="h-[170px] rounded-[12px] bg-white/70" />
          <div className="h-[210px] rounded-[12px] bg-white/70" />
        </div>
      ) : !dashboard ? null : (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <section className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
              <div className="grid grid-cols-4 gap-6">
                <MetricStat
                  value={dashboard.sent}
                  labelTop="отправлено"
                  labelBottom=""
                />
                <MetricStat
                  value={dashboard.reviews}
                  labelTop="новых"
                  labelBottom="отзывов"
                  valueClassName="text-[#22A652]"
                />
                <MetricStat
                  value={dashboard.complaints}
                  labelTop="перехвачено"
                  labelBottom="жалоб"
                  valueClassName="text-[#E04B4B]"
                />
                <MetricStat
                  value={dashboard.avgRating.toFixed(1)}
                  labelTop="средняя оценка"
                  labelBottom="новых отзывов"
                />
              </div>
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-white px-5 py-4">
              {dashboard.platforms.length === 0 ? (
                <EmptyState text="Нет данных по площадкам" />
              ) : (
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr className="text-[15px] font-medium text-[#111827]">
                      <th className="w-[169px] pb-2.5">Площадка</th>
                      <th className="w-[88px] pb-2.5">Рейтинг</th>
                      <th className="w-[88px] pb-2.5">Отзывы</th>
                      <th className="w-[119px] pb-2.5">Всего отзывов</th>
                      <th className="w-[106px] pb-2.5">Всего негатива</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.platforms.map((item) => (
                      <tr
                        key={item.platform}
                        className="text-[15px] text-[#111827]"
                      >
                        <td className="py-[6px] pr-2.5">
                          <div className="flex items-center gap-2.5">
                            <PlatformToggle
                              enabled={
                                platformEnabledMap[item.platform] ??
                                item.enabled
                              }
                              onToggle={() =>
                                setPlatformEnabledMap((prev) => ({
                                  ...prev,
                                  [item.platform]: !(
                                    prev[item.platform] ?? item.enabled
                                  ),
                                }))
                              }
                            />
                            <PlatformIcon platform={item.platform} />
                            <span className="truncate">{item.label}</span>
                          </div>
                        </td>
                        <td className="py-[6px]">
                          <RatingBadge value={item.rating} />
                        </td>
                        <td className="py-[6px]">{item.reviews}</td>
                        <td className="py-[6px]">{item.totalReviews}</td>
                        <td className="py-[6px]">
                          <div className="flex items-center gap-2.5">
                            <span>{item.totalNegative}</span>
                            <NegativeBadge
                              value={Math.round(item.negativePercent)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <SatisfactionSection data={dashboard.satisfaction} />

              <NpsSmallSection
                data={dashboard.npsSmall}
                satisfaction={dashboard.satisfaction}
              />
            </div>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
              <div className="mb-3 text-[14px] font-medium text-[#111827]">
                Оценка сотрудников
              </div>

              {dashboard.employees.length === 0 ? (
                <EmptyState text="В выбранном периоде не найдено упоминаний сотрудников" />
              ) : (
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr className="text-[11px] font-medium text-[#111827]">
                      <th className="w-[170px] pb-2">Сотрудник</th>
                      <th className="w-[55px] pb-2">Оценок</th>
                      <th className="w-[42px] pb-2">5 ★</th>
                      <th className="w-[42px] pb-2">4 ★</th>
                      <th className="w-[42px] pb-2">3 ★</th>
                      <th className="w-[42px] pb-2">2 ★</th>
                      <th className="w-[42px] pb-2">1 ★</th>
                      <th className="w-[46px] pb-2">Ср. балл</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.employees.map((employee) => (
                      <tr
                        key={employee.name}
                        className="text-[12px] text-[#111827]"
                      >
                        <td className="py-[5px] pr-2">{employee.name}</td>
                        <td className="py-[5px]">{employee.ratingsCount}</td>
                        <td className="py-[5px]">
                          <PercentBadge
                            value={employee.fiveStarPercent}
                            tone="green"
                          />
                        </td>
                        <td className="py-[5px]">
                          <PercentBadge
                            value={employee.fourStarPercent}
                            tone="yellow"
                          />
                        </td>
                        <td className="py-[5px]">
                          <PercentBadge
                            value={employee.threeStarPercent}
                            tone="red"
                          />
                        </td>
                        <td className="py-[5px]">
                          <PercentBadge
                            value={employee.twoStarPercent}
                            tone="red"
                          />
                        </td>
                        <td className="py-[5px]">
                          <PercentBadge
                            value={employee.oneStarPercent}
                            tone="red"
                          />
                        </td>
                        <td className="py-[5px]">
                          {employee.avgRating.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
              <div className="mb-3 text-[14px] font-medium text-[#111827]">
                Динамика NPS
              </div>

              {dashboard.npsLarge.length === 0 ? (
                <EmptyState text="Нет данных по NPS" />
              ) : (
                <LargeBarChart
                  values={dashboard.npsLarge.map((item) => item.nps)}
                />
              )}
            </section>
          </div>

          <aside className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="mb-3 text-[14px] font-medium text-[#111827]">
              Последние отзывы
            </div>

            <div className="max-h-[calc(100vh-215px)] space-y-4 overflow-y-auto pr-1">
              {dashboard.recentReviews.length === 0 ? (
                <EmptyState text="Нет отзывов за выбранный период" />
              ) : (
                dashboard.recentReviews.map((review) => (
                  <article key={review.id}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                      <span className="font-medium text-[#111827]">
                        {review.reviewerName || "Аноним"}
                      </span>
                      <span className="text-[#A3A3A3]">
                        {review.publishedAt
                          ? new Date(review.publishedAt).toLocaleDateString(
                              "ru-RU"
                            )
                          : ""}
                      </span>
                      <span className="ml-auto text-[#6B7280] underline underline-offset-2">
                        {review.platformLabel}
                      </span>
                      <ReviewStars rating={review.rating} />
                    </div>

                    <p className="mt-1 text-[12px] leading-[15px] text-[#111827]">
                      {review.text || "Без текста"}
                    </p>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
