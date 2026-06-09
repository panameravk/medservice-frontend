import PatientFooter from "@/app/components/patient/PatientFooter";

const ratings = [
  {
    text: "5 - Всё безупречно",
    bg: "#F8ECDE",
  },
  {
    text: "4 - Хорошо",
    bg: "#F7E9DB",
  },
  {
    text: "3 - Удовлетворительно",
    bg: "#F9EFE5",
  },
  {
    text: "2 - Ниже среднего",
    bg: "#FBF5EE",
  },
  {
    text: "1 - Есть над чем работать",
    bg: "#FCF8F4",
  },
];

export default function PatientReviewPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 bg-white px-[13px] pt-[108px]">
        <h1 className="text-[28px] font-black leading-[1.22] tracking-[0.01em] text-black">
          Оцените ваш опыт
          <br />
          в клинике
          <br />
          Счастливый взгляд
        </h1>

        <div className="mt-[43px] space-y-[7px]">
          {ratings.map((rating) => (
            <button
              key={rating.text}
              type="button"
              style={{ backgroundColor: rating.bg }}
              className="flex h-[61px] w-full items-center justify-center rounded-[6px] text-[20px] font-normal text-black"
            >
              {rating.text}
            </button>
          ))}
        </div>
      </main>

      <div className="bg-[#F8F8F8]">
        <PatientFooter />
      </div>
    </div>
  );
}