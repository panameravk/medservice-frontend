export type Period = "week" | "30" | "90" | "year";

export const toMidnight = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export const addDays = (d: Date, days: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

export const addYears = (d: Date, years: number) => {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + years);
  return x;
};

export const getDateRangeByPeriod = (p: Period) => {
  const start = toMidnight(new Date()); // сегодня
  let end: Date;

  switch (p) {
    case "week":
      end = addDays(start, 6);
      break;
    case "30":
      end = addDays(start, 29);
      break;
    case "90":
      end = addDays(start, 89);
      break;
    case "year":
      end = addDays(addYears(start, 1), -1);
      break;
    default:
      end = start;
  }

  return { start, end, label: `${formatDate(start)} - ${formatDate(end)}` };
};
