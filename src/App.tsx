import React, { useState } from "react";
import { OrgProvider } from "./context/OrgContext";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import EmployeeDetail from "./components/EmployeeDetail";
import "./App.css";

const App: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <OrgProvider>
      <div className="app">
        <h1>Organization Management</h1>

        <section>
          <h2>{editingId ? `Edit Employee: ${editingId}` : "Add Employee"}</h2>
          <EmployeeForm editingId={editingId} onDone={() => setEditingId(null)} />
          {editingId && <button onClick={() => setEditingId(null)}>Cancel Edit</button>}
        </section>

        <section>
          <h2>All Employees</h2>
          <EmployeeList onEdit={setEditingId} />
        </section>

        <section>
          <EmployeeDetail />
        </section>
      </div>
    </OrgProvider>
  );
};

export default App;