"use client";

import { useRef, useState } from "react";

const MAX_BYTES = 150 * 1024; // 150 KB — stored inline as a data URL in logoUrl

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V7m0 0-3.5 3.5M12 7l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 16.5A3.5 3.5 0 0 1 6 9.7 5 5 0 0 1 16 9a3.5 3.5 0 0 1 1 6.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Reads a PNG into a base64 data URL (no upload endpoint needed) and hands it
 * back via onChange — stored straight into the bonus's logoUrl.
 */
export function LogoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Только изображение (.png)");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Файл больше 150 КБ");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      onChange(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setError("Не удалось прочитать файл");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-[#D8DBE0] bg-[#F3F4F6] px-3 py-2.5">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-9 w-9 shrink-0 rounded-[8px] bg-white object-contain"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#9CA3AF]">
            <UploadIcon />
          </span>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[14px] text-[#3A3A46] transition hover:text-[#111827]"
        >
          {value ? "Заменить логотип" : "Загрузить логотип"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-auto text-[13px] text-[#DC2626] transition hover:underline"
          >
            Убрать
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-[12px] text-[#DC2626]">{error}</p>}
    </div>
  );
}
