"use client";

import Image from "next/image";
import { UserIcon } from "../components/ui/icons/UserIcon";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useBranchesStore } from "../lib/branchesStore";
import { authApi } from "../lib/api";
import {
  useExitImpersonation,
  useImpersonation,
} from "../lib/useImpersonation";
import { useRouter } from "next/navigation";

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useOutsideClick(
  refs: Array<RefObject<HTMLElement | null>>,
  onOutside: () => void
) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      const inside = refs.some(
        (ref) => ref.current && ref.current.contains(target)
      );

      if (!inside) {
        onOutside();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside, refs]);
}

export function Header() {
  const router = useRouter();

  const branches = useBranchesStore((s) => s.branches);
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const selectBranch = useBranchesStore((s) => s.selectBranch);
  const fetchBranches = useBranchesStore((s) => s.fetchBranches);
  const resetBranchesStore = useBranchesStore((s) => s.reset);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const [userName, setUserName] = useState("...");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  // Поля модалки «Настроить аккаунт» (заполняются при открытии).
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
      } catch {
        if (cancelled) return;
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

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
      // Сохраняется в общий профиль users — админка («Доступы»)
      // увидит изменения сразу.
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

  const selectedBranch = useMemo(() => {
    if (!branches.length) return null;
    return (
      branches.find((branch) => branch.id === selectedBranchId) ?? branches[0]
    );
  }, [branches, selectedBranchId]);

  const [branchOpen, setBranchOpen] = useState(false);
  const branchBtnRef = useRef<HTMLButtonElement>(null);
  const branchPopRef = useRef<HTMLDivElement>(null);

  const [userOpen, setUserOpen] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const userPopRef = useRef<HTMLDivElement>(null);

  const closeBranchMenu = useCallback(() => setBranchOpen(false), []);
  const closeUserMenu = useCallback(() => setUserOpen(false), []);

  useOutsideClick([branchBtnRef, branchPopRef], closeBranchMenu);
  useOutsideClick([userBtnRef, userPopRef], closeUserMenu);

  const impersonation = useImpersonation();
  const exitImpersonation = useExitImpersonation();

  const handleLogout = () => {
    setUserOpen(false);

    // В режиме просмотра (вход из админки) «Выйти» возвращает в админ-панель,
    // не разрушая админскую сессию.
    if (impersonation) {
      exitImpersonation();
      return;
    }

    authApi.logout();
    resetBranchesStore();
    router.replace("/login");
  };

  return (
    <>
      <div className="px-6 pt-5">
        <div className="relative">
          <div className="relative w-full min-w-0 pr-[0px]">
            <button
              ref={branchBtnRef}
              type="button"
              onClick={() => setBranchOpen((open) => !open)}
              className={[
                "flex h-15 w-full items-center justify-between px-4",
                "rounded-[12px] border border-[#E5E7EB] bg-white",
                "text-[15px] text-[#111827]",
                "shadow-[0_1px_0_rgba(0,0,0,0.02)]",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate">
                  {selectedBranch?.name ?? "Выберите филиал"}
                </span>

                <ChevronDown
                  className={[
                    "shrink-0 text-[#6B7280] transition-transform",
                    branchOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </div>
            </button>

            {branchOpen && branches.length > 0 && (
              <div
                ref={branchPopRef}
                className={[
                  "absolute left-0 top-[64px] z-30 w-[520px]",
                  "rounded-[12px] border border-[#E5E7EB] bg-white p-2",
                  "shadow-[0_12px_30px_rgba(17,24,39,0.14)]",
                ].join(" ")}
              >
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => {
                      selectBranch(branch.id);
                      setBranchOpen(false);
                    }}
                    className={[
                      "w-full rounded-[10px] px-3 py-2 text-left",
                      "text-[14px] text-[#111827]",
                      "hover:bg-[#F3F4F6]",
                    ].join(" ")}
                  >
                    {branch.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="absolute right-1.5 top-[6px] z-10">
            <button
              ref={userBtnRef}
              type="button"
              onClick={() => setUserOpen((open) => !open)}
              className="h-12 w-[220px] cursor-pointer rounded-[10px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
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
                      src="/icons/setup-account_logo.svg"
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
                  onClick={handleLogout}
                  className="mt-3 h-10 w-full cursor-pointer rounded-[10px] bg-[#2B2E39] text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.14)] transition hover:opacity-90"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
                <label className="mb-[8px] block text-[13px] font-medium text-[#111827]">
                  Роль в команде
                </label>
                <input
                  type="text"
                  value={accRole}
                  onChange={(e) => setAccRole(e.target.value)}
                  placeholder="Например, Менеджер"
                  className="h-[44px] w-full rounded-[9px] bg-[#F3F4F6] px-[16px] text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
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
    </>
  );
}
