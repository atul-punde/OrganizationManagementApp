import { DateOfBirth } from "../types/employee.types";

// ============================================================
// Converts a JS Date -> our "mm/dd/yyyy" template literal type
// ============================================================
export function formatDateToDOB(date: Date): DateOfBirth {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${Number(mm)}/${Number(dd)}/${yyyy}` as DateOfBirth;
}

// ============================================================
// Parses "mm/dd/yyyy" -> JS Date (or null if invalid/empty)
// ============================================================
export function parseDOBToDate(dob: string | undefined | null): Date | null {
  if (!dob) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dob);
  if (!match) return null;
  const [, mm, dd, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(date.getTime()) ? null : date;
}