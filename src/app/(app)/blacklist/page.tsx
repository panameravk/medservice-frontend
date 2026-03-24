"use client";

import { useEffect, useState } from "react";
import { useBranchesStore } from "../../lib/branchesStore";
import { blacklistApi, type BlacklistUser } from "../../lib/api";

function IconEdit() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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
      xmlns="http://www.w3.org/2000/svg"
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
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function BlacklistPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [entries, setEntries] = useState<BlacklistUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedBranchId) return;
    setLoading(true);
    setError(null);
    blacklistApi
      .getAll(selectedBranchId)
      .then(setEntries)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Ошибка загрузки")
      )
      .finally(() => setLoading(false));
  }, [selectedBranchId]);

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<Pick<BlacklistUser, "lastName" | "firstName" | "phone" | "reason">>
  >({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEdit = (entry: BlacklistUser) => {
    setEditingId(entry.id);
    setSaveError(null);
    setEditForm({
      lastName: entry.lastName,
      firstName: entry.firstName,
      phone: entry.phone,
      reason: entry.reason ?? "",
    });
  };

  const handleSave = async () => {
    if (editingId === null) return;
    setSaveLoading(true);
    setSaveError(null);
    try {
      const updated = await blacklistApi.update(editingId, editForm);
      setEntries((prev) => prev.map((e) => (e.id === editingId ? updated : e)));
      setEditingId(null);
      setEditForm({});
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setSaveError(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await blacklistApi.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // silent — could add a toast here
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page title */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#111827]">
          Чёрный список
        </h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          Управление чёрным списком
        </p>
      </div>

      {/* Table */}
      <div className="bg-[#F3F4F6] rounded-[16px] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_1.6fr_2.4fr_64px] px-6 py-3 text-[13px] font-medium text-[#6B7280]">
          <span>Фамилия</span>
          <span>Имя</span>
          <span>Телефон</span>
          <span>Причина</span>
          <span />
        </div>

        {/* States */}
        {loading && (
          <div className="px-6 py-10 text-center text-[13px] text-[#9CA3AF]">
            Загрузка...
          </div>
        )}
        {!loading && error && (
          <div className="px-6 py-10 text-center text-[13px] text-red-500">
            {error}
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div className="px-6 py-10 text-center text-[13px] text-[#9CA3AF]">
            Чёрный список пуст
          </div>
        )}

        {/* Rows */}
        <div>
          {entries.map((entry) =>
            editingId === entry.id ? (
              /* ── Edit row ── */
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_1fr_1.6fr_2.4fr_64px] gap-3 px-6 py-3 items-center border-t border-black/5 bg-white"
              >
                <input
                  value={editForm.lastName ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="border border-[#E5E7EB] rounded-[8px] px-2 py-1.5 text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#F4C21A]"
                />
                <input
                  value={editForm.firstName ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="border border-[#E5E7EB] rounded-[8px] px-2 py-1.5 text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#F4C21A]"
                />
                <input
                  value={editForm.phone ?? ""}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="border border-[#E5E7EB] rounded-[8px] px-2 py-1.5 text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#F4C21A]"
                />
                <div className="flex flex-col gap-1">
                  <input
                    value={editForm.reason ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, reason: e.target.value }))
                    }
                    className="border border-[#E5E7EB] rounded-[8px] px-2 py-1.5 text-[13px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#F4C21A]"
                  />
                  {saveError && (
                    <span className="text-[11px] text-red-500">
                      {saveError}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="text-[11px] bg-[#F4C21A] hover:bg-yellow-400 disabled:opacity-50 text-[#111827] font-semibold px-2 py-1.5 rounded-[8px] transition-colors whitespace-nowrap"
                  >
                    {saveLoading ? "..." : "Сохранить"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-[11px] text-[#6B7280] hover:text-[#111827] transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              /* ── Display row ── */
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_1fr_1.6fr_2.4fr_64px] gap-3 px-6 py-4 items-center border-t border-black/5 hover:bg-black/[0.02] transition-colors"
              >
                <span className="text-[13px] text-[#111827]">
                  {entry.lastName}
                </span>
                <span className="text-[13px] text-[#111827]">
                  {entry.firstName}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🇷🇺</span>
                  <span className="text-[11px] text-[#6B7280]">▾</span>
                  <span className="text-[13px] text-[#3B82F6]">
                    {entry.phone}
                  </span>
                </div>
                <span className="text-[13px] text-[#111827]">
                  {entry.reason ?? "—"}
                </span>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-[#9CA3AF] hover:text-[#111827] transition-colors"
                    title="Редактировать"
                  >
                    <IconEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-[#9CA3AF] hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
