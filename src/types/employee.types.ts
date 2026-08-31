// ============================================================
// ENUM
// ============================================================
export enum Designation {
  Engineer = "Engineer",
  Lead = "Lead",
  Manager = "Manager",
  Director = "Director",
  CEO = "CEO",
}

// ============================================================
// TEMPLATE LITERAL TYPE
// ============================================================
export type DateOfBirth = `${number}/${number}/${number}`;

// ============================================================
// OBJECTS / INTERFACE (base object shape)
// ============================================================
export interface BaseEmployee {
  readonly id: string;
  name: string;
  dateOfBirth: DateOfBirth;
}

// ============================================================
// DISCRIMINATED UNION MEMBERS
// ============================================================
export interface EngineerEmployee extends BaseEmployee {
  designation: Designation.Engineer;
  reportsTo: string;
  reportees: [];
}

export interface LeadEmployee extends BaseEmployee {
  designation: Designation.Lead;
  reportsTo: string;
  reportees: string[];
}

export interface ManagerEmployee extends BaseEmployee {
  designation: Designation.Manager;
  reportsTo: string;
  reportees: string[];
}

export interface DirectorEmployee extends BaseEmployee {
  designation: Designation.Director;
  reportsTo: string;
  reportees: string[];
}

export interface CEOEmployee extends BaseEmployee {
  designation: Designation.CEO;
  reportsTo: null;
  reportees: string[];
}

// ============================================================
// UNION TYPE + DISCRIMINATED UNION
// ============================================================
export type Employee =
  | EngineerEmployee
  | LeadEmployee
  | ManagerEmployee
  | DirectorEmployee
  | CEOEmployee;

// ============================================================
// INTERSECTION TYPE demo retained via ValidationResult tuple below —
// TUPLE TYPE (labeled) vs ARRAY TYPE
// ============================================================
export type ValidationResult = [isValid: boolean, errors: string[]];

// ============================================================
// keyof / typeof / satisfies — still exercised here even without a
// standalone derived type alias
// ============================================================
export const reportsToDesignationMap = {
  [Designation.Engineer]: Designation.Lead,
  [Designation.Lead]: Designation.Manager,
  [Designation.Manager]: Designation.Director,
  [Designation.Director]: Designation.CEO,
  [Designation.CEO]: null,
} satisfies Record<Designation, Designation | null>;

// ============================================================
// UTILITY TYPES — kept only where a real consumer exists
// ============================================================
export type ReadonlyEmployee = Readonly<Employee>;                 // used in EmployeeDetail

// ============================================================
// INDEX SIGNATURE — used by EmployeeRepository.toDirectory()
// and OrgService.validateHierarchy()
// ============================================================
export interface EmployeeDirectory {
  [employeeId: string]: Employee;
}