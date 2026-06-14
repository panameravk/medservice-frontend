"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminSearchInput } from "../../components/admin/AdminSearchInput";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { AdminSwitch } from "../../components/admin/AdminSwitch";
import { adminBranchesApi } from "../../lib/admin/api";
import { getAccessToken, setTokens } from "../../lib/api";
import { setImpersonation } from "../../lib/impersonation";
import { useBranchesStore } from "../../lib/branchesStore";
import type { AdminBranch } from "../../types/admin";

const PLATFORM_FIELDS: Array<{ key: string; label: string; placeholder: string }> = [
  {
    key: "yandex_maps",
    label: "Яндекс.Карты",
    placeholder: "https://yandex.ru/maps/org/...",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    placeholder: "https://www.google.com/maps/place/...",
  },
  {
    key: "2gis",
    label: "2GIS",
    placeholder: "https://2gis.ru/{city}/firm/...",
  },
  {
    key: "prodoctorov",
    label: "ПроДокторов",
    placeholder: "https://prodoctorov.ru/{city}/lpu/...",
  },
  {
    key: "napopravku",
    label: "НаПоправку",
    placeholder: "https://spb.napopravku.ru/clinics/{slug}/otzyvy/",
  },
];

function SortIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
      <path
        d="M4 1v14M4 1L1 4M4 1l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15V1m0 14-3-3m3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminBranchesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<AdminBranch[]>([]);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<AdminBranch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<AdminBranch | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    void adminBranchesApi.getAll().then(setItems);
  }, []);

  useEffect(() => {
    void adminBranchesApi.getAll(query).then(setItems);
  }, [query]);

  const rows = useMemo(() => items, [items]);

  const selectBranch = useBranchesStore((s) => s.selectBranch);
  const resetBranchesStore = useBranchesStore((s) => s.reset);

  // Провалиться в кабинет филиала: открываем пользовательский интерфейс с
  // выбранным филиалом под собственным токеном админа (admin-сессия остаётся),
  // флаг impersonation включает баннер «Аккаунт Администратора».
  const enterBranchCabinet = (branch: AdminBranch) => {
    const adminToken = getAccessToken("admin");
    if (adminToken) {
      setTokens(adminToken, "user");
    }
    setImpersonation({
      kind: "branch",
      branchId: branch.id,
      branchName: branch.name,
    });
    resetBranchesStore();
    selectBranch(String(branch.id));
    router.push("/analytics");
  };

  const toggleStatus = async (id: number) => {
    try {
      const updated = await adminBranchesApi.toggleStatus(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const closeCreate = () => {
    setCreateOpen(false);
    router.replace("/admin/branches", { scroll: false });
  };

  const onCreate = async (payload: Parameters<typeof adminBranchesApi.create>[0]) => {
    setError(null);
    try {
      const created = await adminBranchesApi.create(payload);
      setItems((prev) => [created, ...prev]);
      closeCreate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при создании");
    }
  };

  const onUpdate = async (
    id: number,
    payload: Parameters<typeof adminBranchesApi.update>[1]
  ) => {
    setError(null);
    try {
      const updated = await adminBranchesApi.update(id, payload);
      setItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setEditingBranch(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при сохранении");
    }
  };

  const onDelete = async (id: number) => {
    setError(null);
    try {
      await adminBranchesApi.delete(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
      setDeletingBranch(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка при удалении");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold leading-[32px] text-black">
            Филиалы
          </h1>
          <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
            Список всех филиалов
          </p>
        </div>

        <AdminSearchInput
          value={query}
          onChange={setQuery}
          placeholder="Поиск по названию или ID"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <AdminShellCard>
        <div className="grid grid-cols-[1.8fr_0.4fr_0.7fr_1.1fr_0.6fr_0.5fr_0.65fr_0.55fr] items-center border-b border-[#E6E6E6] pb-4 text-[13px] font-medium text-[#222222]">
          <div className="flex items-center gap-2">
            <SortIcon />
            Филиал
          </div>
          <div className="flex items-center gap-2">
            <SortIcon />
            ID
          </div>
          <div>Активность</div>
          <div>Основной контакт</div>
          <div>Сотрудников</div>
          <div>Тариф</div>
          <div className="flex items-center gap-2">
            <SortIcon />
            Оплачено до
          </div>
          <div className="text-right">Действия</div>
        </div>

        <div className="divide-y divide-[#ECECEC]">
          {rows.length === 0 && (
            <p className="py-8 text-center text-[14px] text-[#A3A3A3]">
              Филиалы не найдены
            </p>
          )}
          {rows.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.8fr_0.4fr_0.7fr_1.1fr_0.6fr_0.5fr_0.65fr_0.55fr] items-center py-[14px]"
            >
              <div className="min-w-0 pr-6">
                <button
                  type="button"
                  onClick={() => enterBranchCabinet(item)}
                  title="Открыть кабинет филиала"
                  className="max-w-full truncate text-left text-[16px] text-[#3A3A46] underline decoration-dotted underline-offset-4 transition hover:text-[#111827]"
                >
                  {item.name}
                </button>
              </div>

              <div className="text-[16px] text-[#3A3A46]">{item.publicId}</div>

              <div>
                <AdminSwitch
                  checked={item.isActive}
                  onChange={() => {
                    void toggleStatus(item.id);
                  }}
                />
              </div>

              <div className="truncate pr-4 text-[16px] text-[#3A3A46]">
                {item.primaryContact}
              </div>

              <div className="text-[16px] text-[#3A3A46]">
                {item.employeesCount}
              </div>

              <div className="text-[16px] text-[#3A3A46]">
                {item.smsMonthlyLimit ?? "—"}
              </div>

              <div>
                {item.paidUntil ? (
                  <span className="inline-flex h-[22px] items-center rounded-[6px] bg-[#F2E3E3] px-2 text-[14px] text-[#4A4A4A]">
                    {formatDate(item.paidUntil)}
                  </span>
                ) : (
                  <span className="text-[14px] text-[#A3A3A3]">—</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setEditingBranch(item)}
                  aria-label="Редактировать"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6E6E73] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
                >
                  <Pencil size={16} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingBranch(item)}
                  aria-label="Удалить"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6E6E73] transition hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminShellCard>

      {createOpen && (
        <CreateBranchModal
          onClose={closeCreate}
          onSave={onCreate}
        />
      )}

      {editingBranch && (
        <EditBranchModal
          branch={editingBranch}
          onClose={() => setEditingBranch(null)}
          onSave={(payload) => onUpdate(editingBranch.id, payload)}
        />
      )}

      {deletingBranch && (
        <DeleteConfirmModal
          branch={deletingBranch}
          onClose={() => setDeletingBranch(null)}
          onConfirm={() => onDelete(deletingBranch.id)}
        />
      )}
    </div>
  );
}

const SPECIALIZATIONS = [
  "Офтальмология",
  "Стоматология",
  "Кардиология",
  "Неврология",
  "Педиатрия",
  "Терапия",
  "Хирургия",
  "Дерматология",
  "Гинекология",
  "Урология",
];

const TIMEZONES = [
  "Московское время - UTC +3",
  "Калининград - UTC +2",
  "Самара - UTC +4",
  "Екатеринбург - UTC +5",
  "Омск - UTC +6",
  "Красноярск - UTC +7",
  "Иркутск - UTC +8",
  "Якутск - UTC +9",
  "Владивосток - UTC +10",
  "Магадан - UTC +11",
  "Камчатка - UTC +12",
];

function CreateBranchModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (payload: {
    name: string;
    city: string | null;
    address: string | null;
    phone: string | null;
    specialization: string;
    timezone: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);

  const inputCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";
  const selectCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition appearance-none cursor-pointer";

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[520px]" title="Создать филиал">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Счастливый взгляд, Невский пр. 12"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Город
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Санкт-Петербург"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Телефон
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 999 000 11 22"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Адрес
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ул. Примерная, д. 1"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Специализация
          </label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className={selectCls}
          >
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Часовой пояс
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={selectCls}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              name: name.trim(),
              city: city.trim() || null,
              address: address.trim() || null,
              phone: phone.trim() || null,
              specialization,
              timezone,
            })
          }
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Создать филиал
        </button>
      </div>
    </AdminModal>
  );
}

function EditBranchModal({
  branch,
  onClose,
  onSave,
}: {
  branch: AdminBranch;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    city: string | null;
    phone: string | null;
    specialization: string;
    smsMonthlyLimit: number | null;
    platformUrls: Record<string, string>;
  }) => void;
}) {
  const [name, setName] = useState(branch.name);
  const [city, setCity] = useState(branch.city ?? "");
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [specialization, setSpecialization] = useState(branch.specialization);
  const [tariff, setTariff] = useState(
    branch.smsMonthlyLimit != null ? String(branch.smsMonthlyLimit) : ""
  );
  const [urls, setUrls] = useState<Record<string, string>>({ ...branch.platformUrls });

  const inputCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";
  const selectCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition appearance-none cursor-pointer";

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    const cleanedUrls: Record<string, string> = {};
    for (const [k, v] of Object.entries(urls)) {
      const trimmed = v.trim();
      if (trimmed) cleanedUrls[k] = trimmed;
    }
    const tariffTrimmed = tariff.trim();
    const tariffNum = tariffTrimmed === "" ? null : Number(tariffTrimmed);
    onSave({
      name: name.trim(),
      city: city.trim() || null,
      phone: phone.trim() || null,
      specialization,
      smsMonthlyLimit:
        tariffNum != null && Number.isFinite(tariffNum) && tariffNum >= 0
          ? tariffNum
          : null,
      platformUrls: cleanedUrls,
    });
  };

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[560px]" title="Редактировать филиал">
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Название <span className="text-red-500">*</span>
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">Город</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">Телефон</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">Специализация</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className={selectCls}
          >
            {[specialization, ...SPECIALIZATIONS.filter((s) => s !== specialization)].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Тариф — запросов в месяц
          </label>
          <input
            type="number"
            min={0}
            value={tariff}
            onChange={(e) => setTariff(e.target.value)}
            placeholder="например, 150"
            className={inputCls}
          />
          <p className="mt-1.5 text-[12px] text-[#A3A3A3]">
            Лимит SMS-запросов в месяц. Эта цифра показывается в кабинете как «X из Y».
          </p>
        </div>

        <div className="border-t border-[#ECECEC] pt-4">
          <div className="mb-3 text-[13px] font-medium text-[#222222]">URL площадок</div>
          <div className="space-y-3">
            {PLATFORM_FIELDS.map((p) => (
              <div key={p.key}>
                <label className="mb-1 block text-[12px] text-[#6E6E73]">{p.label}</label>
                <input
                  value={urls[p.key] ?? ""}
                  onChange={(e) => setUrls((prev) => ({ ...prev, [p.key]: e.target.value }))}
                  placeholder={p.placeholder}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Сохранить
        </button>
      </div>
    </AdminModal>
  );
}

function DeleteConfirmModal({
  branch,
  onClose,
  onConfirm,
}: {
  branch: AdminBranch;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[460px]" title="Удалить филиал?">
      <div className="space-y-4">
        <p className="text-[14px] leading-[20px] text-[#3A3A46]">
          Вы собираетесь удалить филиал <span className="font-semibold">«{branch.name}»</span>.
          Все связанные данные — отзывы, жалобы, запросы, сотрудники и записи чёрного списка — будут
          безвозвратно удалены.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#222222] transition hover:bg-[#F3F4F6]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[42px] rounded-[10px] bg-[#DC2626] px-4 text-[14px] font-semibold text-white transition hover:brightness-95"
          >
            Удалить
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
