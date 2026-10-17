import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CONCEPTS } from '../../data/concepts';
import { DOMAINS } from '../../storage/initialData';
import { ConceptDomain, ConceptDifficulty } from '../../types/concept';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Search,
  Filter,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FlaskConical,
  X,
} from 'lucide-react';

export const ConceptCatalogView: React.FC = () => {
  const { progress, toggleBookmark, markConceptComplete, navigateTo, currentRoute } = useApp();

  // Extract query params from currentRoute (e.g. #/concepts?domain=storage or #/concepts?filter=bookmarked)
  const initialDomain = useMemo(() => {
    const match = currentRoute.match(/domain=([^&]+)/);
    return match ? (match[1] as ConceptDomain) : 'all';
  }, [currentRoute]);

  const initialFilter = useMemo(() => {
    const match = currentRoute.match(/filter=([^&]+)/);
    return match ? match[1] : 'all';
  }, [currentRoute]);

  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomain);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Update filters if URL hash changes
  React.useEffect(() => {
    if (initialDomain !== 'all') setSelectedDomain(initialDomain);
    if (initialFilter !== 'all') setSelectedStatus(initialFilter);
  }, [initialDomain, initialFilter]);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    return CONCEPTS.filter(c => {
      // Domain filter
      if (selectedDomain !== 'all' && c.domain !== selectedDomain) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false;

      // Status filter
      if (selectedStatus === 'completed' && !progress.completedConceptIds.includes(c.id)) return false;
      if (selectedStatus === 'bookmarked' && !progress.bookmarks.includes(c.id)) return false;
      if (selectedStatus === 'flagship' && !c.isFlagship) return false;
      if (selectedStatus === 'incomplete' && progress.completedConceptIds.includes(c.id)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesDesc = c.shortDescription.toLowerCase().includes(q);
        const matchesTags = c.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [selectedDomain, selectedDifficulty, selectedStatus, searchQuery, progress]);

  const clearAllFilters = () => {
    setSelectedDomain('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedDomain !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || !!searchQuery;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Design Concept Catalog
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-3xl">
          Comprehensive structured curriculum covering foundational laws, scalability patterns, database engines, networking protocols, distributed consensus, and resilience.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-slate-200 dark:border-gray-800 shadow-xs">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search concepts by title, description, or keyword (e.g. B-Tree, Quorum, Kafka, Leaky Bucket)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Domain selection tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedDomain === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
            }`}
          >
            All Domains ({CONCEPTS.length})
          </button>
          {DOMAINS.map(d => {
            const count = CONCEPTS.filter(c => c.domain === d.id).length;
            const isSelected = selectedDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                }`}
              >
                {d.shortName} ({count})
              </button>
            );
          })}
        </div>

        {/* Secondary filters: Difficulty, Status, and Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-gray-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Difficulty select */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 dark:text-gray-500 font-medium">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md px-2 py-1 text-slate-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Status select */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 dark:text-gray-500 font-medium">Filter:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-md px-2 py-1 text-slate-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="all">All Items</option>
                <option value="flagship">Flagship Lessons Only</option>
                <option value="bookmarked">Bookmarked Only</option>
                <option value="completed">Completed Only</option>
                <option value="incomplete">Incomplete Only</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 px-1">
        <span>Showing {filteredConcepts.length} of {CONCEPTS.length} concepts</span>
        <span>
          {progress.completedConceptIds.length} marked complete
        </span>
      </div>

      {/* Concept Cards Grid */}
      {filteredConcepts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">
          <div className="text-slate-400 dark:text-gray-500 mb-2">No concepts match the selected filters.</div>
          <Button variant="secondary" size="sm" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredConcepts.map(concept => {
            const isCompleted = progress.completedConceptIds.includes(concept.id);
            const isBookmarked = progress.bookmarks.includes(concept.id);

            return (
              <Card
                key={concept.id}
                hoverable
                onClick={() => navigateTo(`#/concepts/${concept.id}`)}
                className={`p-5 flex flex-col justify-between group relative overflow-hidden transition-all ${
                  isCompleted ? 'border-emerald-500/30 dark:border-emerald-500/20' : ''
                }`}
              >
                <div>
                  {/* Top Bar: Domain, Difficulty, Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <Badge variant="domain" domain={concept.domain}>
                        {concept.domain}
                      </Badge>
                      <Badge variant="difficulty" difficulty={concept.difficulty}>
                        {concept.difficulty}
                      </Badge>
                      {concept.isFlagship && (
                        <Badge variant="flagship">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Flagship
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleBookmark(concept.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark concept'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={() => markConceptComplete(concept.id, !isCompleted)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isCompleted
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                        }`}
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mb-2">
                    {concept.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                    {concept.shortDescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {concept.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                    {concept.tags.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 font-mono">
                        +{concept.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {concept.readTimeMinutes} min
                    </span>

                    {concept.pairedLabId && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(`#/labs/${concept.pairedLabId}`);
                        }}
                        className="flex items-center text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-medium text-[11px]"
                      >
                        <FlaskConical className="w-3.5 h-3.5 mr-1" />
                        Interactive Lab
                      </span>
                    )}
                  </div>

                  <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center text-xs">
                    Read <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
