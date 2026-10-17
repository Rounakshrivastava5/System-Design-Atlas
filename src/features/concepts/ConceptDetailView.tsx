import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CONCEPTS } from '../../data/concepts';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  FlaskConical,
  Scale,
  Calculator,
  AlertTriangle,
  Building2,
  CheckSquare,
  FileText,
  Save,
  Share2,
  ChevronRight,
} from 'lucide-react';

interface ConceptDetailViewProps {
  conceptId: string;
}

export const ConceptDetailView: React.FC<ConceptDetailViewProps> = ({ conceptId }) => {
  const { progress, markConceptComplete, toggleBookmark, saveNote, navigateTo } = useApp();

  const concept = CONCEPTS.find(c => c.id === conceptId);
  const isCompleted = concept ? progress.completedConceptIds.includes(concept.id) : false;
  const isBookmarked = concept ? progress.bookmarks.includes(concept.id) : false;

  // Personal notes state
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content');

  useEffect(() => {
    if (concept && progress.notes[concept.id]) {
      setNoteContent(progress.notes[concept.id]);
    } else {
      setNoteContent('');
    }
  }, [conceptId, progress.notes]);

  const handleSaveNote = () => {
    if (concept) {
      saveNote(concept.id, noteContent);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    }
  };

  if (!concept) {
    return (
      <div className="p-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="text-xl font-bold text-slate-800 dark:text-gray-200">
          Concept Not Found
        </div>
        <p className="text-sm text-slate-500">
          The concept ID "{conceptId}" was not found in the curriculum catalog.
        </p>
        <Button variant="primary" onClick={() => navigateTo('#/concepts')}>
          Return to Concept Catalog
        </Button>
      </div>
    );
  }

  // Prerequisites and related concept lookups
  const prerequisites = CONCEPTS.filter(c => concept.prerequisites.includes(c.id));
  const relatedConcepts = CONCEPTS.filter(c => concept.relatedConcepts.includes(c.id));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('#/concepts')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Catalog
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant={isBookmarked ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => toggleBookmark(concept.id)}
            icon={<Bookmark className={`w-4 h-4 ${isBookmarked ? 'text-amber-500 fill-current' : ''}`} />}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>

          <Button
            variant={isCompleted ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => markConceptComplete(concept.id, !isCompleted)}
            icon={<CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : ''}`} />}
          >
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="domain" domain={concept.domain}>
            {concept.domain}
          </Badge>
          <Badge variant="difficulty" difficulty={concept.difficulty}>
            {concept.difficulty}
          </Badge>
          {concept.isFlagship && (
            <Badge variant="flagship">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              Flagship Masterclass
            </Badge>
          )}
          <span className="flex items-center text-xs font-mono text-slate-400 dark:text-gray-500 ml-2">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {concept.readTimeMinutes} min read
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {concept.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 leading-relaxed max-w-4xl">
          {concept.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {concept.tags.map(t => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 font-mono"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Paired Interactive Lab Callout */}
      {concept.pairedLabId && (
        <Card className="p-4 sm:p-5 bg-gradient-to-r from-cyan-900/10 via-blue-900/10 to-transparent dark:from-cyan-950/40 dark:via-blue-950/30 border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Paired Interactive Simulation Lab Available
              </div>
              <div className="text-sm font-medium text-slate-800 dark:text-gray-200">
                Experiment with live controls and observe system behavior in real-time.
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigateTo(`#/labs/${concept.pairedLabId}`)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white shrink-0"
            icon={<FlaskConical className="w-4 h-4" />}
          >
            Launch Lab
          </Button>
        </Card>
      )}

      {/* Navigation tabs: Content vs Personal Notes */}
      <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('content')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400'
          }`}
        >
          Architectural Guide
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-gray-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Personal Notes</span>
          {noteContent.trim() && (
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          )}
        </button>
      </div>

      {activeTab === 'content' ? (
        <div className="space-y-10">
          {/* Section 1: Core Theory Overview */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <span className="w-2 h-5 bg-blue-600 dark:bg-blue-500 rounded mr-2.5 inline-block" />
              Core Architecture & Theoretical Foundations
            </h2>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {concept.content.overview}
            </div>

            {concept.content.architectureDetails && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-sm text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {concept.content.architectureDetails}
              </div>
            )}
          </section>

          {/* Section 2: Key Trade-offs */}
          {concept.content.keyTradeoffs && concept.content.keyTradeoffs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Scale className="w-5 h-5 text-indigo-500 mr-2.5" />
                Critical Architectural Trade-Offs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concept.content.keyTradeoffs.map((tradeoff, idx) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                      Key Advantage
                    </div>
                    <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                      {tradeoff.advantage}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-gray-800">
                      <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2" />
                        Cost / Drawback
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        {tradeoff.drawback}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Mathematical Formulations */}
          {concept.content.formulas && concept.content.formulas.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Calculator className="w-5 h-5 text-cyan-500 mr-2.5" />
                Formulas & Mathematical Models
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {concept.content.formulas.map((formula, idx) => (
                  <Card key={idx} className="p-4 bg-slate-50/50 dark:bg-gray-900/50 border-cyan-500/20">
                    <div className="font-semibold text-sm text-slate-900 dark:text-white mb-2">
                      {formula.name}
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-950 rounded-lg border border-slate-200 dark:border-gray-800 font-mono text-sm text-blue-600 dark:text-blue-400 overflow-x-auto mb-2">
                      {formula.equation}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                      {formula.explanation}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section 4: Failure Modes & Mitigations */}
          {concept.content.failureModes && concept.content.failureModes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2.5" />
                Failure Modes & Disaster Mitigations
              </h2>
              <div className="space-y-3">
                {concept.content.failureModes.map((fm, idx) => (
                  <Card key={idx} className="p-4 border-l-4 border-l-amber-500 space-y-2">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {fm.failure}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 dark:text-gray-400 block mb-0.5">
                          System Consequence:
                        </span>
                        <p className="text-slate-700 dark:text-gray-300 leading-relaxed">
                          {fm.consequence}
                        </p>
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                          Recommended Mitigation:
                        </span>
                        <p className="text-slate-700 dark:text-gray-300 leading-relaxed">
                          {fm.mitigation}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section 5: Real-World Case Studies & Tech Stacks */}
          {concept.content.realWorldExamples && concept.content.realWorldExamples.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Building2 className="w-5 h-5 text-emerald-500 mr-2.5" />
                Production Implementations in Industry
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {concept.content.realWorldExamples.map((example, idx) => (
                  <Card key={idx} className="p-4 space-y-2">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                      {example.companyOrSystem}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                      {example.usage}
                    </p>
                    {example.details && (
                      <div className="text-[11px] text-slate-500 font-mono bg-slate-50 dark:bg-gray-800/60 p-2 rounded">
                        {example.details}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section 6: Interview Tips & Checklist */}
          {concept.content.implementationChecklist && concept.content.implementationChecklist.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <CheckSquare className="w-5 h-5 text-blue-500 mr-2.5" />
                Interview & Implementation Checklist
              </h2>
              <Card className="p-4 bg-slate-50 dark:bg-gray-900/60">
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-gray-300">
                  {concept.content.implementationChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2.5 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {/* Section 7: Prerequisites & Related Concepts */}
          <section className="pt-6 border-t border-slate-200 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Prerequisites & Related Topics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prerequisites */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Prerequisites
                </span>
                {prerequisites.length > 0 ? (
                  <div className="space-y-2">
                    {prerequisites.map(p => (
                      <div
                        key={p.id}
                        onClick={() => navigateTo(`#/concepts/${p.id}`)}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500 cursor-pointer transition flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-800 dark:text-gray-200 truncate pr-2">
                          {p.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">None — This is a foundational concept.</div>
                )}
              </div>

              {/* Related */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Related Concepts
                </span>
                {relatedConcepts.length > 0 ? (
                  <div className="space-y-2">
                    {relatedConcepts.map(r => (
                      <div
                        key={r.id}
                        onClick={() => navigateTo(`#/concepts/${r.id}`)}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-500 cursor-pointer transition flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-800 dark:text-gray-200 truncate pr-2">
                          {r.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No specific related concepts registered.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* Personal Notes Tab */
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Engineering Notes
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Notes are persisted in local browser storage across sessions.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveNote}
              icon={<Save className="w-4 h-4" />}
            >
              {isSavedRecently ? 'Saved!' : 'Save Notes'}
            </Button>
          </div>

          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Record your takeaways, interview reminders, architectural formulas, or questions here..."
            rows={14}
            className="w-full p-4 text-sm font-mono bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl text-slate-900 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>{noteContent.length} characters</span>
            {isSavedRecently && <span className="text-emerald-500 font-medium">Auto-saved to local storage!</span>}
          </div>
        </div>
      )}
    </div>
  );
};
