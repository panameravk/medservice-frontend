"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useBranchesStore } from "../../lib/branchesStore";
import {
  employeesApi,
  blacklistApi,
  createRequest,
  type Employee,
} from "../../lib/api";

// ── Country list ──────────────────────────────────────────────────────────────
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
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex items-center gap-2 bg-[#F3F4F6] rounded-[10px] px-3 py-2.5 border border-transparent focus-within:border-[#F4C21A]"
    >
      {/* Flag + dial button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 shrink-0 cursor-pointer select-none"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="text-[11px] text-[#6B7280]">▾</span>
      </button>

      <span className="text-[13px] text-[#6B7280] shrink-0">
        {country.dial}
      </span>

      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="(000) 000-00-00"
        className="flex-1 bg-transparent text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none min-w-0"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-[10px] shadow-lg border border-[#E5E7EB] z-50 overflow-hidden">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCountry(c);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#F3F4F6] transition-colors ${
                c.code === country.code ? "bg-[#FFFBEA] font-medium" : ""
              }`}
            >
              <span>{c.flag}</span>
              <span className="text-[#6B7280] w-10 text-left">{c.dial}</span>
              <span className="text-[#111827]">{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MailingsPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  // ── employees ─────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (!selectedBranchId) return;
    setLoadingEmployees(true);
    employeesApi
      .getAll(selectedBranchId)
      .then(setEmployees)
      .catch(() => {})
      .finally(() => setLoadingEmployees(false));
  }, [selectedBranchId]);

  // ── request form ──────────────────────────────────────────────────────────
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const toggleEmployee = (id: number) =>
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const handleSubmitRequest = async () => {
    if (!selectedBranchId) return;
    setRequestLoading(true);
    setRequestError(null);
    setRequestSuccess(false);
    try {
      await createRequest({
        branchId: Number(selectedBranchId),
        clientName: `${lastName} ${firstName}`.trim(),
        clientPhone: phone,
      });
      setLastName("");
      setFirstName("");
      setPhone("");
      setSelectedEmployees([]);
      setRequestSuccess(true);
    } catch (e: unknown) {
      setRequestError(
        e instanceof Error ? e.message : "Ошибка при отправке запроса"
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // ── blacklist form ────────────────────────────────────────────────────────
  const [blLastName, setBlLastName] = useState("");
  const [blFirstName, setBlFirstName] = useState("");
  const [blPhone, setBlPhone] = useState("");
  const [blReason, setBlReason] = useState("");
  const [blLoading, setBlLoading] = useState(false);
  const [blError, setBlError] = useState<string | null>(null);
  const [blSuccess, setBlSuccess] = useState(false);

  const handleSubmitBlacklist = async () => {
    if (!selectedBranchId) return;
    setBlLoading(true);
    setBlError(null);
    setBlSuccess(false);
    try {
      await blacklistApi.create(selectedBranchId, {
        lastName: blLastName,
        firstName: blFirstName,
        phone: blPhone,
        reason: blReason,
      });
      setBlLastName("");
      setBlFirstName("");
      setBlPhone("");
      setBlReason("");
      setBlSuccess(true);
    } catch (e: unknown) {
      setBlError(
        e instanceof Error ? e.message : "Ошибка при добавлении в чёрный список"
      );
    } finally {
      setBlLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <h1 className="text-[22px] font-semibold text-[#111827]">
          Отправить запрос на отзыв
        </h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          Формы для отправки запросов и добавления в черный список
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* ── Left: request form ── */}
        <div className="flex-1 min-w-0 bg-white rounded-[16px] p-6 shadow-sm">
          <div className="space-y-4">
            {/* Last name */}
            <div>
              <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                Фамилия
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#F3F4F6] border border-transparent rounded-[10px] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A]"
              />
            </div>

            {/* First name */}
            <div>
              <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                Имя
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#F3F4F6] border border-transparent rounded-[10px] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
                Телефон
              </label>
              <PhoneInput value={phone} onChange={setPhone} />
            </div>

            {/* Employees */}
            <div>
              <label className="block text-[13px] font-medium text-[#111827] mb-2">
                Сотрудник
              </label>
              {loadingEmployees ? (
                <p className="text-[13px] text-[#9CA3AF]">Загрузка...</p>
              ) : employees.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF]">
                  Нет сотрудников для выбора
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => toggleEmployee(emp.id)}
                      className={[
                        "text-left px-4 py-3 rounded-[10px] border text-[13px] transition-all",
                        selectedEmployees.includes(emp.id)
                          ? "border-[#F4C21A] bg-[#FFFBEA] text-[#111827] font-semibold"
                          : "border-transparent bg-[#F3F4F6] text-[#6B7280] hover:bg-[#EBEBEB]",
                      ].join(" ")}
                    >
                      {emp.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {requestError && (
              <p className="text-[13px] text-red-500">{requestError}</p>
            )}
            {requestSuccess && (
              <p className="text-[13px] text-green-600">Запрос отправлен!</p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmitRequest}
              disabled={requestLoading || !selectedBranchId}
              className="w-full bg-[#F4C21A] hover:bg-yellow-300 active:brightness-90 disabled:opacity-50 text-[#111827] font-semibold py-3 rounded-[10px] text-[13px] transition-colors"
            >
              {requestLoading ? "Отправка..." : "Отправить запрос"}
            </button>
          </div>
        </div>

        {/* ── Right: blacklist form ── */}
        <div className="w-[272px] shrink-0 bg-[#F3F4F6] rounded-[16px] p-5 space-y-3">
          {/* Last name */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
              Фамилия
            </label>
            <input
              type="text"
              value={blLastName}
              onChange={(e) => setBlLastName(e.target.value)}
              className="w-full bg-white border border-transparent rounded-[10px] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A]"
            />
          </div>

          {/* First name */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
              Имя
            </label>
            <input
              type="text"
              value={blFirstName}
              onChange={(e) => setBlFirstName(e.target.value)}
              className="w-full bg-white border border-transparent rounded-[10px] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
              Телефон
            </label>
            {/* White bg variant for right panel */}
            <div className="bg-white rounded-[10px] border border-transparent focus-within:border-[#F4C21A]">
              <PhoneInput value={blPhone} onChange={setBlPhone} />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[13px] font-medium text-[#111827] mb-1.5">
              Причина
            </label>
            <textarea
              value={blReason}
              onChange={(e) => setBlReason(e.target.value)}
              rows={4}
              className="w-full bg-white border border-transparent rounded-[10px] px-3 py-2.5 text-[13px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#F4C21A] resize-none"
            />
          </div>

          {blError && <p className="text-[13px] text-red-500">{blError}</p>}
          {blSuccess && (
            <p className="text-[13px] text-green-600">
              Добавлено в чёрный список!
            </p>
          )}

          {/* Submit blacklist */}
          <button
            onClick={handleSubmitBlacklist}
            disabled={blLoading || !selectedBranchId}
            className="w-full bg-[#111827] hover:bg-[#1f2937] active:brightness-90 disabled:opacity-50 text-white font-semibold py-3 rounded-[10px] text-[13px] transition-colors"
          >
            {blLoading ? "Отправка..." : "Отправить в черный список"}
          </button>

          <div className="text-center">
            <Link
              href="/blacklist"
              className="text-[13px] text-[#6B7280] hover:text-[#111827] underline underline-offset-2 transition-colors"
            >
              Открыть черный список
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
