import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import EmployeeList from '../pages/employees/EmployeeList';
import EmployeeForm from '../pages/employees/EmployeeForm';
import EmployeeView from '../pages/employees/EmployeeView';
import TaskList from '../pages/tasks/TaskList';
import TaskForm from '../pages/tasks/TaskForm';
import TaskView from '../pages/tasks/TaskView';

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-black text-gray-200">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mt-2">Page Not Found</h2>
      <p className="text-gray-500 text-sm mt-1 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Employees */}
      <Route path="/employees" element={<EmployeeList />} />
      <Route path="/employees/new" element={<EmployeeForm />} />
      <Route path="/employees/:id" element={<EmployeeView />} />
      <Route path="/employees/:id/edit" element={<EmployeeForm />} />

      {/* Tasks */}
      <Route path="/tasks" element={<TaskList />} />
      <Route path="/tasks/new" element={<TaskForm />} />
      <Route path="/tasks/:id" element={<TaskView />} />
      <Route path="/tasks/:id/edit" element={<TaskForm />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
