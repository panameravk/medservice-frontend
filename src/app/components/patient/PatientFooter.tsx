import { LEGAL_LINKS } from "../../lib/legal";

export default function PatientFooter() {
  return (
    <footer className="mt-auto bg-white px-[14px] pb-[8px] pt-[7px]">
      <div className="h-px w-full bg-[#E9E9E9]" />

      <div className="mt-[7px] flex items-start justify-between gap-[8px]">
        <div className="pt-[2px] text-[24px] font-black leading-none tracking-[-0.12em]">
          Ф
        </div>

        <div className="flex-1 text-center">
          <div className="text-[8px] font-semibold leading-none text-[#222]">
            Все права защищены © ООО «Фидбэк»
          </div>

          <div className="mt-[4px] flex justify-center gap-[18px] text-[7px] leading-none text-[#6F6F6F]">
            <a
              href={LEGAL_LINKS.userAgreement.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-dotted border-[#6F6F6F]"
            >
              {LEGAL_LINKS.userAgreement.label}
            </a>

            <a
              href={LEGAL_LINKS.cookiePolicy.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-dotted border-[#6F6F6F]"
            >
              {LEGAL_LINKS.cookiePolicy.label}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
