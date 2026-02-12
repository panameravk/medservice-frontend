import { create } from "zustand";

export type BranchOption = {
  id: string;
  name: string;
};

type BranchesState = {
  branches: BranchOption[];
  selectedBranchId: string | null;

  setBranches: (branches: BranchOption[]) => void;
  selectBranch: (id: string | null) => void;
};

export const useBranchesStore = create<BranchesState>((set) => ({
  branches: [],
  selectedBranchId: null,

  setBranches: (branches) =>
    set((s) => {
      // если выбранного нет — сбросим/поставим первый
      const exists =
        s.selectedBranchId && branches.some((b) => b.id === s.selectedBranchId);

      return {
        branches,
        selectedBranchId: exists ? s.selectedBranchId : branches[0]?.id ?? null,
      };
    }),

  selectBranch: (id) => set({ selectedBranchId: id }),
}));
