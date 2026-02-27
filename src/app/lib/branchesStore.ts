// lib/branchesStore.ts
import { create } from "zustand";
import { getBranches } from "./api";

export type BranchOption = {
  id: string;
  name: string;
};

type BranchesState = {
  branches: BranchOption[];
  selectedBranchId: string | null;
  loading: boolean;
  error: string | null;

  fetchBranches: () => Promise<void>; // ← новый метод, вместо setBranches
  setBranches: (branches: BranchOption[]) => void; // оставим для совместимости
  selectBranch: (id: string | null) => void;
};

export const useBranchesStore = create<BranchesState>((set, get) => ({
  branches: [],
  selectedBranchId: null,
  loading: false,
  error: null,

  // Загружает филиалы с бэкенда
  fetchBranches: async () => {
    set({ loading: true, error: null });
    try {
      const branches = await getBranches();
      get().setBranches(branches);
    } catch (e: unknown) {
      set({ error: (e as Error).message, loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // Оставили как было — на случай если где-то используется напрямую
  setBranches: (branches) =>
    set((s) => {
      const exists =
        s.selectedBranchId && branches.some((b) => b.id === s.selectedBranchId);
      return {
        branches,
        selectedBranchId: exists ? s.selectedBranchId : branches[0]?.id ?? null,
      };
    }),

  selectBranch: (id) => set({ selectedBranchId: id }),
}));
