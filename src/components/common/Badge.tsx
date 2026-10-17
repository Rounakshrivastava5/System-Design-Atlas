import React from 'react';
import { ConceptDomain, ConceptDifficulty } from '../../types/concept';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'domain' | 'difficulty' | 'flagship' | 'success' | 'warning' | 'danger';
  domain?: ConceptDomain;
  difficulty?: ConceptDifficulty;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  domain,
  difficulty,
  className = '',
}) => {
  let styleClasses = 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300 border-slate-200 dark:border-gray-700';

  if (variant === 'domain' && domain) {
    const domainStyles: Record<ConceptDomain, string> = {
      fundamentals: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      scalability: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      storage: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      networking: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      distributed: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      observability: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    };
    styleClasses = domainStyles[domain] || styleClasses;
  } else if (variant === 'difficulty' && difficulty) {
    const diffStyles: Record<ConceptDifficulty, string> = {
      beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      advanced: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };
    styleClasses = diffStyles[difficulty] || styleClasses;
  } else if (variant === 'flagship') {
    styleClasses = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 font-semibold';
  } else if (variant === 'success') {
    styleClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (variant === 'warning') {
    styleClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styleClasses} ${className}`}
    >
      {children}
    </span>
  );
};
