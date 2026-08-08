// Impersonation: суперпользователь открывает кабинет от имени другого
// пользователя (через «Доступы») или проваливается в кабинет филиала
// (клик по названию в «Филиалах»). Флаг живёт в localStorage рядом с
// токенами — пока он есть, кабинет показывает баннер «Аккаунт Администратора».

const STORAGE_KEY = "impersonation";

export type ImpersonationState =
  | { kind: "user"; userId: number; userName: string }
  | { kind: "branch"; branchId: number; branchName: string };

function isBrowser() {
  return typeof window !== "undefined";
}

/** Сырое значение из localStorage — стабильная строка для useSyncExternalStore. */
export function getImpersonationRaw(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function parseImpersonation(
  raw: string | null
): ImpersonationState | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpersonationState;
  } catch {
    return null;
  }
}

export function getImpersonation(): ImpersonationState | null {
  return parseImpersonation(getImpersonationRaw());
}

export function setImpersonation(state: ImpersonationState) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearImpersonation() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
