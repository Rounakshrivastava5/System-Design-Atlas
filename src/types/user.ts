export interface QuizAttempt {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface UserProgress {
  completedConceptIds: string[];
  completedLabIds: string[];
  completedCaseStudyIds: string[];
  bookmarks: string[]; // Concept IDs
  notes: Record<string, string>; // conceptId -> note content
  quizAttempts: QuizAttempt[];
  knownFlashcardIds: string[];
}

export type ThemeMode = 'light' | 'dark';
