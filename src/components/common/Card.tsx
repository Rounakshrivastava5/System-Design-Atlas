import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 transition-all ${
        hoverable
          ? 'hover:border-slate-300 dark:hover:border-gray-700 hover:shadow-md cursor-pointer'
          : 'shadow-xs'
      } ${className}`}
    >
      {children}
    </div>
  );
};
