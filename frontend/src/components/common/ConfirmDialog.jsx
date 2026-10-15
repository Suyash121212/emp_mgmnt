import React, { useEffect } from 'react';
import { HiExclamationCircle } from 'react-icons/hi';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
  loading = false,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const confirmColors = {
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  };

  const buttonColorClass = confirmColors[confirmColor] || confirmColors.red;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={!loading ? onCancel : undefined} 
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md p-6 border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full shrink-0 ${
              confirmColor === 'red' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <HiExclamationCircle className="w-6 h-6" />
            </div>
            <div className="mt-1 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 leading-6">{title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:w-auto ${buttonColorClass} ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
