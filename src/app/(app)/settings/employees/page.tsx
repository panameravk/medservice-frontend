"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "../../../components/ui/Switch";
import { ApiError, employeesApi, type Employee } from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

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

export default function EmployeesPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const modalTitle = useMemo(
    () => (editing ? "Редактировать сотрудника" : "Добавить сотрудника"),
    [editing]
  );

  useEffect(() => {
    if (!selectedBranchId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await employeesApi.getAll(selectedBranchId);

        if (cancelled) return;
        setItems(response);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Не удалось загрузить сотрудников");
        }

        setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setIsOpen(true);
  };

  const remove = async (id: number) => {
    setError(null);

    try {
      await employeesApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Не удалось удалить сотрудника");
      }
    }
  };

  const toggleRequests = async (id: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    setError(null);

    try {
      const updated = await employeesApi.update(id, {
        active: !current.active,
      });

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Не удалось обновить статус сотрудника");
      }
    }
  };

  const save = async (payload: {
    id?: number;
    name: string;
    active: boolean;
    profiles: string[];
  }) => {
    if (!selectedBranchId) return;

    setError(null);

    try {
      if (payload.id) {
        const updated = await employeesApi.update(payload.id, {
          name: payload.name,
          active: payload.active,
          profiles: payload.profiles,
        });

        setItems((prev) =>
          prev.map((item) => (item.id === payload.id ? updated : item))
        );
      } else {
        const created = await employeesApi.create(selectedBranchId, {
          name: payload.name,
          active: payload.active,
          profiles: payload.profiles,
        });

        setItems((prev) => [created, ...prev]);
      }

      setIsOpen(false);
      setEditing(null);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Не удалось сохранить сотрудника");
      }
    }
  };

  if (!selectedBranchId) {
    return <p className="text-[#9CA3AF]">Выберите филиал</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[14px] font-semibold text-[#111827]">
          Сотрудники
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-10 rounded-[10px] bg-[#F4C21A] px-4 text-[13px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90"
        >
          Добавить сотрудника
        </button>
      </div>

      {error && (
        <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-[12px] border border-[#E5E7EB]">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="text-left text-[12px] text-[#6B7280]">
              <th className="w-[120px] px-4 py-3">Запросы</th>
              <th className="px-4 py-3">ФИО</th>
              <th className="px-4 py-3">Профили</th>
              <th className="w-[120px] px-4 py-3" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-sm text-[#9CA3AF]" colSpan={4}>
                  Загрузка...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-sm text-[#9CA3AF]" colSpan={4}>
                  Сотрудников пока нет
                </td>
              </tr>
            ) : (
              items.map((employee) => (
                <tr key={employee.id} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2">
                      <Switch
                        checked={employee.active}
                        onChange={() => {
                          void toggleRequests(employee.id);
                        }}
                      />
                    </label>
                  </td>

                  <td className="px-4 py-3 text-[14px] text-[#111827]">
                    {employee.name}
                  </td>

                  <td className="px-4 py-3">
                    {employee.profiles.length === 0 ? (
                      <span className="text-[13px] text-[#9CA3AF]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {employee.profiles.map((url, index) => (
                          <a
                            key={`${employee.id}-${index}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-[#E5E7EB] px-3 py-1 text-[12px] text-[#111827] hover:bg-[#F3F4F6]"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-[#A3A3A3]">
                      <button
                        type="button"
                        onClick={() => openEdit(employee)}
                        className="transition hover:text-[#222222]"
                        title="Редактировать"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void remove(employee.id);
                        }}
                        className="transition hover:text-red-500"
                        title="Удалить"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <EmployeeModal
          title={modalTitle}
          initial={editing}
          onClose={() => {
            setIsOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

function EmployeeModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial: Employee | null;
  onClose: () => void;
  onSave: (payload: {
    id?: number;
    name: string;
    active: boolean;
    profiles: string[];
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [profile1, setProfile1] = useState(initial?.profiles[0] ?? "");
  const [profile2, setProfile2] = useState(initial?.profiles[1] ?? "");

  const submit = () => {
    const profiles = [profile1.trim(), profile2.trim()].filter(Boolean);

    onSave({
      id: initial?.id,
      name: name.trim(),
      active: initial?.active ?? true,
      profiles,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-[520px] rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_40px_rgba(17,24,39,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[14px] font-semibold text-[#111827]">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-[12px] text-[#6B7280]">ФИО</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Введите ФИО"
            />
          </div>

          <div>
            <div className="text-[12px] text-[#6B7280]">Ссылки на профили</div>
            <div className="mt-1 space-y-2">
              <input
                value={profile1}
                onChange={(e) => setProfile1(e.target.value)}
                className="h-10 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/10"
                placeholder="URL профиля 1"
              />
              <input
                value={profile2}
                onChange={(e) => setProfile2(e.target.value)}
                className="h-10 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/10"
                placeholder="URL профиля 2"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="mt-5 h-10 w-full rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90 disabled:opacity-60"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
