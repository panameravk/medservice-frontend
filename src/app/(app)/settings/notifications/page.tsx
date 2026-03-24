"use client";

import { useEffect, useState } from "react";
import { useBranchesStore } from "../../../lib/branchesStore";
import { updateBranch } from "../../../lib/api";

function uniqLower(arr: string[]): string[] {
  return Array.from(
    new Set(arr.map((e) => e.trim().toLowerCase()).filter(Boolean))
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function IconTrash() {
  return (
    <svg
      width="14"
      height="14"
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

function EmailSection({
  label,
  emails,
  onChange,
}: {
  label: string;
  emails: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const val = input.trim().toLowerCase();
    if (!val) return;
    if (!isValidEmail(val)) {
      setError("Неверный формат email");
      return;
    }
    if (emails.includes(val)) {
      setError("Уже добавлен");
      return;
    }
    onChange([...emails, val]);
    setInput("");
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-[13px] font-medium text-[#111827]">
        {label}
      </label>

      {/* Input + Добавить */}
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <input
            type="email"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            className={[
              "w-full h-11 bg-[#F3F4F6] border rounded-[10px] px-4 text-[13px]",
              "text-[#111827] placeholder-[#9CA3AF] focus:outline-none transition-colors",
              error
                ? "border-red-400"
                : "border-transparent focus:border-[#F4C21A]",
            ].join(" ")}
          />
          {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
        </div>
        <button
          type="button"
          onClick={add}
          className="h-11 px-6 rounded-[10px] bg-[#F4C21A] hover:bg-yellow-300 active:brightness-90 text-[13px] font-semibold text-[#111827] transition-colors shrink-0"
        >
          Добавить
        </button>
      </div>

      {/* Email chips */}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-2 border border-[#E5E7EB] rounded-[8px] px-3 py-1.5"
            >
              <span className="text-[13px] text-[#6B7280]">{email}</span>
              <button
                type="button"
                onClick={() => onChange(emails.filter((e) => e !== email))}
                className="text-[#9CA3AF] hover:text-red-500 transition-colors"
              >
                <IconTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const selectedBranch = useBranchesStore((s) =>
    s.branches.find((b) => b.id === s.selectedBranchId)
  );
  const updateBranchInStore = useBranchesStore((s) => s.updateBranchInStore);

  const [complaintEmails, setComplaintEmails] = useState<string[]>([]);
  const [reminderEmails, setReminderEmails] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setComplaintEmails(selectedBranch?.complaintEmails ?? []);
    setReminderEmails(selectedBranch?.reminderEmails ?? []);
    setSaved(false);
    setSaveError(null);
  }, [selectedBranch?.id]);

  const handleSave = async () => {
    if (!selectedBranch?.id) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await updateBranch(selectedBranch.id, {
        complaintEmails: uniqLower(complaintEmails),
        reminderEmails: uniqLower(reminderEmails),
      });
      updateBranchInStore(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedBranch) {
    return <p className="text-[13px] text-[#9CA3AF] p-6">Выберите филиал</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <EmailSection
        label="Email для  перехваченных жалоб"
        emails={complaintEmails}
        onChange={setComplaintEmails}
      />

      <EmailSection
        label="Email для напоминания об отправке запросов"
        emails={reminderEmails}
        onChange={setReminderEmails}
      />

      {saveError && <p className="text-[13px] text-red-500">{saveError}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="h-12 w-[280px] rounded-[10px] bg-[#F4C21A] hover:bg-yellow-300 active:brightness-90 disabled:opacity-60 text-[14px] font-semibold text-[#111827] transition"
      >
        {saving ? "Сохранение..." : saved ? "Сохранено ✓" : "Сохранить"}
      </button>
    </div>
  );
}
