import React, { useEffect, useState } from "react";
import { useOrg } from "../context/OrgContext";
import { Designation, Employee, DateOfBirth, reportsToDesignationMap } from "../types/employee.types";
import { assertNever } from "../utils/typeGuards";

interface EmployeeFormProps {
  editingId?: string | null;
  onDone: () => void;
}

type FormState = {
  id: string;
  name: string;
  dateOfBirth: string;
  designation: Designation;
  reportsTo: string;
};

const emptyForm: FormState = {
  id: "",
  name: "",
  dateOfBirth: "",
  designation: Designation.Engineer,
  reportsTo: "",
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({ editingId, onDone }) => {
  const { getEmployee, addEmployee, updateEmployee } = useOrg();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!editingId) {
      setForm(emptyForm);
      return;
    }
    const result = getEmployee(editingId);
    if (result.success) {
      const e = result.data;
      setForm({
        id: e.id,
        name: e.name,
        dateOfBirth: e.dateOfBirth,
        designation: e.designation,
        reportsTo: e.designation === Designation.CEO ? "" : e.reportsTo,
      });
    }
  }, [editingId, getEmployee]);

  const handleChange =
    (field: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: ev.target.value }));
    };

  // Builds a brand-new Employee (always starts with empty reportees)
  const buildNewEmployee = (): Employee => {
    const base = {
      id: form.id.trim(),
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth as DateOfBirth,
    };
    switch (form.designation) {
      case Designation.CEO:
        return { ...base, designation: Designation.CEO, reportsTo: null, reportees: [] };
      case Designation.Engineer:
        return { ...base, designation: Designation.Engineer, reportsTo: form.reportsTo.trim(), reportees: [] };
      case Designation.Lead:
        return { ...base, designation: Designation.Lead, reportsTo: form.reportsTo.trim(), reportees: [] };
      case Designation.Manager:
        return { ...base, designation: Designation.Manager, reportsTo: form.reportsTo.trim(), reportees: [] };
      case Designation.Director:
        return { ...base, designation: Designation.Director, reportsTo: form.reportsTo.trim(), reportees: [] };
      default:
        return assertNever(form.designation);
    }
  };

  // Builds a patch for an existing employee — reportees are never touched here,
  // they're maintained internally by OrgService.
  const buildPatch = (): Partial<Employee> => {
    const patch = {
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth as DateOfBirth,
      designation: form.designation,
      reportsTo: form.designation === Designation.CEO ? null : form.reportsTo.trim(),
    };
    return patch as unknown as Partial<Employee>;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const result = editingId ? updateEmployee(editingId, buildPatch()) : addEmployee(buildNewEmployee());
    if (result.success) {
      setErrors([]);
      setForm(emptyForm);
      onDone();
    } else {
      setErrors(result.errors);
    }
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <label>
        ID
        <input value={form.id} onChange={handleChange("id")} disabled={!!editingId} required />
      </label>
      <label>
        Name
        <input value={form.name} onChange={handleChange("name")} required />
      </label>
      <label>
        Date of Birth (mm/dd/yyyy)
        <input
          value={form.dateOfBirth}
          onChange={handleChange("dateOfBirth")}
          placeholder="01/31/1995"
          required
        />
      </label>
      <label>
        Designation
        <select value={form.designation} onChange={handleChange("designation")}>
          {Object.values(Designation).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      {form.designation !== Designation.CEO && (
        <label>
          Reports To (must be a {reportsToDesignationMap[form.designation]})
          <input value={form.reportsTo} onChange={handleChange("reportsTo")} required />
        </label>
      )}

      <button type="submit">{editingId ? "Update" : "Add"} Employee</button>

      {errors.length > 0 && (
        <ul className="error">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
    </form>
  );
};

export default EmployeeForm;