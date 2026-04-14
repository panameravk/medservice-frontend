import { create } from "zustand";
import { getBranches, type Branch } from "../lib/api";

export type BranchOption = Branch;

const STORAGE_KEY = "selected_branch_id";

function getStoredBranchId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredBranchId(branchId: string | null) {
  if (typeof window === "undefined") return;

  if (branchId) {
    localStorage.setItem(STORAGE_KEY, branchId);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

type BranchesState = {
  branches: BranchOption[];
  selectedBranchId: string | null;
  loading: boolean;
  error: string | null;

  fetchBranches: () => Promise<void>;
  setBranches: (branches: BranchOption[]) => void;
  updateBranchInStore: (branch: BranchOption) => void;
  selectBranch: (id: string | null) => void;
  reset: () => void;
};

export const useBranchesStore = create<BranchesState>((set, get) => ({
  branches: [],
  selectedBranchId: getStoredBranchId(),
  loading: false,
  error: null,

  fetchBranches: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const nextBranches = await getBranches();
      get().setBranches(nextBranches);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Не удалось загрузить филиалы";

      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  setBranches: (branches) =>
    set((state) => {
      const currentSelectedId = state.selectedBranchId ?? getStoredBranchId();

      const hasSelected =
        currentSelectedId !== null &&
        branches.some((branch) => branch.id === currentSelectedId);

      const nextSelectedBranchId = hasSelected
        ? currentSelectedId
        : branches[0]?.id ?? null;

      setStoredBranchId(nextSelectedBranchId);

      return {
        branches,
        selectedBranchId: nextSelectedBranchId,
      };
    }),

  updateBranchInStore: (branch) =>
    set((state) => ({
      branches: state.branches.map((item) =>
        item.id === branch.id ? { ...item, ...branch } : item
      ),
    })),

  selectBranch: (id) => {
    setStoredBranchId(id);
    set({ selectedBranchId: id });
  },

  reset: () => {
    setStoredBranchId(null);
    set({
      branches: [],
      selectedBranchId: null,
      loading: false,
      error: null,
    });
  },
}));
