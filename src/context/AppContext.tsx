import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, ThemeMode, QuizAttempt } from '../types/user';
import { storage } from '../storage/localStorage';

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  progress: UserProgress;
  markConceptComplete: (id: string, completed: boolean) => void;
  toggleBookmark: (id: string) => void;
  saveNote: (id: string, noteText: string) => void;
  recordQuizAttempt: (attempt: QuizAttempt) => void;
  toggleKnownFlashcard: (id: string) => void;
  markCaseStudyComplete: (id: string, completed: boolean) => void;
  currentRoute: string;
  navigateTo: (route: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => storage.getTheme());
  const [progress, setProgress] = useState<UserProgress>(() => storage.getUserProgress());
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return window.location.hash;
    }
    return '#/';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync theme changes with DOM
  useEffect(() => {
    storage.setTheme(theme);
  }, [theme]);

  // Sync route changes with window hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    const target = route.startsWith('#') ? route : `#${route}`;
    window.location.hash = target;
    setCurrentRoute(target);
    window.scrollTo(0, 0);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const markConceptComplete = (id: string, completed: boolean) => {
    setProgress(prev => {
      const exists = prev.completedConceptIds.includes(id);
      let updated: string[];
      if (completed && !exists) {
        updated = [...prev.completedConceptIds, id];
      } else if (!completed && exists) {
        updated = prev.completedConceptIds.filter(c => c !== id);
      } else {
        return prev;
      }
      const newProgress = { ...prev, completedConceptIds: updated };
      storage.saveUserProgress(newProgress);
      return newProgress;
    });
  };

  const toggleBookmark = (id: string) => {
    setProgress(prev => {
      const exists = prev.bookmarks.includes(id);
      const updated = exists ? prev.bookmarks.filter(b => b !== id) : [...prev.bookmarks, id];
      const newProgress = { ...prev, bookmarks: updated };
      storage.saveUserProgress(newProgress);
      return newProgress;
    });
  };

  const saveNote = (id: string, noteText: string) => {
    setProgress(prev => {
      const newNotes = { ...prev.notes, [id]: noteText };
      const newProgress = { ...prev, notes: newNotes };
      storage.saveUserProgress(newProgress);
      return newProgress;
    });
  };

  const recordQuizAttempt = (attempt: QuizAttempt) => {
    setProgress(prev => {
      // Keep recent attempts, update if same question attempted
      const otherAttempts = prev.quizAttempts.filter(q => q.questionId !== attempt.questionId);
      const newAttempts = [...otherAttempts, attempt];
      const newProgress = { ...prev, quizAttempts: newAttempts };
      storage.saveUserProgress(newProgress);
      return newProgress;
    });
  };

  const toggleKnownFlashcard = (id: string) => {
    setProgress(prev => {
      const exists = prev.knownFlashcardIds.includes(id);
      const updated = exists ? prev.knownFlashcardIds.filter(f => f !== id) : [...prev.knownFlashcardIds, id];
      const newProgress = { ...prev, knownFlashcardIds: updated };
      storage.saveUserProgress(newProgress);
      return newProgress;
    });
  };

  const markCaseStudyComplete = (id: string, completed: boolean) => {
    setProgress(prev => {
      const exists = prev.completedCaseStudyIds.includes(id);
      let updated: string[];
      if (completed && !exists) {
        updated = [...prev.completedCaseStudyIds, id];
      } else if (!completed && exists) {
        updated = prev.completedCaseStudyIds.filter(c => c !== id);
      } else {
        return prev;
      }
      const newProgress = { ...prev, completedCaseStudyIds: updated };
      storage.saveUserProgress(newProgress);
      return newProgress;
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        progress,
        markConceptComplete,
        toggleBookmark,
        saveNote,
        recordQuizAttempt,
        toggleKnownFlashcard,
        markCaseStudyComplete,
        currentRoute,
        navigateTo,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
