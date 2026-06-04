import PatientFooter from "@/app/components/patient/PatientFooter";

type Platform = {
  title: string;
  icon: string;
  href: string;
};

const platforms: Platform[] = [
  {
    title: "Яндекс.Карты",
    icon: "/Icons/platforms/yandex-maps-logo.svg",
    href: "https://yandex.ru/maps/org/klinika_mikrokhirurgii_glaza_schastlivy_vzglyad/136382389323/",
  },
  {
    title: "Google Maps",
    icon: "/Icons/platforms/google-maps-sign-logo.svg",
    href: "https://www.google.com/maps/search/?api=1&query=Клиника%20микрохирургии%20глаза%20Счастливый%20взгляд%20Лиговский%20проспект%2052%20Санкт-Петербург",
  },
  {
    title: "2Gis",
    icon: "/Icons/platforms/2gis-icon-logo.svg",
    href: "https://2gis.ru/spb/search/Клиника%20микрохирургии%20глаза%20Счастливый%20взгляд%20Лиговский%20проспект%2052",
  },
  {
    title: "Продокторов",
    icon: "/Icons/platforms/prodoktorov.svg",
    href: "https://prodoctorov.ru/spb/lpu/85084-schastlivyy-vzglyad/",
  },
  {
    title: "НаПоправку",
    icon: "/Icons/platforms/napopravku.svg",
    href: "https://spb.napopravku.ru/clinics/schastlivyy-vzglyad-klinika-mikrohirurgii-glaza/",
  },
];

export default function PatientGiftsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 px-[16px] pt-[42px]">
        <h1 className="text-[24px] font-black leading-[1.02] tracking-[-0.04em]">
          Дарим подарки
          <br />
          за отзывы
        </h1>

        <p className="mt-[9px] max-w-[310px] text-[8px] leading-[1.35] text-black">
          Оставьте отзыв на одной из площадок и получите приятные бонусы и
          подарки от нас и наших партнёров. Это займет пару минут.
        </p>

        <div className="mt-[13px] flex justify-center">
  <div className="relative h-[58px] w-[228px]">
    {/* INVITRO — сверху над аптекой */}
    <div className="absolute left-0 top-0 z-[6] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#0097A9]">
      <span className="text-[11px] font-black italic tracking-[0.04em] text-white">
        INVITRO
      </span>
    </div>

    {/* 36,6 интернет аптека — слева под INVITRO, справа над Золотым яблоком */}
    <div className="absolute left-[46px] top-0 z-[5] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#D7D8F6]">
      <div className="flex items-center gap-[2px] translate-x-[2px]">
        <img
          src="/Icons/platforms/36,6.svg"
          alt="36,6"
          className="h-[17px] w-[17px] shrink-0 object-contain"
        />

        <div className="w-[30px] text-[7px] font-black leading-[0.92] text-[#174A86]">
          интернет
          <br />
          аптека
        </div>
      </div>
    </div>

    {/* Золотое яблоко — ниже аптеки */}
    <div className="absolute left-[92px] top-0 z-[4] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#DCFF00]">
      <div className="flex flex-col items-center justify-center">
        <img
          src="/Icons/platforms/golden_apple.svg"
          alt="Золотое яблоко"
          className="mb-[-1px] h-[33px] w-[33px] object-contain"
        />

        <div className="text-center text-[5px] font-black leading-[0.9] text-black">
          Золотое
          <br />
          Яблоко
        </div>
      </div>
    </div>

    {/* серые круги справа */}
    <div className="absolute left-[138px] top-0 z-[3] h-[58px] w-[58px] rounded-full bg-[#D9D9D9]" />
    <div className="absolute left-[162px] top-0 z-[2] h-[58px] w-[58px] rounded-full bg-[#D9D9D9] opacity-55" />
    <div className="absolute left-[184px] top-0 z-[1] h-[58px] w-[58px] rounded-full bg-[#D9D9D9] opacity-30" />
  </div>
</div>

        <div className="mt-[11px] space-y-[6px]">
  {platforms.map((item) => (
    <a
      key={item.title}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[34px] w-full items-center justify-center gap-[8px] rounded-[5px] bg-[#F6E8D9] text-[13px] text-black underline"
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white">
        <img
          src={item.icon}
          alt=""
          className="h-[14px] w-[14px] object-contain"
        />
      </span>

      <span>{item.title}</span>
    </a>
  ))}
</div>
      </main>

      <PatientFooter />
    </div>
  );
}