import React, { useState } from "react";
import { useOrg } from "../context/OrgContext";
import { describeEmployee, isCEO, isEngineer } from "../utils/typeGuards";
import { ReadonlyEmployee } from "../types/employee.types";

const EmployeeDetail: React.FC = () => {
  const { getEmployee } = useOrg();
  const [searchId, setSearchId] = useState("");
  const result = searchId.trim() ? getEmployee(searchId.trim()) : null;

  return (
    <div className="employee-detail">
      <h2>Find Employee by ID</h2>
      <input
        className="detail-search"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="Enter employee id"
      />
      {result &&
        (result.success ? (
          (() => {
            // Typed as ReadonlyEmployee (Readonly<Employee>) — this view is
            // purely for display, so the type signals no mutation is intended
            const employee: ReadonlyEmployee = result.data;
            return (
              <>
                <p className="detail-summary">
                  {describeEmployee(employee)}
                  {isCEO(employee) && <span className="pill pill--ceo detail-tag">Top of hierarchy</span>}
                  {isEngineer(employee) && (
                    <span className="pill pill--engineer detail-tag">Individual contributor</span>
                  )}
                </p>
                <pre className="detail-result">{JSON.stringify(employee, null, 2)}</pre>
              </>
            );
          })()
        ) : (
          <p className="error-list">{result.errors[0]}</p>
        ))}
    </div>
  );
};

export default EmployeeDetail;