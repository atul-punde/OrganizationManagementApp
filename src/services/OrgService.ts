import { EmployeeRepository } from "../models/EmployeeRepository";
import { Employee, Designation, reportsToDesignationMap } from "../types/employee.types";
import { isValidDate } from "../utils/typeGuards";

// Discriminated union result type used across the whole service layer
export type OrgResult<T = void> =
  | { success: true; data: T }
  | { success: false; errors: string[] };

export class OrgService {
  constructor(private readonly repo: EmployeeRepository) {} // private parameter property

  public getAllEmployees(): Employee[] {
    return this.repo.getAll();
  }

  public getEmployee(id: string): OrgResult<Employee> {
    const employee = this.repo.getById(id);
    return employee
      ? { success: true, data: employee }
      : { success: false, errors: [`No employee found with id "${id}"`] };
  }

  private validateHierarchy(employee: Employee): string[] {
    const errors: string[] = [];

    if (employee.designation === Designation.CEO) {
      if (employee.reportsTo !== null) errors.push("CEO must not report to anyone");
      return errors;
    }

    if (!employee.reportsTo?.trim()) {
      errors.push("reportsTo is required for non-CEO employees");
      return errors;
    }

    const manager = this.repo.getById(employee.reportsTo);
    if (!manager) {
      errors.push(`reportsTo references a non-existent employee id "${employee.reportsTo}"`);
      return errors;
    }

    const expected = reportsToDesignationMap[employee.designation];
    if (manager.designation !== expected) {
      errors.push(
        `A ${employee.designation} must report to a ${expected}, but "${manager.name}" is a ${manager.designation}`
      );
    }
    return errors;
  }

  public addEmployee(employee: Employee): OrgResult {
    const errors: string[] = [];
    if (!isValidDate(employee.dateOfBirth)) errors.push("dateOfBirth must be in mm/dd/yyyy format");
    errors.push(...this.validateHierarchy(employee));
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
    if (!existing) return { success: false, errors: [`No employee found with id "${id}"`] };

    if (patch.dateOfBirth && !isValidDate(patch.dateOfBirth)) {
      return { success: false, errors: ["dateOfBirth must be in mm/dd/yyyy format"] };
    }

    const merged = { ...existing, ...patch, id: existing.id } as Employee;
    const hierarchyErrors = this.validateHierarchy(merged);
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
    if (!existing) return { success: false, errors: [`No employee found with id "${id}"`] };

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