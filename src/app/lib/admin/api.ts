import {
  ADMIN_ACCESS_USERS_MOCK,
  ADMIN_ACCOUNT_MOCK,
  ADMIN_BRANCHES_MOCK,
} from "../../lib/admin/mocks";
import type {
  AdminAccessUser,
  AdminAccount,
  AdminBranch,
} from "../../types/admin";

function wait(ms = 150) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let branchesDb = [...ADMIN_BRANCHES_MOCK];
let accessUsersDb = [...ADMIN_ACCESS_USERS_MOCK];
let accountDb = { ...ADMIN_ACCOUNT_MOCK };

export const adminBranchesApi = {
  async getAll(search = ""): Promise<AdminBranch[]> {
    await wait();
    const q = search.trim().toLowerCase();

    if (!q) return [...branchesDb];

    return branchesDb.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.publicId.toLowerCase().includes(q)
    );
  },

  async toggleStatus(id: number): Promise<AdminBranch> {
    await wait();
    const item = branchesDb.find((branch) => branch.id === id);
    if (!item) {
      throw new Error("Филиал не найден");
    }

    item.isActive = !item.isActive;
    return { ...item };
  },

  async create(payload: Omit<AdminBranch, "id">): Promise<AdminBranch> {
    await wait();
    const created: AdminBranch = {
      ...payload,
      id: Date.now(),
    };
    branchesDb = [created, ...branchesDb];
    return created;
  },
};

export const adminAccessApi = {
  async getAll(): Promise<AdminAccessUser[]> {
    await wait();
    return [...accessUsersDb];
  },

  async create(payload: Omit<AdminAccessUser, "id">): Promise<AdminAccessUser> {
    await wait();
    const created: AdminAccessUser = {
      ...payload,
      id: Date.now(),
    };
    accessUsersDb = [created, ...accessUsersDb];
    return created;
  },

  async update(
    id: number,
    payload: Partial<Omit<AdminAccessUser, "id">>
  ): Promise<AdminAccessUser> {
    await wait();
    const index = accessUsersDb.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Пользователь не найден");
    }

    accessUsersDb[index] = { ...accessUsersDb[index], ...payload };
    return { ...accessUsersDb[index] };
  },

  async delete(id: number): Promise<void> {
    await wait();
    accessUsersDb = accessUsersDb.filter((item) => item.id !== id);
  },
};

export const adminAccountApi = {
  async getMe(): Promise<AdminAccount> {
    await wait();
    return { ...accountDb };
  },

  async updateMe(
    payload: Partial<Omit<AdminAccount, "id" | "role">>
  ): Promise<AdminAccount> {
    await wait();
    accountDb = { ...accountDb, ...payload };
    return { ...accountDb };
  },
};
