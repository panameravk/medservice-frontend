export interface Branding {
  publicName: string | null;
  publicCity: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
}

export interface BranchBonus {
  id: number;
  branchId: number;
  isPublished: boolean;
  discountPercent: number;
  description: string;
  startDate: string;
  endDate: string;
  promoCode: string | null;
}

export interface BranchBonusInput {
  discountPercent: number;
  description: string;
  startDate: string;
  endDate: string;
  isPublished?: boolean;
  promoCode?: string | null;
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
  promoCode: string | null;
  websiteUrl: string | null;
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
  promoCode?: string | null;
  websiteUrl?: string | null;
}

export interface BonusCategory {
  id: number;
  name: string;
  sortOrder: number;
  bonuses: AdminBonus[];
}
