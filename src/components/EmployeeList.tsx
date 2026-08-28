import React from "react";
import { useOrg } from "../context/OrgContext";
import { Employee, Designation } from "../types/employee.types";

interface EmployeeListProps {
  onEdit: (id: string) => void;
}

const designationClass: Record<Designation, string> = {
  [Designation.Engineer]: "pill--engineer",
  [Designation.Lead]: "pill--lead",
  [Designation.Manager]: "pill--manager",
  [Designation.Director]: "pill--director",
  [Designation.CEO]: "pill--ceo",
};

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit }) => {
  const { employees, deleteEmployee } = useOrg();

  const handleDelete = (id: string): void => {
    const result = deleteEmployee(id);
    if (!result.success) alert(result.errors.join("\n"));
  };

  if (employees.length === 0) {
    return <p className="empty-state">No employees yet. Add the CEO first.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>DOB</th>
            <th>Designation</th>
            <th>Reports To</th>
            <th>Reportees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e: Employee) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.name}</td>
              <td>{e.dateOfBirth}</td>
              <td>
                <span className={`pill ${designationClass[e.designation]}`}>{e.designation}</span>
              </td>
              <td>{e.reportsTo ?? "—"}</td>
              <td>{e.reportees.length > 0 ? e.reportees.join(", ") : "—"}</td>
              <td className="actions-cell">
                <button className="btn btn--ghost" onClick={() => onEdit(e.id)}>
                  Edit
                </button>
                <button className="btn btn--danger" onClick={() => handleDelete(e.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;