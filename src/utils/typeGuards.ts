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
// NEVER — exhaustiveness guard.
// ============================================================
export function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

// ============================================================
// TYPE NARROWING via discriminated union (user-defined type guards)
// Used in EmployeeDetail.tsx for role-specific rendering.
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

// Used in EmployeeDetail.tsx to render a human-readable summary line.
export function describeEmployee(e: Employee): string {
  switch (e.designation) {
    case Designation.Engineer:
      return `${e.name} is an Engineer reporting to ${e.reportsTo}`;
    case Designation.Lead:
      return `${e.name} is a Lead managing ${e.reportees.length} engineer(s)`;
    case Designation.Manager:
      return `${e.name} is a Manager managing ${e.reportees.length} lead(s)`;
    case Designation.Director:
      return `${e.name} is a Director managing ${e.reportees.length} manager(s)`;
    case Designation.CEO:
      return `${e.name} is the CEO overseeing ${e.reportees.length} director(s)`;
    default:
      return assertNever(e);
  }
}

// ============================================================
// FUNCTION TYPE EXPRESSION — used to type the dateOfBirth validator
// ============================================================
export type Validator<T> = (value: T) => ValidationResult;

export const validateDateField: Validator<string> = (value) => {
  const isValid = isValidDate(value);
  return [isValid, isValid ? [] : ["dateOfBirth must be in mm/dd/yyyy format"]];
};

// ============================================================
// CALL SIGNATURE — callable object that also carries a property
// ============================================================
export interface DateValidatorFn {
  (raw: string): boolean;
  description: string;
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
// VOID — used by OrgService to log rejected operations
// ============================================================
export function logValidation(context: string, result: ValidationResult): void {
  if (!result[0]) console.warn(`[${context}]`, result[1]);
}

// ============================================================
// FUNCTION OVERLOADS — used by OrgService to build field-specific
// or generic errors
// ============================================================
export function makeError(message: string): Error;
export function makeError(field: string, message: string): Error;
export function makeError(a: string, b?: string): Error {
  return b ? new Error(`${a}: ${b}`) : new Error(a);
}

// ============================================================
// GENERIC FUNCTIONS + INFERENCE — used by EmployeeRepository lookups
// ============================================================
export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}