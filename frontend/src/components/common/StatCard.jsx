import React from 'react';

const colorStyles = {
  blue: {
    border: 'border-l-blue-500',
    iconBg: 'bg-blue-50 text-blue-600',
    number: 'text-gray-900',
  },
  emerald: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
    number: 'text-gray-900',
  },
  green: {
    border: 'border-l-green-500',
    iconBg: 'bg-green-50 text-green-600',
    number: 'text-gray-900',
  },
  amber: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    number: 'text-gray-900',
  },
  yellow: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    number: 'text-gray-900',
  },
  red: {
    border: 'border-l-red-500',
    iconBg: 'bg-red-50 text-red-600',
    number: 'text-gray-900',
  },
  rose: {
    border: 'border-l-rose-500',
    iconBg: 'bg-rose-50 text-rose-600',
    number: 'text-gray-900',
  },
  purple: {
    border: 'border-l-purple-500',
    iconBg: 'bg-purple-50 text-purple-600',
    number: 'text-gray-900',
  },
  indigo: {
    border: 'border-l-indigo-500',
    iconBg: 'bg-indigo-50 text-indigo-600',
    number: 'text-gray-900',
  },
  gray: {
    border: 'border-l-gray-400',
    iconBg: 'bg-gray-100 text-gray-600',
    number: 'text-gray-900',
  },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue' }) {
  const theme = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${theme.border} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${theme.number}`}>
            {value !== undefined && value !== null ? value : 0}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${theme.iconBg} flex items-center justify-center shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
