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

function MenuIcon() {
  return (
    <svg width="15" height="12" viewBox="0 0 20 14" fill="none">
      <path d="M0 1H20" stroke="#333" strokeWidth="2" />
      <path d="M0 7H20" stroke="#333" strokeWidth="2" />
      <path d="M0 13H20" stroke="#333" strokeWidth="2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <div className="mx-auto mr-1 flex h-[31px] w-[31px] items-center justify-center overflow-hidden">
      <img
        src="/Icons/copy_main.svg"
        alt=""
        className="h-[15px] w-[28px] object-contain"
      />
    </div>
  );
}

function EyeSvgLargePlace() {
  return (
    <div className="mx-auto flex h-[31px] w-[31px] items-center justify-center overflow-hidden">
      <img
        src="/Icons/platforms/happyeye.svg"
        alt=""
        className="h-[28px] w-[28px] object-contain"
      />
    </div>
  );
}

function BonusBanner() {
  return (
    <section className="relative mx-[13px] h-[118px] overflow-hidden rounded-[5px] bg-[linear-gradient(115deg,#FFF2DE_0%,#F4E8FF_48%,#DED9FF_100%)]">
      {/* светлое пятно слева */}
      <div className="absolute left-[-18px] top-[-18px] h-[145px] w-[145px] rounded-full bg-white/35 blur-[18px]" />

      {/* декоративный круг */}
      <div className="absolute left-[22px] top-[22px] h-[76px] w-[76px] rounded-full border-[6px] border-dashed border-white/70" />

      {/* тень под подарком */}
      <div className="absolute left-[38px] top-[86px] h-[13px] w-[65px] rounded-full bg-black/10 blur-[6px]" />

      {/* коробка подарка */}
      <div className="absolute left-[44px] top-[55px] h-[43px] w-[48px] rounded-[7px] bg-[linear-gradient(145deg,#C9B8FF,#8D78EA)] shadow-[0_10px_18px_rgba(83,64,150,0.25)]" />

      {/* крышка подарка */}
      <div className="absolute left-[39px] top-[48px] h-[13px] w-[58px] rounded-[5px] bg-[linear-gradient(145deg,#D9CCFF,#9A83F1)]" />

      {/* лента вертикальная */}
      <div className="absolute left-[62px] top-[48px] h-[50px] w-[9px] bg-[linear-gradient(180deg,#FFD84D,#FFAE17)]" />

      {/* лента горизонтальная */}
      <div className="absolute left-[39px] top-[61px] h-[8px] w-[58px] bg-[linear-gradient(90deg,#FFD84D,#FFAE17)]" />

      {/* бантик */}
      <div className="absolute left-[50px] top-[39px] h-[20px] w-[20px] rounded-full bg-[#FFB51F]" />
      <div className="absolute left-[68px] top-[39px] h-[20px] w-[20px] rounded-full bg-[#FFB51F]" />
      <div className="absolute left-[61px] top-[43px] h-[14px] w-[14px] rounded-full bg-[#FFD44A]" />

      {/* верхний отзыв */}
      <div className="absolute left-[42px] top-[25px] rotate-[-6deg] rounded-[6px] bg-[#8B73F1] px-[8px] py-[5px] text-[7px] font-black text-white shadow-[0_6px_12px_rgba(90,70,160,0.25)]">
        ● ★★★★★
      </div>

      {/* нижний отзыв */}
      <div className="absolute left-[93px] top-[51px] rotate-[3deg] rounded-[6px] bg-white px-[8px] py-[5px] text-[7px] font-black text-[#8B73F1] shadow-[0_6px_12px_rgba(90,70,160,0.16)]">
        ● ★★★★★
      </div>

      {/* заголовок справа */}
      <div className="absolute right-[14px] top-[20px] rounded-[7px] bg-[#FFBD5A] px-[12px] py-[6px] text-[17px] font-black leading-[0.86] tracking-[-0.05em] text-white shadow-[0_8px_14px_rgba(255,160,50,0.22)]">
        Подарки
        <br />
        за отзывы
      </div>

      {/* подпись */}
      <div className="absolute right-[19px] top-[65px] text-[7px] text-black">
        На сохранение промокодов:
      </div>

      {/* таймер */}
      <div className="absolute bottom-[12px] right-[17px] flex gap-[3px]">
        {["05", "59", "59"].map((item) => (
          <div
            key={item}
            className="h-[23px] w-[34px] rounded-[3px] bg-[#303133] text-center text-[16px] font-black leading-[23px] text-white shadow-[0_4px_8px_rgba(0,0,0,0.18)]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

const bonuses = [
  {
    date: "до 20.05.2026",
    description: "Скидка 20% на вторичный прием у офтальмолога",
    code: "SuperSkidka",
  },
  {
    date: "до 25.05.2026",
    description: "Скидка 20% на вторичный прием у офтальмолога",
    code: "SuperSkidka",
  },
];

const faq = [
  "Что такое промокод?",
  "Как воспользоваться промокодом?",
  "Есть ли ограничения на количество промокодов?",
  "Зачем сохранять промокод?",
];

export default function PatientBonusDetailPage() {
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

        <Link href="/patient/menu" aria-label="Меню">
          <MenuIcon />
        </Link>
      </header>

      <main className="flex-1">
        <BonusBanner />

        <section className="mt-[12px] px-[13px]">
          <Link
            href="/patient/bonuses"
            className="inline-flex h-[35px] items-center rounded-[5px] bg-[#333] px-[13px] text-[10px] text-white"
          >
            ← Назад
          </Link>

          <div className="mt-[24px] text-center">
            <EyeSvgLargePlace />

            <h1 className="mt-[8px] text-[16px] font-black leading-[1.15] tracking-[-0.03em]">
              Клиника микрохирургии глаза
              <br />
              Счастливый взгляд
            </h1>

            <button
              type="button"
              className="mt-[14px] h-[25px] rounded-[6px] bg-[#F5F5F5] px-[16px] text-[8px] text-[#999]"
            >
              На сайт ↗
            </button>
          </div>

          <div className="mt-[25px] space-y-[8px]">
            {bonuses.map((bonus, index) => (
              <article
                key={index}
                className="rounded-[6px] bg-[#F6E8D9] px-[15px] pb-[13px] pt-[15px]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-[26px] font-black leading-none">20%</div>
                  <div className="pt-[6px] text-[10px] leading-none">
                    {bonus.date}
                  </div>
                </div>

                <p className="mt-[13px] max-w-[230px] text-[11px] leading-[1.25]">
                  {bonus.description}
                </p>

                <div className="mt-[15px] flex h-[39px] items-center justify-between rounded-[5px] bg-white px-[13px]">
                  <span className="text-[11px] font-semibold">
                    {bonus.code}
                  </span>

                  <CopyIcon />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-[38px] px-[13px]">
          <h3 className="mb-[8px] text-[12px] font-black">Вопрос/Ответ</h3>

          {faq.map((item) => (
            <button
              key={item}
              className="flex h-[26px] w-full items-center justify-between border-b border-[#E6E6E6] text-left text-[8px]"
              type="button"
            >
              <span>{item}</span>
              <span className="text-[10px] text-[#777]">⌄</span>
            </button>
          ))}

          <p className="mt-[8px] max-w-[265px] text-[7px] leading-[1.2]">
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