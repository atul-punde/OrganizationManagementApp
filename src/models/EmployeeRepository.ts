import { Employee, EmployeeDirectory, Designation } from "../types/employee.types";
import { findById } from "../utils/typeGuards";

function LogOperation(_target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (this: unknown, ...args: unknown[]): [boolean, string[]] {
    console.log(`[EmployeeRepository] ${propertyKey}(${args.map((a) => JSON.stringify(a)).join(", ")})`);
    return original.apply(this, args);
  };
  return descriptor;
}

export abstract class BaseRepository<T extends { id: string }> {
  #store: Map<string, T> = new Map();

  protected constructor() {}

  public getAll(): T[] {
    return Array.from(this.#store.values());
  }

  public getById(id: string): T | undefined {
    return findById(this.getAll(), id);
  }

  protected save(entity: T): void {
    this.#store.set(entity.id, entity);
  }

  protected removeById(id: string): boolean {
    return this.#store.delete(id);
  }

  public has(id: string): boolean {
    return this.#store.has(id);
  }

  public abstract validate(entity: T): [boolean, string[]];
}

export interface CrudOperations<T> {
  add(entity: T): [boolean, string[]];
  update(id: string, patch: Partial<T>): [boolean, string[]];
  remove(id: string): [boolean, string[]];
}

export class EmployeeRepository extends BaseRepository<Employee> implements CrudOperations<Employee> {
  constructor();
  constructor(seed: Employee[]);
  constructor(seed?: Employee[]) {
    super();
    seed?.forEach((e) => this.save(e));
  }

  public validate(entity: Employee): [boolean, string[]] {
    const errors: string[] = [];
    if (!entity.id?.trim()) errors.push("id is required");
    if (!entity.name?.trim()) errors.push("name is required");
    if (!entity.dateOfBirth) errors.push("dateOfBirth is required");
    return [errors.length === 0, errors];
  }

  @LogOperation
  public add(entity: Employee): [boolean, string[]] {
    const [isValid, errors] = this.validate(entity);
    if (!isValid) return [false, errors];
    if (this.has(entity.id)) return [false, [`Employee with id "${entity.id}" already exists`]];
    if (
      entity.designation === Designation.CEO &&
      this.getAll().some((e) => e.designation === Designation.CEO)
    ) {
      return [false, ["Only one CEO is allowed in the organization"]];
    }
    this.save(entity);
    return [true, []];
  }

  @LogOperation
  public update(id: string, patch: Partial<Employee>): [boolean, string[]] {
    const existing = this.getById(id);
    if (!existing) return [false, [`Employee with id "${id}" does not exist`]];
    const updated = { ...existing, ...patch, id: existing.id } as Employee;
    const [isValid, errors] = this.validate(updated);
    if (!isValid) return [false, errors];
    this.save(updated);
    return [true, []];
  }

  @LogOperation
  public remove(id: string): [boolean, string[]] {
    const existing = this.getById(id);
    if (!existing) return [false, [`Employee with id "${id}" does not exist`]];
    if (existing.reportees.length > 0) {
      return [
        false,
        [`Cannot delete "${existing.name}" — reassign ${existing.reportees.length} reportee(s) first`],
      ];
    }
    this.removeById(id);
    return [true, []];
  }

  // Now consumed by OrgService.validateHierarchy() for reportsTo lookups
  public toDirectory(): EmployeeDirectory {
    return this.getAll().reduce<EmployeeDirectory>((acc, e) => {
      acc[e.id] = e;
      return acc;
    }, {});
  }
}