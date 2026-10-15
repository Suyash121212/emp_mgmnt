import React from 'react';
import { getStatusColor, getEmployeeStatusColor } from '../../utils/helpers';

export default function StatusBadge({ status, type = 'task' }) {
  if (!status) return <span className="text-gray-400 text-sm">-</span>;

  const style = type === 'employee' 
    ? getEmployeeStatusColor(status) 
    : getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        style.badge || 'bg-gray-100 text-gray-700 border-gray-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          style.dot || 'bg-gray-400'
        }`}
      />
      {status}
    </span>
  );
}
