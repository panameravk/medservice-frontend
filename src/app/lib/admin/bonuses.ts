import { apiFetch } from "../api/client";

// ── Types (camelCase, matching the backend's APIModel aliases) ───────────────

export interface AdminBranchBonus {
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

export interface AdminPartnerBonus {
  id: number;
  categoryId: number;
  isPublished: boolean;
  companyName: string;
  logoUrl: string | null;
  city: string;
  discountPercent: number;
  description: string;
  startDate: string | null;
  endDate: string | null;
  promoCode: string | null;
  websiteUrl: string | null;
  sortOrder: number;
}

export interface AdminBonusCategory {
  id: number;
  name: string;
  sortOrder: number;
  isPublished: boolean;
  bonuses: AdminPartnerBonus[];
}

export interface AdminFaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface BonusOverview {
  branchBonuses: AdminBranchBonus[];
  categories: AdminBonusCategory[];
  faq: AdminFaqItem[];
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

export type PartnerBonusInput = {
  categoryId?: number;
  isPublished?: boolean;
  companyName?: string;
  logoUrl?: string | null;
  city?: string;
  discountPercent?: number;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  promoCode?: string | null;
  websiteUrl?: string | null;
  sortOrder?: number;
};

export type CategoryInput = {
  name?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export type FaqInput = {
  question?: string;
  answer?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

const ADMIN_SESSION = { session: "admin" as const };

// ── Overview ─────────────────────────────────────────────────────────────────

export const adminBonusesApi = {
  /** Everything the bonus-management page needs for one branch. */
  getOverview(branchId: number): Promise<BonusOverview> {
    return apiFetch<BonusOverview>(
      `/bonuses/admin?branchId=${branchId}`,
      ADMIN_SESSION
    );
  },
};

// ── Branch bonuses (per-branch) ──────────────────────────────────────────────

export const adminBranchBonusesApi = {
  create(branchId: number, payload: BranchBonusInput): Promise<AdminBranchBonus> {
    return apiFetch<AdminBranchBonus>(`/bonuses/branch/${branchId}`, {
      ...ADMIN_SESSION,
      method: "POST",
      body: payload,
    });
  },
  update(id: number, payload: BranchBonusInput): Promise<AdminBranchBonus> {
    return apiFetch<AdminBranchBonus>(`/bonuses/branch-items/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: payload,
    });
  },
  delete(id: number): Promise<void> {
    return apiFetch<void>(`/bonuses/branch-items/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },
};

// ── Categories (global) ──────────────────────────────────────────────────────

export const adminCategoriesApi = {
  getAll(): Promise<AdminBonusCategory[]> {
    return apiFetch<AdminBonusCategory[]>("/bonuses/categories", ADMIN_SESSION);
  },
  create(payload: CategoryInput): Promise<AdminBonusCategory> {
    return apiFetch<AdminBonusCategory>("/bonuses/categories", {
      ...ADMIN_SESSION,
      method: "POST",
      body: payload,
    });
  },
  update(id: number, payload: CategoryInput): Promise<AdminBonusCategory> {
    return apiFetch<AdminBonusCategory>(`/bonuses/categories/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: payload,
    });
  },
  delete(id: number): Promise<void> {
    return apiFetch<void>(`/bonuses/categories/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },
};

// ── Partner bonuses (global, inside a category) ──────────────────────────────

export const adminPartnerBonusesApi = {
  create(payload: PartnerBonusInput & { categoryId: number }): Promise<AdminPartnerBonus> {
    return apiFetch<AdminPartnerBonus>("/bonuses/partner-items", {
      ...ADMIN_SESSION,
      method: "POST",
      body: payload,
    });
  },
  update(id: number, payload: PartnerBonusInput): Promise<AdminPartnerBonus> {
    return apiFetch<AdminPartnerBonus>(`/bonuses/partner-items/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: payload,
    });
  },
  delete(id: number): Promise<void> {
    return apiFetch<void>(`/bonuses/partner-items/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },
};

// ── FAQ (global) ──────────────────────────────────────────────────────────────

export const adminFaqApi = {
  getAll(): Promise<AdminFaqItem[]> {
    return apiFetch<AdminFaqItem[]>("/bonuses/faq", ADMIN_SESSION);
  },
  create(payload: FaqInput): Promise<AdminFaqItem> {
    return apiFetch<AdminFaqItem>("/bonuses/faq", {
      ...ADMIN_SESSION,
      method: "POST",
      body: payload,
    });
  },
  update(id: number, payload: FaqInput): Promise<AdminFaqItem> {
    return apiFetch<AdminFaqItem>(`/bonuses/faq/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: payload,
    });
  },
  delete(id: number): Promise<void> {
    return apiFetch<void>(`/bonuses/faq/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },
};
