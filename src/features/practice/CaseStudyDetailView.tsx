import React from 'react';
import { useApp } from '../../context/AppContext';
import { CASE_STUDIES } from '../../data/caseStudies';
import { CONCEPTS } from '../../data/concepts';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Clock,
  Calculator,
  Layers,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface CaseStudyDetailViewProps {
  caseStudyId: string;
}

export const CaseStudyDetailView: React.FC<CaseStudyDetailViewProps> = ({ caseStudyId }) => {
  const { progress, markCaseStudyComplete, navigateTo } = useApp();
  const cs = CASE_STUDIES.find(c => c.id === caseStudyId);
  const isCompleted = cs ? progress.completedCaseStudyIds.includes(cs.id) : false;

  if (!cs) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">Case Study Not Found</h2>
        <p className="text-sm text-slate-500">The requested case study was not found.</p>
        <Button variant="primary" onClick={() => navigateTo('#/practice')}>
          Return to Practice Center
        </Button>
      </div>
    );
  }

  const related = CONCEPTS.filter(c => cs.relatedConceptIds.includes(c.id));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('#/practice')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          All Practice & Case Studies
        </Button>

        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => markCaseStudyComplete(cs.id, !isCompleted)}
          icon={<CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : ''}`} />}
        >
          {isCompleted ? 'Completed Case Study' : 'Mark as Completed'}
        </Button>
      </div>

      {/* Hero Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            {cs.targetCompany} Case Study
          </span>
          <Badge variant="domain" domain={cs.domain}>
            {cs.domain}
          </Badge>
          <Badge variant="difficulty" difficulty={cs.difficulty}>
            {cs.difficulty}
          </Badge>
          <span className="flex items-center text-xs text-slate-400 font-mono ml-2">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {cs.estimatedMinutes} min architectural breakdown
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {cs.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 leading-relaxed max-w-4xl">
          {cs.problemStatement}
        </p>
      </div>

      {/* Step 1: Requirements Scoping */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <span className="w-2 h-5 bg-purple-600 rounded mr-2.5 inline-block" />
          1. System Requirements Scoping
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Functional Requirements (What the system does)
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-gray-300">
              {cs.functionalRequirements.map((req, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Non-Functional Requirements (Quality Attributes)
            </div>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-gray-300">
              {cs.nonFunctionalRequirements.map((req, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Step 2: Capacity Estimation */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <Calculator className="w-5 h-5 text-cyan-500 mr-2.5" />
          2. Back-of-the-Envelope Capacity Estimations
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-gray-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-gray-800">
              <tr>
                <th className="p-3">Metric Dimension</th>
                <th className="p-3">Assumed Math & Formula</th>
                <th className="p-3">Estimated Scale</th>
                <th className="p-3">Architectural Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800 bg-white dark:bg-gray-950 font-mono">
              {cs.capacityEstimations.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-900/50">
                  <td className="p-3 font-semibold text-slate-900 dark:text-gray-100">{item.metric}</td>
                  <td className="p-3 text-slate-600 dark:text-gray-400">{item.calculation}</td>
                  <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">{item.result}</td>
                  <td className="p-3 text-slate-500 font-sans">{item.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Step 3: High-Level Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <Layers className="w-5 h-5 text-indigo-500 mr-2.5" />
          3. High-Level Architecture & Component Flow
        </h2>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-sans">
          {cs.highLevelDesign}
        </div>
      </section>

      {/* Step 4: Detailed Step-by-Step Component Walk-through */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          4. Detailed Component Pipeline Steps
        </h2>
        <div className="space-y-4">
          {cs.detailedSteps.map(step => (
            <Card key={step.stepNumber} className="p-5 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {step.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-gray-800 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-400">Components:</span>
                {step.componentsInvolved.map((comp, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 font-mono text-[11px] text-slate-600 dark:text-gray-300">
                    {comp}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Step 5: Core Bottlenecks Deep Dive */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2.5" />
          5. Core Bottlenecks & Concurrency Deep Dives
        </h2>
        <div className="space-y-4">
          {cs.deepDiveBottlenecks.map((item, idx) => (
            <Card key={idx} className="p-5 border-l-4 border-l-amber-500 space-y-2">
              <div className="font-bold text-base text-slate-900 dark:text-white">
                {item.bottleneck}
              </div>
              <div className="text-xs text-slate-600 dark:text-gray-400">
                <span className="font-bold text-rose-600 block mb-0.5">The Technical Challenge:</span>
                {item.challenge}
              </div>
              <div className="text-xs text-slate-700 dark:text-gray-300 pt-2 border-t border-slate-100 dark:border-gray-800">
                <span className="font-bold text-emerald-600 block mb-0.5">Architectural Solution:</span>
                {item.architecturalSolution}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Step 6: Resiliency and Failover */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2.5" />
          6. High Availability, Failover & Disaster Recovery
        </h2>
        <Card className="p-5 space-y-2.5 bg-slate-50 dark:bg-gray-900/60">
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
            {cs.resiliencyAndFailover.map((item, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2.5 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Related Concepts */}
      {related.length > 0 && (
        <section className="pt-6 border-t border-slate-200 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Related Curriculum Concepts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map(r => (
              <div
                key={r.id}
                onClick={() => navigateTo(`#/concepts/${r.id}`)}
                className="p-3 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500 cursor-pointer transition flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-800 dark:text-gray-200 truncate pr-2">
                  {r.title}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
