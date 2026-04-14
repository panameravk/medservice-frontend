import { apiFetch } from "./client";

export interface Branch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  timezone: string;
  specialization: string;
  requestFrequencyDays: number;
  complaintEmails: string[];
  reminderEmails: string[];
  avgRating: number;
  npsScore: number;
}

type BranchDto = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  timezone: string;
  specialization: string;
  requestFrequencyDays: number;
  complaintEmails: string[];
  reminderEmails: string[];
  avgRating: number;
  npsScore: number;
};

type BranchUpdatePayload = Partial<{
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  timezone: string;
  specialization: string;
  requestFrequencyDays: number;
  complaintEmails: string[];
  reminderEmails: string[];
}>;

function mapBranchDto(branch: BranchDto): Branch {
  return {
    ...branch,
    id: String(branch.id),
  };
}

function toBranchUpdateDto(data: BranchUpdatePayload) {
  const dto: Record<string, unknown> = {};

  if ("name" in data) dto.name = data.name;
  if ("address" in data) dto.address = data.address;
  if ("city" in data) dto.city = data.city;
  if ("phone" in data) dto.phone = data.phone;
  if ("timezone" in data) dto.timezone = data.timezone;
  if ("specialization" in data) dto.specialization = data.specialization;
  if ("requestFrequencyDays" in data) {
    dto.request_frequency_days = data.requestFrequencyDays;
  }
  if ("complaintEmails" in data) {
    dto.complaint_emails = data.complaintEmails;
  }
  if ("reminderEmails" in data) {
    dto.reminder_emails = data.reminderEmails;
  }

  return dto;
}

export async function getBranches(): Promise<Branch[]> {
  const data = await apiFetch<{
    branches: BranchDto[];
    total: number;
  }>("/branches");

  return data.branches.map(mapBranchDto);
}

export async function updateBranch(
  branchId: string,
  data: BranchUpdatePayload
): Promise<Branch> {
  const response = await apiFetch<BranchDto>(`/branches/${branchId}`, {
    method: "PATCH",
    body: toBranchUpdateDto(data),
  });

  return mapBranchDto(response);
}
