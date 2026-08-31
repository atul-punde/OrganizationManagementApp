/**
 * ============================================================
 * REFERENCE FILE — NOT USED BY THE APPLICATION
 * ============================================================
 * These snippets demonstrate TypeScript concepts (any/unknown boundary
 * handling, construct signatures, generic grouping) that don't have a
 * natural call site in this app's current feature set. Kept here for
 * concept-coverage reference rather than left as dead code inside real
 * app files. Nothing here is imported by App.tsx, components, services,
 * or models.
 */

import { Employee } from "../types/employee.types";

// ============================================================
// TOP TYPES: any / unknown
// Would be used at an untyped boundary, e.g. parsing employee data
// imported from a JSON file or localStorage.
// ============================================================
export function legacyParse(raw: any): unknown {
  return raw;
}

export function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// ============================================================
// TYPE ASSERTION — trusting a value's shape after external parsing
// ============================================================
export function toEmployeeUnsafe(value: unknown): Employee {
  return value as Employee;
}

// ============================================================
// CONSTRUCT SIGNATURE — describes something invokable with `new`.
// Would be used for a factory that dynamically instantiates a class
// based on config (not needed since Employee is a plain object union,
// not a class hierarchy).
// ============================================================
export interface Newable<T> {
  new (...args: any[]): T;
}

export function createInstance<T>(Ctor: Newable<T>, ...args: any[]): T {
  return new Ctor(...args);
}

// ============================================================
// GENERIC OBJECTS / GENERIC ARRAYS — generic grouping utility.
// Would be used for a "group employees by designation" view; no such
// view currently exists in the app.
// ============================================================
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}