"use client";

import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
}

const ROLES = ["Руководитель", "Специалист", "Гость"];

const STORAGE_KEY = "team_members";

function loadMembers(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}

function saveMembers(members: TeamMember[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "1",
    fullName: "Байков Даниил Владимирович",
    role: "Руководитель",
    email: "primer@ya.ru",
    phone: "+7 999 333 22 11",
  },
  {
    id: "2",
    fullName: "Михайлов Павел Павлович",
    role: "Специалист",
    email: "primer@ya.ru",
    phone: "+7 999 333 22 11",
  },
  {
    id: "3",
    fullName: "Михайлов Павел Павлович",
    role: "Гость",
    email: "primer@ya.ru",
    phone: "+7 999 333 22 11",
  },
];

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

// ── Modal ─────────────────────────────────────────────────────────────────────
function MemberModal({
  initial,
  onClose,
  onSave,
}: {
  initial: TeamMember | null;
  onClose: () => void;
  onSave: (m: Omit<TeamMember, "id"> & { id?: string }) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [role, setRole] = useState(initial?.role ?? ROLES[0]);
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-[16px] shadow-[0_18px_40px_rgba(17,24,39,0.18)] p-6 space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
            ФИО
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 bg-[#F3F4F6] border border-transparent rounded-[10px] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A] transition-colors"
            placeholder="Иванов Иван Иванович"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
            Роль в команде
          </label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-11 bg-[#F3F4F6] border border-transparent rounded-[10px] px-4 text-[13px] text-[#111827] appearance-none focus:outline-none focus:border-[#F4C21A] transition-colors cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 bg-[#F3F4F6] border border-transparent rounded-[10px] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A] transition-colors"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
            Телефон
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-11 bg-[#F3F4F6] border border-transparent rounded-[10px] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A] transition-colors"
            placeholder="+7 999 000 00 00"
          />
        </div>

        <button
          type="button"
          onClick={() =>
            onSave({ id: initial?.id, fullName, role, email, phone })
          }
          disabled={!fullName.trim()}
          className="w-full h-11 rounded-[10px] bg-[#F4C21A] hover:bg-yellow-300 active:brightness-90 disabled:opacity-50 text-[13px] font-semibold text-[#111827] transition-colors"
        >
          {initial ? "Сохранить" : "Выдать доступ"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AccessPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  useEffect(() => {
    setMembers(loadMembers());
  }, []);

  const persist = (next: TeamMember[]) => {
    setMembers(next);
    saveMembers(next);
  };

  const handleSave = (data: Omit<TeamMember, "id"> & { id?: string }) => {
    if (data.id) {
      persist(
        members.map((m) =>
          m.id === data.id ? ({ ...m, ...data } as TeamMember) : m
        )
      );
    } else {
      persist([...members, { ...data, id: String(Date.now()) } as TeamMember]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    persist(members.filter((m) => m.id !== id));
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setModalOpen(true);
  };
  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Table */}
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
        {/* Header */}
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_64px] px-6 py-3 text-[13px] font-medium text-[#6B7280] border-b border-[#E5E7EB]">
          <span>ФИО</span>
          <span>Роль в команде</span>
          <span>Email</span>
          <span>Телефон</span>
          <span />
        </div>

        {members.length === 0 ? (
          <div className="px-6 py-8 text-[13px] text-[#9CA3AF]">
            Нет участников команды
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {members.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[1.6fr_1fr_1fr_1fr_64px] px-6 py-4 items-center hover:bg-[#FAFAFA] transition-colors"
              >
                <span className="text-[13px] text-[#111827]">{m.fullName}</span>
                <span className="text-[13px] text-[#6B7280]">{m.role}</span>
                <span className="text-[13px] text-[#6B7280]">{m.email}</span>
                <span className="text-[13px] text-[#6B7280]">{m.phone}</span>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => openEdit(m)}
                    className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
                    title="Редактировать"
                  >
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-[#9CA3AF] hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openCreate}
        className="h-12 px-8 rounded-[10px] bg-[#F4C21A] hover:bg-yellow-300 active:brightness-90 text-[13px] font-semibold text-[#111827] transition-colors"
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
          onSave={handleSave}
        />
      )}
    </div>
  );
}
