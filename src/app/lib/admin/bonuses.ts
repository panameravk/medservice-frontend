import { apiFetch } from "../api/client";
import type {
  AdminBonus,
  AdminBonusInput,
  BonusCategory,
} from "../../types/bonus";

const ADMIN_SESSION = { session: "admin" as const };

export const adminBonusesApi = {
  async listCategories(): Promise<BonusCategory[]> {
    return apiFetch<BonusCategory[]>("/admin/bonus-categories", ADMIN_SESSION);
  },

  async createCategory(name: string): Promise<BonusCategory> {
    return apiFetch<BonusCategory>("/admin/bonus-categories", {
      ...ADMIN_SESSION,
      method: "POST",
      body: { name },
    });
  },

  async renameCategory(id: number, name: string): Promise<BonusCategory> {
    return apiFetch<BonusCategory>(`/admin/bonus-categories/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: { name },
    });
  },

  async deleteCategory(id: number): Promise<void> {
    await apiFetch<void>(`/admin/bonus-categories/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },

  async createBonus(
    categoryId: number,
    payload: AdminBonusInput
  ): Promise<AdminBonus> {
    return apiFetch<AdminBonus>(
      `/admin/bonus-categories/${categoryId}/bonuses`,
      {
        ...ADMIN_SESSION,
        method: "POST",
        body: payload,
      }
    );
  },

  async updateBonus(
    categoryId: number,
    bonusId: number,
    payload: Partial<AdminBonusInput>
  ): Promise<AdminBonus> {
    return apiFetch<AdminBonus>(
      `/admin/bonus-categories/${categoryId}/bonuses/${bonusId}`,
      {
        ...ADMIN_SESSION,
        method: "PATCH",
        body: payload,
      }
    );
  },

  async deleteBonus(categoryId: number, bonusId: number): Promise<void> {
    await apiFetch<void>(
      `/admin/bonus-categories/${categoryId}/bonuses/${bonusId}`,
      {
        ...ADMIN_SESSION,
        method: "DELETE",
      }
    );
  },
};
