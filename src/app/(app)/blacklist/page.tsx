"use client";

import { useEffect, useState } from "react";
import { ApiError, blacklistApi, type BlacklistUser } from "../../lib/api";
import { useBranchesStore } from "../../lib/branchesStore";

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

type EditableBlacklistFields = Partial<
  Pick<BlacklistUser, "lastName" | "firstName" | "phone" | "reason">
>;

export default function BlacklistPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  if (!selectedBranchId) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111827]">
            Чёрный список
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Управление чёрным списком
          </p>
        </div>

        <div className="rounded-[16px] bg-[#F3F4F6] px-6 py-10 text-center text-[13px] text-[#9CA3AF]">
          Выберите филиал
        </div>
      </div>
    );
  }

  return (
    <BlacklistContent key={selectedBranchId} branchId={selectedBranchId} />
  );
}

function BlacklistContent({ branchId }: { branchId: string }) {
  const [entries, setEntries] = useState<BlacklistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditableBlacklistFields>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadEntries = async () => {
      try {
        const data = await blacklistApi.getAll(branchId);

        if (cancelled) return;

        setEntries(data);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Ошибка загрузки");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadEntries();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const handleEdit = (entry: BlacklistUser) => {
    setEditingId(entry.id);
    setSaveError(null);
    setDeleteError(null);
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
      const updated = await blacklistApi.update(editingId, {
        lastName: editForm.lastName?.trim(),
        firstName: editForm.firstName?.trim(),
        phone: editForm.phone?.trim(),
        reason: editForm.reason?.trim() || null,
      });

      setEntries((prev) =>
        prev.map((entry) => (entry.id === editingId ? updated : entry))
      );
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      if (error instanceof ApiError) {
        setSaveError(error.message);
      } else if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Ошибка сохранения");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setSaveError(null);
  };

  const handleDelete = async (id: number) => {
    setDeleteError(null);

    try {
      await blacklistApi.delete(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteError(error.message);
      } else if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError("Не удалось удалить запись");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-semibold text-[#111827]">
          Чёрный список
        </h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Управление чёрным списком
        </p>
      </div>

      {deleteError && (
        <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {deleteError}
        </div>
      )}

      <div className="overflow-hidden rounded-[16px] bg-[#F3F4F6]">
        <div className="grid grid-cols-[1fr_1fr_1.6fr_2.4fr_64px] px-6 py-3 text-[13px] font-medium text-[#6B7280]">
          <span>Фамилия</span>
          <span>Имя</span>
          <span>Телефон</span>
          <span>Причина</span>
          <span />
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-[13px] text-[#9CA3AF]">
            Загрузка...
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-[13px] text-red-500">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] text-[#9CA3AF]">
            Чёрный список пуст
          </div>
        ) : (
          <div>
            {entries.map((entry) =>
              editingId === entry.id ? (
                <div
                  key={entry.id}
                  className="grid grid-cols-[1fr_1fr_1.6fr_2.4fr_64px] items-center gap-3 border-t border-black/5 bg-white px-6 py-3"
                >
                  <input
                    value={editForm.lastName ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="rounded-[8px] border border-[#E5E7EB] bg-white px-2 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D8D8D8]"
                  />
                  <input
                    value={editForm.firstName ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="rounded-[8px] border border-[#E5E7EB] bg-white px-2 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D8D8D8]"
                  />
                  <input
                    value={editForm.phone ?? ""}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="rounded-[8px] border border-[#E5E7EB] bg-white px-2 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D8D8D8]"
                  />
                  <div className="flex flex-col gap-1">
                    <input
                      value={editForm.reason ?? ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      className="rounded-[8px] border border-[#E5E7EB] bg-white px-2 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D8D8D8]"
                    />
                    {saveError && (
                      <span className="text-[11px] text-red-500">
                        {saveError}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="whitespace-nowrap rounded-[8px] bg-[#F4C21A] px-2 py-1.5 text-[11px] font-semibold text-[#111827] transition-colors hover:bg-yellow-400 disabled:opacity-50"
                    >
                      {saveLoading ? "..." : "Сохранить"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[11px] text-[#6B7280] transition-colors hover:text-[#111827]"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={entry.id}
                  className="grid grid-cols-[1fr_1fr_1.6fr_2.4fr_64px] items-center gap-3 border-t border-black/5 px-6 py-4 transition-colors hover:bg-black/[0.02]"
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
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className="text-[#9CA3AF] transition-colors hover:text-[#111827]"
                      title="Редактировать"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(entry.id);
                      }}
                      className="text-[#9CA3AF] transition-colors hover:text-red-500"
                      title="Удалить"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
