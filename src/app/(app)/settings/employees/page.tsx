"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Switch } from "../../../components/ui/Switch";
import { ApiError, employeesApi, type Employee } from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <polyline
        points="3 6 5 6 21 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EmployeesPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const modalTitle = useMemo(
    () => (editing ? "Редактировать сотрудника" : "Добавить сотрудника"),
    [editing]
  );

  useEffect(() => {
    if (!selectedBranchId) {
      return;
    }

    let cancelled = false;

    const loadEmployees = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await employeesApi.getAll(selectedBranchId);

        if (cancelled) return;
        setItems(response);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Не удалось загрузить сотрудников");
        }

        setItems([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId]);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setIsOpen(true);
  };

  const remove = async (id: number) => {
    setError(null);

    if (typeof window !== "undefined") {
      const target = items.find((item) => item.id === id);
      const name = target?.name ? `«${target.name}»` : "этого сотрудника";
      const confirmed = window.confirm(`Удалить ${name}? Действие необратимо.`);
      if (!confirmed) return;
    }

    try {
      await employeesApi.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Не удалось удалить сотрудника");
      }
    }
  };

  const toggleRequests = async (id: number) => {
    const current = items.find((item) => item.id === id);
    if (!current) return;

    setError(null);

    try {
      const updated = await employeesApi.update(id, {
        active: !current.active,
      });

      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Не удалось обновить статус сотрудника");
      }
    }
  };

  const save = async (payload: {
    id?: number;
    name: string;
    active: boolean;
    profiles: string[];
    profilePlatforms: string[];
  }) => {
    if (!selectedBranchId) return;

    setError(null);

    try {
      if (payload.id) {
        const updated = await employeesApi.update(payload.id, {
          name: payload.name,
          active: payload.active,
          profiles: payload.profiles,
          profilePlatforms: payload.profilePlatforms,
        });

        setItems((prev) =>
          prev.map((item) => (item.id === payload.id ? updated : item))
        );
      } else {
        const created = await employeesApi.create(selectedBranchId, {
          name: payload.name,
          active: payload.active,
          profiles: payload.profiles,
          profilePlatforms: payload.profilePlatforms,
        });

        setItems((prev) => [created, ...prev]);
      }

      setIsOpen(false);
      setEditing(null);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Не удалось сохранить сотрудника");
      }
    }
  };

  if (!selectedBranchId) {
    return <p className="text-[#9CA3AF]">Выберите филиал</p>;
  }

  return (
    <div className="min-h-[470px]">
      {error && (
        <div className="mb-4 max-w-[560px] rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      )}

      <div className="max-w-[560px] overflow-x-auto">
        <table className="w-full table-fixed border-collapse bg-white">
          <thead>
            <tr className="text-left text-[14px] font-medium text-[#111827]">
              <th className="w-[96px] pb-3 font-medium">Запросы</th>
              <th className="w-[285px] pb-3 font-medium">ФИО</th>
              <th className="w-[110px] pb-3 font-medium">Профили</th>
              <th className="w-[69px] pb-3" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-3 text-sm text-[#9CA3AF]" colSpan={4}>
                  Загрузка...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-3 text-sm text-[#9CA3AF]" colSpan={4}>
                  Сотрудников пока нет
                </td>
              </tr>
            ) : (
              items.map((employee) => (
                <tr key={employee.id}>
                  <td className="h-[36px] py-1 align-middle">
                    <label className="inline-flex origin-left scale-[0.8] items-center">
                      <Switch
                        checked={employee.active}
                        onChange={() => {
                          void toggleRequests(employee.id);
                        }}
                      />
                    </label>
                  </td>

                  <td className="h-[36px] truncate py-1 pr-4 align-middle text-[14px] text-[#2F2F2F]">
                    {employee.name}
                  </td>

                  <td className="h-[36px] py-1 align-middle">
                    {employee.profiles.length === 0 ? (
                      <span className="text-[13px] text-[#9CA3AF]">—</span>
                    ) : (
                      <EmployeeProfileIcons employee={employee} />
                    )}
                  </td>

                  <td className="h-[36px] py-1 align-middle">
                    <div className="flex items-center justify-start gap-2 text-[#929292]">
                      <button
                        type="button"
                        onClick={() => openEdit(employee)}
                        className="flex h-6 w-6 items-center justify-center transition hover:text-[#222222]"
                        title="Редактировать"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void remove(employee.id);
                        }}
                        className="flex h-6 w-6 items-center justify-center transition hover:text-red-500"
                        title="Удалить"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={openCreate}
        className="mt-8 h-10 rounded-[10px] bg-[#FFC51B] px-5 text-[13px] font-semibold text-[#111827] hover:bg-[#FFD044] active:brightness-90"
      >
        Добавить сотрудника
      </button>

      {isOpen && (
        <EmployeeModal
          title={modalTitle}
          initial={editing}
          onClose={() => {
            setIsOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

const PLATFORMS = [
  {
    id: "yandex_maps",
    name: "Яндекс Карты",
    icon: "/Icons/platforms/yandex-maps-logo.svg",
  },
  {
    id: "google_maps",
    name: "Google Maps",
    icon: "/Icons/platforms/google-maps-sign-logo.svg",
  },
  {
    id: "2gis",
    name: "2ГИС",
    icon: "/Icons/platforms/2gis-icon-logo.svg",
  },
  {
    id: "prodoctorov",
    name: "ПроДокторов",
    icon: "/Icons/platforms/prodoktorov.svg",
  },
  {
    id: "napopravku",
    name: "НаПоправку",
    icon: "/Icons/platforms/napopravku.svg",
  },
  {
    id: "other",
    name: "Другая ссылка",
    icon: "/Icons/platforms/link.svg",
  },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];
const PLATFORM_IDS = new Set<string>(PLATFORMS.map((platform) => platform.id));

function toPlatformId(value: string | undefined): PlatformId {
  return value && PLATFORM_IDS.has(value) ? (value as PlatformId) : "other";
}

function PlatformIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-[5px]">
      <Image
        src={src}
        alt={alt}
        width={22}
        height={22}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

function EmployeeProfileIcons({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-1.5">
      {employee.profiles.map((url, index) => {
        const platform =
          PLATFORMS.find(
            (item) => item.id === employee.profilePlatforms[index]
          ) ?? PLATFORMS[PLATFORMS.length - 1];

        return (
          <a
            key={`${employee.id}-${index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            title={platform.name}
            aria-label={`${platform.name}: ${url}`}
            className="flex h-5 w-5 items-center justify-center rounded-[4px] transition hover:bg-[#F3F4F6]"
          >
            <Image
              src={platform.icon}
              alt=""
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
            />
          </a>
        );
      })}
    </div>
  );
}

function PlatformDropdown({
  value,
  onChange,
}: {
  value: PlatformId;
  onChange: (value: PlatformId) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected =
    PLATFORMS.find((platform) => platform.id === value) ??
    PLATFORMS[PLATFORMS.length - 1];

  return (
    <div className="relative h-full shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-full w-[70px] items-center justify-center gap-2 rounded-l-[8px] text-[#4B5563] transition hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
        aria-label={`Площадка: ${selected.name}`}
      >
        <PlatformIcon src={selected.icon} alt={selected.name} />
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#4B5563]">
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-[180px] rounded-[10px] border border-[#E5E7EB] bg-white py-1 shadow-lg">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => {
                  onChange(platform.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#111827] transition hover:bg-[#F3F4F6]"
              >
                <PlatformIcon src={platform.icon} alt={platform.name} />
                {platform.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProfileLinkInput({
  value,
  platform,
  ariaLabel,
  onValueChange,
  onPlatformChange,
}: {
  value: string;
  platform: PlatformId;
  ariaLabel: string;
  onValueChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPlatformChange: (value: PlatformId) => void;
}) {
  return (
    <div className="flex h-[42px] w-full items-center rounded-[8px] bg-[#F1F2F3] transition focus-within:ring-2 focus-within:ring-black/10">
      <PlatformDropdown value={platform} onChange={onPlatformChange} />
      <input
        value={value}
        onChange={onValueChange}
        aria-label={ariaLabel}
        className="h-full min-w-0 flex-1 bg-transparent px-3 text-[14px] text-[#2F2F2F] outline-none placeholder:text-[#9CA3AF]"
      />
    </div>
  );
}

function EmployeeModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial: Employee | null;
  onClose: () => void;
  onSave: (payload: {
    id?: number;
    name: string;
    active: boolean;
    profiles: string[];
    profilePlatforms: string[];
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [profile1, setProfile1] = useState(initial?.profiles[0] ?? "");
  const [profile2, setProfile2] = useState(initial?.profiles[1] ?? "");

  const [platform1, setPlatform1] = useState<PlatformId>(
    toPlatformId(initial?.profilePlatforms[0])
  );
  const [platform2, setPlatform2] = useState<PlatformId>(
    toPlatformId(initial?.profilePlatforms[1])
  );

  const submit = () => {
    const profileRows = [
      { url: profile1.trim(), platform: platform1 },
      { url: profile2.trim(), platform: platform2 },
    ].filter((profile) => profile.url);

    onSave({
      id: initial?.id,
      name: name.trim(),
      active: initial?.active ?? true,
      profiles: profileRows.map((profile) => profile.url),
      profilePlatforms: profileRows.map((profile) => profile.platform),
    });
  };

  const handleProfile1Change = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile1(e.target.value);
  };

  const handleProfile2Change = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile2(e.target.value);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4 xl:justify-start xl:pl-[372px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="animate-modal relative w-full max-w-[385px] rounded-[10px] border border-[#E2E2E2] bg-white p-[14px] shadow-[0_10px_24px_rgba(17,24,39,0.16)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="absolute right-2 top-2">
          <div className="sr-only">
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7280] opacity-0 transition hover:bg-[#F3F4F6] hover:opacity-100 focus-visible:opacity-100"
            aria-label="Закрыть"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 text-[12px] font-medium text-[#111827]">ФИО</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[42px] w-full rounded-[8px] bg-[#F1F2F3] px-[14px] text-[14px] text-[#2F2F2F] outline-none transition focus:ring-2 focus:ring-black/10"
              placeholder="Введите ФИО"
            />
          </div>

          <div>
            <div className="mb-1 text-[12px] font-medium text-[#111827]">Ссылки на профили</div>
            <div className="space-y-1">
              <ProfileLinkInput
                value={profile1}
                platform={platform1}
                ariaLabel="Ссылка на профиль 1"
                onValueChange={handleProfile1Change}
                onPlatformChange={setPlatform1}
              />

              <ProfileLinkInput
                value={profile2}
                platform={platform2}
                ariaLabel="Ссылка на профиль 2"
                onValueChange={handleProfile2Change}
                onPlatformChange={setPlatform2}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="mt-5 h-[42px] w-full rounded-[8px] bg-[#FFC51B] text-[14px] font-semibold text-[#111827] transition hover:bg-[#FFD044] active:brightness-90 disabled:opacity-60"
        >
          {initial ? "Сохранить" : "Добавить сотрудника"}
        </button>
      </div>
    </div>,
    document.body
  );
}
