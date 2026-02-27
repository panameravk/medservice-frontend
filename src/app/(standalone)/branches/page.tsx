"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDateRangeByPeriod, type Period } from "../../lib/date";
import { Unbounded } from "next/font/google";
import { useBranchesStore } from "../../lib/branchesStore";
import { UserIcon } from "../../components/ui/icons/UserIcon";

const unbounded = Unbounded({
  subsets: ["cyrillic"],
  weight: ["600", "700", "800", "900"],
});

type BranchAnalyticsRow = {
  id: string;
  name: string;
  requests: number;
  newReviews: number;
  interceptedComplaints: number;
  avgRating: number;
  nps: number;
};

type AnalyticsResponse = {
  rows: BranchAnalyticsRow[];
};

// -------------------- UI helpers --------------------
function Badge({
  value,
  kind,
}: {
  value: string;
  kind: "good" | "mid" | "bad";
}) {
  const cls =
    kind === "good"
      ? "bg-[#DCFCE7] text-[#166534]"
      : kind === "mid"
      ? "bg-[#FEF9C3] text-[#854D0E]"
      : "bg-[#FEE2E2] text-[#991B1B]";

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center",
        "h-6 w-[44px] rounded-[6px] px-2 text-[12px] leading-none",
        cls,
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function ratingKind(r: number): "good" | "mid" | "bad" {
  if (r >= 4.5) return "good";
  if (r >= 3.2) return "mid";
  return "bad";
}

function npsKind(n: number): "good" | "mid" | "bad" {
  if (n >= 60) return "good";
  if (n >= 20) return "mid";
  return "bad";
}

// -------------------- Mock (пока API нет) --------------------
const MOCK_ROWS: BranchAnalyticsRow[] = [
  {
    id: "1",
    name: "Счастливый взгляд, Сенная ул. 10",
    requests: 1,
    newReviews: 1,
    interceptedComplaints: 1,
    avgRating: 5.0,
    nps: 80,
  },
  {
    id: "2",
    name: "Счастливый взгляд, Невский пр. 12",
    requests: 0,
    newReviews: 0,
    interceptedComplaints: 0,
    avgRating: 4.9,
    nps: 70,
  },
  {
    id: "3",
    name: "Счастливый взгляд, ул. Сизова 6",
    requests: 2,
    newReviews: 2,
    interceptedComplaints: 2,
    avgRating: 4.5,
    nps: 60,
  },
  {
    id: "4",
    name: "Счастливый взгляд, наб. реки Фонтанки 114",
    requests: 4,
    newReviews: 4,
    interceptedComplaints: 4,
    avgRating: 3.5,
    nps: 30,
  },
  {
    id: "5",
    name: "Счастливый взгляд, Литейный пр. 2",
    requests: 8,
    newReviews: 8,
    interceptedComplaints: 8,
    avgRating: 2.5,
    nps: -10,
  },
];

// Если есть API — сюда вставишь реальный URL
async function fetchAnalytics(params: {
  period: Period;
  start: Date;
  end: Date;
}): Promise<AnalyticsResponse> {
  // ✅ пример под реальный бэк:
  // const res = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/analytics/branches?period=${params.period}&start=${params.start.toISOString()}&end=${params.end.toISOString()}`,
  //   { cache: "no-store" }
  // );
  // if (!res.ok) throw new Error("Failed to load analytics");
  // return (await res.json()) as AnalyticsResponse;

  // Пока API нет — мок
  await new Promise((r) => setTimeout(r, 250));
  return { rows: MOCK_ROWS };
}

export default function BranchesPage() {
  const router = useRouter();
  const setBranches = useBranchesStore((s) => s.setBranches);
  const selectBranchGlobal = useBranchesStore((s) => s.selectBranch);

  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userPopRef = useRef<HTMLDivElement>(null);

  const [period, setPeriod] = useState<Period>("30");
  const [rangeLabel, setRangeLabel] = useState(
    () => getDateRangeByPeriod("30").label
  );

  const [rows, setRows] = useState<BranchAnalyticsRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBranch = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  const load = async (p: Period) => {
    const { start, end, label } = getDateRangeByPeriod(p);

    setLoading(true);
    setError(null);
    setRangeLabel(label);

    try {
      const data = await fetchAnalytics({ period: p, start, end });
      setRows(data.rows);
      // если выбранного филиала больше нет в ответе — сбрасываем
      setBranches(data.rows.map((x) => ({ id: x.id, name: x.name })));

      if (selectedId && !data.rows.some((x) => x.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (e) {
      setError("Не удалось загрузить аналитику. Попробуйте позже.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const inside =
        userBtnRef.current?.contains(t) || userPopRef.current?.contains(t);
      if (!inside) setUserOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    load(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPeriodAndReload = (p: Period) => {
    setPeriod(p);
    void load(p);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[rgba(242,243,244,1)]">
      {/* CONTENT */}
      <div className="flex-1">
        {/* TOP */}
        <div className="px-8 pt-6">
          <div className="flex items-start justify-between">
            {/* Logo */}
            <div className="flex items-start gap-1">
              <div
                className={`${unbounded.className} text-[28px] font-[600] tracking-[-0.02em] text-[#111827]`}
              >
                Фидбэк
              </div>
              <div
                className={`${unbounded.className} mt-[6px] text-[12px] italic font-[600] text-[#111827]`}
              >
                ИИ
              </div>
            </div>

            {/* User button */}
            <div className="relative">
              <button
                ref={userBtnRef}
                type="button"
                onClick={() => setUserOpen((v) => !v)}
                className="h-12 w-[220px] rounded-[16px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)] cursor-pointer"
              >
                Сергей П.
              </button>

              {userOpen && (
                <div
                  ref={userPopRef}
                  className="absolute right-0 top-[56px] w-[280px] rounded-[14px] bg-white border border-[#E5E7EB] shadow-[0_18px_40px_rgba(17,24,39,0.18)] p-4 z-30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 flex justify-center">
                        <UserIcon className="w-8 h-8 text-[#111827] ml-[9px]" />
                      </div>

                      <div>
                        <div className="text-[14px] text-[#111827] leading-5">
                          Сергей Popov
                        </div>
                        <div className="text-[12px] text-[#9CA3AF] leading-4">
                          popov.s@yandex.ru
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUserOpen(false)}
                      className="h-8 w-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
                    >
                      ✕
                    </button>
                  </div>

                  <button
                    type="button"
                    className="mt-4 w-full h-10 rounded-[10px]
                  flex items-center gap-3 px-3
                  text-[#000000] text-[14px] 
                  hover:bg-[#F3F4F6] transition cursor-pointer"
                  >
                    <img
                      src="/icons/setup-account_logo.svg"
                      alt="setup-account_logo"
                      className="w-8 h-8 text-[#111827]"
                    />
                    Настроить аккаунт
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserOpen(false);
                      router.push("/login");
                    }}
                    className="mt-3 w-full h-10 rounded-[10px] bg-[#2B2E39] text-white text-[13px] font-semibold shadow-[0_10px_24px_rgba(17,24,39,0.14)] cursor-pointer hover:opacity-90 transition"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>

          <h1 className="mt-6 text-[24px] font-bold text-[#111827]">
            Аналитика по филиалам
          </h1>

          {/* Filters */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
              <button
                type="button"
                className={`px-5 py-2.5 text-[13px] ${
                  period === "week"
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : "text-[#9CA3AF]"
                }`}
                onClick={() => setPeriodAndReload("week")}
              >
                Неделя
              </button>
              <button
                type="button"
                className={`px-5 py-2.5 text-[13px] ${
                  period === "30"
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : "text-[#9CA3AF]"
                }`}
                onClick={() => setPeriodAndReload("30")}
              >
                30 дней
              </button>
              <button
                type="button"
                className={`px-5 py-2.5 text-[13px] ${
                  period === "90"
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : "text-[#9CA3AF]"
                }`}
                onClick={() => setPeriodAndReload("90")}
              >
                90 дней
              </button>
              <button
                type="button"
                className={`px-5 py-2.5 text-[13px] ${
                  period === "year"
                    ? "bg-[#F3F4F6] text-[#111827]"
                    : "text-[#9CA3AF]"
                }`}
                onClick={() => setPeriodAndReload("year")}
              >
                Год
              </button>
            </div>

            <input
              value={rangeLabel}
              readOnly
              className="h-10 w-[200px] rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[13px] text-[#9CA3AF] text-center outline-none"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="px-8 pb-6 pt-6">
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white">
            <div className="px-6 py-4">
              <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.9fr_0.8fr_0.9fr] gap-4 border-b border-[#E5E7EB] pb-3 text-[12px] font-semibold text-[#111827]">
                <div>Филиал</div>
                <div className="text-center">Запросов</div>
                <div className="text-center">Новых отзывов</div>
                <div className="text-center">Перехвачено жалоб</div>
                <div className="text-center">Средняя оценка</div>
                <div className="text-center">NPS по всем оценкам</div>
              </div>

              {loading ? (
                <div className="py-10 text-[13px] text-[#6B7280]">
                  Загрузка аналитики...
                </div>
              ) : error ? (
                <div className="py-10 text-[13px] text-[#991B1B]">{error}</div>
              ) : rows.length === 0 ? (
                <div className="py-10 text-[13px] text-[#6B7280]">
                  Нет данных за выбранный период
                </div>
              ) : (
                <div className="divide-y divide-[#EEF2F7]">
                  {rows.map((r) => {
                    const selected = r.id === selectedId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(r.id);
                          selectBranchGlobal(r.id);
                        }}
                        className={`grid w-full grid-cols-[1.6fr_0.6fr_0.7fr_0.9fr_0.8fr_0.9fr] gap-4 py-4 text-left text-[14px] transition ${
                          selected ? "bg-[#F8FAFC]" : "hover:bg-[#FAFAFA]"
                        }`}
                      >
                        <div className="text-[#111827]">
                          <span className="underline decoration-[#D1D5DB] underline-offset-4">
                            {r.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-center text-[#111827]">
                          {r.requests}
                        </div>
                        <div className="flex items-center justify-center text-[#111827]">
                          {r.newReviews}
                        </div>
                        <div className="flex items-center justify-center text-[#111827]">
                          {r.interceptedComplaints}
                        </div>
                        <div className="flex items-center justify-center">
                          <Badge
                            value={r.avgRating.toFixed(1)}
                            kind={ratingKind(r.avgRating)}
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <Badge value={`${r.nps}%`} kind={npsKind(r.nps)} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* визуально как на макете: карточка "дышит" даже при малом кол-ве строк */}
              <div className="h-[240px]" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-[13px] text-[#6B7280]">
              {selectedBranch
                ? `Вы выбрали: ${selectedBranch.name}`
                : "Выберите филиал из списка"}
            </div>

            <button
              type="button"
              disabled={!selectedBranch}
              onClick={() => {
                if (!selectedBranch) return;
                router.push(`/analytics?branchId=${selectedBranch.id}`);
              }}
              className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold ${
                selectedBranch
                  ? "bg-yellow-400 text-[#111827] hover:bg-yellow-300 active:brightness-90"
                  : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
              }`}
            >
              Выбрать филиал
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-auto pb-6 mb-[1px]">
        <div className="px-6">
          <div className="flex items-center gap-6 text-[12px] leading-[14px]">
            <span className="text-[#111827] text-[14px] font-semibold">
              Все права защищены © ООО «Фидбэк»
            </span>

            <a
              href="#"
              className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
            >
              Лицензия
            </a>

            <a
              href="#"
              className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
            >
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
