"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useBranchesStore } from "../../lib/branchesStore";
import { LogoUploader } from "../../components/LogoUploader";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminSwitch } from "../../components/admin/AdminSwitch";
import {
  createBranchBonus,
  deleteBranchBonus,
  getBranding,
  listBranchBonuses,
  updateBranchBonus,
  updateBranding,
} from "../../lib/api/bonuses";
import type {
  Branding,
  BranchBonus,
  BranchBonusInput,
} from "../../types/bonus";

const DISCOUNT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function BonusesPage() {
  const branchId = useBranchesStore((s) => s.selectedBranchId);
  const numericBranchId = branchId ? Number(branchId) : null;

  if (!numericBranchId) {
    return (
      <div className="p-6 text-[14px] text-[#6E6E73]">
        Выберите филиал в выпадающем списке наверху.
      </div>
    );
  }

  return <BonusesScreen branchId={numericBranchId} />;
}

function BonusesScreen({ branchId }: { branchId: number }) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [bonuses, setBonuses] = useState<BranchBonus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BranchBonus | null>(null);
  const [deleting, setDeleting] = useState<BranchBonus | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBranding(branchId), listBranchBonuses(branchId)])
      .then(([b, list]) => {
        if (cancelled) return;
        setError(null);
        setBranding(b);
        setBonuses(list);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Ошибка"));
    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const saveBranding = async (patch: Partial<Branding>) => {
    try {
      const updated = await updateBranding(branchId, patch);
      setBranding(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    }
  };

  const togglePublished = async (bonus: BranchBonus) => {
    const nextValue = !bonus.isPublished;
    setBonuses((prev) =>
      prev.map((b) => (b.id === bonus.id ? { ...b, isPublished: nextValue } : b))
    );
    try {
      const updated = await updateBranchBonus(branchId, bonus.id, {
        isPublished: nextValue,
      });
      setBonuses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (e) {
      setBonuses((prev) =>
        prev.map((b) =>
          b.id === bonus.id ? { ...b, isPublished: bonus.isPublished } : b
        )
      );
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onCreate = async (payload: BranchBonusInput) => {
    try {
      const created = await createBranchBonus(branchId, payload);
      setBonuses((prev) => [created, ...prev]);
      setCreateOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    }
  };

  const onSaveEdit = async (id: number, payload: Partial<BranchBonusInput>) => {
    try {
      const updated = await updateBranchBonus(branchId, id, payload);
      setBonuses((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await deleteBranchBonus(branchId, id);
      setBonuses((prev) => prev.filter((b) => b.id !== id));
      setDeleting(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  if (!branding) {
    return <div className="p-6 text-[14px] text-[#6E6E73]">Загрузка…</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-[26px] font-bold text-black">Бонусы</h1>
        <p className="mt-1 text-[14px] text-[#6E6E73]">
          Промокоды, которые будет видеть пациент после отправки отзыва
        </p>
      </div>

      {error && (
        <div className="rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <BrandingCard value={branding} onSave={saveBranding} />

      <div className="rounded-[14px] border border-[#E6E6E6] bg-white px-5 py-4">
        {bonuses.length > 0 && (
          <div className="mb-3 grid grid-cols-[80px_140px_1fr_120px_120px_80px] items-center text-[13px] font-medium text-[#222222]">
            <div>Опубл.</div>
            <div>Размер скидки</div>
            <div>Описание</div>
            <div>Дата начала</div>
            <div>Дата окончания</div>
            <div />
          </div>
        )}

        <div className="divide-y divide-[#ECECEC]">
          {bonuses.map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-[80px_140px_1fr_120px_120px_80px] items-center py-3 text-[14px] text-[#3A3A46]"
            >
              <div>
                <AdminSwitch
                  checked={b.isPublished}
                  onChange={() => togglePublished(b)}
                />
              </div>
              <div>{b.discountPercent}%</div>
              <div className="pr-4">{b.description}</div>
              <div>{formatDate(b.startDate)}</div>
              <div>{formatDate(b.endDate)}</div>
              <div className="flex justify-end gap-1 text-[#6E6E73]">
                <button
                  type="button"
                  onClick={() => setEditing(b)}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#F3F4F6] hover:text-[#111827]"
                  aria-label="Редактировать"
                >
                  <Pencil size={16} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(b)}
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                  aria-label="Удалить"
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="mt-4 flex h-[44px] w-[200px] items-center justify-center rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          Добавить бонус
        </button>
      </div>

      {createOpen && (
        <BonusModal
          title="Добавить бонус"
          submitLabel="Добавить"
          onClose={() => setCreateOpen(false)}
          onSave={onCreate}
        />
      )}

      {editing && (
        <BonusModal
          title="Редактировать бонус"
          submitLabel="Сохранить"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(payload) => onSaveEdit(editing.id, payload)}
        />
      )}

      {deleting && (
        <AdminModal
          onClose={() => setDeleting(null)}
          widthClassName="max-w-[420px]"
          title="Удалить бонус?"
        >
          <div className="space-y-4">
            <p className="text-[14px] text-[#3A3A46]">
              Бонус «{deleting.description}» будет удалён без возможности
              восстановления.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => onDelete(deleting.id)}
                className="h-[42px] rounded-[10px] bg-[#DC2626] px-4 text-[14px] font-semibold text-white"
              >
                Удалить
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

function BrandingCard({
  value,
  onSave,
}: {
  value: Branding;
  onSave: (patch: Partial<Branding>) => void;
}) {
  const [publicName, setPublicName] = useState(value.publicName ?? "");
  const [publicCity, setPublicCity] = useState(value.publicCity ?? "");

  useEffect(() => {
    setPublicName(value.publicName ?? "");
    setPublicCity(value.publicCity ?? "");
  }, [value.publicName, value.publicCity]);

  const inputCls =
    "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";

  const commit = (field: keyof Branding, current: string) => {
    const next = current.trim() || null;
    if (next === value[field]) return;
    onSave({ [field]: next });
  };

  return (
    <div className="rounded-[14px] border border-[#E6E6E6] bg-white px-5 py-4">
      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Публичное название компании для пациентов
          </label>
          <input
            value={publicName}
            onChange={(e) => setPublicName(e.target.value)}
            onBlur={() => commit("publicName", publicName)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Город
          </label>
          <input
            value={publicCity}
            onChange={(e) => setPublicCity(e.target.value)}
            onBlur={() => commit("publicCity", publicCity)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Логотип (размер: 40×40 px, формат: .png)
          </label>
          <LogoUploader
            value={value.logoUrl}
            onChange={(next) => onSave({ logoUrl: next })}
          />
        </div>
      </div>
    </div>
  );
}

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
  onSave: (payload: BranchBonusInput) => void;
}) {
  const [discount, setDiscount] = useState<number>(initial?.discountPercent ?? 20);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");

  const canSave =
    description.trim().length > 0 &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    endDate >= startDate;

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[420px]" title={title}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Размер скидки (%)
          </label>
          <select
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="h-[46px] w-[120px] rounded-[10px] bg-[#F3F4F6] px-3 text-[14px]"
          >
            {DISCOUNT_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-[10px] bg-[#F3F4F6] px-3 py-2 text-[14px] outline-none focus:border-[#F4C21A]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Дата начала
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-[46px] w-full rounded-[10px] bg-[#F3F4F6] px-3 text-[14px]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#222222]">
              Дата окончания
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-[46px] w-full rounded-[10px] bg-[#F3F4F6] px-3 text-[14px]"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            onSave({
              discountPercent: discount,
              description: description.trim(),
              startDate,
              endDate,
            })
          }
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}
