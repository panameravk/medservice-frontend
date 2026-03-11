"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "../../../components/ui/Switch";
import { employeesApi, type Employee } from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

export default function EmployeesPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const modalTitle = useMemo(
    () => (editing ? "Редактировать сотрудника" : "Добавить сотрудника"),
    [editing]
  );

  useEffect(() => {
    if (!selectedBranchId) return;

    setLoading(true);
    employeesApi
      .getAll(selectedBranchId)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [selectedBranchId]);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setIsOpen(true);
  };

  const remove = async (id: number) => {
    await employeesApi.delete(id);
    setItems((p) => p.filter((x) => x.id !== id));
  };

  const toggleRequests = async (id: number) => {
    const current = items.find((x) => x.id === id);
    if (!current) return;

    const updated = await employeesApi.update(id, {
      active: !current.active,
    });

    setItems((p) => p.map((x) => (x.id === id ? updated : x)));
  };

  const save = async (payload: {
    id?: number;
    name: string;
    active: boolean;
    profiles: string[];
  }) => {
    if (!selectedBranchId) return;

    if (payload.id) {
      const updated = await employeesApi.update(payload.id, {
        name: payload.name,
        active: payload.active,
        profiles: payload.profiles,
      });

      setItems((p) => p.map((x) => (x.id === payload.id ? updated : x)));
    } else {
      const created = await employeesApi.create(selectedBranchId, {
        name: payload.name,
        active: payload.active,
        profiles: payload.profiles,
      });

      setItems((p) => [created, ...p]);
    }

    setIsOpen(false);
    setEditing(null);
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
          className="h-10 px-4 rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90"
        >
          Добавить сотрудника
        </button>
      </div>

      <div className="overflow-x-auto rounded-[12px] border border-[#E5E7EB]">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="text-left text-[12px] text-[#6B7280]">
              <th className="py-3 px-4 w-[120px]">Запросы</th>
              <th className="py-3 px-4">ФИО</th>
              <th className="py-3 px-4">Профили</th>
              <th className="py-3 px-4 w-[120px]" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 px-4 text-sm text-[#9CA3AF]" colSpan={4}>
                  Загрузка...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-4 px-4 text-sm text-[#9CA3AF]" colSpan={4}>
                  Сотрудников пока нет
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr key={e.id} className="border-t border-[#E5E7EB]">
                  <td className="py-3 px-4">
                    <label className="inline-flex items-center gap-2">
                      <Switch
                        checked={e.active}
                        onChange={() => {
                          void toggleRequests(e.id);
                        }}
                      />
                    </label>
                  </td>

                  <td className="py-3 px-4 text-[14px] text-[#111827]">
                    {e.name}
                  </td>

                  <td className="py-3 px-4">
                    {e.profiles.length === 0 ? (
                      <span className="text-[13px] text-[#9CA3AF]">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {e.profiles.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-full border border-[#E5E7EB] text-[12px] text-[#111827] hover:bg-[#F3F4F6]"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(e)}
                        className="h-9 w-9 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F3F4F6]"
                        title="Редактировать"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void remove(e.id);
                        }}
                        className="h-9 w-9 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F3F4F6]"
                        title="Удалить"
                      >
                        🗑
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
      <div className="w-full max-w-[520px] rounded-[12px] bg-white border border-[#E5E7EB] shadow-[0_18px_40px_rgba(17,24,39,0.18)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[14px] font-semibold text-[#111827]">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]"
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
          className="mt-5 h-10 w-full rounded-[10px] bg-[#F4C21A] text-[13px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
