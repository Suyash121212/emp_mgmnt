import React from 'react';
import { HiArrowUp, HiArrowDown, HiOutlineSwitchVertical } from 'react-icons/hi';

export default function DataTable({
  columns = [],
  data = [],
  sortBy = '',
  sortOrder = 'asc',
  onSort,
  loading = false,
  emptyMessage = 'No records found.',
}) {
  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;
    if (sortBy === column.key) {
      onSort(column.key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column.key, 'asc');
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto min-w-full">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50/75 border-b border-gray-200">
            <tr>
              {columns.map((column) => {
                const isSorted = sortBy === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    onClick={() => handleSort(column)}
                    className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-600 ${
                      column.sortable
                        ? 'cursor-pointer select-none hover:bg-gray-100/80 transition-colors'
                        : ''
                    } ${column.headerClassName || ''}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <span className="text-gray-400">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <HiArrowUp className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <HiArrowDown className="w-3.5 h-3.5 text-blue-600" />
                            )
                          ) : (
                            <HiOutlineSwitchVertical className="w-3.5 h-3.5 hover:text-gray-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {columns.map((col, colIndex) => (
                    <td key={`skeleton-col-${colIndex}`} className="px-4 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row._id || rowIndex}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3.5 whitespace-nowrap text-gray-700 ${
                        column.className || ''
                      }`}
                    >
                      {column.render ? column.render(row) : row[column.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm font-medium text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
