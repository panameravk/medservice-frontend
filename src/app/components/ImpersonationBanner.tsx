"use client";

import { useImpersonation } from "../lib/useImpersonation";

/**
 * Плашка над кабинетом, когда суперпользователь просматривает чужой аккаунт
 * или кабинет филиала (вход через админку). Выход из режима — через кнопку
 * «Выйти» в меню пользователя (Header / страница выбора филиала).
 */
export function ImpersonationBanner() {
  const state = useImpersonation();

  if (!state) return null;

  const subtitle =
    state.kind === "branch"
      ? `Вы просматриваете кабинет филиала «${state.branchName}»`
      : `Вы просматриваете аккаунт «${state.userName}»`;

  return (
    <div className="bg-[#2B2E39] px-6 py-2.5 text-[13px] text-white/85">
      {subtitle}
    </div>
  );
}
