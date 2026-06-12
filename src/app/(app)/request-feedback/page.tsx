"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  blacklistApi,
  createRequest,
  employeesApi,
  type Employee,
} from "../../lib/api";
import { useBranchesStore } from "../../lib/branchesStore";

const COUNTRIES = [
  { code: "RU", flag: "🇷🇺", dial: "+7", label: "Россия" },
  { code: "BY", flag: "🇧🇾", dial: "+375", label: "Беларусь" },
  { code: "KZ", flag: "🇰🇿", dial: "+7", label: "Казахстан" },
  { code: "UA", flag: "🇺🇦", dial: "+380", label: "Украина" },
  { code: "UZ", flag: "🇺🇿", dial: "+998", label: "Узбекистан" },
  { code: "AM", flag: "🇦🇲", dial: "+374", label: "Армения" },
  { code: "AZ", flag: "🇦🇿", dial: "+994", label: "Азербайджан" },
  { code: "GE", flag: "🇬🇪", dial: "+995", label: "Грузия" },
  { code: "KG", flag: "🇰🇬", dial: "+996", label: "Кыргызстан" },
  { code: "TJ", flag: "🇹🇯", dial: "+992", label: "Таджикистан" },
  { code: "TM", flag: "🇹🇲", dial: "+993", label: "Туркменистан" },
  { code: "MD", flag: "🇲🇩", dial: "+373", label: "Молдова" },
];

function PhoneInput({
  value,
  onChange,
  inputClassName = "bg-transparent",
}: {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-2 rounded-[10px] border border-transparent bg-[#F3F4F6] px-3 py-2.5 focus-within:border-[#D8D8D8]"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex shrink-0 cursor-pointer select-none items-center gap-1"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="text-[11px] text-[#6B7280]">▾</span>
      </button>

      <span className="shrink-0 text-[13px] text-[#6B7280]">
        {country.dial}
      </span>

      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="(000) 000-00-00"
        className={`min-w-0 flex-1 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none ${inputClassName}`}
      />

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-[10px] border border-[#E5E7EB] bg-white shadow-lg">
          {COUNTRIES.map((countryItem) => (
            <button
              key={countryItem.code}
              type="button"
              onClick={() => {
                setCountry(countryItem);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-[#F3F4F6] ${
                countryItem.code === country.code
                  ? "bg-[#FFFBEA] font-medium"
                  : ""
              }`}
            >
              <span>{countryItem.flag}</span>
              <span className="w-10 text-left text-[#6B7280]">
                {countryItem.dial}
              </span>
              <span className="text-[#111827]">{countryItem.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RequestFeedbackPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  if (!selectedBranchId) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111827]">
            Отправить запрос на отзыв
          </h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Формы для отправки запросов и добавления в черный список
          </p>
        </div>

        <div className="rounded-[16px] bg-white px-6 py-10 text-center text-[13px] text-[#9CA3AF] shadow-sm">
          Выберите филиал
        </div>
      </div>
    );
  }

  return (
    <RequestFeedbackContent
      key={selectedBranchId}
      branchId={selectedBranchId}
    />
  );
}

function RequestFeedbackContent({ branchId }: { branchId: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestWarning, setRequestWarning] = useState<{
    reason: string;
    link: string | null;
  } | null>(null);

  const [blLastName, setBlLastName] = useState("");
  const [blFirstName, setBlFirstName] = useState("");
  const [blPhone, setBlPhone] = useState("");
  const [blReason, setBlReason] = useState("");
  const [blLoading, setBlLoading] = useState(false);
  const [blError, setBlError] = useState<string | null>(null);
  const [blSuccess, setBlSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      try {
        const data = await employeesApi.getAll(branchId);

        if (cancelled) return;

        setEmployees(data);
        setEmployeesError(null);
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          setEmployeesError(error.message);
        } else if (error instanceof Error) {
          setEmployeesError(error.message);
        } else {
          setEmployeesError("Не удалось загрузить сотрудников");
        }

        setEmployees([]);
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  const toggleEmployee = (id: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitRequest = async () => {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(false);
    setRequestWarning(null);

    try {
      const created = await createRequest({
        branchId: Number(branchId),
        clientName: `${lastName} ${firstName}`.trim(),
        clientPhone: phone.trim(),
      });

      setLastName("");
      setFirstName("");
      setPhone("");
      setSelectedEmployees([]);

      // 201 означает «запрос создан», но SMS могла не уйти (отключена,
      // лимит, ошибка провайдера) — это приходит в поле sms.
      if (created.sms && !created.sms.ok) {
        setRequestWarning({
          reason:
            created.sms.skippedReason ??
            created.sms.error ??
            "SMS не отправлена",
          link: created.requestLink,
        });
      } else {
        setRequestSuccess(true);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setRequestError(error.message);
      } else if (error instanceof Error) {
        setRequestError(error.message);
      } else {
        setRequestError("Ошибка при отправке запроса");
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmitBlacklist = async () => {
    setBlLoading(true);
    setBlError(null);
    setBlSuccess(false);

    try {
      await blacklistApi.create(branchId, {
        lastName: blLastName.trim(),
        firstName: blFirstName.trim(),
        phone: blPhone.trim(),
        reason: blReason.trim() || undefined,
      });

      setBlLastName("");
      setBlFirstName("");
      setBlPhone("");
      setBlReason("");
      setBlSuccess(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setBlError(error.message);
      } else if (error instanceof Error) {
        setBlError(error.message);
      } else {
        setBlError("Ошибка при добавлении в чёрный список");
      }
    } finally {
      setBlLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-semibold text-[#111827]">
          Отправить запрос на отзыв
        </h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Формы для отправки запросов и добавления в черный список
        </p>
      </div>

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 rounded-[16px] bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
                Фамилия
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
                Имя
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
                Телефон
              </label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                Сотрудник
              </label>

              {loadingEmployees ? (
                <p className="text-[13px] text-[#9CA3AF]">Загрузка...</p>
              ) : employeesError ? (
                <p className="text-[13px] text-red-500">{employeesError}</p>
              ) : employees.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF]">
                  Нет сотрудников для выбора
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {employees.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => toggleEmployee(employee.id)}
                        className={[
                          "rounded-[10px] border px-4 py-3 text-left text-[13px] transition-all",
                          selectedEmployees.includes(employee.id)
                            ? "border-[#F4C21A] bg-[#FFFBEA] font-semibold text-[#111827]"
                            : "border-transparent bg-[#F3F4F6] text-[#6B7280] hover:bg-[#EBEBEB]",
                        ].join(" ")}
                      >
                        {employee.name}
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-[11px] text-[#9CA3AF]">
                    Выбор сотрудника сейчас используется только в интерфейсе.
                    Бекенд пока не принимает его в запросе на отзыв.
                  </p>
                </>
              )}
            </div>

            {requestError && (
              <p className="text-[13px] text-red-500">{requestError}</p>
            )}
            {requestSuccess && (
              <p className="text-[13px] text-green-600">Запрос отправлен!</p>
            )}
            {requestWarning && (
              <div className="rounded-[10px] bg-amber-50 px-3 py-2.5 text-[13px] text-amber-700">
                <p>
                  Запрос создан, но SMS не отправлена: {requestWarning.reason}
                </p>
                {requestWarning.link && (
                  <p className="mt-1 break-all text-[12px] text-amber-800">
                    Ссылку можно передать пациенту вручную:{" "}
                    <span className="select-all font-medium">
                      {requestWarning.link}
                    </span>
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void handleSubmitRequest();
              }}
              disabled={
                requestLoading ||
                !branchId ||
                !`${lastName} ${firstName}`.trim() ||
                !phone.trim()
              }
              className="w-full rounded-[10px] bg-[#F4C21A] py-3 text-[13px] font-semibold text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90 disabled:opacity-50"
            >
              {requestLoading ? "Отправка..." : "Отправить запрос"}
            </button>
          </div>
        </div>

        <div className="w-[272px] shrink-0 space-y-3 rounded-[16px] bg-[#F3F4F6] p-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Фамилия
            </label>
            <input
              type="text"
              value={blLastName}
              onChange={(e) => setBlLastName(e.target.value)}
              className="w-full rounded-[10px] border border-transparent bg-white px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Имя
            </label>
            <input
              type="text"
              value={blFirstName}
              onChange={(e) => setBlFirstName(e.target.value)}
              className="w-full rounded-[10px] border border-transparent bg-white px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Телефон
            </label>
            <div className="rounded-[10px] border border-transparent bg-white focus-within:border-[#D8D8D8]">
              <PhoneInput
                value={blPhone}
                onChange={setBlPhone}
                inputClassName="bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Причина
            </label>
            <textarea
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-[10px] border border-transparent bg-white px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
            />
          </div>

          {blError && <p className="text-[13px] text-red-500">{blError}</p>}
          {blSuccess && (
            <p className="text-[13px] text-green-600">
              Добавлено в чёрный список!
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              void handleSubmitBlacklist();
            }}
            disabled={
              blLoading ||
              !branchId ||
              !blLastName.trim() ||
              !blFirstName.trim() ||
              !blPhone.trim()
            }
            className="w-full rounded-[10px] bg-[#111827] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#1f2937] active:brightness-90 disabled:opacity-50"
          >
            {blLoading ? "Отправка..." : "Отправить в черный список"}
          </button>

          <div className="text-center">
            <Link
              href="/blacklist"
              className="text-[13px] text-[#6B7280] underline underline-offset-2 transition-colors hover:text-[#111827]"
            >
              Открыть черный список
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
