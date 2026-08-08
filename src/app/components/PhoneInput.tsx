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
  nationalDigits: number;
  placeholder: string;
};

export type PhoneInputMeta = {
  canonical: string | null;
  valid: boolean;
};

const COUNTRIES: PhoneCountry[] = [
  { code: "RU", flag: "🇷🇺", dial: "+7", label: "Россия", nationalDigits: 10, placeholder: "(000) 000-00-00" },
  { code: "BY", flag: "🇧🇾", dial: "+375", label: "Беларусь", nationalDigits: 9, placeholder: "00 000-00-00" },
  { code: "KZ", flag: "🇰🇿", dial: "+7", label: "Казахстан", nationalDigits: 10, placeholder: "(000) 000-00-00" },
  { code: "UA", flag: "🇺🇦", dial: "+380", label: "Украина", nationalDigits: 9, placeholder: "00 000 00 00" },
  { code: "UZ", flag: "🇺🇿", dial: "+998", label: "Узбекистан", nationalDigits: 9, placeholder: "00 000 00 00" },
  { code: "AM", flag: "🇦🇲", dial: "+374", label: "Армения", nationalDigits: 8, placeholder: "00 000000" },
  { code: "AZ", flag: "🇦🇿", dial: "+994", label: "Азербайджан", nationalDigits: 9, placeholder: "00 000 00 00" },
  { code: "GE", flag: "🇬🇪", dial: "+995", label: "Грузия", nationalDigits: 9, placeholder: "000 00 00 00" },
  { code: "KG", flag: "🇰🇬", dial: "+996", label: "Кыргызстан", nationalDigits: 9, placeholder: "000 000 000" },
  { code: "TJ", flag: "🇹🇯", dial: "+992", label: "Таджикистан", nationalDigits: 9, placeholder: "00 000 0000" },
  { code: "TM", flag: "🇹🇲", dial: "+993", label: "Туркменистан", nationalDigits: 8, placeholder: "00 000000" },
  { code: "MD", flag: "🇲🇩", dial: "+373", label: "Молдова", nationalDigits: 8, placeholder: "00 000 000" },
];

function detectCountry(value: string): PhoneCountry {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) return COUNTRIES[0];

  return (
    [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((item) => trimmed.startsWith(item.dial)) ?? COUNTRIES[0]
  );
}

function sanitizePhoneInput(value: string) {
  return value.replace(/\D/g, "");
}

export function getCanonicalPhone(
  value: string,
  country: CountryCode = "RU"
): string | null {
  const sanitized = value.trim();
  if (!sanitizePhoneInput(sanitized)) return null;

  const parsed = parsePhoneNumberFromString(
    sanitized,
    sanitized.startsWith("+") ? undefined : country
  );

  return parsed?.isPossible() ? parsed.number : null;
}

function getNationalDigits(value: string, country: PhoneCountry): string {
  let digits = sanitizePhoneInput(value);
  const dialDigits = sanitizePhoneInput(country.dial);

  if (digits.length > country.nationalDigits && digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  } else if (
    (country.code === "RU" || country.code === "KZ") &&
    digits.length > country.nationalDigits &&
    digits.startsWith("8")
  ) {
    digits = digits.slice(1);
  }

  return digits.slice(0, country.nationalDigits);
}

function formatRussianPhone(digits: string): string {
  if (!digits) return "";

  const area = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 8);
  const third = digits.slice(8, 10);

  let result = `(${area}`;
  if (area.length === 3) result += ")";
  if (first) result += ` ${first}`;
  if (second) result += `-${second}`;
  if (third) result += `-${third}`;
  return result;
}

function formatDisplayPhone(digits: string, country: PhoneCountry): string {
  if (!digits) return "";
  if (country.code === "RU" || country.code === "KZ") {
    return formatRussianPhone(digits);
  }

  const international = new AsYouType(country.code).input(
    `${country.dial}${digits}`
  );
  return international.replace(country.dial, "").trimStart();
}

export function PhoneInput({
  value,
  onChange,
  surfaceClassName = "bg-[#F3F4F6]",
  inputClassName = "bg-transparent",
  placeholder,
}: {
  value: string;
  onChange: (value: string, meta: PhoneInputMeta) => void;
  surfaceClassName?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  const [country, setCountry] = useState<PhoneCountry>(() =>
    detectCountry(value)
  );
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
    const digits = getNationalDigits(next, nextCountry);
    const display = formatDisplayPhone(digits, nextCountry);
    const canonical =
      digits.length === nextCountry.nationalDigits
        ? getCanonicalPhone(`${nextCountry.dial}${digits}`, nextCountry.code)
        : null;
    onChange(display, { canonical, valid: canonical !== null });
  };
  const displayValue = formatDisplayPhone(
    getNationalDigits(value, country),
    country
  );

  return (
    <div
      ref={ref}
      className={[
        "relative flex h-[48px] items-center gap-2 rounded-[12px] border border-transparent px-4 shadow-[inset_0_0_0_1px_rgba(17,24,39,0)] transition focus-within:border-[#D8D8D8] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(17,24,39,0.05)]",
        surfaceClassName,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex shrink-0 cursor-pointer select-none items-center gap-1 rounded-[6px] py-1 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D8D8D8]"
        aria-label={`Выбрать страну. Сейчас: ${country.label}`}
      >
        <span className="text-[18px] leading-none">{country.flag}</span>
        <span className="text-[10px] text-[#9CA3AF]">▾</span>
      </button>

      <span className="shrink-0 text-[15px] font-medium text-[#6B7280]">
        {country.dial}
      </span>

      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={country.placeholder.length}
        value={displayValue}
        onChange={(event) => commitValue(event.target.value)}
        onKeyDown={(event) => {
          if (
            event.ctrlKey ||
            event.metaKey ||
            event.altKey ||
            ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Enter"].includes(event.key)
          ) {
            return;
          }
          if (!/^\d$/.test(event.key)) event.preventDefault();
        }}
        onPaste={(event) => {
          event.preventDefault();
          commitValue(event.clipboardData.getData("text"));
        }}
        placeholder={placeholder ?? country.placeholder}
        aria-label={`Номер телефона, ${country.nationalDigits} цифр`}
        className={`min-w-0 flex-1 text-[15px] tracking-[0.01em] text-[#111827] placeholder:text-[#AAB4BE] focus:outline-none ${inputClassName}`}
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
