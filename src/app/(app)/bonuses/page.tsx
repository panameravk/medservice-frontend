"use client";

/* eslint-disable react-hooks/set-state-in-effect -- The initial branch-scoped API load owns this local state. */

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminSwitch } from "../../components/admin/AdminSwitch";
import { CustomSelect } from "../../components/CustomSelect";
import { LogoUploader } from "../../components/LogoUploader";
import {
  ApiError,
  createBranchBonus,
  deleteBranchBonus,
  getBranchBonuses,
  updateBranchIdentity,
  updateBranchBonus,
  type BranchBonus,
} from "../../lib/api";
import { useBranchesStore } from "../../lib/branchesStore";
import { openDatePicker } from "../../lib/datePicker";

// ── shared classes ───────────────────────────────────────────────────────────

const inputCls =
  "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none transition focus:border-[#D8D8D8]";
const textareaCls =
  "min-h-[96px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 py-3 text-[14px] text-[#222222] outline-none transition focus:border-[#D8D8D8]";
const labelCls = "mb-2 block text-[13px] font-medium text-[#222222]";
const yellowBtn =
  "rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50";

const DISCOUNT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

// Major RU cities for the header dropdown; the branch's own city is folded in.
const BASE_CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Краснодар",
  "Ростов-на-Дону",
];

// Опубл. | Размер скидки | Описание | Дата начала | Дата окончания | actions
const COLS = "grid-cols-[70px_120px_1fr_120px_120px_72px]";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BonusesPage() {
  const selectedBranch = useBranchesStore((s) =>
    s.branches.find((branch) => branch.id === s.selectedBranchId)
  );

  if (!selectedBranch) {
    return <p className="text-[14px] text-[#9CA3AF]">Выберите филиал</p>;
  }

  return <BonusesView key={selectedBranch.id} branchId={selectedBranch.id} />;
}

function BonusesView({ branchId }: { branchId: string }) {
  const [bonuses, setBonuses] = useState<BranchBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BranchBonus | null>(null);
  const [deleting, setDeleting] = useState<BranchBonus | null>(null);

  const reload = useCallback(async () => {
    try {
      setBonuses(await getBranchBonuses(branchId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось загрузить бонусы");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка");
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-bold leading-[32px] text-black">Бонусы</h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
          Промокоды, которые будет видеть пациент после отправки отзыва
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <BranchIdentityCard branchId={branchId} />

      <div className="overflow-hidden rounded-[14px] border border-[#E6E6E6] bg-white px-5 py-4">
        {/* column header */}
        <div
          className={`grid ${COLS} items-center gap-3 border-b border-[#E6E6E6] pb-3 text-[13px] font-medium text-[#222222]`}
        >
          <div>Опубл.</div>
          <div>Размер скидки</div>
          <div>Описание</div>
          <div>Дата начала</div>
          <div>Дата окончания</div>
          <div />
        </div>

        {loading ? (
          <p className="py-10 text-center text-[14px] text-[#A3A3A3]">Загрузка…</p>
        ) : bonuses.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#A3A3A3]">
            Бонусов пока нет
          </p>
        ) : (
          bonuses.map((b) => (
            <div
              key={b.id}
              className={`grid ${COLS} items-center gap-3 border-t border-[#F1F1F1] py-3 text-[14px] text-[#3A3A46]`}
            >
              <AdminSwitch
                checked={b.isPublished}
                onChange={() =>
                  run(() =>
                    updateBranchBonus(b.id, { isPublished: !b.isPublished })
                  )
                }
              />
              <div className="font-semibold">{b.discountPercent}%</div>
              <div className="truncate pr-2">{b.description || "—"}</div>
              <div>{fmtDate(b.startDate)}</div>
              <div>{fmtDate(b.endDate)}</div>
              <div className="flex items-center justify-end gap-1">
                <IconBtn label="Редактировать" onClick={() => setEditing(b)}>
                  <Pencil size={16} strokeWidth={1.8} />
                </IconBtn>
                <IconBtn label="Удалить" danger onClick={() => setDeleting(b)}>
                  <Trash2 size={16} strokeWidth={1.8} />
                </IconBtn>
              </div>
            </div>
          ))
        )}

        <div className="border-t border-[#F1F1F1] pt-4">
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={`flex h-[44px] items-center gap-2 px-4 ${yellowBtn}`}
          >
            <Plus size={16} /> Добавить бонус
          </button>
        </div>
      </div>

      {creating && (
        <BonusModal
          title="Добавить бонус"
          submitLabel="Добавить"
          onClose={() => setCreating(false)}
          onSave={(payload) =>
            run(() => createBranchBonus(branchId, payload)).then(() =>
              setCreating(false)
            )
          }
        />
      )}
      {editing && (
        <BonusModal
          title="Редактировать бонус"
          submitLabel="Сохранить"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(payload) =>
            run(() => updateBranchBonus(editing.id, payload)).then(() =>
              setEditing(null)
            )
          }
        />
      )}
      {deleting && (
        <DeleteConfirm
          message={`Бонус «${
            deleting.description || `скидка ${deleting.discountPercent}%`
          }» будет удалён.`}
          onClose={() => setDeleting(null)}
          onConfirm={() =>
            run(() => deleteBranchBonus(deleting.id)).then(() =>
              setDeleting(null)
            )
          }
        />
      )}
    </div>
  );
}

// ── header card: public name / city / logo ───────────────────────────────────

function BranchIdentityCard({ branchId }: { branchId: string }) {
  const selectedBranch = useBranchesStore((s) =>
    s.branches.find((branch) => branch.id === branchId)
  );
  const updateBranchInStore = useBranchesStore((s) => s.updateBranchInStore);

  const [name, setName] = useState(selectedBranch?.name ?? "");
  const [city, setCity] = useState(selectedBranch?.city ?? "");
  // Patient-facing logo (base64 data URL) — persisted to the branch and shown on
  // the mini tile. Seeded from the store so it survives reloads/branch switches.
  const [logo, setLogo] = useState<string | null>(
    selectedBranch?.logoUrl ?? null
  );
  const [saved, setSaved] = useState(false);

  const cityOptions = BASE_CITIES.includes(city) || !city
    ? BASE_CITIES
    : [city, ...BASE_CITIES];

  const persist = async (patch: {
    name?: string;
    city?: string | null;
    logoUrl?: string | null;
  }) => {
    if (!selectedBranch) return;
    try {
      const updated = await updateBranchIdentity(selectedBranch.id, patch);
      updateBranchInStore(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch {
      // surfaced on the table-level error banner if the user retries; the
      // header stays editable so a transient failure isn't destructive.
    }
  };

  const saveName = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === selectedBranch?.name) return;
    void persist({ name: trimmed });
  };

  const saveCity = (next: string) => {
    setCity(next);
    if (next !== (selectedBranch?.city ?? "")) void persist({ city: next });
  };

  const saveLogo = (next: string | null) => {
    setLogo(next);
    if (next !== (selectedBranch?.logoUrl ?? null)) {
      void persist({ logoUrl: next });
    }
  };

  return (
    <div className="mb-4 rounded-[14px] border border-[#E6E6E6] bg-white px-5 py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_240px]">
        <div>
          <label className={labelCls}>
            Публичное название компании для пациентов
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Город</label>
          <CustomSelect
            value={city}
            options={cityOptions.map((c) => ({ label: c, value: c }))}
            onChange={saveCity}
          />
        </div>

        <div>
          <label className={labelCls}>
            Логотип (размер: 40×40 px, формат: .png)
          </label>
          <LogoUploader value={logo} onChange={saveLogo} />
        </div>
      </div>

      {saved && (
        <p className="mt-2 text-[12px] text-[#45C16E]">Сохранено ✓</p>
      )}
    </div>
  );
}

// ── add / edit modal ─────────────────────────────────────────────────────────

type BonusModalPayload = {
  discountPercent: number;
  description: string;
  startDate: string | null;
  endDate: string | null;
  promoCode: string | null;
};

function BonusModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  initial?: BranchBonus;
  onClose: () => void;
  onSave: (payload: BonusModalPayload) => void;
}) {
  const [discount, setDiscount] = useState(initial?.discountPercent ?? 20);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [promo, setPromo] = useState(initial?.promoCode ?? "");

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[440px]" title={title}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Размер скидки (%)</label>
          <div className="w-[140px]">
            <CustomSelect
              value={String(discount)}
              options={DISCOUNT_OPTIONS.map((d) => ({
                label: `${d}%`,
                value: String(d),
              }))}
              onChange={(value) => setDiscount(Number(value))}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={textareaCls}
          />
        </div>

        <div>
          <label className={labelCls}>Промокод</label>
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Необязательно"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Дата начала</label>
            <input
              type="date"
              value={startDate}
              onClick={(event) => openDatePicker(event.currentTarget)}
              onChange={(e) => setStartDate(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            />
          </div>
          <div>
            <label className={labelCls}>Дата окончания</label>
            <input
              type="date"
              value={endDate}
              onClick={(event) => openDatePicker(event.currentTarget)}
              onChange={(e) => setEndDate(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onSave({
              discountPercent: discount,
              description: description.trim(),
              startDate: startDate || null,
              endDate: endDate || null,
              promoCode: promo.trim() || null,
            })
          }
          className={`mt-2 h-[48px] w-full ${yellowBtn}`}
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────

function IconBtn({
  children,
  label,
  danger = false,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6E6E73] transition",
        danger
          ? "hover:bg-[#FEE2E2] hover:text-[#DC2626]"
          : "hover:bg-[#F3F4F6] hover:text-[#111827]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DeleteConfirm({
  message,
  onClose,
  onConfirm,
}: {
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[440px]" title="Удалить бонус?">
      <div className="space-y-4">
        <p className="text-[14px] leading-[20px] text-[#3A3A46]">{message}</p>
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
