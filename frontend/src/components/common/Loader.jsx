import React from 'react';

export default function Loader({ fullPage = false, message = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600"></div>
      </div>
      {message && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-12">
      {content}
    </div>
  );
}
