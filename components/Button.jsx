import React from 'react';

export default function Button({ children, onClick, className }) {
  return (
    <button
      className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
