"use client";

import { useState } from "react";
import { ApiError, updateBranch } from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";
import { CustomSelect } from "../../../components/CustomSelect";

const TIMEZONES = [
  { label: "Московское время - UTC +3", value: "Europe/Moscow" },
  { label: "Калининградское время - UTC +2", value: "Europe/Kaliningrad" },
  { label: "Самарское время - UTC +4", value: "Europe/Samara" },
  { label: "Екатеринбургское время - UTC +5", value: "Asia/Yekaterinburg" },
  { label: "Новосибирское время - UTC +7", value: "Asia/Novosibirsk" },
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
    s.branches.find((branch) => branch.id === s.selectedBranchId)
  );

  if (!selectedBranch) {
    return <p className="text-[14px] text-[#9CA3AF]">Выберите филиал</p>;
  }

  return (
    <BranchSettingsForm key={selectedBranch.id} branchId={selectedBranch.id} />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[13px] font-medium leading-[18px] text-[#222222]">
      {children}
    </label>
  );
}

function InputBase({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "h-[48px] w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] text-[#222222] outline-none transition",
        "focus:border-[#D8D8D8]",
        className,
      ].join(" ")}
    />
  );
}

function BranchSettingsForm({ branchId }: { branchId: string }) {
  const selectedBranch = useBranchesStore((s) =>
    s.branches.find((branch) => branch.id === branchId)
  );
  const updateBranchInStore = useBranchesStore((s) => s.updateBranchInStore);

  const [name, setName] = useState(selectedBranch?.name ?? "");
  const [city, setCity] = useState(selectedBranch?.city ?? "");
  const [timezone, setTimezone] = useState(
    selectedBranch?.timezone ?? "Europe/Moscow"
  );
  const [specialty, setSpecialty] = useState(
    selectedBranch?.specialization ?? "Офтальмология"
  );
  const [cooldown, setCooldown] = useState(
    selectedBranch?.requestFrequencyDays ?? 14
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const specialtyOptions = SPECIALTIES.map((item) => ({
    label: item,
    value: item,
  }));

  const handleSave = async () => {
    if (!selectedBranch?.id) return;

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const updated = await updateBranch(selectedBranch.id, {
        name: name.trim(),
        city: city.trim() || null,
        timezone,
        specialization: specialty,
        requestFrequencyDays: cooldown,
      });

      updateBranchInStore(updated);
      setSaved(true);

      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      if (error instanceof ApiError) {
        setSaveError(error.message);
      } else if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Не удалось сохранить настройки филиала");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[500px] rounded-[14px] bg-white">
      <div className="max-w-[310px] space-y-4">
        <div>
          <FieldLabel>Название филиала</FieldLabel>
          <InputBase value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <FieldLabel>Город</FieldLabel>
          <InputBase value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        <div>
          <FieldLabel>Часовой пояс</FieldLabel>
          <CustomSelect
            value={timezone}
            options={TIMEZONES}
            onChange={setTimezone}
          />
        </div>

        <div>
          <FieldLabel>Направление деятельности</FieldLabel>
          <CustomSelect
            value={specialty}
            options={specialtyOptions}
            onChange={setSpecialty}
          />
        </div>

        <div>
          <FieldLabel>
            Отправлять запрос на один номер не чаще (дней)
          </FieldLabel>
          <div className="flex gap-2">
            {COOLDOWN_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setCooldown(days)}
                className={[
                  "h-11 w-16 rounded-[10px] border text-[14px] transition",
                  cooldown === days
                    ? "border-[#111827] bg-[#111827] font-semibold text-white"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6]",
                ].join(" ")}
              >
                {days}
              </button>
            ))}
          </div>
        </div>

        {saveError && <p className="text-[13px] text-red-500">{saveError}</p>}

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || !name.trim()}
          className="mt-2 h-[46px] w-[280px] rounded-[10px] bg-[#F4C21A] text-[15px] font-medium text-[#111827] transition hover:bg-yellow-300 disabled:opacity-60"
        >
          {saving ? "Сохранение..." : saved ? "Сохранено ✓" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
