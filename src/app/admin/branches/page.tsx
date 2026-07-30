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
import { openDatePicker } from "../../lib/datePicker";
import { getCanonicalPhone, PhoneInput } from "../../components/PhoneInput";

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
  const createVisible = createOpen || searchParams.get("create") === "1";

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
    setError(null);
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
      throw e;
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

      {createVisible && (
        <CreateBranchModal
          onClose={closeCreate}
          onSave={onCreate}
          error={error}
        />
      )}

      {editingBranch && (
        <EditBranchModal
          branch={editingBranch}
          onClose={() => setEditingBranch(null)}
          onSave={(payload) => onUpdate(editingBranch.id, payload)}
          error={error}
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
  error,
}: {
  onClose: () => void;
  onSave: (
    payload: Parameters<typeof adminBranchesApi.create>[0]
  ) => Promise<void>;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [username, setUsername] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCheckStatus, setUserCheckStatus] = useState<
    "idle" | "checking" | "existing" | "new"
  >("idle");
  const [checkedUsername, setCheckedUsername] = useState<string | null>(null);
  const [userCheckError, setUserCheckError] = useState<string | null>(null);
  const phoneCanonical = getCanonicalPhone(phone);
  const userPhoneCanonical = getCanonicalPhone(userPhone);
  const normalizedUsername = username.trim();
  const checkedUsernameMatches = checkedUsername === normalizedUsername;

  const branchFieldsAreValid = Boolean(
    name.trim() && (!phone.trim() || phoneCanonical)
  );
  const existingUserIsValid =
    userCheckStatus === "existing" && checkedUsernameMatches;
  const newUserIsValid = Boolean(
    userCheckStatus === "new" &&
      checkedUsernameMatches &&
      userPhoneCanonical &&
      email.trim() &&
      password.length >= 8 &&
      role.trim()
  );
  const canSubmit =
    branchFieldsAreValid && (existingUserIsValid || newUserIsValid);

  const inputCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";
  const selectCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition appearance-none cursor-pointer";

  const handleUsernameChange = (nextUsername: string) => {
    setUsername(nextUsername);
    setUserCheckStatus("idle");
    setCheckedUsername(null);
    setUserCheckError(null);
  };

  const handleUserCheck = async () => {
    if (!normalizedUsername || userCheckStatus === "checking") return;

    setUserCheckStatus("checking");
    setUserCheckError(null);

    try {
      const result = await adminBranchesApi.checkUser(normalizedUsername);
      setCheckedUsername(normalizedUsername);
      setUserCheckStatus(result.exists ? "existing" : "new");
    } catch (checkError) {
      setCheckedUsername(null);
      setUserCheckStatus("idle");
      setUserCheckError(
        checkError instanceof Error
          ? checkError.message
          : "Не удалось проверить пользователя"
      );
    }
  };

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[620px]" title="Создать филиал">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!canSubmit || isSubmitting) return;

          setIsSubmitting(true);
          try {
            const branchPayload = {
              name: name.trim(),
              city: city.trim() || null,
              address: address.trim() || null,
              phone: phoneCanonical,
              specialization,
              timezone,
            };

            if (existingUserIsValid && checkedUsername) {
              await onSave({
                ...branchPayload,
                existingUserUsername: checkedUsername,
              });
            } else if (newUserIsValid) {
              await onSave({
                ...branchPayload,
                firstUser: {
                  username: normalizedUsername,
                  email: email.trim(),
                  password,
                  phone: userPhoneCanonical ?? "",
                  role: role.trim(),
                },
              });
            }
          } catch {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Счастливый взгляд, Невский пр. 12"
            className={inputCls}
            required
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
              Телефон филиала
            </label>
            <PhoneInput
              value={phone}
              onChange={(next, meta) => setPhone(meta.canonical ?? next)}
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

        <div className="border-t border-[#E5E7EB] pt-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Первый пользователь
          </h3>
          <p className="mt-1 text-[12px] leading-[17px] text-[#6E6E73]">
            Получит доступ к этому филиалу и сможет войти по логину и паролю.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Логин <span className="text-red-500">*</span>
            </label>
            <input
              value={username}
              onChange={(event) => handleUsernameChange(event.target.value)}
              placeholder="clinic-manager"
              autoComplete="username"
              className={inputCls}
              disabled={userCheckStatus === "checking"}
              required
            />
          </div>

          {(userCheckStatus === "idle" ||
            userCheckStatus === "checking") && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  void handleUserCheck();
                }}
                disabled={!normalizedUsername || userCheckStatus === "checking"}
                className="h-[46px] w-full rounded-[10px] bg-black text-[14px] font-medium text-white transition hover:bg-[#1F2937] disabled:cursor-not-allowed"
              >
                {userCheckStatus === "checking"
                  ? "Проверяем пользователя…"
                  : "Проверить пользователя"}
              </button>
            </div>
          )}

          {userCheckStatus === "new" && (
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                Роль в команде <span className="text-red-500">*</span>
              </label>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Руководитель"
                className={inputCls}
                required
              />
            </div>
          )}
        </div>

        {userCheckStatus === "new" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="manager@clinic.ru"
                  autoComplete="email"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                  Телефон пользователя <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  value={userPhone}
                  onChange={(next, meta) =>
                    setUserPhone(meta.canonical ?? next)
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                Пароль <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Не менее 8 символов"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                className={inputCls}
                required
              />
              <p className="mt-1.5 text-[12px] text-[#6E6E73]">
                От 8 до 72 символов.
              </p>
            </div>
          </>
        )}

        {userCheckStatus === "existing" && (
          <div
            role="status"
            className="rounded-[10px] bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            Пользователь добавлен
          </div>
        )}

        {userCheckStatus === "new" && (
          <div
            role="status"
            className="rounded-[10px] bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            Такого пользователя нет. Введи данные.
          </div>
        )}

        {userCheckError && (
          <div
            role="alert"
            className="rounded-[10px] bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            {userCheckError}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-[10px] bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Создаём филиал…" : "Создать филиал"}
        </button>
      </form>
    </AdminModal>
  );
}

function EditBranchModal({
  branch,
  onClose,
  onSave,
  error,
}: {
  branch: AdminBranch;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    city: string | null;
    phone: string | null;
    specialization: string;
    smsMonthlyLimit: number | null;
    paidUntil: string | null;
    platformUrls: Record<string, string>;
    firstUser?: {
      username: string;
      email: string;
      phone: string;
      role: string;
      password?: string;
    };
  }) => void;
  error: string | null;
}) {
  const [name, setName] = useState(branch.name);
  const [city, setCity] = useState(branch.city ?? "");
  const [phone, setPhone] = useState(branch.phone ?? "");
  const [specialization, setSpecialization] = useState(branch.specialization);
  const [tariff, setTariff] = useState(
    branch.smsMonthlyLimit != null ? String(branch.smsMonthlyLimit) : ""
  );
  const [paidUntil, setPaidUntil] = useState(
    branch.paidUntil ? branch.paidUntil.split("T")[0] : ""
  );
  const [urls, setUrls] = useState<Record<string, string>>({ ...branch.platformUrls });
  const [username, setUsername] = useState(branch.firstUser?.username ?? "");
  const [email, setEmail] = useState(branch.firstUser?.email ?? "");
  const [userPhone, setUserPhone] = useState(branch.firstUser?.phone ?? "");
  const [role, setRole] = useState(branch.firstUser?.role ?? "");
  const [newPassword, setNewPassword] = useState("");
  const phoneCanonical = getCanonicalPhone(phone);
  const userPhoneCanonical = getCanonicalPhone(userPhone);

  const inputCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";
  const selectCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition appearance-none cursor-pointer";

  const firstUserIsValid =
    !branch.firstUser ||
    (username.trim() &&
      email.trim() &&
      userPhoneCanonical &&
      role.trim() &&
      (!newPassword || newPassword.length >= 8));
  const canSave =
    name.trim().length > 0 &&
    firstUserIsValid &&
    (!phone.trim() || phoneCanonical);

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
      phone: phoneCanonical,
      specialization,
      smsMonthlyLimit:
        tariffNum != null && Number.isFinite(tariffNum) && tariffNum >= 0
          ? tariffNum
          : null,
      paidUntil: paidUntil || null,
      platformUrls: cleanedUrls,
      ...(branch.firstUser
        ? {
            firstUser: {
              username: username.trim(),
              email: email.trim(),
              phone: userPhoneCanonical ?? "",
              role: role.trim(),
              ...(newPassword ? { password: newPassword } : {}),
            },
          }
        : {}),
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
            <PhoneInput
              value={phone}
              onChange={(next, meta) => setPhone(meta.canonical ?? next)}
            />
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

        <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Оплачено до
            </label>
            <input
              type="date"
              value={paidUntil}
              onClick={(event) => openDatePicker(event.currentTarget)}
              onChange={(e) => setPaidUntil(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            />
          </div>
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

        <div className="border-t border-[#ECECEC] pt-4">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Первый пользователь
          </h3>
          {branch.firstUser ? (
            <>
              <p className="mt-1 text-[12px] leading-[17px] text-[#6E6E73]">
                Учётная запись, созданная вместе с филиалом.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                    Логин <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                    Роль в команде <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                    Телефон пользователя <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    value={userPhone}
                    onChange={(next, meta) =>
                      setUserPhone(meta.canonical ?? next)
                    }
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-2 block text-[13px] font-medium text-[#222222]">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Оставьте пустым, чтобы не менять"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  className={inputCls}
                />
                <p className="mt-1.5 text-[12px] text-[#6E6E73]">
                  Если меняете пароль — от 8 до 72 символов.
                </p>
              </div>
            </>
          ) : (
            <p className="mt-1 text-[13px] leading-[18px] text-[#6E6E73]">
              Первый пользователь для этого филиала не найден.
            </p>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-[10px] bg-red-50 px-4 py-3 text-[13px] text-red-600"
          >
            {error}
          </div>
        )}

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
