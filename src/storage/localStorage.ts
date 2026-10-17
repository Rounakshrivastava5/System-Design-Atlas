import { UserProgress, ThemeMode } from '../types/user';
import { ArchitectureDocument } from '../types/workbench';

const KEYS = {
  THEME: 'sda_theme_mode',
  PROGRESS: 'sda_user_progress',
  SAVED_WORKBENCH: 'sda_saved_architectures',
  CURRENT_WORKBENCH: 'sda_current_architecture',
};

const DEFAULT_PROGRESS: UserProgress = {
  completedConceptIds: [],
  completedLabIds: [],
  completedCaseStudyIds: [],
  bookmarks: [],
  notes: {},
  quizAttempts: [],
  knownFlashcardIds: [],
};

export const storage = {
  getTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
      // Default to dark mode for developer-centric UX if system prefers dark
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
  },

  getUserProgress(): UserProgress {
    try {
      const raw = localStorage.getItem(KEYS.PROGRESS);
      if (!raw) return DEFAULT_PROGRESS;
      const parsed = JSON.parse(raw);
      return {
        completedConceptIds: Array.isArray(parsed.completedConceptIds) ? parsed.completedConceptIds : [],
        completedLabIds: Array.isArray(parsed.completedLabIds) ? parsed.completedLabIds : [],
        completedCaseStudyIds: Array.isArray(parsed.completedCaseStudyIds) ? parsed.completedCaseStudyIds : [],
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
        notes: typeof parsed.notes === 'object' && parsed.notes !== null ? parsed.notes : {},
        quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
        knownFlashcardIds: Array.isArray(parsed.knownFlashcardIds) ? parsed.knownFlashcardIds : [],
      };
    } catch (e) {
      console.warn('Corrupted progress storage, returning default:', e);
      return DEFAULT_PROGRESS;
    }
  },

  saveUserProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save user progress:', e);
    }
  },

  getSavedArchitectures(): ArchitectureDocument[] {
    try {
      const raw = localStorage.getItem(KEYS.SAVED_WORKBENCH);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveArchitectures(docs: ArchitectureDocument[]): void {
    try {
      localStorage.setItem(KEYS.SAVED_WORKBENCH, JSON.stringify(docs));
    } catch (e) {
      console.warn('Failed to save architectures:', e);
    }
  },

  getCurrentArchitecture(): ArchitectureDocument | null {
    try {
      const raw = localStorage.getItem(KEYS.CURRENT_WORKBENCH);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveCurrentArchitecture(doc: ArchitectureDocument): void {
    try {
      localStorage.setItem(KEYS.CURRENT_WORKBENCH, JSON.stringify(doc));
    } catch (e) {
      console.warn('Failed to save current architecture:', e);
    }
  },
};
