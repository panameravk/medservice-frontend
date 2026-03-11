import { create } from "zustand";
import { getBranches, type Branch } from "../lib/api";

export type BranchOption = Branch;

type BranchesState = {
  branches: BranchOption[];
  selectedBranchId: string | null;
  loading: boolean;
  error: string | null;

  fetchBranches: () => Promise<void>;
  setBranches: (branches: BranchOption[]) => void;
  updateBranchInStore: (branch: BranchOption) => void;
  selectBranch: (id: string | null) => void;
};

export const useBranchesStore = create<BranchesState>((set, get) => ({
  branches: [],
  selectedBranchId: null,
  loading: false,
  error: null,

  fetchBranches: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const nextBranches = await getBranches();
      get().setBranches(nextBranches);
    } catch (e: unknown) {
      set({ error: (e as Error).message || "Не удалось загрузить филиалы" });
    } finally {
      set({ loading: false });
    }
  },

  setBranches: (branches) =>
    set((s) => {
      const exists =
        s.selectedBranchId !== null &&
        branches.some((b) => b.id === s.selectedBranchId);

      const nextSelectedBranchId = exists
        ? s.selectedBranchId
        : branches[0]?.id ?? null;

      return {
        branches,
        selectedBranchId: nextSelectedBranchId,
      };
    }),

  updateBranchInStore: (branch) =>
    set((s) => ({
      branches: s.branches.map((b) =>
        b.id === branch.id ? { ...b, ...branch } : b
      ),
    })),

  selectBranch: (id) => set({ selectedBranchId: id }),
}));
