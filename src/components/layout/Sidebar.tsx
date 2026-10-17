import React from 'react';
import { useApp } from '../../context/AppContext';
import { DOMAINS } from '../../storage/initialData';
import { CONCEPTS } from '../../data/concepts';
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Boxes,
  GraduationCap,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  FolderGit2,
  Scale,
  Network,
  Database,
  Radio,
  Activity,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentRoute, navigateTo, progress } = useApp();

  const navItems = [
    { label: 'Dashboard', route: '#/', icon: LayoutDashboard },
    { label: 'Concept Catalog', route: '#/concepts', icon: BookOpen, count: CONCEPTS.length },
    { label: 'Interactive Labs', route: '#/labs', icon: FlaskConical, badge: '12 Labs' },
    { label: 'Architecture Canvas', route: '#/workbench', icon: Boxes },
    { label: 'Practice Center', route: '#/practice', icon: GraduationCap, badge: 'Case Studies' },
  ];

  const domainIcons: Record<string, React.ElementType> = {
    fundamentals: Scale,
    scalability: Network,
    storage: Database,
    networking: Radio,
    distributed: Layers,
    observability: Activity,
  };

  const isRouteActive = (route: string) => {
    if (route === '#/') return currentRoute === '#/' || currentRoute === '' || currentRoute === '#';
    return currentRoute.startsWith(route);
  };

  const handleNav = (route: string) => {
    navigateTo(route);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 select-none">
      {/* Brand Header */}
      <div 
        onClick={() => handleNav('#/')} 
        className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-gray-800 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 mr-3 group-hover:scale-105 transition-transform">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center">
            System Design Atlas
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono tracking-wider">
            DISTRIBUTED SYSTEMS
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
            Platform
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isRouteActive(item.route);
              return (
                <button
                  key={item.route}
                  onClick={() => handleNav(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100/70 dark:hover:bg-gray-800/60 hover:text-slate-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-3 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span className="text-xs text-slate-400 dark:text-gray-500 font-mono">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Curriculum Domains */}
        <div>
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
            <span>Curriculum Domains</span>
            <span className="font-mono text-[10px]">
              {progress.completedConceptIds.length}/{CONCEPTS.length}
            </span>
          </div>
          <div className="space-y-0.5">
            {DOMAINS.map(domain => {
              const Icon = domainIcons[domain.id] || BookOpen;
              const domainConcepts = CONCEPTS.filter(c => c.domain === domain.id);
              const completedInDomain = domainConcepts.filter(c => progress.completedConceptIds.includes(c.id)).length;
              const isDomainActive = currentRoute.includes(`domain=${domain.id}`);

              return (
                <button
                  key={domain.id}
                  onClick={() => handleNav(`#/concepts?domain=${domain.id}`)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
                    isDomainActive
                      ? 'bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white font-medium'
                      : 'text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800/40 hover:text-slate-800 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center min-w-0 pr-2">
                    <Icon className="w-3.5 h-3.5 mr-2 shrink-0 text-slate-400 dark:text-gray-500" />
                    <span className="truncate">{domain.shortName}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500 shrink-0">
                    {completedInDomain}/{domainConcepts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Collections */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
            Your Library
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleNav('#/concepts?filter=bookmarked')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800/50 rounded-md transition"
            >
              <div className="flex items-center">
                <Bookmark className="w-3.5 h-3.5 mr-2 text-amber-500" />
                <span>Bookmarked</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500">
                {progress.bookmarks.length}
              </span>
            </button>

            <button
              onClick={() => handleNav('#/concepts?filter=completed')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800/50 rounded-md transition"
            >
              <div className="flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                <span>Completed</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500">
                {progress.completedConceptIds.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* User Progress Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-600 dark:text-gray-400">Mastery Progress</span>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
            {CONCEPTS.length > 0 ? Math.round((progress.completedConceptIds.length / CONCEPTS.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${CONCEPTS.length > 0 ? (progress.completedConceptIds.length / CONCEPTS.length) * 100 : 0}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
