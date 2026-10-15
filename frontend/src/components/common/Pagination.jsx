import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  itemName = 'items',
}) {
  if (totalItems === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-2 text-sm text-gray-500 gap-3">
        <div>Showing 0 of 0 {itemName}</div>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 px-2 text-sm text-gray-600 gap-4">
      <div>
        Showing <span className="font-semibold text-gray-900">{startItem}</span>-
        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center space-x-1">
        {/* Previous Page Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex items-center px-2.5 py-1.5 rounded-md border text-sm font-medium transition-colors ${
            currentPage <= 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
          }`}
          aria-label="Previous Page"
        >
          <HiChevronLeft className="w-4 h-4 mr-1" />
          <span>Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="hidden sm:flex items-center space-x-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2.5 py-1 text-gray-400 select-none text-sm font-medium"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[34px] h-[34px] flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-600 text-white font-semibold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Mobile current page indicator */}
        <span className="sm:hidden text-xs text-gray-500 font-medium px-2">
          Page {currentPage} of {totalPages}
        </span>

        {/* Next Page Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex items-center px-2.5 py-1.5 rounded-md border text-sm font-medium transition-colors ${
            currentPage >= totalPages
              ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
          }`}
          aria-label="Next Page"
        >
          <span>Next</span>
          <HiChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
