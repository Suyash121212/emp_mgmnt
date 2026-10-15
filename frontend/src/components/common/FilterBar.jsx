import React from 'react';
import { HiOutlineFilter, HiX } from 'react-icons/hi';

export default function FilterBar({
  filters = [],
  values = {},
  onChange,
  onClear,
}) {
  const hasActiveFilters = Object.values(values).some((val) => val !== '' && val !== null && val !== undefined);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center text-gray-500 font-medium text-sm mr-1">
          <HiOutlineFilter className="w-4 h-4 mr-1.5 text-blue-600" />
          <span>Filters:</span>
        </div>

        {filters.map((filter) => {
          const value = values[filter.key] ?? '';

          if (filter.type === 'select') {
            return (
              <div key={filter.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                {filter.label && (
                  <label htmlFor={`filter-${filter.key}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    {filter.label}:
                  </label>
                )}
                <select
                  id={`filter-${filter.key}`}
                  value={value}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors min-w-[130px]"
                >
                  <option value="">{filter.placeholder || `All ${filter.label || filter.key}`}</option>
                  {filter.options?.map((opt) => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    return (
                      <option key={optValue} value={optValue}>
                        {optLabel}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          }

          if (filter.type === 'date') {
            return (
              <div key={filter.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                {filter.label && (
                  <label htmlFor={`filter-${filter.key}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    {filter.label}:
                  </label>
                )}
                <input
                  id={`filter-${filter.key}`}
                  type="date"
                  value={value}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors"
                />
              </div>
            );
          }

          if (filter.type === 'text') {
            return (
              <div key={filter.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                {filter.label && (
                  <label htmlFor={`filter-${filter.key}`} className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    {filter.label}:
                  </label>
                )}
                <input
                  id={`filter-${filter.key}`}
                  type="text"
                  placeholder={filter.placeholder || filter.label}
                  value={value}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-colors min-w-[150px]"
                />
              </div>
            );
          }

          return null;
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center space-x-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 transition-colors ml-auto"
          >
            <HiX className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
