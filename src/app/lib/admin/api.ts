import { apiFetch } from "../api/client";
import type { AdminAccessUser, AdminAccount, AdminBranch } from "../../types/admin";

interface BranchDto {
  id: number;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  specialization: string;
  timezone: string;
  requestFrequencyDays: number;
  smsMonthlyLimit: number | null;
  complaintEmails: string[];
  reminderEmails: string[];
  platformUrls: Record<string, string>;
  isActive: boolean;
  paidUntil: string | null;
  employeesCount: number;
  firstUser: {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    role: string | null;
  } | null;
}

interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  branchIds: number[];
}

type AdminBranchCreatePayload = {
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  specialization: string;
  timezone: string;
} & (
  | {
      firstUser: {
        username: string;
        email: string;
        password: string;
        phone: string;
        role: string;
      };
      existingUserUsername?: never;
    }
  | {
      existingUserUsername: string;
      firstUser?: never;
    }
);

const ADMIN_SESSION = { session: "admin" as const };

function mapBranch(b: BranchDto): AdminBranch {
  return {
    id: b.id,
    name: b.name,
    publicId: String(b.id),
    isActive: b.isActive,
    primaryContact: b.phone ?? "—",
    employeesCount: b.employeesCount,
    paidUntil: b.paidUntil,
    city: b.city,
    address: b.address,
    phone: b.phone,
    specialization: b.specialization,
    timezone: b.timezone,
    requestFrequencyDays: b.requestFrequencyDays,
    smsMonthlyLimit: b.smsMonthlyLimit ?? null,
    complaintEmails: b.complaintEmails ?? [],
    reminderEmails: b.reminderEmails ?? [],
    platformUrls: b.platformUrls ?? {},
    firstUser: b.firstUser ?? null,
  };
}

function mapUser(u: UserDto): AdminAccessUser {
  return {
    id: u.id,
    fullName: u.fullName,
    username: u.username,
    role: u.role,
    email: u.email,
    phone: u.phone,
    isSuperuser: u.isSuperuser,
    branchIds: u.branchIds ?? [],
  };
}

export const adminBranchesApi = {
  async getAll(search = ""): Promise<AdminBranch[]> {
    const data = await apiFetch<{ branches: BranchDto[]; total: number }>(
      "/branches",
      ADMIN_SESSION
    );
    const q = search.trim().toLowerCase();
    const branches = data.branches.map(mapBranch);
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.publicId.toLowerCase().includes(q)
    );
  },

  async toggleStatus(id: number): Promise<AdminBranch> {
    const current = (await adminBranchesApi.getAll()).find((b) => b.id === id);
    if (!current) throw new Error("Филиал не найден");
    const updated = await apiFetch<BranchDto>(`/branches/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body: { is_active: !current.isActive },
    });
    return mapBranch(updated);
  },

  async checkUser(username: string): Promise<{ exists: boolean }> {
    return apiFetch<{ exists: boolean }>("/branches/check-user", {
      ...ADMIN_SESSION,
      method: "POST",
      body: { username },
    });
  },

  async create(payload: AdminBranchCreatePayload): Promise<AdminBranch> {
    const branch = await apiFetch<BranchDto>("/branches", {
      ...ADMIN_SESSION,
      method: "POST",
      body: {
        name: payload.name,
        city: payload.city,
        address: payload.address,
        phone: payload.phone,
        specialization: payload.specialization,
        timezone: payload.timezone,
        ...(payload.firstUser
          ? {
              first_user: {
                username: payload.firstUser.username,
                email: payload.firstUser.email,
                password: payload.firstUser.password,
                phone: payload.firstUser.phone,
                role: payload.firstUser.role,
              },
            }
          : {
              existing_user_username: payload.existingUserUsername,
            }),
      },
    });
    return mapBranch(branch);
  },

  async update(
    id: number,
    payload: Partial<{
      name: string;
      city: string | null;
      address: string | null;
      phone: string | null;
      specialization: string;
      timezone: string;
      requestFrequencyDays: number;
      smsMonthlyLimit: number | null;
      paidUntil: string | null;
      complaintEmails: string[];
      reminderEmails: string[];
      platformUrls: Record<string, string>;
      firstUser: {
        username: string;
        email: string;
        phone: string;
        role: string;
        password?: string;
      };
    }>
  ): Promise<AdminBranch> {
    const body: Record<string, unknown> = {};
    if ("name" in payload) body.name = payload.name;
    if ("city" in payload) body.city = payload.city;
    if ("address" in payload) body.address = payload.address;
    if ("phone" in payload) body.phone = payload.phone;
    if ("specialization" in payload) body.specialization = payload.specialization;
    if ("timezone" in payload) body.timezone = payload.timezone;
    if ("requestFrequencyDays" in payload)
      body.request_frequency_days = payload.requestFrequencyDays;
    if ("smsMonthlyLimit" in payload)
      body.sms_monthly_limit = payload.smsMonthlyLimit;
    if ("paidUntil" in payload) body.paid_until = payload.paidUntil;
    if ("complaintEmails" in payload) body.complaint_emails = payload.complaintEmails;
    if ("reminderEmails" in payload) body.reminder_emails = payload.reminderEmails;
    if ("platformUrls" in payload) body.platform_urls = payload.platformUrls;
    if (payload.firstUser) {
      body.first_user = {
        username: payload.firstUser.username,
        email: payload.firstUser.email,
        phone: payload.firstUser.phone,
        role: payload.firstUser.role,
        ...(payload.firstUser.password
          ? { password: payload.firstUser.password }
          : {}),
      };
    }

    const branch = await apiFetch<BranchDto>(`/branches/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body,
    });
    return mapBranch(branch);
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/branches/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },
};

export const adminAccessApi = {
  async getAll(): Promise<AdminAccessUser[]> {
    const users = await apiFetch<UserDto[]>("/admin/users", ADMIN_SESSION);
    return users.map(mapUser);
  },

  async create(payload: {
    fullName: string | null;
    username: string;
    password: string;
    role: string | null;
    email: string;
    phone: string | null;
  }): Promise<AdminAccessUser> {
    // Эта страница создаёт только администраторов — у суперпользователя доступ
    // ко всем филиалам автоматически (branch_ids не нужны).
    const user = await apiFetch<UserDto>("/admin/users", {
      ...ADMIN_SESSION,
      method: "POST",
      body: {
        username: payload.username,
        email: payload.email,
        password: payload.password,
        full_name: payload.fullName,
        phone: payload.phone,
        role: payload.role,
        is_superuser: true,
        branch_ids: [],
      },
    });
    return mapUser(user);
  },

  async update(
    id: number,
    payload: Partial<{
      fullName: string | null;
      role: string | null;
      email: string;
      phone: string | null;
      branchIds: number[];
    }>
  ): Promise<AdminAccessUser> {
    const body: Record<string, unknown> = {};
    if ("fullName" in payload) body.full_name = payload.fullName;
    if ("role" in payload) body.role = payload.role;
    if ("email" in payload) body.email = payload.email;
    if ("phone" in payload) body.phone = payload.phone;
    if ("branchIds" in payload) body.branch_ids = payload.branchIds;

    const user = await apiFetch<UserDto>(`/admin/users/${id}`, {
      ...ADMIN_SESSION,
      method: "PATCH",
      body,
    });
    return mapUser(user);
  },

  async delete(id: number): Promise<void> {
    await apiFetch(`/admin/users/${id}`, {
      ...ADMIN_SESSION,
      method: "DELETE",
    });
  },

  /** Получить токен пользователя, чтобы открыть кабинет от его имени. */
  async impersonate(
    id: number
  ): Promise<{ accessToken: string; user: AdminAccessUser }> {
    const data = await apiFetch<{ accessToken: string; user: UserDto }>(
      `/admin/users/${id}/impersonate`,
      { ...ADMIN_SESSION, method: "POST" }
    );
    return { accessToken: data.accessToken, user: mapUser(data.user) };
  },
};

export const adminAccountApi = {
  async getMe(): Promise<AdminAccount> {
    const user = await apiFetch<UserDto>("/auth/me", ADMIN_SESSION);
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      isSuperuser: user.isSuperuser,
    };
  },

  async updateMe(payload: {
    fullName?: string | null;
    email?: string;
    phone?: string | null;
    role?: string | null;
  }): Promise<AdminAccount> {
    const body: Record<string, unknown> = {};
    if ("fullName" in payload) body.full_name = payload.fullName;
    if ("email" in payload) body.email = payload.email;
    if ("phone" in payload) body.phone = payload.phone;
    if ("role" in payload) body.role = payload.role;

    const user = await apiFetch<UserDto>("/auth/me", {
      ...ADMIN_SESSION,
      method: "PATCH",
      body,
    });
    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      isSuperuser: user.isSuperuser,
    };
  },
};
