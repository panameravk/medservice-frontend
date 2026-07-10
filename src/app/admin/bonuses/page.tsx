"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Plus, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
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

// Partner table column widths are handled via flex (see header and row)

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

      <PartnersTab categories={categories} setCategories={setCategories} run={run} reload={reload} />
    </div>
  );
}

// ─── Partners & categories ───────────────────────────────────────────────────

function PartnersTab({
  categories,
  setCategories,
  run,
  reload,
}: {
  categories: AdminBonusCategory[];
  setCategories: React.Dispatch<React.SetStateAction<AdminBonusCategory[]>>;
  run: (action: () => Promise<unknown>) => Promise<void>;
  reload: () => Promise<void>;
}) {
  const [creatingCat, setCreatingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState<AdminBonusCategory | null>(null);
  const [creatingBonusCat, setCreatingBonusCat] = useState<AdminBonusCategory | null>(null);
  const [editingBonus, setEditingBonus] = useState<AdminPartnerBonus | null>(null);
  const [deletingBonus, setDeletingBonus] = useState<AdminPartnerBonus | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "category") {
      if (source.index === destination.index) return;

      const newCategories = Array.from(categories);
      const [moved] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, moved);

      newCategories.forEach((cat, idx) => {
        cat.sortOrder = idx;
      });

      setCategories(newCategories);

      try {
        await Promise.all(
          newCategories.map((c) => adminCategoriesApi.update(c.id, { sortOrder: c.sortOrder }))
        );
      } catch (e) {
        void reload();
      }
      return;
    }

    if (type === "bonus") {
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
      }

      const sourceCatIndex = categories.findIndex((c) => c.id.toString() === source.droppableId);
      const destCatIndex = categories.findIndex((c) => c.id.toString() === destination.droppableId);

      if (sourceCatIndex === -1 || destCatIndex === -1) return;

      const newCategories = [...categories];
      const sourceCat = { ...newCategories[sourceCatIndex], bonuses: [...newCategories[sourceCatIndex].bonuses] };
      const destCat = sourceCatIndex === destCatIndex ? sourceCat : { ...newCategories[destCatIndex], bonuses: [...newCategories[destCatIndex].bonuses] };

      const [movedBonus] = sourceCat.bonuses.splice(source.index, 1);
      destCat.bonuses.splice(destination.index, 0, movedBonus);

      newCategories[sourceCatIndex] = sourceCat;
      newCategories[destCatIndex] = destCat;

      destCat.bonuses.forEach((b, idx) => {
        b.sortOrder = idx;
      });
      if (sourceCatIndex !== destCatIndex) {
        sourceCat.bonuses.forEach((b, idx) => {
          b.sortOrder = idx;
        });
      }

      setCategories(newCategories);

      try {
        const promises = destCat.bonuses.map((b) =>
          adminPartnerBonusesApi.update(b.id, { sortOrder: b.sortOrder, categoryId: destCat.id })
        );
        if (sourceCatIndex !== destCatIndex) {
          promises.push(
            ...sourceCat.bonuses.map((b) => adminPartnerBonusesApi.update(b.id, { sortOrder: b.sortOrder }))
          );
        }
        await Promise.all(promises);
      } catch (e) {
        void reload();
      }
    }
  };

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
        <div
          className="flex items-center gap-3 border-b border-[#E6E6E6] pb-3 text-[13px] font-medium text-[#222222]"
        >
          <div className="w-[32px]" />
          <div className="w-[60px]">Опубл.</div>
          <div className="w-[22%]">Компания</div>
          <div className="w-[15%]">Город</div>
          <div className="w-[64px]">Скидка</div>
          <div className="flex-1">Описание</div>
          <div className="w-[12%]">Дата начала</div>
          <div className="w-[12%]">Дата окончания</div>
          <div className="w-[72px]" />
        </div>

        {categories.length === 0 && (
          <p className="py-10 text-center text-[14px] text-[#A3A3A3]">Категорий пока нет</p>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="categories-board" type="category">
            {(provided) => (
              <div ref={(el) => { provided.innerRef(el); containerRef.current = el; }} {...provided.droppableProps}>
                {categories.map((cat, catIndex) => (
                  <Draggable key={`cat-${cat.id}`} draggableId={`cat-${cat.id}`} index={catIndex}>
                    {(catProvided, catSnapshot) => {
                      const catEl = (
                        <div
                          ref={catProvided.innerRef}
                          {...catProvided.draggableProps}
                          style={catProvided.draggableProps.style}
                          className={`bg-white ${catSnapshot.isDragging ? "shadow-lg rounded-xl px-5 py-2" : ""}`}
                        >
                          <div className="flex items-center gap-2 pb-2 pt-4">
                            <div
                              {...catProvided.dragHandleProps}
                              className="cursor-grab text-[#A3A3A3] hover:text-black"
                            >
                              <GripVertical size={18} />
                            </div>
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

                          <Droppable droppableId={cat.id.toString()} type="bonus">
                            {(bonusProvided) => (
                              <div ref={bonusProvided.innerRef} {...bonusProvided.droppableProps} className="min-h-[10px]">
                                {cat.bonuses.map((b, bIndex) => (
                                  <BonusRow
                                    key={b.id}
                                    bonus={b}
                                    index={bIndex}
                                    containerRef={containerRef}
                                    run={run}
                                    onEdit={() => setEditingBonus(b)}
                                    onDelete={() => setDeletingBonus(b)}
                                  />
                                ))}
                                {bonusProvided.placeholder}
                              </div>
                            )}
                          </Droppable>

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
                      );
                      if (catSnapshot.isDragging) {
                        return createPortal(catEl, document.body);
                      }
                      return catEl;
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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

// ─── BonusRow (portal-aware draggable) ───────────────────────────────────────

function BonusRow({
  bonus: b,
  index,
  containerRef,
  run,
  onEdit,
  onDelete,
}: {
  bonus: AdminPartnerBonus;
  index: number;
  containerRef: React.RefObject<HTMLElement | null>;
  run: (action: () => Promise<unknown>) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Draggable draggableId={`bonus-${b.id}`} index={index}>
      {(bp, snapshot) => {
        const containerWidth = containerRef.current?.getBoundingClientRect().width;
        const rowEl = (
          <div
            ref={bp.innerRef}
            {...bp.draggableProps}
            style={{
              ...bp.draggableProps.style,
              ...(snapshot.isDragging && containerWidth ? { width: containerWidth } : {}),
            }}
            className={`flex items-center gap-3 border-t border-[#F1F1F1] py-3 text-[14px] text-[#3A3A46] ${
              snapshot.isDragging ? "rounded-lg bg-white shadow-md" : "bg-white"
            }`}
          >
            <div
              {...bp.dragHandleProps}
              className="w-[32px] shrink-0 flex items-center justify-center cursor-grab text-[#D4D4D4] hover:text-[#6E6E73]"
            >
              <GripVertical size={16} />
            </div>
            <div className="w-[60px] shrink-0">
              <AdminSwitch
                checked={b.isPublished}
                onChange={() =>
                  run(() =>
                    adminPartnerBonusesApi.update(b.id, { isPublished: !b.isPublished })
                  )
                }
              />
            </div>
            <div className="w-[22%] shrink-0 flex items-center gap-2 truncate pr-2">
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
            <div className="w-[15%] shrink-0 truncate pr-2 text-[#6E6E73]">{b.city || "—"}</div>
            <div className="w-[64px] shrink-0 font-semibold">{b.discountPercent}%</div>
            <div className="flex-1 min-w-0 truncate pr-2">{b.description}</div>
            <div className="w-[12%] shrink-0">{fmtDate(b.startDate)}</div>
            <div className="w-[12%] shrink-0">{fmtDate(b.endDate)}</div>
            <div className="w-[72px] shrink-0">
              <RowActions onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        );

        if (snapshot.isDragging) {
          return createPortal(rowEl, document.body);
        }
        return rowEl;
      }}
    </Draggable>
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
