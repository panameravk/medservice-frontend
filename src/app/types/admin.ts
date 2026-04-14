export type AdminBranch = {
  id: number;
  name: string;
  publicId: string;
  isActive: boolean;
  primaryContact: string;
  usersCount: number;
  paidUntil: string;
};

export type AdminAccessUser = {
  id: number;
  fullName: string;
  role: string;
  email: string;
  phone: string;
};

export type AdminAccount = {
  id: number;
  fullName: string;
  role: string;
  email: string;
  phone: string;
};
