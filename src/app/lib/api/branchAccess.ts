import { apiFetch, buildQuery } from "./client";

export interface BranchAccessUser {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  branchIds: number[];
}

type BranchAccessCreatePayload = {
  fullName: string;
  username: string;
  password: string;
  role: string;
  email: string;
  phone: string;
};

type BranchAccessUpdatePayload = {
  fullName: string;
  role: string;
  email: string;
  phone: string;
};

export const branchAccessApi = {
  getAll: (branchId: string): Promise<BranchAccessUser[]> =>
    apiFetch(`/branch-access${buildQuery({ branch_id: branchId })}`),

  create: (
    branchId: string,
    data: BranchAccessCreatePayload
  ): Promise<BranchAccessUser> =>
    apiFetch(`/branch-access${buildQuery({ branch_id: branchId })}`, {
      method: "POST",
      body: data,
    }),

  grant: (branchId: string, username: string): Promise<BranchAccessUser> =>
    apiFetch(`/branch-access/grant${buildQuery({ branch_id: branchId })}`, {
      method: "POST",
      body: { username },
    }),

  update: (
    id: number,
    branchId: string,
    data: BranchAccessUpdatePayload
  ): Promise<BranchAccessUser> =>
    apiFetch(`/branch-access/${id}${buildQuery({ branch_id: branchId })}`, {
      method: "PATCH",
      body: data,
    }),

  revoke: (id: number, branchId: string): Promise<void> =>
    apiFetch(`/branch-access/${id}${buildQuery({ branch_id: branchId })}`, {
      method: "DELETE",
    }),
};
