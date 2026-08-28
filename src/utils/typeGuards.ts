import {
  Designation,
  Employee,
  EngineerEmployee,
  LeadEmployee,
  ManagerEmployee,
  DirectorEmployee,
  CEOEmployee,
  ValidationResult,
} from "../types/employee.types";

// ============================================================
// NEVER — exhaustiveness guard. If a new Designation is ever added
// and a switch forgets to handle it, this line fails to compile.
// ============================================================
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

// ============================================================
// TOP TYPES: any / unknown
// ============================================================
export function legacyParse(raw: any): unknown {
  // `any` disables checking entirely — used only at an untyped boundary,
  // then immediately handed off as `unknown` so callers are forced to narrow it.
  return raw;
}

export function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// ============================================================
// TYPE ASSERTIONS
// ============================================================
export function toEmployeeUnsafe(value: unknown): Employee {
  return value as Employee; // trust the caller (e.g. our own storage layer)
}

// ============================================================
// TYPE NARROWING via discriminated union (user-defined type guards)
// ============================================================
export function isEngineer(e: Employee): e is EngineerEmployee {
  return e.designation === Designation.Engineer;
}
export function isLead(e: Employee): e is LeadEmployee {
  return e.designation === Designation.Lead;
}
export function isManager(e: Employee): e is ManagerEmployee {
  return e.designation === Designation.Manager;
}
export function isDirector(e: Employee): e is DirectorEmployee {
  return e.designation === Designation.Director;
}
export function isCEO(e: Employee): e is CEOEmployee {
  return e.designation === Designation.CEO;
}

// Exhaustive switch narrowing on the discriminant + `never` guard
export function describeEmployee(e: Employee): string {
  switch (e.designation) {
    case Designation.Engineer:
      return `${e.name} (Engineer) reports to ${e.reportsTo}`;
    case Designation.Lead:
      return `${e.name} (Lead) manages ${e.reportees.length} engineer(s)`;
    case Designation.Manager:
      return `${e.name} (Manager) manages ${e.reportees.length} lead(s)`;
    case Designation.Director:
      return `${e.name} (Director) manages ${e.reportees.length} manager(s)`;
    case Designation.CEO:
      return `${e.name} (CEO) oversees ${e.reportees.length} director(s)`;
    default:
      return assertNever(e);
  }
}

// ============================================================
// FUNCTION TYPE EXPRESSION
// ============================================================
export type Validator<T> = (value: T) => ValidationResult;

// ============================================================
// CALL SIGNATURE — an object that is itself callable AND carries properties
// ============================================================
export interface DateValidatorFn {
  (raw: string): boolean;   // call signature
  description: string;      // functions are objects — they can have properties
}

export const isValidDate: DateValidatorFn = Object.assign(
  (raw: string): boolean => {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
    if (!match) return false;
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12) return false;
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day;
  },
  { description: "Validates mm/dd/yyyy formatted date strings" }
);

// ============================================================
// CONSTRUCT SIGNATURE — describes something invokable with `new`
// ============================================================
export interface Newable<T> {
  new (...args: any[]): T;
}
export function createInstance<T>(Ctor: Newable<T>, ...args: any[]): T {
  return new Ctor(...args);
}

// ============================================================
// VOID
// ============================================================
export function logValidation(context: string, result: ValidationResult): void {
  if (!result[0]) console.warn(`[${context}]`, result[1]);
}

// ============================================================
// FUNCTION OVERLOADS
// ============================================================
export function makeError(message: string): Error;
export function makeError(field: string, message: string): Error;
export function makeError(a: string, b?: string): Error {
  return b ? new Error(`${a}: ${b}`) : new Error(a);
}

// ============================================================
// GENERIC FUNCTIONS + INFERENCE (T is inferred from the `items` argument —
// callers never need to write findById<Employee>(...))
// ============================================================
export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

// GENERIC OBJECTS / GENERIC ARRAYS combined
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item); // nullish-coalescing assignment
  }
  return result;
}