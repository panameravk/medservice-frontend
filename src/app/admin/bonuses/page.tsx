"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { AdminSwitch } from "../../components/admin/AdminSwitch";
import { LogoUploader } from "../../components/LogoUploader";
import { adminBonusesApi } from "../../lib/admin/bonuses";
import type {
  AdminBonus,
  AdminBonusInput,
  BonusCategory,
} from "../../types/bonus";

const DISCOUNT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function AdminBonusesPage() {
  const [categories, setCategories] = useState<BonusCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<BonusCategory | null>(null);
  const [addingBonusIn, setAddingBonusIn] = useState<BonusCategory | null>(null);
  const [editingBonus, setEditingBonus] = useState<{
    category: BonusCategory;
    bonus: AdminBonus;
  } | null>(null);
  const [deletingBonus, setDeletingBonus] = useState<{
    category: BonusCategory;
    bonus: AdminBonus;
  } | null>(null);

  const refresh = async () => {
    try {
      const data = await adminBonusesApi.listCategories();
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const onAddCategory = async (name: string) => {
    try {
      await adminBonusesApi.createCategory(name);
      setCreateCatOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onDeleteCategory = async (id: number) => {
    try {
      await adminBonusesApi.deleteCategory(id);
      setDeletingCat(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onTogglePublished = async (categoryId: number, bonus: AdminBonus) => {
    try {
      await adminBonusesApi.updateBonus(categoryId, bonus.id, {
        isPublished: !bonus.isPublished,
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onAddBonus = async (categoryId: number, payload: AdminBonusInput) => {
    try {
      await adminBonusesApi.createBonus(categoryId, payload);
      setAddingBonusIn(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onSaveBonus = async (
    categoryId: number,
    bonusId: number,
    payload: Partial<AdminBonusInput>
  ) => {
    try {
      await adminBonusesApi.updateBonus(categoryId, bonusId, payload);
      setEditingBonus(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onDeleteBonus = async (categoryId: number, bonusId: number) => {
    try {
      await adminBonusesApi.deleteBonus(categoryId, bonusId);
      setDeletingBonus(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-bold leading-[32px] text-black">
            Бонусы
          </h1>
          <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
            Список всех категорий и бонусов
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateCatOpen(true)}
          className="h-[44px] rounded-[10px] bg-[#F4C21A] px-4 text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          Добавить категорию
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <AdminShellCard>
        {categories.length === 0 && (
          <p className="py-8 text-center text-[14px] text-[#A3A3A3]">
            Нет категорий. Создайте первую — кнопка справа сверху.
          </p>
        )}

        <div className="space-y-8">
          {categories.map((cat) => (
            <section key={cat.id}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-[20px] font-bold text-[#111827]">
                  {cat.name}
                </h2>
                <button
                  type="button"
                  onClick={() => setDeletingCat(cat)}
                  className="text-[#A3A3A3] transition hover:text-[#DC2626]"
                  aria-label="Удалить категорию"
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              </div>

              {cat.bonuses.length > 0 && (
                <div className="mb-2 grid grid-cols-[70px_2fr_1fr_70px_2fr_110px_110px_70px] items-center text-[13px] font-medium text-[#222222]">
                  <div>Опубл.</div>
                  <div>Компания</div>
                  <div>Город</div>
                  <div>Скидка</div>
                  <div>Описание</div>
                  <div>Дата начала</div>
                  <div>Дата окончания</div>
                  <div />
                </div>
              )}

              <div className="divide-y divide-[#ECECEC]">
                {cat.bonuses.map((b) => (
                  <div
                    key={b.id}
                    className="grid grid-cols-[70px_2fr_1fr_70px_2fr_110px_110px_70px] items-center py-3 text-[14px] text-[#3A3A46]"
                  >
                    <div>
                      <AdminSwitch
                        checked={b.isPublished}
                        onChange={() => onTogglePublished(cat.id, b)}
                      />
                    </div>
                    <div className="flex items-center gap-2 pr-3">
                      {b.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.logoUrl}
                          alt=""
                          className="h-8 w-8 rounded-[6px] border border-[#E6E6E6] object-contain"
                        />
                      )}
                      <span className="truncate">{b.companyName}</span>
                    </div>
                    <div>{b.city}</div>
                    <div>{b.discountPercent}%</div>
                    <div className="pr-3">{b.description}</div>
                    <div>{formatDate(b.startDate)}</div>
                    <div>{formatDate(b.endDate)}</div>
                    <div className="flex justify-end gap-1 text-[#6E6E73]">
                      <button
                        type="button"
                        onClick={() => setEditingBonus({ category: cat, bonus: b })}
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#F3F4F6] hover:text-[#111827]"
                      >
                        <Pencil size={16} strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBonus({ category: cat, bonus: b })}
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                      >
                        <Trash2 size={16} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAddingBonusIn(cat)}
                className="mt-3 flex h-[40px] w-[180px] items-center justify-center rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
              >
                Добавить бонус
              </button>
            </section>
          ))}
        </div>
      </AdminShellCard>

      {createCatOpen && (
        <CategoryModal
          title="Добавить категорию"
          submitLabel="Добавить"
          onClose={() => setCreateCatOpen(false)}
          onSave={onAddCategory}
        />
      )}

      {deletingCat && (
        <ConfirmDeleteModal
          title="Удалить категорию?"
          message={`Категория «${deletingCat.name}» и все бонусы внутри будут удалены без возможности восстановления.`}
          onClose={() => setDeletingCat(null)}
          onConfirm={() => onDeleteCategory(deletingCat.id)}
        />
      )}

      {addingBonusIn && (
        <AdminBonusModal
          title={`Добавить бонус — ${addingBonusIn.name}`}
          submitLabel="Добавить"
          onClose={() => setAddingBonusIn(null)}
          onSave={(payload) => onAddBonus(addingBonusIn.id, payload)}
        />
      )}

      {editingBonus && (
        <AdminBonusModal
          title="Редактировать бонус"
          submitLabel="Сохранить"
          initial={editingBonus.bonus}
          onClose={() => setEditingBonus(null)}
          onSave={(payload) =>
            onSaveBonus(editingBonus.category.id, editingBonus.bonus.id, payload)
          }
        />
      )}

      {deletingBonus && (
        <ConfirmDeleteModal
          title="Удалить бонус?"
          message={`Бонус «${deletingBonus.bonus.companyName}» будет удалён без возможности восстановления.`}
          onClose={() => setDeletingBonus(null)}
          onConfirm={() =>
            onDeleteBonus(deletingBonus.category.id, deletingBonus.bonus.id)
          }
        />
      )}
    </div>
  );
}

function CategoryModal({
  title,
  submitLabel,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[360px]" title={title}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Название категории
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-[46px] w-full rounded-[10px] bg-[#F3F4F6] px-4 text-[14px] outline-none"
          />
        </div>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSave(name.trim())}
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}

function AdminBonusModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  initial?: AdminBonus;
  onClose: () => void;
  onSave: (payload: AdminBonusInput) => void;
}) {
  const [companyName, setCompanyName] = useState(initial?.companyName ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initial?.logoUrl ?? null);
  const [city, setCity] = useState(initial?.city ?? "");
  const [discount, setDiscount] = useState<number>(
    initial?.discountPercent ?? 20
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");

  const canSave =
    companyName.trim().length > 0 &&
    city.trim().length > 0 &&
    description.trim().length > 0 &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    endDate >= startDate;

  const inputCls =
    "h-[46px] w-full rounded-[10px] bg-[#F3F4F6] px-4 text-[14px] outline-none";

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[460px]" title={title}>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Название компании
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Логотип (размер: 40×40 px, формат: .png)
          </label>
          <LogoUploader value={logoUrl} onChange={setLogoUrl} />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Город
          </label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputCls}
          />
        </div>

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
            className="w-full rounded-[10px] bg-[#F3F4F6] px-3 py-2 text-[14px] outline-none"
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
              className={inputCls}
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
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            onSave({
              companyName: companyName.trim(),
              logoUrl,
              city: city.trim(),
              discountPercent: discount,
              description: description.trim(),
              startDate,
              endDate,
            })
          }
          className="mt-2 h-[48px] w-full rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] disabled:opacity-50"
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}

function ConfirmDeleteModal({
  title,
  message,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[440px]" title={title}>
      <div className="space-y-4">
        <p className="text-[14px] text-[#3A3A46]">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[42px] rounded-[10px] bg-[#DC2626] px-4 text-[14px] font-semibold text-white"
          >
            Удалить
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
