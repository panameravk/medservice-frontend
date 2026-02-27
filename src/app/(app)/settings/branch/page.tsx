"use client";

import { useState, useEffect } from "react";
import { useBranchesStore } from "../../../lib/branchesStore";

const CITIES = [
  "Санкт-Петербург",
  "Москва",
  "Екатеринбург",
  "Новосибирск",
  "Казань",
];

const TIMEZONES = [
  { label: "Московское время - UTC +3", value: "Europe/Moscow" },
  { label: "Калининград - UTC +2", value: "Europe/Kaliningrad" },
  { label: "Самара - UTC +4", value: "Europe/Samara" },
  { label: "Екатеринбург - UTC +5", value: "Asia/Yekaterinburg" },
  { label: "Новосибирск - UTC +7", value: "Asia/Novosibirsk" },
];

const SPECIALTIES = [
  "Офтальмология",
  "Стоматология",
  "Терапия",
  "Хирургия",
  "Педиатрия",
  "Неврология",
  "Косметология",
];

const COOLDOWN_OPTIONS = [14, 30, 60, 90];

export default function SettingsBranchPage() {
  const selectedBranch = useBranchesStore((s) =>
    s.branches.find((b) => b.id === s.selectedBranchId)
  );

  const [name, setName] = useState(selectedBranch?.name ?? "");
  const [city, setCity] = useState(CITIES[0]);
  const [timezone, setTimezone] = useState(TIMEZONES[0].value);
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [cooldown, setCooldown] = useState(14);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Обновляем имя если сменился филиал
  useEffect(() => {
    if (selectedBranch) setName(selectedBranch.name);
  }, [selectedBranch]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: подключить PATCH /api/v1/branches/{id} когда появится в бэкенде
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-[520px] space-y-6">
      {/* Название филиала */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#111827]">
          Название филиала
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none focus:border-[#111827] transition"
        />
      </div>

      {/* Город */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#111827]">Город</label>
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none focus:border-[#111827] transition cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        </div>
      </div>

      {/* Часовой пояс */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#111827]">
          Часовой пояс
        </label>
        <div className="relative">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none focus:border-[#111827] transition cursor-pointer"
          >
            {TIMEZONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        </div>
      </div>

      {/* Направление деятельности */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#111827]">
          Направление деятельности
        </label>
        <div className="relative">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="h-11 w-full appearance-none rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] outline-none focus:border-[#111827] transition cursor-pointer"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        </div>
      </div>

      {/* Cooldown */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-[#111827]">
          Отправлять запрос на один номер не чаще (дней)
        </label>
        <div className="flex gap-2">
          {COOLDOWN_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setCooldown(d)}
              className={[
                "h-11 w-16 rounded-[10px] border text-[14px] transition",
                cooldown === d
                  ? "border-[#111827] bg-[#111827] font-semibold text-white"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6]",
              ].join(" ")}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="h-11 w-[280px] rounded-[10px] bg-[#F4C21A] text-[14px] font-semibold text-[#111827] hover:bg-yellow-300 active:brightness-90 disabled:opacity-60 transition"
      >
        {saving ? "Сохранение..." : saved ? "Сохранено ✓" : "Сохранить"}
      </button>
    </div>
  );
}

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
