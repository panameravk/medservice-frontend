export type Period = "week" | "30" | "90" | "year";

export const toMidnight = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const addYears = (date: Date, years: number) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

export const getDateRangeByPeriod = (
  p: Period,
  baseDate: Date = new Date()
) => {
  const end = toMidnight(baseDate);
  let start: Date;

  switch (p) {
    case "week":
      start = addDays(end, -6);
      break;
    case "30":
      start = addDays(end, -29);
      break;
    case "90":
      start = addDays(end, -89);
      break;
    case "year":
      start = addYears(end, -1);
      break;
    default:
      start = end;
  }

  return {
    start,
    end,
    label: `${formatDate(start)} - ${formatDate(end)}`,
  };
};
