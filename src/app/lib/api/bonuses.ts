import { apiFetch } from "./client";
import type {
  Branding,
  BranchBonus,
  BranchBonusInput,
} from "../../types/bonus";

export async function getBranding(branchId: number): Promise<Branding> {
  return apiFetch<Branding>(`/branches/${branchId}/branding`);
}

export async function updateBranding(
  branchId: number,
  payload: Partial<Branding>
): Promise<Branding> {
  return apiFetch<Branding>(`/branches/${branchId}/branding`, {
    method: "PATCH",
    body: payload,
  });
}

export async function listBranchBonuses(
  branchId: number
): Promise<BranchBonus[]> {
  return apiFetch<BranchBonus[]>(`/branches/${branchId}/bonuses`);
}

export async function createBranchBonus(
  branchId: number,
  payload: BranchBonusInput
): Promise<BranchBonus> {
  return apiFetch<BranchBonus>(`/branches/${branchId}/bonuses`, {
    method: "POST",
    body: payload,
  });
}

export async function updateBranchBonus(
  branchId: number,
  bonusId: number,
  payload: Partial<BranchBonusInput>
): Promise<BranchBonus> {
  return apiFetch<BranchBonus>(`/branches/${branchId}/bonuses/${bonusId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteBranchBonus(
  branchId: number,
  bonusId: number
): Promise<void> {
  await apiFetch<void>(`/branches/${branchId}/bonuses/${bonusId}`, {
    method: "DELETE",
  });
}
