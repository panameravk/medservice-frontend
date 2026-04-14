import { apiFetch, buildQuery } from "./client";

export interface BlacklistUser {
  id: number;
  branchId: number;
  lastName: string;
  firstName: string;
  phone: string;
  reason: string | null;
}

export const blacklistApi = {
  getAll: (branchId: string): Promise<BlacklistUser[]> =>
    apiFetch(`/blacklist${buildQuery({ branch_id: branchId })}`),

  create: (
    branchId: string,
    data: {
      lastName: string;
      firstName: string;
      phone: string;
      reason?: string;
    }
  ): Promise<BlacklistUser> =>
    apiFetch(`/blacklist${buildQuery({ branch_id: branchId })}`, {
      method: "POST",
      body: data,
    }),

  update: (
    id: number,
    data: Partial<{
      lastName: string;
      firstName: string;
      phone: string;
      reason: string | null;
    }>
  ): Promise<BlacklistUser> =>
    apiFetch(`/blacklist/${id}`, {
      method: "PATCH",
      body: data,
    }),

  delete: (id: number): Promise<void> =>
    apiFetch(`/blacklist/${id}`, { method: "DELETE" }),
};
