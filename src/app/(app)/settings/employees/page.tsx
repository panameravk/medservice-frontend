"use client";

import { useMemo, useState } from "react";
import { Switch } from "../../../components/ui/Switch";

type ProfileLink = { kind: "zoon" | "prodoctorov"; url: string };
type Employee = {
  id: number;
  fullName: string;
  requestsEnabled: boolean;
  links: ProfileLink[];
};

const initialMock: Employee[] = [
  {
    id: 1,
    fullName: "Байков Даниил Владимирович",
    requestsEnabled: true,
    links: [{ kind: "zoon", url: "https://zoon.ru/spb/" }],
  },
  {
    id: 2,
    fullName: "Михайлов Павел Павлович",
    requestsEnabled: false,
    links: [{ kind: "prodoctorov", url: "https://prodoctorov.ru/" }],
  },
];

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>(initialMock);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const modalTitle = useMemo(
    () => (editing ? "Редактировать сотрудника" : "Добавить сотрудника"),
    [editing]
  );

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setIsOpen(true);
  };

  const remove = (id: number) => setItems((p) => p.filter((x) => x.id !== id));

  const toggleRequests = (id: number) =>
    setItems((p) =>
      p.map((x) =>
        x.id === id ? { ...x, requestsEnabled: !x.requestsEnabled } : x
      )
    );

  const save = (payload: Omit<Employee, "id"> & { id?: number }) => {
    setItems((p) => {
      if (payload.id)
        return p.map((x) => (x.id === payload.id ? (payload as Employee) : x));
      const newId = Math.max(0, ...p.map((x) => x.id)) + 1;
      return [{ ...(payload as Employee), id: newId }, ...p];
    });
    setIsOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {/* Header row inside tab */}
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

      {/* Table */}
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
            {items.map((e) => (
              <tr key={e.id} className="border-t border-[#E5E7EB]">
                <td className="py-3 px-4">
                  <label className="inline-flex items-center gap-2">
                    <Switch
                      checked={e.requestsEnabled}
                      onChange={() => toggleRequests(e.id)}
                    />
                  </label>
                </td>

                <td className="py-3 px-4 text-[14px] text-[#111827]">
                  {e.fullName}
                </td>

                <td className="py-3 px-4">
                  {e.links.length === 0 ? (
                    <span className="text-[13px] text-[#9CA3AF]">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {e.links.map((l, idx) => (
                        <a
                          key={idx}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-full border border-[#E5E7EB] text-[12px] text-[#111827] hover:bg-[#F3F4F6]"
                        >
                          {l.kind}
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
                      onClick={() => remove(e.id)}
                      className="h-9 w-9 rounded-[10px] border border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      title="Удалить"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
  onSave: (payload: Omit<Employee, "id"> & { id?: number }) => void;
}) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [zoon, setZoon] = useState(
    initial?.links.find((x) => x.kind === "zoon")?.url ?? ""
  );
  const [prodoctorov, setProdoctorov] = useState(
    initial?.links.find((x) => x.kind === "prodoctorov")?.url ?? ""
  );

  const submit = () => {
    const links: ProfileLink[] = [];
    if (zoon.trim()) links.push({ kind: "zoon", url: zoon.trim() });
    if (prodoctorov.trim())
      links.push({ kind: "prodoctorov", url: prodoctorov.trim() });

    onSave({
      id: initial?.id,
      fullName: fullName.trim(),
      requestsEnabled: initial?.requestsEnabled ?? true,
      links,
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 h-10 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Введите ФИО"
            />
          </div>

          <div>
            <div className="text-[12px] text-[#6B7280]">Ссылки на профили</div>
            <div className="mt-1 space-y-2">
              <input
                value={zoon}
                onChange={(e) => setZoon(e.target.value)}
                className="h-10 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Zoon URL"
              />
              <input
                value={prodoctorov}
                onChange={(e) => setProdoctorov(e.target.value)}
                className="h-10 w-full rounded-[10px] border border-[#E5E7EB] px-3 text-[14px] text-[#111827] outline-none focus:ring-2 focus:ring-black/10"
                placeholder="ПроДокторов URL"
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
