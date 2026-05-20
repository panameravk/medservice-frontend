export interface Branding {
  publicName: string | null;
  publicCity: string | null;
  logoUrl: string | null;
}

export interface BranchBonus {
  id: number;
  branchId: number;
  isPublished: boolean;
  discountPercent: number;
  description: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
}

export interface BranchBonusInput {
  discountPercent: number;
  description: string;
  startDate: string;
  endDate: string;
  isPublished?: boolean;
}

export interface AdminBonus {
  id: number;
  categoryId: number;
  isPublished: boolean;
  companyName: string;
  logoUrl: string | null;
  city: string;
  discountPercent: number;
  description: string;
  startDate: string;
  endDate: string;
}

export interface AdminBonusInput {
  companyName: string;
  logoUrl: string | null;
  city: string;
  discountPercent: number;
  description: string;
  startDate: string;
  endDate: string;
  isPublished?: boolean;
}

export interface BonusCategory {
  id: number;
  name: string;
  sortOrder: number;
  bonuses: AdminBonus[];
}
