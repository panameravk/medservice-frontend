"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  authApi,
  branchAccessApi,
  type BranchAccessUser,
} from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";
import { AdminModal } from "../../../components/admin/AdminModal";
import {
  getCanonicalPhone,
  PhoneInput,
} from "../../../components/PhoneInput";

type MemberFormPayload = {
  id?: number;
  fullName: string;
  username: string;
  password: string;
  role: string;
  email: string;
  phone: string;
};

function IconEdit() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function MemberModal({
  initial,
  onClose,
  onSave,
}: {
  initial: BranchAccessUser | null;
  onClose: () => void;
  onSave: (member: MemberFormPayload) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");

  const isEditing = !!initial;
  const phoneCanonical = getCanonicalPhone(phone);
  const canSave =
    fullName.trim() &&
    role.trim() &&
    email.trim() &&
    phoneCanonical &&
    (isEditing || (username.trim() && password.length >= 8));

  return (
    <AdminModal
      onClose={onClose}
      widthClassName="max-w-[460px]"
      title={isEditing ? "Редактировать доступ" : "Выдать доступ к филиалу"}
    >
      <div className="space-y-4">
        {!isEditing && (
          <p className="text-[12px] leading-[17px] text-[#6B7280]">
            Будет создан отдельный пользователь с доступом только к этому филиалу.
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
            ФИО
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
            placeholder="Иванов Иван Иванович"
          />
        </div>

        {!isEditing && (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Логин
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
              placeholder="manager"
            />
          </div>
        )}

        {!isEditing && (
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Временный пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
              placeholder="Минимум 8 символов"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
            Роль в команде
          </label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
            placeholder="Руководитель"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
            Телефон
          </label>
          <PhoneInput
            value={phone}
            onChange={(next, meta) => setPhone(meta.canonical ?? next)}
          />
        </div>

        <button
          type="button"
          onClick={() =>
            onSave({
              id: initial?.id,
              fullName: fullName.trim(),
              username: username.trim(),
              password,
              role: role.trim(),
              email: email.trim(),
              phone: phoneCanonical ?? "",
            })
          }
          disabled={!canSave}
          className="h-11 w-full rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90 disabled:opacity-50"
        >
          {isEditing ? "Сохранить" : "Выдать доступ"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-[13px] text-[#6B7280] transition-colors hover:text-[#111827]"
        >
          Отмена
        </button>
      </div>
    </AdminModal>
  );
}

export default function AccessPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const branches = useBranchesStore((s) => s.branches);
  const [members, setMembers] = useState<BranchAccessUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BranchAccessUser | null>(null);

  const tableMessage = useMemo(() => {
    if (loading) return "Загрузка...";
    if (members.length === 0) return "Нет участников команды";
    return null;
  }, [loading, members.length]);

  const firstUserId = useMemo(
    () =>
      branches.find((branch) => branch.id === selectedBranchId)?.firstUser?.id ??
      null,
    [branches, selectedBranchId]
  );

  useEffect(() => {
    if (!selectedBranchId) {
      return;
    }

    let cancelled = false;

    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const [nextMembers, me] = await Promise.all([
          branchAccessApi.getAll(selectedBranchId),
          authApi.me(),
        ]);

        if (cancelled) return;
        setMembers(nextMembers);
        setCurrentUserId(me.id);
      } catch (error) {
        if (cancelled) return;
        setMembers([]);
        setError(
          error instanceof ApiError
            ? error.message
            : "Не удалось загрузить доступы"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  const handleSave = async (data: MemberFormPayload) => {
    if (!selectedBranchId) return;

    setError(null);

    try {
      if (data.id) {
        const updated = await branchAccessApi.update(data.id, selectedBranchId, {
          fullName: data.fullName,
          role: data.role,
          email: data.email,
          phone: data.phone,
        });
        setMembers((prev) =>
          prev.map((member) => (member.id === data.id ? updated : member))
        );
      } else {
        const created = await branchAccessApi.create(selectedBranchId, {
          fullName: data.fullName,
          username: data.username,
          password: data.password,
          role: data.role,
          email: data.email,
          phone: data.phone,
        });
        setMembers((prev) => [...prev, created]);
      }

      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "Не удалось сохранить доступ"
      );
    }
  };

  const handleRevoke = async (member: BranchAccessUser) => {
    if (!selectedBranchId || member.id === currentUserId) return;

    const name = member.fullName || member.username;
    const confirmed = window.confirm(`Отозвать доступ к филиалу у «${name}»?`);
    if (!confirmed) return;

    setError(null);

    try {
      await branchAccessApi.revoke(member.id, selectedBranchId);
      setMembers((prev) => prev.filter((item) => item.id !== member.id));
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "Не удалось отозвать доступ"
      );
    }
  };

  if (!selectedBranchId) {
    return <p className="text-[14px] text-[#9CA3AF]">Выберите филиал</p>;
  }

  return (
    <div className="space-y-5 p-6">
      {error && (
        <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_80px] border-b border-[#E5E7EB] px-6 py-3 text-[13px] font-medium text-[#6B7280]">
          <span>ФИО</span>
          <span>Роль в команде</span>
          <span>Email</span>
          <span>Телефон</span>
          <span />
        </div>

        {tableMessage ? (
          <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
            {tableMessage}
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {members.map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const isFirstUser = member.id === firstUserId;

              return (
                <div
                  key={member.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_80px] items-center px-6 py-4 transition-colors hover:bg-[#FAFAFA]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] text-[#111827]">
                      {member.fullName || "—"}
                    </div>
                    <div className="truncate text-[12px] text-[#9CA3AF]">
                      @{member.username}
                    </div>
                  </div>
                  <span className="truncate text-[13px] text-[#6B7280]">
                    {member.role || "—"}
                  </span>
                  <span className="truncate text-[13px] text-[#6B7280]">
                    {member.email}
                  </span>
                  <span className="truncate text-[13px] text-[#6B7280]">
                    {member.phone || "—"}
                  </span>
                  <div className="flex items-center justify-end gap-3">
                    {!isFirstUser && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(member);
                            setModalOpen(true);
                          }}
                          disabled={isCurrentUser}
                          className="text-[#9CA3AF] transition-colors hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-[#9CA3AF]"
                          title="Редактировать"
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleRevoke(member);
                          }}
                          disabled={isCurrentUser}
                          className="text-[#9CA3AF] transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-[#9CA3AF]"
                          title="Отозвать доступ"
                        >
                          <IconTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        className="h-12 rounded-[10px] bg-[#F4C21A] px-8 text-[13px] font-medium text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90"
      >
        Выдать доступ к филиалу
      </button>

      {modalOpen && (
        <MemberModal
          initial={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={(payload) => {
            void handleSave(payload);
          }}
        />
      )}
    </div>
  );
}
