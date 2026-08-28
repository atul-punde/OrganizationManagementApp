import React, { useState } from "react";
import { useOrg } from "../context/OrgContext";

const EmployeeDetail: React.FC = () => {
  const { getEmployee } = useOrg();
  const [searchId, setSearchId] = useState("");
  const result = searchId.trim() ? getEmployee(searchId.trim()) : null;

  return (
    <div className="employee-detail">
      <h3>Find Employee by ID</h3>
      <input
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="Enter employee id"
      />
      {result &&
        (result.success ? (
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        ) : (
          <p className="error">{result.errors[0]}</p>
        ))}
    </div>
  );
};

export default EmployeeDetail;