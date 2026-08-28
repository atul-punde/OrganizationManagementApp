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
        <header className="app-header">
          <h1>Organization Management</h1>
          <p className="app-subtitle">Manage employees across your reporting hierarchy</p>
        </header>

        <div className="app-grid">
          <section className="panel panel--form">
            <EmployeeForm editingId={editingId} onDone={() => setEditingId(null)} />
            {editingId && (
              <button className="btn btn--ghost btn--full" onClick={() => setEditingId(null)}>
                Cancel Edit
              </button>
            )}
          </section>

          <section className="panel panel--list">
            <div className="panel-header">
              <h2>All Employees</h2>
            </div>
            <EmployeeList onEdit={setEditingId} />
          </section>

          <section className="panel panel--detail">
            <EmployeeDetail />
          </section>
        </div>
      </div>
    </OrgProvider>
  );
};

export default App;