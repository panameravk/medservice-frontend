import { apiFetch } from "./client";

/**
 * Branch bonuses — the clinic's own promo codes a patient sees after leaving a
 * review. Per-branch, managed from the dashboard (user session). The backend
 * CRUD lives at `/bonuses/branch/*` and `/bonuses/branch-items/*` and is gated
 * by `get_current_user`, so these calls use the default "user" session.
 *
 * The global partner catalog + categories + FAQ are a separate concern handled
 * by the super-admin area (`lib/admin/bonuses.ts`, "admin" session).
 */

export interface BranchBonus {
  id: number;
  branchId: number;
  isPublished: boolean;
  discountPercent: number;
  description: string;
  startDate: string | null;
  endDate: string | null;
  promoCode: string | null;
  sortOrder: number;
}

export type BranchBonusInput = {
  isPublished?: boolean;
  discountPercent?: number;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  promoCode?: string | null;
  sortOrder?: number;
};

export function getBranchBonuses(
  branchId: string | number
): Promise<BranchBonus[]> {
  return apiFetch<BranchBonus[]>(`/bonuses/branch/${branchId}`);
}

export function createBranchBonus(
  branchId: string | number,
  payload: BranchBonusInput
): Promise<BranchBonus> {
  return apiFetch<BranchBonus>(`/bonuses/branch/${branchId}`, {
    method: "POST",
    body: payload,
  });
}

export function updateBranchBonus(
  bonusId: number,
  payload: BranchBonusInput
): Promise<BranchBonus> {
  return apiFetch<BranchBonus>(`/bonuses/branch-items/${bonusId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteBranchBonus(bonusId: number): Promise<void> {
  return apiFetch<void>(`/bonuses/branch-items/${bonusId}`, {
    method: "DELETE",
  });
}
