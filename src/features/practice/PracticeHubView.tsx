import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QUIZ_QUESTIONS } from '../../data/quizzes';
import { FLASHCARDS } from '../../data/flashcards';
import { CASE_STUDIES } from '../../data/caseStudies';
import { DOMAINS } from '../../storage/initialData';
import { ConceptDomain } from '../../types/concept';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Briefcase,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const PracticeHubView: React.FC = () => {
  const { progress, recordQuizAttempt, toggleKnownFlashcard, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<string>('quizzes');

  // Quiz state
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [reviewIncorrectOnly, setReviewIncorrectOnly] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Filter quizzes
  const filteredQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter(q => {
      if (selectedDomain !== 'all' && q.domain !== selectedDomain) return false;
      if (reviewIncorrectOnly) {
        // Find if user attempted and was incorrect
        const attempt = progress.quizAttempts.find(a => a.questionId === q.id);
        if (!attempt || attempt.isCorrect) return false;
      }
      return true;
    });
  }, [selectedDomain, reviewIncorrectOnly, progress.quizAttempts]);

  const handleSelectOption = (questionId: string, optionId: string, isCorrect: boolean) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setShowExplanation(prev => ({ ...prev, [questionId]: true }));
    recordQuizAttempt({
      questionId,
      selectedOptionId: optionId,
      isCorrect,
      timestamp: Date.now(),
    });
  };

  const handleResetQuizHistory = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setReviewIncorrectOnly(false);
  };

  const currentFlashcard = FLASHCARDS[flashcardIndex];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Design Practice & Interview Preparation
        </h1>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-3xl">
          Test your architectural judgment with deep scenario quizzes, revise key trade-offs with spaced-repetition flashcards, and review 10 worked FAANG interview case studies.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'quizzes', label: 'Architectural Quizzes', count: QUIZ_QUESTIONS.length, icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'flashcards', label: 'Interview Flashcards', count: FLASHCARDS.length, icon: <Layers className="w-4 h-4" /> },
          { id: 'case_studies', label: 'Worked Case Studies', count: CASE_STUDIES.length, icon: <Briefcase className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Quiz Filters & Review Mode */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Domain:</span>
              <button
                onClick={() => setSelectedDomain('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedDomain === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                }`}
              >
                All ({QUIZ_QUESTIONS.length})
              </button>
              {DOMAINS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedDomain === d.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  {d.shortName}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => setReviewIncorrectOnly(!reviewIncorrectOnly)}
                className={`px-3 py-1.5 rounded-lg font-medium border transition ${
                  reviewIncorrectOnly
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                    : 'border-slate-200 dark:border-gray-700 hover:bg-slate-50 text-slate-600 dark:text-gray-400'
                }`}
              >
                Review Incorrect Answers Only
              </button>

              <button
                onClick={handleResetQuizHistory}
                className="text-slate-400 hover:text-slate-600 flex items-center"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset answers
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 text-sm text-slate-500">
                {reviewIncorrectOnly
                  ? 'No incorrect answers found for this domain! Great job!'
                  : 'No questions available for the selected filter.'}
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const selectedOptId = selectedAnswers[q.id];
                const isAnswered = !!selectedOptId;

                return (
                  <Card key={q.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                          Question {idx + 1}
                        </span>
                        <Badge variant="domain" domain={q.domain}>
                          {q.domain}
                        </Badge>
                        <Badge variant="difficulty" difficulty={q.difficulty}>
                          {q.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {q.question}
                    </h3>

                    {q.scenario && (
                      <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded-lg border border-slate-200 dark:border-gray-700 text-xs text-slate-600 dark:text-gray-300 italic">
                        {q.scenario}
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2 pt-2">
                      {q.options.map(opt => {
                        const isChosen = selectedOptId === opt.id;
                        let optionStyle = 'border-slate-200 dark:border-gray-800 hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-gray-800/50';

                        if (isAnswered) {
                          if (opt.isCorrect) {
                            optionStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 font-medium';
                          } else if (isChosen && !opt.isCorrect) {
                            optionStyle = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100';
                          } else {
                            optionStyle = 'border-slate-200 dark:border-gray-800 opacity-50';
                          }
                        }

                        return (
                          <div
                            key={opt.id}
                            onClick={() => !isAnswered && handleSelectOption(q.id, opt.id, opt.isCorrect)}
                            className={`p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${optionStyle}`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="leading-relaxed">{opt.text}</span>
                              {isAnswered && opt.isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2 mt-0.5" />
                              )}
                              {isAnswered && isChosen && !opt.isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2 mt-0.5" />
                              )}
                            </div>

                            {/* Option Explanation */}
                            {isAnswered && (
                              <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-gray-700/50 text-xs text-slate-600 dark:text-gray-400">
                                <span className="font-semibold text-slate-800 dark:text-gray-200">Analysis: </span>
                                {opt.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* General Explanation & Link to Concept */}
                    {isAnswered && (
                      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs text-slate-700 dark:text-gray-300 space-y-2 animate-fadeIn">
                        <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center">
                          <HelpCircle className="w-4 h-4 mr-1.5" />
                          Architectural Principle:
                        </div>
                        <p className="leading-relaxed">{q.generalExplanation}</p>
                        {q.relatedConceptId && (
                          <div className="pt-1">
                            <button
                              onClick={() => navigateTo(`#/concepts/${q.relatedConceptId}`)}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center"
                            >
                              Deep-dive lesson on this topic <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {currentFlashcard ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Card {flashcardIndex + 1} of {FLASHCARDS.length}</span>
                <Badge variant="domain" domain={currentFlashcard.domain}>
                  {currentFlashcard.domain}
                </Badge>
              </div>

              {/* Flashcard container with flip */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[300px] p-8 rounded-2xl border-2 border-blue-500/30 bg-white dark:bg-gray-900 shadow-xl cursor-pointer flex flex-col justify-between transition-all hover:border-blue-500 select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {isFlipped ? 'Architectural Solution (Back)' : 'System Design Question (Front)'}
                  </span>
                  <span className="text-xs text-slate-400 italic">Click card to flip</span>
                </div>

                <div className="py-6 text-center">
                  {!isFlipped ? (
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentFlashcard.frontQuestion}
                    </h3>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-base text-slate-800 dark:text-gray-200 leading-relaxed">
                        {currentFlashcard.backAnswer}
                      </p>
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                        Key Takeaway: {currentFlashcard.keyTakeaway}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-xs text-slate-400">
                  {isFlipped ? 'Tap to view question' : 'Tap to reveal answer & key takeaway'}
                </div>
              </div>

              {/* Card Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={flashcardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex(prev => Math.max(0, prev - 1));
                  }}
                >
                  Previous Card
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    toggleKnownFlashcard(currentFlashcard.id);
                    setIsFlipped(false);
                    if (flashcardIndex + 1 < FLASHCARDS.length) {
                      setFlashcardIndex(prev => prev + 1);
                    }
                  }}
                >
                  {progress.knownFlashcardIds.includes(currentFlashcard.id) ? 'Marked as Mastered' : 'Mark Known & Next'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={flashcardIndex === FLASHCARDS.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setFlashcardIndex(prev => Math.min(FLASHCARDS.length - 1, prev + 1));
                  }}
                >
                  Next Card
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Loading flashcard deck...</div>
          )}
        </div>
      )}

      {/* Tab 3: Case Studies */}
      {activeTab === 'case_studies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CASE_STUDIES.map(cs => {
            const isCompleted = progress.completedCaseStudyIds.includes(cs.id);

            return (
              <Card
                key={cs.id}
                hoverable
                onClick={() => navigateTo(`#/practice/case-studies/${cs.id}`)}
                className="p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {cs.targetCompany} Case Study
                    </span>
                    <Badge variant="difficulty" difficulty={cs.difficulty}>
                      {cs.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {cs.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">
                    {cs.problemStatement}
                  </p>

                  <div className="space-y-1 mb-4 text-xs">
                    <div className="font-semibold text-slate-400 uppercase text-[10px]">
                      Core Bottlenecks Addressed:
                    </div>
                    {cs.deepDiveBottlenecks.slice(0, 2).map((b, i) => (
                      <div key={i} className="text-slate-600 dark:text-gray-300 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 shrink-0" />
                        <span className="truncate">{b.bottleneck}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  {isCompleted ? (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-slate-400">~{cs.estimatedMinutes} min breakdown</span>
                  )}

                  <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                    Read Architecture <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
