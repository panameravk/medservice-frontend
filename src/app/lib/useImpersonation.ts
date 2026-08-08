"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { clearTokens, getAccessToken, setTokens } from "./api/client";
import {
  clearImpersonation,
  getImpersonation,
  getImpersonationRaw,
  parseImpersonation,
  type ImpersonationState,
} from "./impersonation";
import { useBranchesStore } from "./branchesStore";

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/** Текущее состояние просмотра чужого аккаунта/филиала (null — обычная сессия). */
export function useImpersonation(): ImpersonationState | null {
  // localStorage есть только в браузере: на сервере снапшот null, на клиенте
  // React сам перерисует после гидратации.
  const raw = useSyncExternalStore(
    subscribeToStorage,
    getImpersonationRaw,
    () => null
  );
  return useMemo(() => parseImpersonation(raw), [raw]);
}

/**
 * Выход из режима просмотра: возвращает админу его собственную user-сессию
 * (admin-токен оставался нетронутым) и ведёт обратно в админ-панель.
 */
export function useExitImpersonation() {
  const router = useRouter();
  const resetBranchesStore = useBranchesStore((s) => s.reset);

  return () => {
    const state = getImpersonation();
    clearImpersonation();
    resetBranchesStore();

    const adminToken = getAccessToken("admin");
    if (adminToken) {
      setTokens(adminToken, "user");
    } else {
      clearTokens("user");
    }

    router.replace(
      state?.kind === "branch" ? "/admin/branches" : "/admin/access"
    );
  };
}
