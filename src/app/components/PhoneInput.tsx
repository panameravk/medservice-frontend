"use client";

import {
  AsYouType,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { useEffect, useRef, useState } from "react";

type PhoneCountry = {
  code: CountryCode;
  flag: string;
  dial: string;
  label: string;
};

export type PhoneInputMeta = {
  canonical: string | null;
  valid: boolean;
};

const COUNTRIES: PhoneCountry[] = [
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

const LETTER_RE = /[A-Za-zА-Яа-яЁё]/g;

function sanitizePhoneInput(value: string) {
  return value.replace(LETTER_RE, "");
}

export function getCanonicalPhone(
  value: string,
  country: CountryCode = "RU"
): string | null {
  const sanitized = sanitizePhoneInput(value).trim();
  if (!sanitized) return null;

  const parsed = parsePhoneNumberFromString(
    sanitized,
    sanitized.startsWith("+") ? undefined : country
  );

  return parsed?.isValid() ? parsed.number : null;
}

function formatDisplayPhone(value: string, country: CountryCode) {
  const sanitized = sanitizePhoneInput(value);
  if (!sanitized.trim()) return "";

  const countryDial = COUNTRIES.find((item) => item.code === country)?.dial;
  const displayValue =
    countryDial && sanitized.trim().startsWith(countryDial)
      ? sanitized.trim().slice(countryDial.length).trimStart()
      : sanitized;

  return new AsYouType(country).input(displayValue);
}

export function PhoneInput({
  value,
  onChange,
  surfaceClassName = "bg-[#F3F4F6]",
  inputClassName = "bg-transparent",
  placeholder = "(000) 000-00-00",
}: {
  value: string;
  onChange: (value: string, meta: PhoneInputMeta) => void;
  surfaceClassName?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const [country, setCountry] = useState<PhoneCountry>(COUNTRIES[0]);
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

  const commitValue = (next: string, nextCountry = country) => {
    const display = formatDisplayPhone(next, nextCountry.code);
    const canonical = getCanonicalPhone(display, nextCountry.code);
    onChange(display, { canonical, valid: canonical !== null });
  };

  return (
    <div
      ref={ref}
      className={[
        "relative flex items-center gap-2 rounded-[10px] border border-transparent px-3 py-2.5 focus-within:border-[#D8D8D8]",
        surfaceClassName,
      ].join(" ")}
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
        onChange={(event) => commitValue(event.target.value)}
        onPaste={(event) => {
          event.preventDefault();
          commitValue(event.clipboardData.getData("text"));
        }}
        placeholder={placeholder}
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
                commitValue(value, countryItem);
              }}
              className={[
                "flex w-full items-center gap-2 px-3 py-2 text-[13px] transition-colors hover:bg-[#F3F4F6]",
                countryItem.code === country.code ? "bg-[#FFFBEA] font-medium" : "",
              ].join(" ")}
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
