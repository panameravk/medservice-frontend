"use client";

import Image from "next/image";
import { AuthGuard } from "../../components/AuthGuard";
import { ImpersonationBanner } from "../../components/ImpersonationBanner";
import {
  useExitImpersonation,
  useImpersonation,
} from "../../lib/useImpersonation";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getDateRangeByPeriod, type Period } from "../../lib/date";
import { Unbounded } from "next/font/google";
import { useBranchesStore } from "../../lib/branchesStore";
import { UserIcon } from "../../components/ui/icons/UserIcon";
import {
  authApi,
  getBranches,
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

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1.6fr_0.6fr_0.7fr_0.9fr_0.8fr_0.9fr] gap-4 px-0 py-4">
      <div className="h-4 w-48 rounded bg-black/5" />
      <div className="mx-auto h-4 w-8 rounded bg-black/5" />
      <div className="mx-auto h-4 w-8 rounded bg-black/5" />
      <div className="mx-auto h-4 w-8 rounded bg-black/5" />
      <div className="mx-auto h-6 w-11 rounded-[6px] bg-black/5" />
      <div className="mx-auto h-6 w-11 rounded-[6px] bg-black/5" />
    </div>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
  formatRu,
  onChange,
}: {
  value: string;
  formatRu: (value: string) => string;
  onChange: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openCalendar = () => {
    const input = inputRef.current;

    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  return (
    <button
      type="button"
      onClick={openCalendar}
      className="relative flex h-10 w-[150px] items-center justify-between gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] shadow-[0_1px_0_rgba(0,0,0,0.02)]"
    >
      <span className="tabular-nums">{formatRu(value)}</span>

      <svg
        className="text-[#9CA3AF]"
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

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        tabIndex={-1}
      />
    </button>
  );
}

export default function BranchesPage() {
  const router = useRouter();

  const setBranches = useBranchesStore((s) => s.setBranches);
  const resetBranchesStore = useBranchesStore((s) => s.reset);
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const selectBranchGlobal = useBranchesStore((s) => s.selectBranch);

  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userPopRef = useRef<HTMLDivElement>(null);

  const impersonation = useImpersonation();
  const exitImpersonation = useExitImpersonation();

  const toISODate = (d: Date) => d.toISOString().slice(0, 10);

  const [activePreset, setActivePreset] = useState<Period | null>("30");

  const initialRange = getDateRangeByPeriod("30");
  const [dateFrom, setDateFrom] = useState(() => toISODate(initialRange.start));
  const [dateTo, setDateTo] = useState(() => toISODate(initialRange.end));

  const formatRu = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return iso;
    return `${d}.${m}.${y}`;
  };

  const [rows, setRows] = useState<BranchAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState("...");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  // Роль может менять только суперпользователь — обычный юзер её только видит.
  const [userIsSuperuser, setUserIsSuperuser] = useState(false);

  // Модалка «Настроить аккаунт» — та же, что в шапке внутри (app).
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [accEmail, setAccEmail] = useState("");
  const [accPassword, setAccPassword] = useState("");
  const [accName, setAccName] = useState("");
  const [accPhone, setAccPhone] = useState("");
  const [accRole, setAccRole] = useState("");
  const [accSaving, setAccSaving] = useState(false);
  const [accError, setAccError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const user = await authApi.me();

        if (cancelled) return;

        setUserName(user.fullName || user.username);
        setUserEmail(user.email);
        setUserPhone(user.phone);
        setUserRole(user.role);
        setUserIsSuperuser(user.isSuperuser);
      } catch {
        if (cancelled) return;

        authApi.logout();
        resetBranchesStore();
        router.replace("/login");
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [resetBranchesStore, router]);

  const openAccountSettings = () => {
    setAccEmail(userEmail);
    setAccPassword("");
    setAccName(userName === "..." ? "" : userName);
    setAccPhone(userPhone ?? "");
    setAccRole(userRole ?? "");
    setAccError(null);
    setIsAccountSettingsOpen(true);
  };

  const handleAccountSave = async () => {
    if (accSaving) return;

    const password = accPassword.trim();
    if (password && password.length < 8) {
      setAccError("Пароль должен быть не короче 8 символов");
      return;
    }
    if (!accEmail.trim()) {
      setAccError("Email не может быть пустым");
      return;
    }

    setAccError(null);
    setAccSaving(true);
    try {
      const updated = await authApi.updateMe({
        email: accEmail.trim(),
        fullName: accName.trim() || null,
        phone: accPhone.trim() || null,
        role: accRole.trim() || null,
        ...(password ? { password } : {}),
      });
      setUserName(updated.fullName || updated.username);
      setUserEmail(updated.email);
      setUserPhone(updated.phone);
      setUserRole(updated.role);
      setIsAccountSettingsOpen(false);
    } catch (e) {
      setAccError(
        e instanceof Error ? e.message : "Не удалось сохранить изменения"
      );
    } finally {
      setAccSaving(false);
    }
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside =
        userBtnRef.current?.contains(target) ||
        userPopRef.current?.contains(target);

      if (!inside) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPageData = async () => {
      try {
        setError(null);
        setLoading(true);

        if (dateFrom && dateTo && dateFrom > dateTo) {
          setError("Дата начала не может быть позже даты окончания");
          setRows([]);
          return;
        }

        const analyticsParams =
          activePreset !== null
            ? { period: activePreset }
            : { start: dateFrom, end: dateTo };

        const [analyticsRows, branches] = await Promise.all([
          getBranchesAnalytics(analyticsParams),
          getBranches(),
        ]);

        if (cancelled) return;

        setRows(analyticsRows);
        setBranches(branches);
      } catch {
        if (cancelled) return;

        setRows([]);
        setError(
          "Не удалось загрузить аналитику по филиалам. Попробуйте позже."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    void loadPageData();

    return () => {
      cancelled = true;
    };
  }, [activePreset, dateFrom, dateTo, setBranches]);

  useEffect(() => {
    if (rows.length === 0) return;

    const hasSelected =
      selectedBranchId !== null &&
      rows.some((row) => String(row.id) === selectedBranchId);

    if (!hasSelected) {
      selectBranchGlobal(String(rows[0].id));
    }
  }, [rows, selectedBranchId, selectBranchGlobal]);

  const skeletonCount = rows.length > 0 ? rows.length : 5;

  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col bg-[rgba(242,243,244,1)]">
        <ImpersonationBanner />
        <div className="flex-1">
          <div className="px-8 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-1">
                <div
                  className={`${unbounded.className} text-[28px] font-[600] tracking-[-0.02em] text-[#111827]`}
                >
                  Фидбэк
                </div>
              </div>

              <div className="relative">
                <button
                  ref={userBtnRef}
                  type="button"
                  onClick={() => setUserOpen((prev) => !prev)}
                  className="h-12 w-[220px] cursor-pointer rounded-[16px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
                >
                  {userName}
                </button>

                {userOpen && (
                  <div
                    ref={userPopRef}
                    className="absolute right-0 top-[56px] z-30 w-[280px] rounded-[14px] border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_40px_rgba(17,24,39,0.18)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex w-10 justify-center">
                          <UserIcon className="ml-[9px] h-8 w-8 text-[#111827]" />
                        </div>
                        <div>
                          <div className="text-[14px] leading-5 text-[#111827]">
                            {userName}
                          </div>
                          <div className="text-[12px] leading-4 text-[#9CA3AF]">
                            {userEmail}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setUserOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
                      >
                        ✕
                      </button>
                    </div>

                    {!impersonation && (
                      <button
                        type="button"
                        onClick={() => {
                          setUserOpen(false);
                          openAccountSettings();
                        }}
                        className="mt-4 flex h-10 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-[14px] text-[#000000] transition hover:bg-[#F3F4F6]"
                      >
                        <Image
                          src="/Icons/setup-account_logo.svg"
                          alt="Настроить аккаунт"
                          width={32}
                          height={32}
                          className="h-8 w-8"
                        />
                        Настроить аккаунт
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUserOpen(false);
                        // В режиме просмотра «Выйти» возвращает в админ-панель.
                        if (impersonation) {
                          exitImpersonation();
                          return;
                        }
                        authApi.logout();
                        resetBranchesStore();
                        router.replace("/login");
                      }}
                      className="mt-3 h-10 w-full cursor-pointer rounded-[10px] bg-[#2B2E39] text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.14)] transition hover:opacity-90"
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

            <div className="mt-4 flex items-center gap-6">
              <div className="flex overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
                {(["week", "30", "90", "year"] as Period[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`px-5 py-2.5 text-[13px] transition-colors ${
                      activePreset === value
                        ? "bg-[#F3F4F6] font-medium text-[#111827]"
                        : "text-[#9CA3AF] hover:bg-black/[0.02]"
                    }`}
                    onClick={() => {
                      const next = getDateRangeByPeriod(value, new Date());
                      setActivePreset(value);
                      setDateFrom(toISODate(next.start));
                      setDateTo(toISODate(next.end));
                    }}
                  >
                    {value === "week"
                      ? "Неделя"
                      : value === "year"
                      ? "Год"
                      : `${value} дней`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <DateField
                  value={dateFrom}
                  formatRu={formatRu}
                  onChange={(next) => {
                    setActivePreset(null);
                    setDateFrom(next);
                  }}
                />
                <span className="text-[13px] text-[#9CA3AF]">—</span>
                <DateField
                  value={dateTo}
                  formatRu={formatRu}
                  onChange={(next) => {
                    setActivePreset(null);
                    setDateTo(next);
                  }}
                />
              </div>
            </div>
          </div>

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

                <div className="min-h-[320px]">
                  {error ? (
                    <div className="py-10 text-[13px] text-[#991B1B]">
                      {error}
                    </div>
                  ) : initialLoading ? (
                    <div className="divide-y divide-[#EEF2F7] opacity-60">
                      {Array.from({ length: skeletonCount }).map((_, index) => (
                        <SkeletonRow key={index} />
                      ))}
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="py-10 text-[13px] text-[#6B7280]">
                      Нет данных за выбранный период
                    </div>
                  ) : (
                    <div className="relative">
                      {loading && (
                        <div className="absolute inset-0 z-10 rounded-[8px] bg-white/55 backdrop-blur-[1px]" />
                      )}

                      <div className="divide-y divide-[#EEF2F7]">
                        {rows.map((row) => {
                          const isSelected =
                            String(row.id) === selectedBranchId;

                          return (
                            <button
                              key={row.id}
                              type="button"
                              onClick={() => selectBranchGlobal(String(row.id))}
                              onDoubleClick={() => {
                                selectBranchGlobal(String(row.id));
                                router.push("/analytics");
                              }}
                              className={`grid w-full grid-cols-[1.6fr_0.6fr_0.7fr_0.9fr_0.8fr_0.9fr] gap-4 py-4 text-left text-[14px] transition ${
                                isSelected
                                  ? "bg-[#F8FAFC]"
                                  : "hover:bg-[#FAFAFA]"
                              }`}
                            >
                              <div className="text-[#111827]">
                                <span className="underline decoration-[#D1D5DB] underline-offset-4">
                                  {row.name}
                                </span>
                              </div>

                              <div className="flex items-center justify-center text-[#111827]">
                                {row.requests}
                              </div>
                              <div className="flex items-center justify-center text-[#111827]">
                                {row.newReviews}
                              </div>
                              <div className="flex items-center justify-center text-[#111827]">
                                {row.interceptedComplaints}
                              </div>
                              <div className="flex items-center justify-center">
                                <Badge
                                  value={row.avgRating.toFixed(1)}
                                  kind={ratingKind(row.avgRating)}
                                />
                              </div>
                              <div className="flex items-center justify-center">
                                <Badge
                                  value={`${row.nps}%`}
                                  kind={npsKind(row.nps)}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto pb-6">
          <div className="px-6">
            <div className="flex items-center gap-6 text-[12px] leading-[14px]">
              <span className="text-[14px] font-semibold text-[#111827]">
                Все права защищены © ООО «Фидбэк»
              </span>
              <a
                href="https://fdbck.ru/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
              >
                Пользовательское соглашение
              </a>
              <a
                href="https://fdbck.ru/cookie-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
              >
                Политика использования файлов Cookie
              </a>
            </div>
          </div>
        </footer>

        {isAccountSettingsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
            onClick={() => setIsAccountSettingsOpen(false)}
          >
            <div
              className="w-full max-w-[417px] rounded-[16px] bg-white px-[22px] pb-[18px] pt-[22px] shadow-[0_18px_45px_rgba(15,23,42,0.22)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="space-y-[17px]">
                <div>
                  <label className="mb-[8px] block text-[13px] font-medium text-[#111827]">
                    Email-логин
                  </label>
                  <input
                    type="email"
                    value={accEmail}
                    onChange={(e) => setAccEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="h-[44px] w-full rounded-[9px] bg-[#F3F4F6] px-[16px] text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="mb-[8px] block text-[13px] font-medium text-[#111827]">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={accPassword}
                    onChange={(e) => setAccPassword(e.target.value)}
                    placeholder="Оставьте пустым, чтобы не менять"
                    className="h-[44px] w-full rounded-[9px] bg-[#F3F4F6] px-[16px] text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="mb-[8px] block text-[13px] font-medium text-[#111827]">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="h-[44px] w-full rounded-[9px] bg-[#F3F4F6] px-[16px] text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="mb-[8px] block text-[13px] font-medium text-[#111827]">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={accPhone}
                    onChange={(e) => setAccPhone(e.target.value)}
                    placeholder="+7 999 000 00 00"
                    className="h-[44px] w-full rounded-[9px] bg-[#F3F4F6] px-[16px] text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                  />
                </div>

                <div>
                  <label className="mb-[8px] flex items-center gap-1.5 text-[13px] font-medium text-[#111827]">
                    Роль в команде
                    {!userIsSuperuser && (
                      <LockIcon className="h-3.5 w-3.5 text-[#9CA3AF]" />
                    )}
                  </label>
                  <input
                    type="text"
                    value={accRole}
                    onChange={(e) => setAccRole(e.target.value)}
                    readOnly={!userIsSuperuser}
                    disabled={!userIsSuperuser}
                    placeholder="Например, Менеджер"
                    className="h-[44px] w-full rounded-[9px] bg-[#F3F4F6] px-[16px] text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                  />
                  {!userIsSuperuser && (
                    <p className="mt-[6px] text-[12px] leading-snug text-[#9CA3AF]">
                      Роль назначает администратор.
                    </p>
                  )}
                </div>

                {accError && (
                  <p className="text-[13px] leading-snug text-[#DC2626]">
                    {accError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => void handleAccountSave()}
                  disabled={accSaving}
                  className="mt-[2px] h-[44px] w-full rounded-[9px] bg-black text-[13px] font-medium text-white transition hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {accSaving ? "Сохраняем..." : "Сохранить"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAccountSettingsOpen(false)}
                  className="block h-[28px] w-full text-center text-[13px] text-[#6B7280]"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
