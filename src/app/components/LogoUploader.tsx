"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 100 * 1024; // 100 KB

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  buttonLabel?: string;
};

export function LogoUploader({
  value,
  onChange,
  buttonLabel = "Загрузить логотип",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.type !== "image/png") {
      setError("Только PNG");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Файл больше 100 КБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => setError("Не удалось прочитать файл");
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Логотип"
            className="h-10 w-10 rounded-[6px] border border-[#E6E6E6] object-contain"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[12px] text-[#A3A3A3] underline hover:text-[#DC2626]"
          >
            убрать
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[46px] items-center gap-2 rounded-[10px] bg-[#F3F4F6] px-3 text-[14px] text-[#3A3A46] transition hover:bg-[#E6E7EB]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M16 8l-4-4-4 4M12 4v12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {buttonLabel}
        </button>
      )}

      {error && <span className="text-[12px] text-red-500">{error}</span>}
    </div>
  );
}
