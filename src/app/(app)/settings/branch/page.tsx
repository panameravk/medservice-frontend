"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError, updateBranch } from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

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

type SelectOption = {
  label: string;
  value: string;
};

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

function CustomSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((item) => item.value === value) ?? options[0];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex h-[48px] w-full items-center justify-between rounded-[10px]",
          "border border-transparent bg-[#F3F4F6] px-4 text-left text-[14px] text-[#222222]",
          "outline-none transition hover:bg-[#ECEEF1]",
          open ? "border-[#D8D8D8]" : "focus:border-[#D8D8D8]",
        ].join(" ")}
      >
        <span className="truncate">{selected?.label ?? "Выберите"}</span>
        <ChevronDown
          className={[
            "shrink-0 text-[#5F6368] transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          className={[
            "absolute left-0 top-[54px] z-50 w-full overflow-hidden rounded-[12px]",
            "border border-[#E5E7EB] bg-white p-1.5",
            "shadow-[0_16px_36px_rgba(17,24,39,0.16)]",
          ].join(" ")}
        >
          <div className="max-h-[240px] overflow-y-auto">
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={[
                    "flex min-h-[40px] w-full items-center rounded-[10px] px-3 text-left text-[14px] transition",
                    active
                      ? "bg-[#F3F4F6] font-medium text-[#222222]"
                      : "text-[#444444] hover:bg-[#F8F8F8]",
                  ].join(" ")}
                >
                  <span className="pr-2">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
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

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
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
