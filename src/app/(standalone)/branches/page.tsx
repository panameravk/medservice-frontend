"use client";

import { AuthGuard } from "../../components/AuthGuard";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDateRangeByPeriod, type Period } from "../../lib/date";
import { Unbounded } from "next/font/google";
import { useBranchesStore } from "../../lib/branchesStore";
import { UserIcon } from "../../components/ui/icons/UserIcon";
import {
  authApi,
  getBranchesAnalytics,
  type BranchAnalyticsRow,
} from "../../lib/api";

const unbounded = Unbounded({
  subsets: ["cyrillic"],
  weight: ["600", "700", "800", "900"],
});

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

// Skeleton row for loading state — same height as real row
function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.9fr_0.8fr_0.9fr] gap-4 py-4 px-0">
      <div className="h-4 w-48 rounded bg-black/5" />
      <div className="mx-auto h-4 w-8 rounded bg-black/5" />
      <div className="mx-auto h-4 w-8 rounded bg-black/5" />
      <div className="mx-auto h-4 w-8 rounded bg-black/5" />
      <div className="mx-auto h-6 w-11 rounded-[6px] bg-black/5" />
      <div className="mx-auto h-6 w-11 rounded-[6px] bg-black/5" />
    </div>
  );
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
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [userName, setUserName] = useState("...");
  const [userEmail, setUserEmail] = useState("");

  const selectedBranch = useMemo(
    () => rows.find((r) => String(r.id) === selectedId) ?? null,
    [rows, selectedId]
  );

  // Keep last known name so footer doesn't flicker during reload
  const displayName = selectedBranch?.name ?? selectedName;

  const load = async (p: Period) => {
    const { label } = getDateRangeByPeriod(p);
    setLoading(true);
    setError(null);
    setRangeLabel(label);

    try {
      const data = await getBranchesAnalytics(p);
      setRows(data);
      setBranches(data.map((x) => ({ id: String(x.id), name: x.name })));
      if (selectedId && !data.some((x) => String(x.id) === selectedId)) {
        setSelectedId(null);
      }
    } catch {
      setError("Не удалось загрузить аналитику. Попробуйте позже.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    authApi
      .me()
      .then((u) => {
        setUserName(u.fullName || u.username);
        setUserEmail(u.email);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

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
    void load(period);
  }, []);

  const setPeriodAndReload = (p: Period) => {
    setPeriod(p);
    void load(p);
  };

  // Number of skeleton rows = last known rows count (or 5 on first load)
  const skeletonCount = rows.length > 0 ? rows.length : 5;

  return (
    <AuthGuard>
      <main className="min-h-screen flex flex-col bg-[rgba(242,243,244,1)]">
        <div className="flex-1">
          <div className="px-8 pt-6">
            {/* Header */}
            <div className="flex items-start justify-between">
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

              <div className="relative">
                <button
                  ref={userBtnRef}
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  className="h-12 w-[220px] rounded-[16px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)] cursor-pointer"
                >
                  {userName}
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
                            {userName}
                          </div>
                          <div className="text-[12px] text-[#9CA3AF] leading-4">
                            {userEmail}
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
                      onClick={() => {
                        authApi.logout();
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

            {/* Period selector */}
            <div className="mt-4 flex items-center gap-6">
              <div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
                {(["week", "30", "90", "year"] as Period[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`px-5 py-2.5 text-[13px] transition-colors ${
                      period === p
                        ? "bg-[#F3F4F6] text-[#111827] font-medium"
                        : "text-[#9CA3AF] hover:bg-black/[0.02]"
                    }`}
                    onClick={() => setPeriodAndReload(p)}
                  >
                    {p === "week"
                      ? "Неделя"
                      : p === "year"
                      ? "Год"
                      : `${p} дней`}
                  </button>
                ))}
              </div>

              <input
                value={rangeLabel}
                readOnly
                className="h-10 w-[200px] rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[13px] text-[#9CA3AF] text-center outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="px-8 pb-6 pt-6">
            <div className="rounded-[12px] border border-[#E5E7EB] bg-white">
              <div className="px-6 py-4">
                {/* Table header */}
                <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.9fr_0.8fr_0.9fr] gap-4 border-b border-[#E5E7EB] pb-3 text-[12px] font-semibold text-[#111827]">
                  <div>Филиал</div>
                  <div className="text-center">Запросов</div>
                  <div className="text-center">Новых отзывов</div>
                  <div className="text-center">Перехвачено жалоб</div>
                  <div className="text-center">Средняя оценка</div>
                  <div className="text-center">NPS по всем оценкам</div>
                </div>

                {/* Fixed-height body — no layout shift */}
                <div className="min-h-[320px]">
                  {error ? (
                    <div className="py-10 text-[13px] text-[#991B1B]">
                      {error}
                    </div>
                  ) : loading ? (
                    // Skeleton rows — same grid as real rows, same count
                    <div className="divide-y divide-[#EEF2F7] opacity-60">
                      {Array.from({ length: skeletonCount }).map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="py-10 text-[13px] text-[#6B7280]">
                      Нет данных за выбранный период
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEF2F7]">
                      {rows.map((r) => {
                        const selected = String(r.id) === selectedId;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedId(String(r.id));
                              setSelectedName(r.name);
                              selectBranchGlobal(String(r.id));
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
                              <Badge
                                value={`${r.nps}%`}
                                kind={npsKind(r.nps)}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer row */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[13px] text-[#6B7280]">
                {displayName
                  ? `Вы выбрали: ${displayName}`
                  : "Выберите филиал из списка"}
              </div>

              <button
                type="button"
                disabled={!displayName}
                onClick={() => {
                  if (!selectedBranch && !selectedId) return;
                  router.push("/analytics");
                }}
                className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold transition ${
                  displayName
                    ? "bg-yellow-400 text-[#111827] hover:bg-yellow-300 active:brightness-90"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                Выбрать филиал
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-auto pb-6">
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
    </AuthGuard>
  );
}
