import { EmployeeRepository } from "../models/EmployeeRepository";
import { Employee, Designation, reportsToDesignationMap } from "../types/employee.types";
import { validateDateField, logValidation, makeError } from "../utils/typeGuards";

export type OrgResult<T = void> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export class OrgService {
  constructor(private readonly repo: EmployeeRepository) {}

  public getAllEmployees(): Employee[] {
    return this.repo.getAll();
  }

  public getEmployee(id: string): OrgResult<Employee> {
    const employee = this.repo.getById(id);
    return employee
      ? { success: true, data: employee }
      : { success: false, errors: [makeError("id", `No employee found with id "${id}"`).message] };
  }

  private validateHierarchy(employee: Employee): string[] {
    const errors: string[] = [];

    if (employee.designation === Designation.CEO) {
      if (employee.reportsTo !== null) errors.push(makeError("reportsTo", "CEO must not report to anyone").message);
      return errors;
    }

    if (!employee.reportsTo?.trim()) {
      errors.push(makeError("reportsTo is required for non-CEO employees").message);
      return errors;
    }

    // Uses EmployeeRepository.toDirectory() (Index Signature) instead of a
    // single getById lookup
    const directory = this.repo.toDirectory();
    const manager = directory[employee.reportsTo];
    if (!manager) {
      errors.push(
        makeError("reportsTo", `references a non-existent employee id "${employee.reportsTo}"`).message
      );
      return errors;
    }

    const expected = reportsToDesignationMap[employee.designation];
    if (manager.designation !== expected) {
      errors.push(
        makeError(
          `A ${employee.designation} must report to a ${expected}, but "${manager.name}" is a ${manager.designation}`
        ).message
      );
    }
    return errors;
  }

  public addEmployee(employee: Employee): OrgResult {
    const errors: string[] = [];
    const [dobValid, dobErrors] = validateDateField(employee.dateOfBirth);
    if (!dobValid) errors.push(...dobErrors);
    errors.push(...this.validateHierarchy(employee));

    logValidation("addEmployee", [errors.length === 0, errors]);
    if (errors.length > 0) return { success: false, errors };

    const [saved, repoErrors] = this.repo.add(employee);
    if (!saved) return { success: false, errors: repoErrors };

    if (employee.designation !== Designation.CEO) {
      this.linkReportee(employee.reportsTo, employee.id);
    }
    return { success: true, data: undefined };
  }

  public updateEmployee(id: string, patch: Partial<Employee>): OrgResult {
    const existing = this.repo.getById(id);
    if (!existing) return { success: false, errors: [makeError("id", `No employee found with id "${id}"`).message] };

    if (patch.dateOfBirth) {
      const [dobValid, dobErrors] = validateDateField(patch.dateOfBirth);
      if (!dobValid) return { success: false, errors: dobErrors };
    }

    const merged = { ...existing, ...patch, id: existing.id } as Employee;
    const hierarchyErrors = this.validateHierarchy(merged);
    logValidation("updateEmployee", [hierarchyErrors.length === 0, hierarchyErrors]);
    if (hierarchyErrors.length > 0) return { success: false, errors: hierarchyErrors };

    const [ok, errors] = this.repo.update(id, merged);
    if (!ok) return { success: false, errors };

    if ("reportsTo" in patch && patch.reportsTo !== existing.reportsTo) {
      this.unlinkReportee(existing.reportsTo, id);
      if (merged.reportsTo) this.linkReportee(merged.reportsTo, id);
    }
    return { success: true, data: undefined };
  }

  public deleteEmployee(id: string): OrgResult {
    const existing = this.repo.getById(id);
    if (!existing) return { success: false, errors: [makeError("id", `No employee found with id "${id}"`).message] };

    const [ok, errors] = this.repo.remove(id);
    if (!ok) return { success: false, errors };

    this.unlinkReportee(existing.reportsTo, id);
    return { success: true, data: undefined };
  }

  private linkReportee(managerId: string, reporteeId: string): void {
    const manager = this.repo.getById(managerId);
    if (!manager) return;
    const updatedReportees = [...manager.reportees, reporteeId];
    this.repo.update(managerId, { reportees: updatedReportees } as Partial<Employee>);
  }

  private unlinkReportee(managerId: string | null, reporteeId: string): void {
    if (!managerId) return;
    const manager = this.repo.getById(managerId);
    if (!manager) return;
    this.repo.update(managerId, {
      reportees: manager.reportees.filter((rid) => rid !== reporteeId),
    } as Partial<Employee>);
  }
}