export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-[#111827]">Настройки</h1>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Пока заглушка — потом добавим сохранение и интеграции
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5">
          <h2 className="text-[14px] font-semibold text-[#111827]">Профиль</h2>

          <div className="mt-4 space-y-3">
            <Field label="Имя" placeholder="Сергей Попов" />
            <Field label="Email" placeholder="popov.s@yandex.ru" />
            <button
              type="button"
              className="mt-2 h-10 rounded-[10px] bg-[#2B2E39] px-4 text-[13px] font-semibold text-white hover:brightness-110"
            >
              Сохранить
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5">
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Уведомления
          </h2>

          <div className="mt-4 space-y-3 text-[13px] text-[#111827]">
            <Toggle label="Email-уведомления о новых отзывах" />
            <Toggle label="Email-уведомления о жалобах" />
            <Toggle label="Еженедельный отчет по филиалу" />
          </div>
        </section>

        {/* Integrations */}
        <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 lg:col-span-2">
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Интеграции (заглушка)
          </h2>
          <p className="mt-2 text-[13px] text-[#6B7280]">
            Здесь будут подключения площадок (Яндекс/Google/2GIS) и управление
            токенами.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Яндекс", "Google", "2GIS", "ПроДокторов", "НаПоправку"].map(
              (x) => (
                <span
                  key={x}
                  className="inline-flex items-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13px] text-[#111827]"
                >
                  {x}
                </span>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-[12px] font-semibold text-[#111827]">
        {label}
      </div>
      <input
        placeholder={placeholder}
        className="h-10 w-full rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-black/5"
      />
    </label>
  );
}

function Toggle({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] px-3 py-3">
      <span>{label}</span>
      <span className="h-6 w-10 rounded-full bg-[#E5E7EB]" />
    </div>
  );
}
