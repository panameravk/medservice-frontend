import PatientFooter from "@/app/components/patient/PatientFooter";

export default function PatientDirectorPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-[16px] pt-[58px]">
        <h1 className="text-[23px] font-black leading-[1.05] tracking-[-0.04em]">
          Написать директору
        </h1>

        <p className="mt-[10px] max-w-[305px] text-[8px] leading-[1.35] text-black">
          Расскажите, что вам не понравилось и как мы можем стать лучше. Мы
          обязательно всё проверим, исправим и свяжемся с вами.
        </p>

        <form className="mt-[14px]">
          <textarea className="h-[112px] w-full resize-none rounded-[4px] bg-[#F3F3F3] p-[8px] text-[10px] outline-none" />

          <button
            type="submit"
            className="mt-[8px] h-[31px] w-full rounded-[4px] bg-black text-[10px] font-medium text-white"
          >
            Отправить
          </button>
        </form>
      </main>

      <PatientFooter />
    </div>
  );
}