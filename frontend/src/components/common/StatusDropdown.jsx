import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import { VALID_STATUS_TRANSITIONS, STATUS_COLORS } from '../../utils/constants';

export default function StatusDropdown({ currentStatus, taskId, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const validNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  const hasNextStatuses = validNextStatuses.length > 0;
  const currentStyle = STATUS_COLORS[currentStatus] || STATUS_COLORS['Todo'];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (status) => {
    setIsOpen(false);
    if (status !== currentStatus && onStatusChange) {
      onStatusChange(taskId, status);
    }
  };

  // If Completed or Cancelled, no dropdown can be opened
  if (!hasNextStatuses) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
          currentStyle.badge || 'bg-gray-100 text-gray-700 border-gray-200'
        }`}
      >
        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${currentStyle.dot}`} />
        {currentStatus}
      </span>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 shadow-sm ${
          currentStyle.badge
        } hover:opacity-90`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
        <span>{currentStatus}</span>
        <HiChevronDown className="w-3.5 h-3.5 ml-0.5 text-current opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-36 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-30 focus:outline-none py-1 border border-gray-100">
          <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
            Change Status
          </div>
          {validNextStatuses.map((status) => {
            const nextStyle = STATUS_COLORS[status] || STATUS_COLORS['Todo'];
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleSelect(status)}
                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${nextStyle.dot}`} />
                <span>{status}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
