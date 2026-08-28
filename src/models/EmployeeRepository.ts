import { Employee, EmployeeDirectory, Designation } from "../types/employee.types";

// ============================================================
// DECORATOR — logs every call made to a repository method
// ============================================================
function LogOperation(_target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const original = descriptor.value;
  descriptor.value = function (this: unknown, ...args: unknown[]): [boolean, string[]] {
    console.log(`[EmployeeRepository] ${propertyKey}(${args.map((a) => JSON.stringify(a)).join(", ")})`);
    return original.apply(this, args);
  };
  return descriptor;
}

// ============================================================
// ABSTRACT CLASS + GENERIC CLASS
// ============================================================
export abstract class BaseRepository<T extends { id: string }> {
  #store: Map<string, T> = new Map(); // JS PRIVATE FIELD — true encapsulation, not just a TS `private`

  // CONSTRUCTOR + PARAMETER PROPERTY (protected + readonly, declared and assigned in one place)
  protected constructor(protected readonly entityName: string) {}

  public getAll(): T[] {
    return Array.from(this.#store.values());
  }

  public getById(id: string): T | undefined {
    return this.#store.get(id);
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

  // ABSTRACT METHOD — every concrete repository must supply its own validation
  public abstract validate(entity: T): [boolean, string[]];
}

// ============================================================
// INTERFACE contract for `implements`
// ============================================================
export interface CrudOperations<T> {
  add(entity: T): [boolean, string[]];
  update(id: string, patch: Partial<T>): [boolean, string[]];
  remove(id: string): [boolean, string[]];
}

// ============================================================
// EXTENDS + IMPLEMENTS
// ============================================================
export class EmployeeRepository extends BaseRepository<Employee> implements CrudOperations<Employee> {
  // CONSTRUCTOR OVERLOADS
  constructor();
  constructor(seed: Employee[]);
  constructor(seed?: Employee[]) {
    super("Employee");
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
    const updated = { ...existing, ...patch, id: existing.id } as Employee; // type assertion
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

  public toDirectory(): EmployeeDirectory {
    return this.getAll().reduce<EmployeeDirectory>((acc, e) => {
      acc[e.id] = e;
      return acc;
    }, {});
  }
}