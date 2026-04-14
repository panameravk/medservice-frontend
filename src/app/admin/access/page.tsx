"use client";

import { useEffect, useState } from "react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminSelect } from "../../components/admin/AdminSelect";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { adminAccessApi } from "../../lib/admin/api";
import type { AdminAccessUser } from "../../types/admin";

const ROLE_OPTIONS = [
  { label: "Руководитель", value: "Руководитель" },
  { label: "Тех. поддержка", value: "Тех. поддержка" },
  { label: "Менеджер по продажам", value: "Менеджер по продажам" },
];

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
  const [items, setItems] = useState<AdminAccessUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccessUser | null>(null);

  useEffect(() => {
    void adminAccessApi.getAll().then(setItems);
  }, []);

  const onDelete = async (id: number) => {
    await adminAccessApi.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const onSave = async (
    payload: Omit<AdminAccessUser, "id"> & { id?: number }
  ) => {
    if (payload.id) {
      const updated = await adminAccessApi.update(payload.id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === payload.id ? updated : item))
      );
    } else {
      const created = await adminAccessApi.create({
        fullName: payload.fullName,
        role: payload.role,
        email: payload.email,
        phone: payload.phone,
      });
      setItems((prev) => [...prev, created]);
    }

    setOpen(false);
    setEditing(null);
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

      <AdminShellCard>
        <div className="grid grid-cols-[1.45fr_1.1fr_0.9fr_0.9fr_70px] items-center text-[13px] font-medium text-[#222222]">
          <div>ФИО</div>
          <div>Роль в команде</div>
          <div>Email</div>
          <div>Телефон</div>
          <div />
        </div>

        <div className="mt-5 space-y-7">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.45fr_1.1fr_0.9fr_0.9fr_70px] items-center text-[16px] text-[#3A3A46]"
            >
              <div>{item.fullName}</div>
              <div>{item.role}</div>
              <div>{item.email}</div>
              <div>{item.phone}</div>
              <div className="flex items-center justify-end gap-3 text-[#A3A3A3]">
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
          Выдать доступ к филиалу
        </button>
      </AdminShellCard>

      {open && (
        <AccessModal
          initial={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={onSave}
        />
      )}
    </div>
  );
}

function AccessModal({
  initial,
  onClose,
  onSave,
}: {
  initial: AdminAccessUser | null;
  onClose: () => void;
  onSave: (payload: Omit<AdminAccessUser, "id"> & { id?: number }) => void;
}) {
  const [fullName, setFullName] = useState(
    initial?.fullName ?? "Мавриди Анатоли Дмитриевна"
  );
  const [role, setRole] = useState(initial?.role ?? ROLE_OPTIONS[0].value);
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");

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

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Роль в команде
          </label>
          <AdminSelect value={role} options={ROLE_OPTIONS} onChange={setRole} />
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
              id: initial?.id,
              fullName: fullName.trim(),
              role,
              email: email.trim(),
              phone: phone.trim(),
            })
          }
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          Выдать доступ
        </button>
      </div>
    </AdminModal>
  );
}
