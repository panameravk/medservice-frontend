"use client";

import { useEffect, useState } from "react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { adminAccountApi } from "../../lib/admin/api";
import type { AdminAccount } from "../../types/admin";

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

export default function AdminAccountPage() {
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void adminAccountApi.getMe().then(setAccount);
  }, []);

  if (!account) {
    return null;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-[26px] font-bold leading-[32px] text-black">
          Настройки аккаунта
        </h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
          Данные пользователя аккаунта
        </p>
      </div>

      <AdminShellCard>
        <div className="grid grid-cols-[1.45fr_1fr_0.9fr_0.9fr_50px] items-center text-[13px] font-medium text-[#222222]">
          <div>ФИО / Логин</div>
          <div>Роль в команде</div>
          <div>Email</div>
          <div>Телефон</div>
          <div />
        </div>

        <div className="mt-5 grid grid-cols-[1.45fr_1fr_0.9fr_0.9fr_50px] items-center text-[16px] text-[#3A3A46]">
          <div>
            <div>{account.fullName ?? "—"}</div>
            <div className="text-[13px] text-[#A3A3A3]">@{account.username}</div>
          </div>
          <div>{account.role ?? (account.isSuperuser ? "Администратор" : "Пользователь")}</div>
          <div>{account.email}</div>
          <div>{account.phone ?? "—"}</div>
          <div className="flex justify-end text-[#A3A3A3]">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="transition hover:text-[#222222]"
            >
              <EditIcon />
            </button>
          </div>
        </div>
      </AdminShellCard>

      {open && (
        <AccountModal
          initial={account}
          onClose={() => setOpen(false)}
          onSave={async (payload) => {
            const updated = await adminAccountApi.updateMe(payload);
            setAccount(updated);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AccountModal({
  initial,
  onClose,
  onSave,
}: {
  initial: AdminAccount;
  onClose: () => void;
  onSave: (payload: {
    fullName: string | null;
    email: string;
    phone: string | null;
    role: string | null;
  }) => void;
}) {
  const [fullName, setFullName] = useState(initial.fullName ?? "");
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [role, setRole] = useState(initial.role ?? "");

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[450px]">
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

        <button
          type="button"
          onClick={() =>
            onSave({
              fullName: fullName.trim() || null,
              email: email.trim(),
              phone: phone.trim() || null,
              role: role.trim() || null,
            })
          }
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          Сохранить изменения
        </button>
      </div>
    </AdminModal>
  );
}
