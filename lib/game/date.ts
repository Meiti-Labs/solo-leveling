import type { AppDate } from "@/lib/indexed-db/types";

export function toAppDate(date = new Date()): AppDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fromAppDate(date: AppDate): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isOffDay(date: AppDate, weeklyOffDay: number): boolean {
  return fromAppDate(date).getDay() === weeklyOffDay;
}

export function getPreviousAppDate(date = new Date()): AppDate {
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - 1);
  return toAppDate(previousDate);
}
