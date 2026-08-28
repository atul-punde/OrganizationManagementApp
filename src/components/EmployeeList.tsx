import React from "react";
import { useOrg } from "../context/OrgContext";
import { Employee } from "../types/employee.types";

interface EmployeeListProps {
  onEdit: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit }) => {
  const { employees, deleteEmployee } = useOrg();

  const handleDelete = (id: string): void => {
    const result = deleteEmployee(id);
    if (!result.success) alert(result.errors.join("\n"));
  };

  if (employees.length === 0) {
    return <p>No employees yet. Add the CEO first.</p>;
  }

  return (
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
            <td>{e.designation}</td>
            <td>{e.reportsTo ?? "—"}</td>
            <td>{e.reportees.length > 0 ? e.reportees.join(", ") : "—"}</td>
            <td>
              <button onClick={() => onEdit(e.id)}>Edit</button>
              <button onClick={() => handleDelete(e.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeList;