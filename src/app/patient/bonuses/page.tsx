import Image from "next/image";
import Link from "next/link";
import PatientFooter from "@/app/components/patient/PatientFooter";
import { Brand } from "@/app/components/Brand";

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z"
        stroke="#4B4B4B"
        strokeWidth="2"
      />
      <circle cx="12" cy="9" r="2.5" stroke="#4B4B4B" strokeWidth="2" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="17" height="13" viewBox="0 0 20 14" fill="none">
      <path d="M0 1H20" stroke="#333" strokeWidth="2" />
      <path d="M0 7H20" stroke="#333" strokeWidth="2" />
      <path d="M0 13H20" stroke="#333" strokeWidth="2" />
    </svg>
  );
}

function PartnerLogo({
  src,
  alt,
  text,
  textClassName = "",
}: {
  src?: string;
  alt: string;
  text?: string;
  textClassName?: string;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={34}
          height={34}
          className="h-[34px] w-[34px] object-contain"
        />
      ) : (
        <span className={`text-center leading-none ${textClassName}`}>
          {text}
        </span>
      )}
    </div>
  );
}

function GiftSvgPlace() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden">
      <Image
        src="/Icons/gift_base.svg"
        alt="Подарок"
        width={23}
        height={23}
        className="h-[23px] w-[23px] object-contain opacity-70"
      />
    </div>
  );
}

function BonusBanner() {
  return (
    <section className="relative mx-2 h-[171px] overflow-hidden rounded-[10px] bg-[#F3E9EE]">
      <Image
        src="/Icons/patient-background-bonuses.svg"
        alt="Подарки за отзывы"
        width={350}
        height={171}
        priority
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute right-[20px] top-[31px] flex flex-col items-start text-[24px] font-black leading-[0.76] tracking-[-0.045em] text-white">
        <span className="rounded-[10px] bg-[#FFB851] px-[10px] pb-[5px] pt-[7px]">
          Подарки
        </span>
        <span className="ml-[7px] mt-[-2px] rounded-[10px] bg-[#FFB851] px-[11px] pb-[6px] pt-[5px]">
          за отзывы
        </span>
      </div>

      <div className="absolute right-[25px] top-[95px] text-[11px] text-black">
        На сохранение промокодов:
      </div>

      <div className="absolute bottom-[15px] right-[16px] flex gap-[2px]">
        {["05", "59", "59"].map((item) => (
          <div
            key={item}
            className="h-[45px] w-[55px] rounded-[5px] bg-[#333333] text-center text-[27px] font-black leading-[45px] text-white"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

type BonusItem = {
  name: string;
  icon?: string;
  text?: string;
  textClassName?: string;
};

type BonusCategory = {
  title: string;
  cardClassName: string;
  items: BonusItem[];
};

const categories: BonusCategory[] = [
  {
    title: "Индивидуальные предложения",
    cardClassName: "bg-[#FFE1A8]",
    items: [
      {
        name: "Клиника микрохирургии глаза Счастливый взгляд",
        icon: "/Icons/platforms/happyeye.svg",
      },
    ],
  },
  {
    title: "Аптеки",
    cardClassName: "bg-[#FCEAD9]",
    items: [
      {
        name: "Аптека 36,6",
        icon: "/Icons/platforms/36,6.svg",
      },
      {
        name: "Здравсити",
        text: "здравсити❤",
        textClassName: "text-[7px] font-bold text-[#272727]",
      },
    ],
  },
  {
    title: "Анализы/Диагностика",
    cardClassName: "bg-[#FCEAD9]",
    items: [
      {
        name: "Гемотест",
        text: "ГЕМОТЕСТ",
        textClassName: "text-[6px] font-bold text-[#28A76B]",
      },
      {
        name: "Инвитро",
        icon: "/Icons/platforms/Invitro Logo Vector.svg",
      },
    ],
  },
];

const faq = [
  "Что такое промокод?",
  "Как воспользоваться промокодом?",
  "Есть ли ограничения на количество промокодов?",
  "Зачем сохранять промокод?",
];

export default function PatientBonusesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-[45px] items-center justify-between px-[10px]">
        <Brand
          size="sm"
          className="[&>div]:text-[18px] [&>div]:font-[700] [&>div]:text-black"
        />

        <div className="flex items-center gap-[5px] text-[11px] text-[#242424]">
          <LocationIcon />
          <span>Санкт-Петербург</span>
        </div>

        <Link
          href="/patient/menu"
          aria-label="Меню"
          className="flex h-8 w-8 items-center justify-end"
        >
          <MenuIcon />
        </Link>
      </header>

      <main className="flex-1">
        <BonusBanner />

        <section className="mt-[18px] px-[9px]">
          {categories.map((category) => (
            <div key={category.title} className="mb-[18px]">
              <h2 className="mb-[8px] px-[2px] text-[15px] font-black leading-tight">
                {category.title}
              </h2>

              <div className="space-y-[5px]">
                {category.items.map((item) => (
                  <Link
                    href="/patient/bonuses/1"
                    key={item.name}
                    className={`flex min-h-[59px] items-center justify-between rounded-[10px] px-[10px] transition active:scale-[0.99] ${category.cardClassName}`}
                  >
                    <div className="flex min-w-0 items-center gap-[10px]">
                      <PartnerLogo
                        src={item.icon}
                        alt={item.name}
                        text={item.text}
                        textClassName={item.textClassName}
                      />

                      <span className="max-w-[260px] text-[14px] leading-[1.15] text-black">
                        {item.name}
                      </span>
                    </div>

                    <GiftSvgPlace />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-[44px] px-[13px]">
          <h3 className="mb-[7px] text-[13px] font-black">Вопрос/Ответ</h3>

          {faq.map((item) => (
            <button
              key={item}
              className="flex h-[32px] w-full items-center justify-between border-b border-[#E8E8E8] text-left text-[10px]"
              type="button"
            >
              <span>{item}</span>
              <span className="text-[12px] text-[#777]">⌄</span>
            </button>
          ))}

          <p className="mt-[10px] max-w-[310px] text-[8px] leading-[1.3] text-black">
            Страница с промокодами генерируется автоматически, у пользователя
            есть срок действия, поэтому страница с промокодом должна регулярно
            обновляться.
          </p>
        </section>
      </main>

      <PatientFooter />
    </div>
  );
}
