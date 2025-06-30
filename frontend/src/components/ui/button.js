import React from 'react';

export const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const styles =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-100'
      : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <button className={`px-4 py-2 rounded ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};
