export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`pb-6 ${className}`}>
      <div className="px-7">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] leading-[16px]">
          <span className="text-[14px] font-semibold text-[#111827]">
            Все права защищены © ООО «Фидбэк»
          </span>

          <a
            href="#"
            className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
          >
            Лицензия
          </a>

          <a
            href="#"
            className="text-[#9CA3AF] underline decoration-transparent underline-offset-4 hover:decoration-[#9CA3AF]"
          >
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}
