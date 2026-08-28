# Organization Management App

A full-featured **React + TypeScript + Vite** single-page application (SPA) for managing employees and organizational hierarchies. Built with a clean architecture using React Context, discriminated union types, and strict type safety to enforce organizational reporting structures.

## Features

- **Employee Management**: Add, update, and delete employees with role-based organization
- **Hierarchical Structure**: Enforce strict reporting relationships (CEO → Director → Manager → Lead → Engineer)
- **Role-Based Validation**: Automatically validate that employees report to the correct designation level
- **Real-Time State Management**: React Context API with persistent in-memory storage
- **Form Validation**: Comprehensive error handling and validation for all employee operations
- **Employee Details**: View detailed information and reporting relationships for any employee

## Stack

- **Language**: TypeScript 6.x with strict mode enabled
- **Framework**: React 19.2 with React DOM for UI rendering
- **Build Tool**: Vite 8.2 with HMR (Hot Module Replacement)
- **Tooling**: ESLint with TypeScript support for code quality

## Architecture

```
src/
  components/      React UI components
    ├── EmployeeForm.tsx          Form for adding/editing employees
    ├── EmployeeList.tsx          Display all employees with edit/delete actions
    └── EmployeeDetail.tsx        Show details for selected employee
  
  context/         React Context API for state management
    └── OrgContext.tsx            Global org state and CRUD operations
  
  services/        Business logic layer
    └── OrgService.ts             Validation and hierarchy enforcement
  
  models/          Data persistence layer
    └── EmployeeRepository.ts     In-memory storage with CRUD operations
  
  types/           TypeScript type definitions
    └── employee.types.ts         Employee models using discriminated unions
  
  utils/           Helper functions
    └── typeGuards.ts             Type guards and validation utilities
  
  App.tsx                          Main app component
  main.tsx                         React entry point
  App.css                          Styling
```

## How It Works

1. **OrgContext** (at app root) provides global state via React Context
2. **EmployeeRepository** manages in-memory storage via a Map-based data structure
3. **OrgService** enforces business rules: hierarchy validation, reporting constraints, and date formatting
4. **React Components** dispatch CRUD operations through the context, which flow through the service layer
5. **Type System** uses discriminated unions to guarantee type-safe reporting relationships at compile time

### Type-Safe Hierarchy

The `Employee` type is a discriminated union that ensures:
- **CEO** reports to no one (`reportsTo: null`, `reportees: []`)
- **Director** reports to CEO, manages managers
- **Manager** reports to director, manages leads
- **Lead** reports to manager, manages engineers
- **Engineer** reports to lead, has no reportees (fixed-length empty tuple)

## Running Locally

### Prerequisites
- Node.js 18+ with npm

### Installation & Development

```bash
# Install dependencies
npm install

# Start the development server (with HMR)
npm run dev

# Visit http://localhost:5173
```

### Production Build

```bash
npm run build        # Compile TypeScript and bundle with Vite
npm run preview      # Preview the production build locally
```

### Linting

```bash
npm run lint         # Check code with ESLint
```

## Key Technologies & Patterns

### TypeScript Features Demonstrated
- **Discriminated Unions**: Employee type variants enforce role-specific rules
- **Literal Types**: Designation enum ensures compile-time type safety
- **Template Literal Types**: `DateOfBirth = "${number}/${number}/${number}"` loosely enforces date format
- **Readonly Fields**: `id` is immutable to prevent accidental mutations
- **Utility Types**: `Pick`, `Omit`, `Partial`, `Readonly`, `Record`
- **Type Guards**: Custom validation functions for date and type checking

### React Patterns
- **Context API**: Global state management without Redux/Zustand
- **Hooks**: `useState`, `useContext`, `useCallback`, `useEffect`, `useMemo`
- **Provider Pattern**: `OrgProvider` wraps the app with organizational state

### Architecture Patterns
- **Repository Pattern**: `EmployeeRepository` abstracts data storage
- **Service Layer**: `OrgService` contains business logic and validation
- **Dependency Injection**: Services are injected into context
- **Decorators**: `@LogOperation` decorator logs all repository operations
- **Abstract Base Classes**: `BaseRepository<T>` provides reusable CRUD operations

## File Organization

| Directory | Purpose |
|-----------|---------|
| `src/components/` | React components for UI rendering |
| `src/context/` | React Context setup and hooks |
| `src/services/` | Business logic (validation, hierarchy rules) |
| `src/models/` | Data layer (in-memory storage) |
| `src/types/` | TypeScript type definitions |
| `src/utils/` | Helper functions and type guards |

## Browser Support

Works in all modern browsers supporting ES2020+. Built with Vite, which includes automatic polyfills as needed.

## License

Not specified. Please see LICENSE file if present.

## Development Notes

- **State Persistence**: Currently stores data in-memory only. To persist across sessions, connect to a backend API.
- **Validation**: All hierarchy validation happens in `OrgService.validateHierarchy()`. Extend this method to add custom business rules.
- **Type Safety**: The discriminated union approach ensures invalid organizational structures are impossible to represent in TypeScript.
- **Performance**: Uses `useCallback` and `useMemo` to prevent unnecessary re-renders.

## Try These

- Add a CEO, then a Director, Manager, Lead, and Engineer to build a hierarchy
- Try to create a hierarchy violation (e.g., Engineer reporting to Manager) — the service will reject it
- Edit an employee's designation — the form will dynamically update the "Reports To" field based on role
- Delete an employee with reportees — the app will prevent deletion and ask you to reassign them first
