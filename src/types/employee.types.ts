// ============================================================
// LITERAL TYPES
// ============================================================
export type YesNo = "yes" | "no";            // string literal union
type MaxHierarchyDepth = 5;                    // numeric literal type
type IsActiveDefault = true;                   // boolean literal type

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
// Loosely enforces an "mm/dd/yyyy"-shaped string at the type level.
export type DateOfBirth = `${number}/${number}/${number}`;

// ============================================================
// OBJECTS / INTERFACE (base object shape)
// ============================================================
export interface BaseEmployee {
  readonly id: string;          // readonly field
  name: string;
  dateOfBirth: DateOfBirth;
}

// ============================================================
// DISCRIMINATED UNION MEMBERS
// Each variant pins `designation` to a single literal (the "discriminant"),
// and gives reportsTo / reportees the correct shape for that role.
// ============================================================
export interface EngineerEmployee extends BaseEmployee {
  designation: Designation.Engineer;
  reportsTo: string;      // id of the Lead
  reportees: [];           // TUPLE TYPE: fixed-length empty tuple — engineers can NEVER have reportees
}

export interface LeadEmployee extends BaseEmployee {
  designation: Designation.Lead;
  reportsTo: string;       // id of the Manager
  reportees: string[];     // ARRAY TYPE: unbounded list of engineer ids
}

export interface ManagerEmployee extends BaseEmployee {
  designation: Designation.Manager;
  reportsTo: string;       // id of the Director
  reportees: string[];     // list of lead ids
}

export interface DirectorEmployee extends BaseEmployee {
  designation: Designation.Director;
  reportsTo: string;       // id of the CEO
  reportees: string[];     // list of manager ids
}

export interface CEOEmployee extends BaseEmployee {
  designation: Designation.CEO;
  reportsTo: null;         // CEO reports to no one
  reportees: string[];     // list of director ids
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
// TYPE ALIAS vs INTERFACE
// - `BaseEmployee` above is an INTERFACE: can be `extends`-ed by other
//   interfaces/classes, and could later be re-opened via declaration merging.
// - `EmployeeId` below is a TYPE ALIAS: it can name a primitive/union/tuple,
//   which an interface cannot do, but it can't be re-opened later.
// ============================================================
export type EmployeeId = string;

// ============================================================
// INTERSECTION TYPE
// ============================================================
export interface AuditMeta {
  createdAt: string;
  updatedAt: string;
}
export type EmployeeWithAudit = Employee & AuditMeta;

// ============================================================
// TUPLE TYPE (labeled) vs ARRAY TYPE
// ============================================================
export type ValidationResult = [isValid: boolean, errors: string[]]; // tuple: fixed shape, 2 slots
export type EmployeeIdList = string[];                                // array: unbounded, same-type elements

// ============================================================
// keyof / typeof / satisfies (TYPE OPERATORS)
// ============================================================
// Maps each designation to the designation of the person they must report to.
export const reportsToDesignationMap = {
  [Designation.Engineer]: Designation.Lead,
  [Designation.Lead]: Designation.Manager,
  [Designation.Manager]: Designation.Director,
  [Designation.Director]: Designation.CEO,
  [Designation.CEO]: null,
} satisfies Record<Designation, Designation | null>; // `satisfies` checks the shape WITHOUT widening the literal types

export type ReportsToDesignationMap = typeof reportsToDesignationMap; // typeof
export type DesignationKeys = keyof ReportsToDesignationMap;          // keyof

// ============================================================
// UTILITY TYPES
// ============================================================
export type EmployeeSummary = Pick<BaseEmployee, "id" | "name">;               // Pick
export type EmployeeWithoutReportees = Omit<Employee, "reportees">;            // Omit
export type PartialEmployeeUpdate = Partial<Omit<BaseEmployee, "id">> & {
  designation?: Designation;
};
export type RequiredEmployeeUpdate = Required<PartialEmployeeUpdate>;          // Required
export type ReadonlyEmployee = Readonly<Employee>;                             // Readonly
export type EmployeesById = Record<EmployeeId, Employee>;                      // Record<Keys, Type>

// ============================================================
// INDEX SIGNATURE
// ============================================================
export interface EmployeeDirectory {
  [employeeId: string]: Employee;
}