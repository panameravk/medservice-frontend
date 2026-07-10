"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PhoneInput } from "../../components/PhoneInput";
import {
  ApiError,
  blacklistApi,
  createRequest,
  employeesApi,
  type Employee,
} from "../../lib/api";
import { useBranchesStore } from "../../lib/branchesStore";

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
  const [phoneCanonical, setPhoneCanonical] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
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
  const [blPhoneCanonical, setBlPhoneCanonical] = useState<string | null>(null);
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

  const selectedEmployee = useMemo(
    () =>
      selectedEmployeeId === null
        ? null
        : employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );
  const requestableEmployees = useMemo(
    () => employees.filter((employee) => employee.active),
    [employees]
  );

  const toggleEmployee = (employee: Employee) => {
    if (!employee.active) return;
    setSelectedEmployeeId((current) =>
      current === employee.id ? null : employee.id
    );
  };

  const getProdoctorovProfileUrl = (employee: Employee): string | null =>
    employee.profiles.find((url) =>
      url.trim().toLowerCase().includes("prodoctorov.ru")
    ) ?? null;

  const handleSubmitRequest = async () => {
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(false);
    setRequestWarning(null);

    try {
      const selectedProdoctorovUrl = selectedEmployee
        ? getProdoctorovProfileUrl(selectedEmployee)
        : null;

      if (selectedEmployeeId !== null && !selectedEmployee) {
        setRequestError("Выбранный сотрудник не найден");
        return;
      }

      if (selectedEmployee && !selectedEmployee.active) {
        setRequestError("У выбранного сотрудника отключены запросы");
        return;
      }

      if (selectedEmployee && !selectedProdoctorovUrl) {
        setRequestError(
          "У выбранного сотрудника нужно заполнить ссылку на ПроДокторов"
        );
        return;
      }

      const created = await createRequest({
        branchId: Number(branchId),
        clientName: `${lastName} ${firstName}`.trim(),
        clientPhone: phoneCanonical ?? "",
        ...(selectedEmployee ? { employeeId: selectedEmployee.id } : {}),
      });

      setLastName("");
      setFirstName("");
      setPhone("");
      setPhoneCanonical(null);
      setSelectedEmployeeId(null);

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
        phone: blPhoneCanonical ?? "",
        reason: blReason.trim() || undefined,
      });

      setBlLastName("");
      setBlFirstName("");
      setBlPhone("");
      setBlPhoneCanonical(null);
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

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="min-w-0 rounded-[16px] bg-white p-6 shadow-sm">
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
              <PhoneInput
                value={phone}
                onChange={(next, meta) => {
                  setPhone(next);
                  setPhoneCanonical(meta.canonical);
                }}
              />
              {phone && !phoneCanonical && (
                <p className="mt-1 text-[11px] text-red-500">
                  Введите корректный номер телефона
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#111827]">
                Сотрудник
              </label>

              {loadingEmployees ? (
                <p className="text-[13px] text-[#9CA3AF]">Загрузка...</p>
              ) : employeesError ? (
                <p className="text-[13px] text-red-500">{employeesError}</p>
              ) : requestableEmployees.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF]">
                  Нет сотрудников для выбора
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {requestableEmployees.map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => toggleEmployee(employee)}
                        className={[
                          "rounded-[10px] border px-4 py-3 text-left text-[13px] transition-all",
                          selectedEmployeeId === employee.id
                            ? "border-[#F4C21A] bg-[#FFFBEA] font-semibold text-[#111827]"
                            : "border-transparent bg-[#F3F4F6] text-[#6B7280] hover:bg-[#EBEBEB]",
                        ].join(" ")}
                      >
                        <span>{employee.name}</span>
                      </button>
                    ))}
                  </div>
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
                !phoneCanonical
              }
              className="w-full rounded-[10px] bg-[#F4C21A] py-3 text-[13px] font-semibold text-[#111827] transition-colors hover:bg-yellow-300 active:brightness-90 disabled:opacity-50"
            >
              {requestLoading ? "Отправка..." : "Отправить запрос"}
            </button>

          </div>
        </div>

        <div className="min-w-0 space-y-3 rounded-[16px] bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Фамилия
            </label>
            <input
              type="text"
              value={blLastName}
              onChange={(e) => setBlLastName(e.target.value)}
              className="w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
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
              className="w-full rounded-[10px] border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Телефон
            </label>
            <PhoneInput
              value={blPhone}
              onChange={(next, meta) => {
                setBlPhone(next);
                setBlPhoneCanonical(meta.canonical);
              }}
              surfaceClassName="bg-[#F3F4F6]"
            />
            {blPhone && !blPhoneCanonical && (
              <p className="mt-1 text-[11px] text-red-500">
                Введите корректный номер телефона
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#111827]">
              Причина
            </label>
            <textarea
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-[10px] border border-transparent bg-[#F3F4F6] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:border-[#D8D8D8] focus:outline-none"
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
              !blPhoneCanonical
            }
            className="w-full rounded-[10px] bg-black py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#1F2937] active:brightness-90 disabled:opacity-50"
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
