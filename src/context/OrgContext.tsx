import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EmployeeRepository } from "../models/EmployeeRepository";
import { OrgService, OrgResult } from "../services/OrgService";
import { Employee } from "../types/employee.types";

interface OrgContextValue {
  employees: Employee[];
  addEmployee: (e: Employee) => OrgResult;
  updateEmployee: (id: string, patch: Partial<Employee>) => OrgResult;
  deleteEmployee: (id: string) => OrgResult;
  getEmployee: (id: string) => OrgResult<Employee>;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

const repo = new EmployeeRepository();
const service = new OrgService(repo);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => service.getAllEmployees());
  const refresh = useCallback(() => setEmployees(service.getAllEmployees()), []);

  const addEmployee = useCallback(
    (e: Employee): OrgResult => {
      const result = service.addEmployee(e);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const updateEmployee = useCallback(
    (id: string, patch: Partial<Employee>): OrgResult => {
      const result = service.updateEmployee(id, patch);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const deleteEmployee = useCallback(
    (id: string): OrgResult => {
      const result = service.deleteEmployee(id);
      if (result.success) refresh();
      return result;
    },
    [refresh]
  );

  const getEmployee = useCallback((id: string): OrgResult<Employee> => service.getEmployee(id), []);

  const value = useMemo<OrgContextValue>(
    () => ({ employees, addEmployee, updateEmployee, deleteEmployee, getEmployee }),
    [employees, addEmployee, updateEmployee, deleteEmployee, getEmployee]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within an OrgProvider");
  return ctx;
}