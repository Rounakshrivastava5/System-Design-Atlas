import React from 'react';
import { useApp } from '../../context/AppContext';
import { CONCEPTS } from '../../data/concepts';
import { LABS } from '../../data/labs';
import { CASE_STUDIES } from '../../data/caseStudies';
import { DOMAINS } from '../../storage/initialData';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  BookOpen,
  FlaskConical,
  GraduationCap,
  Bookmark,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Trophy,
  Zap,
  TrendingUp,
  Cpu,
  Boxes,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { progress, navigateTo } = useApp();

  const completedConceptsCount = progress.completedConceptIds.length;
  const completedLabsCount = progress.completedLabIds.length;
  const completedCaseStudiesCount = progress.completedCaseStudyIds.length;
  const totalConcepts = CONCEPTS.length;
  const totalLabs = LABS.length;
  const totalCaseStudies = CASE_STUDIES.length;

  const overallPercent = totalConcepts > 0 
    ? Math.round((completedConceptsCount / totalConcepts) * 100) 
    : 0;

  // Find next unread flagship lesson or concept
  const nextConcept = CONCEPTS.find(c => !progress.completedConceptIds.includes(c.id)) || CONCEPTS[0];

  const flagshipLessons = CONCEPTS.filter(c => c.isFlagship).slice(0, 6);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Distributed Systems Mastery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            System Design Atlas
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed mb-6">
            Explore 50+ deep architectural concepts, experiment with 12 real-time interactive simulation labs, model large-scale architectures on the workbench, and review FAANG-grade case studies.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {nextConcept && (
              <Button
                variant="primary"
                onClick={() => navigateTo(`#/concepts/${nextConcept.id}`)}
                className="bg-white text-blue-700 hover:bg-blue-50 border-transparent font-semibold shadow-md"
                icon={<ArrowRight className="w-4 h-4 text-blue-700" />}
              >
                Continue Learning: {nextConcept.title}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigateTo('#/labs')}
              className="border-white/30 text-white hover:bg-white/10"
              icon={<FlaskConical className="w-4 h-4 text-cyan-300" />}
            >
              Open Interactive Labs
            </Button>
            <Button
              variant="outline"
              onClick={() => navigateTo('#/workbench')}
              className="border-white/30 text-white hover:bg-white/10"
              icon={<Boxes className="w-4 h-4 text-indigo-300" />}
            >
              Architecture Canvas
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Concepts Read
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {completedConceptsCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-gray-500">
              / {totalConcepts} completed
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Interactive Labs
            </span>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {completedLabsCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-gray-500">
              / {totalLabs} explored
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${totalLabs > 0 ? (completedLabsCount / totalLabs) * 100 : 0}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Worked Case Studies
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {completedCaseStudiesCount}
            </span>
            <span className="text-xs text-slate-400 dark:text-gray-500">
              / {totalCaseStudies} analyzed
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${totalCaseStudies > 0 ? (completedCaseStudiesCount / totalCaseStudies) * 100 : 0}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Saved Bookmarks
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {progress.bookmarks.length}
            </span>
            <span className="text-xs text-slate-400 dark:text-gray-500">
              articles saved
            </span>
          </div>
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <button 
              onClick={() => navigateTo('#/concepts?filter=bookmarked')} 
              className="hover:underline flex items-center"
            >
              View bookmarks <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </Card>
      </div>

      {/* Curriculum Domains Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Curriculum Domains
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Structured progressive taxonomy covering modern distributed architectures.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('#/concepts')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Explore all {totalConcepts} concepts
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOMAINS.map(domain => {
            const domainConcepts = CONCEPTS.filter(c => c.domain === domain.id);
            const completed = domainConcepts.filter(c => progress.completedConceptIds.includes(c.id)).length;
            const percent = domainConcepts.length > 0 
              ? Math.round((completed / domainConcepts.length) * 100) 
              : 0;

            return (
              <Card
                key={domain.id}
                hoverable
                onClick={() => navigateTo(`#/concepts?domain=${domain.id}`)}
                className="p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="domain" domain={domain.id}>
                      {domain.shortName}
                    </Badge>
                    <span className="font-mono text-xs text-slate-400 dark:text-gray-500">
                      {completed}/{domainConcepts.length}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {domain.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500 dark:text-gray-400">
                    <span>Domain Mastery</span>
                    <span className="font-mono font-medium">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Featured Flagship Lessons Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Flagship Deep Dives
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                20 Masterclasses
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              In-depth theoretical analyses with mathematical formulas, failure modes, and industry implementations.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('#/concepts?filter=flagship')}
          >
            View all flagships
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flagshipLessons.map(lesson => {
            const isCompleted = progress.completedConceptIds.includes(lesson.id);
            return (
              <Card
                key={lesson.id}
                hoverable
                onClick={() => navigateTo(`#/concepts/${lesson.id}`)}
                className="p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="difficulty" difficulty={lesson.difficulty}>
                      {lesson.difficulty}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-gray-500 font-mono">
                      {lesson.readTimeMinutes} min read
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {lesson.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    {isCompleted ? (
                      <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-gray-500 text-xs">
                        Not started
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                    Read lesson <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Launchers: Labs & Architecture Workbench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-cyan-900/10 via-slate-900/5 to-slate-900/0 dark:from-cyan-950/40 dark:to-gray-900 border-cyan-500/20">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                12 Interactive Simulation Labs
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                Tweak live parameters for Round Robin vs Least Conn load balancers, LRU vs LFU caching, token bucket rate limiters, and consistent hashing rings.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigateTo('#/labs')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Launch Simulation Labs
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-slate-900/0 dark:from-indigo-950/40 dark:to-gray-900 border-indigo-500/20">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Architecture Modeling Workbench
              </h3>
              <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                Drag-and-drop system components, connect services via HTTP, gRPC or Kafka, estimate end-to-end latency and bottlenecks, and import/export JSON topologies.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigateTo('#/workbench')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open Architecture Canvas
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
