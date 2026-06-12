"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { adminAccessApi, adminBranchesApi } from "../../lib/admin/api";
import { setTokens } from "../../lib/api";
import { setImpersonation } from "../../lib/impersonation";
import { useBranchesStore } from "../../lib/branchesStore";
import type { AdminAccessUser, AdminBranch } from "../../types/admin";

function EditIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="10 17 15 12 10 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <polyline
        points="3 6 5 6 21 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminAccessPage() {
  const router = useRouter();
  const resetBranchesStore = useBranchesStore((s) => s.reset);

  const [items, setItems] = useState<AdminAccessUser[]>([]);
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccessUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<number | null>(null);

  useEffect(() => {
    void adminAccessApi.getAll().then(setItems);
    void adminBranchesApi.getAll().then(setBranches);
  }, []);

  // Открыть кабинет от имени пользователя: подменяем user-сессию его токеном
  // (admin-сессия остаётся), ставим флаг для баннера «Аккаунт Администратора».
  const onImpersonate = async (user: AdminAccessUser) => {
    setError(null);
    setImpersonatingId(user.id);
    try {
      const { accessToken, user: target } = await adminAccessApi.impersonate(
        user.id
      );
      setTokens(accessToken, "user");
      setImpersonation({
        kind: "user",
        userId: target.id,
        userName: target.fullName || target.username,
      });
      resetBranchesStore();
      router.push("/branches");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось войти в аккаунт пользователя"
      );
      setImpersonatingId(null);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await adminAccessApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при удалении");
    }
  };

  const onSave = async (
    payload: Omit<AdminAccessUser, "id"> & { id?: number; password?: string }
  ) => {
    setError(null);
    try {
      if (payload.id) {
        const updated = await adminAccessApi.update(payload.id, {
          fullName: payload.fullName,
          role: payload.role,
          email: payload.email,
          phone: payload.phone,
          branchIds: payload.branchIds,
        });
        setItems((prev) =>
          prev.map((item) => (item.id === payload.id ? updated : item))
        );
      } else {
        const created = await adminAccessApi.create({
          fullName: payload.fullName,
          username: payload.username,
          password: payload.password ?? "",
          role: payload.role,
          email: payload.email,
          phone: payload.phone,
          branchIds: payload.branchIds,
        });
        setItems((prev) => [...prev, created]);
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при сохранении");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[26px] font-bold leading-[32px] text-black">
          Доступы
        </h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
          Пользователи с доступом к администраторской панели
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <AdminShellCard>
        <div className="grid grid-cols-[1.45fr_1fr_0.9fr_0.9fr_100px] items-center text-[13px] font-medium text-[#222222]">
          <div>ФИО / Логин</div>
          <div>Роль в команде</div>
          <div>Email</div>
          <div>Телефон</div>
          <div />
        </div>

        <div className="mt-5 space-y-7">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.45fr_1fr_0.9fr_0.9fr_100px] items-center text-[16px] text-[#3A3A46]"
            >
              <div>
                <div>{item.fullName ?? "—"}</div>
                <div className="text-[13px] text-[#A3A3A3]">@{item.username}</div>
              </div>
              <div>{item.role ?? "—"}</div>
              <div>{item.email}</div>
              <div>{item.phone ?? "—"}</div>
              <div className="flex items-center justify-end gap-3 text-[#A3A3A3]">
                <button
                  type="button"
                  title="Войти в аккаунт пользователя"
                  disabled={impersonatingId !== null}
                  onClick={() => {
                    void onImpersonate(item);
                  }}
                  className="transition hover:text-[#222222] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LoginIcon />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(item);
                    setOpen(true);
                  }}
                  className="transition hover:text-[#222222]"
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void onDelete(item.id);
                  }}
                  className="transition hover:text-red-500"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="mt-10 flex h-[48px] w-[308px] items-center justify-center rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          Добавить пользователя
        </button>
      </AdminShellCard>

      {open && (
        <AccessModal
          initial={editing}
          branches={branches}
          onClose={() => {
            setOpen(false);
            setEditing(null);
            setError(null);
          }}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function AccessModal({
  initial,
  branches,
  onClose,
  onSave,
}: {
  initial: AdminAccessUser | null;
  branches: AdminBranch[];
  onClose: () => void;
  onSave: (
    payload: Omit<AdminAccessUser, "id"> & { id?: number; password?: string }
  ) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [branchIds, setBranchIds] = useState<number[]>(initial?.branchIds ?? []);

  const isEditing = !!initial;
  const isSuperuser = initial?.isSuperuser ?? false;

  const toggleBranch = (id: number) =>
    setBranchIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );

  return (
    <AdminModal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            ФИО
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none"
          />
        </div>

        {!isEditing && (
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Логин
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none"
            />
          </div>
        )}

        {!isEditing && (
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Роль в команде
          </label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Телефон
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Доступ к филиалам
          </label>
          {isSuperuser ? (
            <p className="text-[13px] text-[#6E6E73]">
              Администратор видит все филиалы.
            </p>
          ) : branches.length === 0 ? (
            <p className="text-[13px] text-[#A3A3A3]">Нет филиалов.</p>
          ) : (
            <div className="max-h-[180px] space-y-2 overflow-y-auto rounded-[10px] bg-[#F3F4F6] p-3">
              {branches.map((b) => (
                <label
                  key={b.id}
                  className="flex cursor-pointer items-center gap-2 text-[14px] text-[#222222]"
                >
                  <input
                    type="checkbox"
                    checked={branchIds.includes(b.id)}
                    onChange={() => toggleBranch(b.id)}
                    className="h-4 w-4 accent-[#F4C21A]"
                  />
                  {b.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onSave({
              id: initial?.id,
              fullName: fullName.trim() || null,
              username: username.trim(),
              password: password,
              role: role.trim() || null,
              email: email.trim(),
              phone: phone.trim() || null,
              isSuperuser,
              branchIds,
            })
          }
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          {isEditing ? "Сохранить изменения" : "Создать пользователя"}
        </button>
      </div>
    </AdminModal>
  );
}
