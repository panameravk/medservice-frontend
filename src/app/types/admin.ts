export type AdminBranch = {
  id: number;
  name: string;
  publicId: string;
  isActive: boolean;
  primaryContact: string;
  employeesCount: number;
  paidUntil: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  specialization: string;
  timezone: string;
  requestFrequencyDays: number;
  complaintEmails: string[];
  reminderEmails: string[];
  platformUrls: Record<string, string>;
};

export type AdminAccessUser = {
  id: number;
  fullName: string | null;
  username: string;
  role: string | null;
  email: string;
  phone: string | null;
  isSuperuser: boolean;
  branchIds: number[];
};

export type AdminAccount = {
  id: number;
  fullName: string | null;
  username: string;
  role: string | null;
  email: string;
  phone: string | null;
  isSuperuser: boolean;
};
