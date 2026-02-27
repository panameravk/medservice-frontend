"use client";

import { useEffect, useState } from "react";
import { useBranchesStore } from "../../../lib/branchesStore";

// Вспомогательная функция для уникальных email в нижнем регистре
function uniqLower(arr: string[]): string[] {
  return Array.from(new Set(arr.map((e) => e.trim().toLowerCase())));
}

export default function NotificationsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);
  const localKey = `notifications_${selectedBranchId}`;

  const [complaintEmails, setComplaintEmails] = useState<string[]>([]);
  const [reminderEmails, setReminderEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Загрузка данных из localStorage
  useEffect(() => {
    if (!selectedBranchId) {
      setLoading(false);
      return;
    }

    try {
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          complaintEmails?: string[];
          reminderEmails?: string[];
        };
        setComplaintEmails(uniqLower(parsed.complaintEmails ?? []));
        setReminderEmails(uniqLower(parsed.reminderEmails ?? []));
      } else {
        // Данные по умолчанию
        setComplaintEmails(["info@happylook.ru", "faq@happylook.ru"]);
        setReminderEmails(["info@happylook.ru", "faq@happylook.ru"]);
      }
    } catch {
      // игнорируем ошибки
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId, localKey]);

  // Добавление email
  const addComplaintEmail = () => {
    const email = prompt("Введите email для жалоб:");
    if (email && email.includes("@")) {
      setComplaintEmails((prev) => uniqLower([...prev, email]));
    } else if (email) {
      alert("Неверный формат почты");
    }
  };

  const addReminderEmail = () => {
    const email = prompt("Введите email для напоминаний:");
    if (email && email.includes("@")) {
      setReminderEmails((prev) => uniqLower([...prev, email]));
    } else if (email) {
      alert("Неверный формат почты");
    }
  };

  // Удаление email
  const removeComplaintEmail = (emailToRemove: string) => {
    setComplaintEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  const removeReminderEmail = (emailToRemove: string) => {
    setReminderEmails((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // Сохранение
  const saveAll = () => {
    if (!selectedBranchId) return;

    setSaving(true);

    const payload = {
      complaintEmails: uniqLower(complaintEmails),
      reminderEmails: uniqLower(reminderEmails),
    };

    // Сохраняем в localStorage
    localStorage.setItem(localKey, JSON.stringify(payload));

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
  };

  if (!selectedBranchId) {
    return (
      <div className="p-6">
        <p className="text-[#9CA3AF]">Выберите филиал</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки уведомлений</h1>

      <div className="max-w-2xl space-y-8">
        {/* Жалобы */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Email для перехваченных жалоб
          </h2>
          <div className="space-y-2 mb-3">
            {complaintEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{email}</span>
                <button
                  onClick={() => removeComplaintEmail(email)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addComplaintEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Добавить
          </button>
        </div>

        {/* Напоминания */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Email для напоминания об отправке запросов
          </h2>
          <div className="space-y-2 mb-3">
            {reminderEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{email}</span>
                <button
                  onClick={() => removeReminderEmail(email)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addReminderEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Добавить
          </button>
        </div>

        {/* Успех */}
        {success && <p className="text-green-500">Настройки сохранены</p>}

        {/* Кнопка сохранения */}
        <button
          onClick={saveAll}
          disabled={saving || loading}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
