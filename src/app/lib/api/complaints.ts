import { apiFetch, buildQuery } from "./client";

export interface Complaint {
  id: number;
  branchId: number;
  branchName: string | null;
  clientName: string | null;
  clientPhone: string | null;
  rating: number;
  text: string;
  intercepted: boolean;
  resolved: boolean;
  createdAt: string;
}

export async function getComplaints(params: {
  branchId: string;
  resolved?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ complaints: Complaint[]; total: number }> {
  return apiFetch(
    `/complaints${buildQuery({
      branchId: params.branchId,
      resolved: params.resolved,
      limit: params.limit,
      offset: params.offset,
    })}`
  );
}

export async function resolveComplaint(
  complaintId: number,
  resolved: boolean
): Promise<Complaint> {
  return apiFetch(`/complaints/${complaintId}`, {
    method: "PATCH",
    body: { resolved },
  });
}
