import Link from "next/link";
import PatientFooter from "@/app/components/patient/PatientFooter";

function LocationIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z"
        stroke="#4B4B4B"
        strokeWidth="2"
      />
      <circle cx="12" cy="9" r="2.5" stroke="#4B4B4B" strokeWidth="2" />
    </svg>
  );
}

const items = [
  "Аптеки",
  "Анализы/Диагностика",
  "Клиники",
  "Эстетическая медицина",
  "Стоматологии",
  "...",
  "Вопрос/Ответ",
];

export default function PatientMenuPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-[42px] items-center justify-between px-[13px]">
        <div className="text-[13px] font-black leading-none tracking-[-0.04em]">
          Фидбэк
        </div>

        <div className="flex items-center gap-[4px] text-[6px] text-[#555]">
          <LocationIcon />
          <span>Санкт-Петербург</span>
        </div>

        <Link href="/patient/bonuses" className="text-[19px] leading-none">
          ×
        </Link>
      </header>

      <main className="flex-1 px-[16px] pt-[18px]">
        <nav className="flex flex-col items-end gap-[20px] pr-[10px]">
          {items.map((item) => (
            <Link
              key={item}
              href="#"
              className="text-right text-[21px] font-medium leading-[1.05] tracking-[-0.04em]"
            >
              {item}
            </Link>
          ))}
        </nav>
      </main>

      <PatientFooter />
    </div>
  );
}