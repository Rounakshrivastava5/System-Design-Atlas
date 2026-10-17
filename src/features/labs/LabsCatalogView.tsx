import React from 'react';
import { useApp } from '../../context/AppContext';
import { LABS } from '../../data/labs';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { FlaskConical, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const LabsCatalogView: React.FC = () => {
  const { progress, navigateTo } = useApp();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>12 Interactive Engineering Simulators</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Interactive Architecture Simulation Labs
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-3xl">
          Tune algorithmic parameters, simulate high-traffic load spikes, trigger server faults, and observe live metrics without deploying physical infrastructure.
        </p>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LABS.map(lab => {
          const isCompleted = progress.completedLabIds.includes(lab.id);

          return (
            <Card
              key={lab.id}
              hoverable
              onClick={() => navigateTo(`#/labs/${lab.id}`)}
              className="p-5 flex flex-col justify-between group border-l-4 border-l-cyan-500"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="domain" domain={lab.domain}>
                    {lab.domain}
                  </Badge>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{lab.estimatedMinutes} min</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors mb-2">
                  {lab.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">
                  {lab.shortDescription}
                </p>

                {/* Learning Objectives Preview */}
                <div className="space-y-1 mb-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Core Objectives:
                  </div>
                  {lab.learningObjectives.slice(0, 2).map((obj, i) => (
                    <div key={i} className="text-xs text-slate-600 dark:text-gray-300 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2 mt-1.5 shrink-0" />
                      <span className="line-clamp-1">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-xs">
                {isCompleted ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-gray-500">
                    Ready to simulate
                  </span>
                )}

                <span className="text-cyan-600 dark:text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                  Launch Lab <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
