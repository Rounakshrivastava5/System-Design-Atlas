import React from 'react';
import { useApp } from '../../context/AppContext';
import { CONCEPTS } from '../../data/concepts';
import { LABS } from '../../data/labs';
import { CASE_STUDIES } from '../../data/caseStudies';
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChevronRight,
  BookOpen,
  FlaskConical,
  Boxes,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileSidebar }) => {
  const { theme, toggleTheme, currentRoute, setIsSearchOpen, progress } = useApp();

  // Dynamic breadcrumbs calculation
  const getBreadcrumbs = () => {
    const route = currentRoute.replace('#/', '').split('?')[0];
    const parts = route.split('/').filter(Boolean);

    if (parts.length === 0) {
      return [{ label: 'Dashboard', icon: null }];
    }

    const crumbs = [];

    if (parts[0] === 'concepts') {
      crumbs.push({ label: 'Concepts', icon: BookOpen, route: '#/concepts' });
      if (parts[1]) {
        const found = CONCEPTS.find(c => c.id === parts[1]);
        crumbs.push({ label: found ? found.title : parts[1], icon: null });
      }
    } else if (parts[0] === 'labs') {
      crumbs.push({ label: 'Interactive Labs', icon: FlaskConical, route: '#/labs' });
      if (parts[1]) {
        const found = LABS.find(l => l.id === parts[1]);
        crumbs.push({ label: found ? found.title : parts[1], icon: null });
      }
    } else if (parts[0] === 'workbench') {
      crumbs.push({ label: 'Architecture Workbench', icon: Boxes });
    } else if (parts[0] === 'practice') {
      crumbs.push({ label: 'Practice Center', icon: GraduationCap, route: '#/practice' });
      if (parts[1] === 'case-studies' && parts[2]) {
        const found = CASE_STUDIES.find(cs => cs.id === parts[2]);
        crumbs.push({ label: found ? found.title : parts[2], icon: null });
      }
    } else {
      crumbs.push({ label: parts[0], icon: null });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center space-x-3 overflow-hidden">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-gray-400 truncate">
          <span className="font-semibold text-slate-700 dark:text-gray-300 hidden sm:inline">
            Atlas
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600 hidden sm:inline shrink-0" />

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.route && !isLast ? (
                  <a
                    href={crumb.route}
                    className="hover:text-blue-600 dark:hover:text-blue-400 truncate transition font-medium"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={`truncate ${isLast ? 'text-slate-900 dark:text-white font-semibold' : ''}`}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600 shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Search & Utilities */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
        {/* Search button trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200/70 dark:hover:bg-gray-700/60 rounded-lg border border-slate-200/80 dark:border-gray-700 transition"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search concepts, labs, case studies...</span>
          <span className="sm:hidden">Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Learning progress badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium font-mono">
            {progress.completedConceptIds.length} done
          </span>
        </div>

        {/* Theme switcher */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
