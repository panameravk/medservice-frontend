"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "../../../components/ui/Switch";
import { useBranchesStore } from "../../../lib/branchesStore";

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
}

const ROLES = ["Руководитель", "Специалист", "Гость"] as const;
const STORAGE_KEY_PREFIX = "team_members_branch_";

type SelectOption = {
  label: string;
  value: string;
};

function storageKey(branchId: string) {
  return `${STORAGE_KEY_PREFIX}${branchId}`;
}

function loadMembers(branchId: string): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(branchId));
    return raw ? (JSON.parse(raw) as TeamMember[]) : [];
  } catch {
    return [];
  }
}

function saveMembers(branchId: string, members: TeamMember[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(branchId), JSON.stringify(members));
}

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CustomSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((item) => item.value === value) ?? options[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex h-11 w-full items-center justify-between rounded-[10px]",
          "border border-transparent bg-[#F3F4F6] px-4 text-left text-[13px] text-[#111827]",
          "outline-none transition-colors hover:bg-[#ECEEF1]",
          open ? "border-[#D8D8D8]" : "focus:border-[#D8D8D8]",
        ].join(" ")}
      >
        <span className="truncate">{selected?.label ?? "Выберите"}</span>
        <ChevronDown
          className={[
            "shrink-0 text-[#6B7280] transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[46px] z-50 w-full overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white p-1.5 shadow-[0_16px_36px_rgba(17,24,39,0.16)]">
          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex min-h-[40px] w-full items-center rounded-[10px] px-3 text-left text-[14px] transition",
                    active
                      ? "bg-[#F3F4F6] font-medium text-[#222222]"
                      : "text-[#444444] hover:bg-[#F8F8F8]",
                  ].join(" ")}
                >
                  <span className="pr-2">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  initial: TeamMember | null;
  onClose: () => void;
  onSave: (member: Omit<TeamMember, "id"> & { id?: string }) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [role, setRole] = useState(initial?.role ?? ROLES[0]);
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");

  const roleOptions: SelectOption[] = ROLES.map((r) => ({ label: r, value: r }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[420px] space-y-4 rounded-[16px] bg-white p-6 shadow-[0_18px_40px_rgba(17,24,39,0.18)]">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">ФИО</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
            placeholder="Иванов Иван Иванович"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">Роль в команде</label>
          <CustomSelect value={role} options={roleOptions} onChange={setRole} />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">Телефон</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[13px] text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#D8D8D8] focus:outline-none"
            placeholder="+7 999 000 00 00"
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
          disabled={!fullName.trim()}
          className="h-11 w-full rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90 disabled:opacity-50"
        >
          {initial ? "Сохранить" : "Выдать доступ"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-[13px] text-[#6B7280] transition-colors hover:text-[#111827]"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

export default function AccessPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!selectedBranchId) {
      setMembers([]);
      return;
    }
    setMembers(loadMembers(selectedBranchId));
  }, [selectedBranchId]);

  const persist = (next: TeamMember[]) => {
    if (!selectedBranchId) return;
    setMembers(next);
    saveMembers(selectedBranchId, next);
  };

  const handleSave = (data: Omit<TeamMember, "id"> & { id?: string }) => {
    if (data.id) {
      persist(members.map((m) => (m.id === data.id ? { ...m, ...data } : m)));
    } else {
      persist([...members, { ...data, id: String(Date.now()) } as TeamMember]);
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Удалить участника? Действие необратимо.")) return;
    persist(members.filter((m) => m.id !== id));
  };

  if (!selectedBranchId) {
    return <p className="text-[14px] text-[#9CA3AF]">Выберите филиал</p>;
  }

  return (
    <div className="space-y-5 p-6">
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_64px] border-b border-[#E5E7EB] px-6 py-3 text-[13px] font-medium text-[#6B7280]">
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
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-[1.6fr_1fr_1fr_1fr_64px] items-center px-6 py-4 transition-colors hover:bg-[#FAFAFA]"
              >
                <span className="text-[13px] text-[#111827]">{member.fullName}</span>
                <span className="text-[13px] text-[#6B7280]">{member.role}</span>
                <span className="text-[13px] text-[#6B7280]">{member.email}</span>
                <span className="text-[13px] text-[#6B7280]">{member.phone}</span>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(member);
                      setModalOpen(true);
                    }}
                    className="text-[#9CA3AF] transition-colors hover:text-[#111827]"
                    title="Редактировать"
                  >
                    <IconEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(member.id)}
                    className="text-[#9CA3AF] transition-colors hover:text-red-500"
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
          onSave={handleSave}
        />
      )}
    </div>
  );
}
