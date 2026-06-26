import { LEGAL_LINKS } from "../lib/legal";

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`pb-6 ${className}`}>
      <div className="px-7">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] leading-[16px]">
          <span className="text-[14px] font-semibold text-[#111827]">
            Все права защищены © ООО «Фидбэк»
          </span>

          <a
            href={LEGAL_LINKS.userAgreement.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
          >
            {LEGAL_LINKS.userAgreement.label}
          </a>

          <a
            href={LEGAL_LINKS.cookiePolicy.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
          >
            {LEGAL_LINKS.cookiePolicy.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
