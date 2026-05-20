import { apiFetch } from "../api/client";
import type { FaqItem, FaqItemInput } from "../../types/faq";

const ADMIN_SESSION = { session: "admin" as const };

export const adminFaqApi = {
  async list(): Promise<FaqItem[]> {
    return apiFetch<FaqItem[]>("/admin/faq", ADMIN_SESSION);
  },

  async create(payload: FaqItemInput): Promise<FaqItem> {
    return apiFetch<FaqItem>("/admin/faq", {
      ...ADMIN_SESSION,
      method: "POST",
      body: payload,
    });
  },

  async update(id: number, payload: Partial<FaqItemInput>): Promise<FaqItem> {
    return apiFetch<FaqItem>(`/admin/faq/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: payload,
    });
  },

  async delete(id: number): Promise<void> {
    await apiFetch<void>(`/admin/faq/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },
};
