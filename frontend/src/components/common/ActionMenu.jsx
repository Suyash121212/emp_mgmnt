import React, { useState, useRef, useEffect } from 'react';
import { HiDotsVertical } from 'react-icons/hi';

export default function ActionMenu({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  const handleItemClick = (e, onClick, disabled) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(false);
    if (onClick) onClick();
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Actions"
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 z-30 focus:outline-none py-1 border border-gray-100">
          {items.map((item, index) => {
            const isDelete = item.label?.toLowerCase().includes('delete') || item.color === 'red';
            const Icon = item.icon;

            return (
              <button
                key={index}
                type="button"
                disabled={item.disabled}
                onClick={(e) => handleItemClick(e, item.onClick, item.disabled)}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center space-x-2 transition-colors ${
                  item.disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isDelete
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {Icon && <Icon className={`w-4 h-4 ${isDelete ? 'text-red-500' : 'text-gray-500'}`} />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
