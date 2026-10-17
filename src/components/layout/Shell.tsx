import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { SearchModal } from '../search/SearchModal';
import { X } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          {/* Slide-over panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-900 shadow-2xl z-50 animate-slideRight">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopNav onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto relative focus:outline-none">
          {children}
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchModal />
    </div>
  );
};
