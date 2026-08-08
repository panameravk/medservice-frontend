"use client";

/* eslint-disable react-hooks/set-state-in-effect -- The editable form mirrors the currently selected branch. */

import { useEffect, useState } from "react";
import { updateBranch } from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

function uniqLower(arr: string[]): string[] {
  return Array.from(
    new Set(arr.map((email) => email.trim().toLowerCase()).filter(Boolean))
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
  onChange: (value: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const value = input.trim().toLowerCase();

    if (!value) return;

    if (!isValidEmail(value)) {
      setError("Неверный формат email");
      return;
    }

    if (emails.includes(value)) {
      setError("Уже добавлен");
      return;
    }

    onChange([...emails, value]);
    setInput("");
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium text-[#222222]">
        {label}
      </label>

      <div className="flex items-start gap-3">
        <div className="w-full max-w-[410px]">
          <input
            type="email"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            className={[
              "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none transition",
              error ? "border-red-400" : "focus:border-[#D8D8D8]",
            ].join(" ")}
          />
          {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
        </div>

        <button
          type="button"
          onClick={add}
          className="h-[46px] min-w-[165px] rounded-[10px] bg-[#F4C21A] px-6 text-[14px] font-medium text-[#111827] transition hover:bg-yellow-300"
        >
          Добавить
        </button>
      </div>

      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {emails.map((email) => (
            <div
              key={email}
              className="flex h-[26px] items-center gap-2 rounded-[8px] border border-[#D8D8D8] bg-white pl-3 pr-2"
            >
              <span className="text-[12px] text-[#9A9A9A]">{email}</span>
              <button
                type="button"
                onClick={() =>
                  onChange(emails.filter((item) => item !== email))
                }
                className="text-[#A2A2A2] transition hover:text-red-500"
              >
                <TrashIcon />
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
    s.branches.find((branch) => branch.id === s.selectedBranchId)
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
  }, [
    selectedBranch?.id,
    selectedBranch?.complaintEmails,
    selectedBranch?.reminderEmails,
  ]);

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
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error ? error.message : "Ошибка сохранения"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!selectedBranch) {
    return <p className="text-[14px] text-[#9CA3AF]">Выберите филиал</p>;
  }

  return (
    <div className="space-y-6">
      <EmailSection
        label="Email для перехваченных жалоб"
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
        onClick={() => void handleSave()}
        disabled={saving}
        className="h-11 w-[280px] rounded-[10px] bg-[#F4C21A] text-[14px] font-medium text-[#111827] transition hover:bg-yellow-300 disabled:opacity-60"
      >
        {saving ? "Сохранение..." : saved ? "Сохранено ✓" : "Сохранить"}
      </button>
    </div>
  );
}
