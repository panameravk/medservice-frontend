"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AdminModal } from "../../components/admin/AdminModal";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { adminFaqApi } from "../../lib/admin/faq";
import type { FaqItem, FaqItemInput } from "../../types/faq";

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState<FaqItem | null>(null);

  const refresh = async () => {
    try {
      const data = await adminFaqApi.list();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load on mount; matches existing project pattern
    void refresh();
  }, []);

  const onCreate = async (payload: FaqItemInput) => {
    try {
      await adminFaqApi.create(payload);
      setCreateOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onUpdate = async (id: number, payload: Partial<FaqItemInput>) => {
    try {
      await adminFaqApi.update(id, payload);
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    }
  };

  const onDelete = async (id: number) => {
    try {
      await adminFaqApi.delete(id);
      setDeleting(null);
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
            Вопрос/Ответ
          </h1>
          <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
            Раздел FAQ на странице бонусов
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-[44px] rounded-[10px] bg-[#F4C21A] px-4 text-[14px] font-semibold text-[#111827] transition hover:brightness-95"
        >
          Добавить вопрос
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </div>
      )}

      <AdminShellCard>
        {items.length === 0 && (
          <p className="py-8 text-center text-[14px] text-[#A3A3A3]">
            Записей нет. Добавьте первую — кнопка справа сверху.
          </p>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-[60px_1fr_2fr_80px] items-center pb-3 text-[13px] font-medium text-[#222222]">
            <div>Порядок</div>
            <div>Вопрос</div>
            <div>Ответ</div>
            <div />
          </div>
        )}

        <div className="divide-y divide-[#ECECEC]">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[60px_1fr_2fr_80px] items-center py-3 text-[14px] text-[#3A3A46]"
            >
              <div>{item.sortOrder}</div>
              <div className="truncate pr-3">{item.question}</div>
              <div className="truncate pr-3 text-[#6E6E73]">{item.answer}</div>
              <div className="flex justify-end gap-1 text-[#6E6E73]">
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  aria-label="Редактировать"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#F3F4F6] hover:text-[#111827]"
                >
                  <Pencil size={16} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(item)}
                  aria-label="Удалить"
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                >
                  <Trash2 size={16} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminShellCard>

      {createOpen && (
        <FaqModal
          title="Добавить вопрос"
          submitLabel="Добавить"
          onClose={() => setCreateOpen(false)}
          onSave={onCreate}
        />
      )}

      {editing && (
        <FaqModal
          title="Редактировать вопрос"
          submitLabel="Сохранить"
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(payload) => onUpdate(editing.id, payload)}
        />
      )}

      {deleting && (
        <AdminModal
          onClose={() => setDeleting(null)}
          widthClassName="max-w-[440px]"
          title="Удалить вопрос?"
        >
          <div className="space-y-4">
            <p className="text-[14px] text-[#3A3A46]">
              «{deleting.question}» будет удалён.
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

function FaqModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  initial?: FaqItem;
  onClose: () => void;
  onSave: (payload: FaqItemInput) => void;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [sortOrder, setSortOrder] = useState<number>(initial?.sortOrder ?? 0);

  const canSave = question.trim().length > 0 && answer.trim().length > 0;

  const inputCls =
    "h-[46px] w-full rounded-[10px] bg-[#F3F4F6] px-4 text-[14px] outline-none";

  return (
    <AdminModal onClose={onClose} widthClassName="max-w-[460px]" title={title}>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Вопрос
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Ответ
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            className="w-full rounded-[10px] bg-[#F3F4F6] px-3 py-2 text-[14px] outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#222222]">
            Порядок
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="h-[46px] w-[120px] rounded-[10px] bg-[#F3F4F6] px-3 text-[14px] outline-none"
          />
        </div>
        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            onSave({
              question: question.trim(),
              answer: answer.trim(),
              sortOrder,
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
