import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { searchAtlas, SearchResultItem } from '../../utils/search';
import { CONCEPTS } from '../../data/concepts';
import { LABS } from '../../data/labs';
import { CASE_STUDIES } from '../../data/caseStudies';
import { Search, X, BookOpen, FlaskConical, Briefcase, ArrowRight, CornerDownLeft } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigateTo } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const matched = searchAtlas(query, CONCEPTS, LABS, CASE_STUDIES);
    setResults(matched);
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    setIsSearchOpen(false);
    navigateTo(item.targetRoute);
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < results.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header & Input */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search concepts, interactive labs, architectures, case studies..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInInput}
            className="w-full py-4 text-slate-900 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-500 bg-transparent text-base focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-mono font-medium text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-800 rounded border border-slate-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-gray-800/60">
          {query && results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-gray-400 text-sm">
              No matching architectural concepts or labs found for "{query}".
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-800/50 text-slate-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center min-w-0 pr-3">
                    <span className="p-2 rounded-md mr-3 shrink-0 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400">
                      {item.type === 'concept' && <BookOpen className="w-4 h-4 text-blue-500" />}
                      {item.type === 'lab' && <FlaskConical className="w-4 h-4 text-cyan-500" />}
                      {item.type === 'case_study' && <Briefcase className="w-4 h-4 text-amber-500" />}
                    </span>
                    <div className="truncate">
                      <div className="font-medium text-sm text-slate-900 dark:text-gray-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center shrink-0 space-x-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400">
                      {item.type.replace('_', ' ')}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-xs text-slate-400 dark:text-gray-500 space-y-2">
              <div className="font-semibold text-slate-600 dark:text-gray-300">Quick suggestions:</div>
              <div className="flex flex-wrap gap-1.5">
                {['Consistent Hashing', 'Load Balancing', 'LSM Trees', 'Rate Limiting', 'CAP Theorem', 'TinyURL', 'CQRS'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-gray-950/50 border-t border-slate-200 dark:border-gray-800 text-[11px] text-slate-400 dark:text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Use <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border border-slate-200 dark:border-gray-700">↑</kbd> <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border border-slate-200 dark:border-gray-700">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded border border-slate-200 dark:border-gray-700">↵</kbd> to select</span>
          </div>
          <span>System Design Atlas</span>
        </div>
      </div>
    </div>
  );
};
