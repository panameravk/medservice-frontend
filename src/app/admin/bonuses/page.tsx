"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { AdminSwitch } from "../../components/admin/AdminSwitch";
import { LogoUploader } from "../../components/LogoUploader";
import {
  adminCategoriesApi,
  adminPartnerBonusesApi,
  type AdminBonusCategory,
  type AdminPartnerBonus,
} from "../../lib/admin/bonuses";

const inputCls =
  "h-[46px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const textareaCls =
  "min-h-[96px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 py-3 text-[14px] text-[#222222] outline-none focus:border-[#F4C21A] transition";
const labelCls = "mb-2 block text-[13px] font-medium text-[#222222]";
const yellowBtn =
  "rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50";
const saveBtnCls = `mt-2 h-[48px] w-full ${yellowBtn}`;

const DISCOUNT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

// Partner table column template (mockup: Опубл | Компания | Город | Скидка | Описание | Дата начала | Дата окончания | actions)
const COLS = "grid-cols-[60px_1.5fr_1fr_64px_2fr_0.9fr_0.9fr_72px]";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AdminBonusesPage() {
  const [categories, setCategories] = useState<AdminBonusCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setCategories(await adminCategoriesApi.getAll());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async load on mount
    void reload();
  }, [reload]);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-bold leading-[32px] text-black">Бонусы</h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
          Список всех категорий и бонусов
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <PartnersTab categories={categories} run={run} />
    </div>
  );
}

// ─── Partners & categories (mockup layout) ───────────────────────────────────

function PartnersTab({
  categories,
  run,
}: {
  categories: AdminBonusCategory[];
  run: (action: () => Promise<unknown>) => Promise<void>;
}) {
  const [creatingCat, setCreatingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState<AdminBonusCategory | null>(null);
  const [creatingBonusCat, setCreatingBonusCat] = useState<AdminBonusCategory | null>(null);
  const [editingBonus, setEditingBonus] = useState<AdminPartnerBonus | null>(null);
  const [deletingBonus, setDeletingBonus] = useState<AdminPartnerBonus | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCreatingCat(true)}
          className={`flex h-[44px] items-center gap-2 px-4 ${yellowBtn}`}
        >
          <Plus size={16} /> Добавить категорию
        </button>
      </div>

      <AdminShellCard>
        {/* column header */}
        <div
          className={`grid ${COLS} items-center gap-3 border-b border-[#E6E6E6] pb-3 text-[13px] font-medium text-[#222222]`}
        >
          <div>Опубл.</div>
          <div>Компания</div>
          <div>Город</div>
          <div>Скидка</div>
          <div>Описание</div>
          <div>Дата начала</div>
          <div>Дата окончания</div>
          <div />
        </div>

        {categories.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[#A3A3A3]">Категорий пока нет</p>
        )}

        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-2 pb-2 pt-4">
              <span className="text-[17px] font-bold text-[#111827]">{cat.name}</span>
              {!cat.isPublished && (
                <span className="rounded-[6px] bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#6B7280]">
                  скрыта
                </span>
              )}
              <IconBtn label="Удалить категорию" danger onClick={() => setDeletingCat(cat)}>
                <Trash2 size={16} strokeWidth={1.8} />
              </IconBtn>
            </div>

            {cat.bonuses.map((b) => (
              <div
                key={b.id}
                className={`grid ${COLS} items-center gap-3 border-t border-[#F1F1F1] py-3 text-[14px] text-[#3A3A46]`}
              >
                <AdminSwitch
                  checked={b.isPublished}
                  onChange={() =>
                    run(() =>
                      adminPartnerBonusesApi.update(b.id, { isPublished: !b.isPublished })
                    )
                  }
                />
                <div className="flex items-center gap-2 truncate pr-2">
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.logoUrl}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-[6px] bg-[#F3F4F6] object-contain"
                    />
                  ) : null}
                  <span className="truncate font-medium text-[#111827]">{b.companyName}</span>
                </div>
                <div className="truncate pr-2 text-[#6E6E73]">{b.city || "—"}</div>
                <div className="font-semibold">{b.discountPercent}%</div>
                <div className="truncate pr-2">{b.description}</div>
                <div>{fmtDate(b.startDate)}</div>
                <div>{fmtDate(b.endDate)}</div>
                <RowActions
                  onEdit={() => setEditingBonus(b)}
                  onDelete={() => setDeletingBonus(b)}
                />
              </div>
            ))}

            <div className="border-t border-[#F1F1F1] py-3">
              <button
                type="button"
                onClick={() => setCreatingBonusCat(cat)}
                className={`flex h-[38px] items-center gap-2 px-4 ${yellowBtn}`}
              >
                <Plus size={15} /> Добавить бонус
              </button>
            </div>
          </div>
        ))}
      </AdminShellCard>

      {creatingCat && (
        <CategoryModal
          title="Добавить категорию"
          submitLabel="Добавить"
          onClose={() => setCreatingCat(false)}
          onSave={(payload) =>
            run(() => adminCategoriesApi.create(payload)).then(() => setCreatingCat(false))
          }
        />
      )}
      {deletingCat && (
        <DeleteConfirm
          title="Удалить категорию?"
          message={`Категория «${deletingCat.name}» и все её бонусы (${deletingCat.bonuses.length}) будут удалены.`}
          onClose={() => setDeletingCat(null)}
          onConfirm={() =>
            run(() => adminCategoriesApi.delete(deletingCat.id)).then(() => setDeletingCat(null))
          }
        />
      )}
      {creatingBonusCat && (
        <PartnerBonusModal
          title="Добавить бонус"
          submitLabel="Добавить"
          categoryId={creatingBonusCat.id}
          categories={categories}
          onClose={() => setCreatingBonusCat(null)}
          onSave={(payload) =>
            run(() => adminPartnerBonusesApi.create(payload)).then(() =>
              setCreatingBonusCat(null)
            )
          }
        />
      )}
      {editingBonus && (
        <PartnerBonusModal
          title="Редактировать бонус"
          submitLabel="Сохранить"
          categoryId={editingBonus.categoryId}
          categories={categories}
          initial={editingBonus}
          onClose={() => setEditingBonus(null)}
          onSave={(payload) =>
            run(() => adminPartnerBonusesApi.update(editingBonus.id, payload)).then(() =>
              setEditingBonus(null)
            )
          }
        />
      )}
      {deletingBonus && (
        <DeleteConfirm
          title="Удалить бонус?"
          message={`Бонус «${deletingBonus.companyName}» будет удалён.`}
          onClose={() => setDeletingBonus(null)}
          onConfirm={() =>
            run(() => adminPartnerBonusesApi.delete(deletingBonus.id)).then(() =>
              setDeletingBonus(null)
            )
          }
        />
      )}
    </div>
  );
}

function CategoryModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  initial?: AdminBonusCategory;
  onClose: () => void;
  onSave: (payload: { name: string; sortOrder: number; isPublished: boolean }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[440px]" title={title}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Название категории</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например, Аптеки"
            className={inputCls}
          />
        </div>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() =>
            onSave({
              name: name.trim(),
              sortOrder: initial?.sortOrder ?? 0,
              isPublished: initial?.isPublished ?? true,
            })
          }
          className={saveBtnCls}
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}

function PartnerBonusModal({
  title,
  submitLabel,
  categoryId,
  categories,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  categoryId: number;
  categories: AdminBonusCategory[];
  initial?: AdminPartnerBonus;
  onClose: () => void;
  onSave: (payload: {
    categoryId: number;
    companyName: string;
    city: string;
    discountPercent: number;
    description: string;
    startDate: string | null;
    endDate: string | null;
    promoCode: string | null;
    websiteUrl: string | null;
    logoUrl: string | null;
    isPublished: boolean;
    sortOrder: number;
  }) => void;
}) {
  const [catId, setCatId] = useState(categoryId);
  const [company, setCompany] = useState(initial?.companyName ?? "");
  const [logo, setLogo] = useState<string | null>(initial?.logoUrl ?? null);
  const [city, setCity] = useState(initial?.city ?? "");
  const [discount, setDiscount] = useState(initial?.discountPercent ?? 20);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [promo, setPromo] = useState(initial?.promoCode ?? "");
  const [website, setWebsite] = useState(initial?.websiteUrl ?? "");
  const [published, setPublished] = useState(initial?.isPublished ?? true);

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[460px]" title={title}>
      <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <label className={labelCls}>Название компании</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Логотип (размер: 40×40 px, формат: .png)</label>
          <LogoUploader value={logo} onChange={setLogo} />
        </div>

        <div>
          <label className={labelCls}>Категория</label>
          <select
            value={catId}
            onChange={(e) => setCatId(Number(e.target.value))}
            className={selectCls}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Город</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Размер скидки (%)</label>
            <select
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className={selectCls}
            >
              {DISCOUNT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Дата начала</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Дата окончания</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Промокод</label>
            <input value={promo} onChange={(e) => setPromo(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Сайт</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
        </div>

        <PublishedRow value={published} onChange={setPublished} />

        <button
          type="button"
          disabled={!company.trim()}
          onClick={() =>
            onSave({
              categoryId: catId,
              companyName: company.trim(),
              city: city.trim(),
              discountPercent: discount,
              description: description.trim(),
              startDate: startDate || null,
              endDate: endDate || null,
              promoCode: promo.trim() || null,
              websiteUrl: website.trim() || null,
              logoUrl: logo,
              isPublished: published,
              sortOrder: initial?.sortOrder ?? 0,
            })
          }
          className={saveBtnCls}
        >
          {submitLabel}
        </button>
      </div>
    </AdminModal>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

function PublishedRow({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[#F9FAFB] px-4 py-3">
      <span className="text-[14px] text-[#222222]">Опубликовано (видно пациенту)</span>
      <AdminSwitch checked={value} onChange={onChange} />
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconBtn label="Редактировать" onClick={onEdit}>
        <Pencil size={16} strokeWidth={1.8} />
      </IconBtn>
      <IconBtn label="Удалить" danger onClick={onDelete}>
        <Trash2 size={16} strokeWidth={1.8} />
      </IconBtn>
    </div>
  );
}

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
        danger ? "hover:bg-[#FEE2E2] hover:text-[#DC2626]" : "hover:bg-[#F3F4F6] hover:text-[#111827]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DeleteConfirm({
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
    <AdminModal onClose={onClose} widthClassName="max-w-[460px]" title={title}>
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
