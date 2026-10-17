import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm disabled:bg-blue-300 dark:disabled:bg-blue-900/50',
    secondary:
      'bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-700',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm',
    outline:
      'bg-transparent hover:bg-slate-50 dark:hover:bg-gray-800/50 border border-slate-300 dark:border-gray-700 text-slate-800 dark:text-gray-200',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
