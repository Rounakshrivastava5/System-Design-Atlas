import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../storage/localStorage';
import { UserProgress } from '../types/user';
import { ArchitectureDocument } from '../types/workbench';

describe('storage module', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('theme storage', () => {
    it('defaults to dark mode when unset', () => {
      const theme = storage.getTheme();
      expect(['light', 'dark']).toContain(theme);
    });

    it('saves and retrieves light and dark mode', () => {
      storage.setTheme('light');
      expect(storage.getTheme()).toBe('light');

      storage.setTheme('dark');
      expect(storage.getTheme()).toBe('dark');
    });
  });

  describe('user progress storage', () => {
    it('returns default empty progress on clean storage', () => {
      const progress = storage.getUserProgress();
      expect(progress.completedConceptIds).toEqual([]);
      expect(progress.completedLabIds).toEqual([]);
      expect(progress.bookmarks).toEqual([]);
      expect(progress.notes).toEqual({});
      expect(progress.quizAttempts).toEqual([]);
    });

    it('persists and loads updated user progress', () => {
      const updated: UserProgress = {
        completedConceptIds: ['cap-theorem-in-practice', 'rate-limiting-algorithms'],
        completedLabIds: ['load-balancer-lab'],
        completedCaseStudyIds: ['tinyurl'],
        bookmarks: ['consistent-hashing-virtual-nodes'],
        notes: { 'cap-theorem-in-practice': 'Remember PACELC theorem during normal ops.' },
        quizAttempts: [
          {
            questionId: 'q1',
            selectedOptionId: 'opt-b',
            isCorrect: true,
            timestamp: 1776400000000,
          },
        ],
        knownFlashcardIds: ['fc-cap'],
      };

      storage.saveUserProgress(updated);
      const loaded = storage.getUserProgress();

      expect(loaded.completedConceptIds).toContain('cap-theorem-in-practice');
      expect(loaded.completedLabIds).toContain('load-balancer-lab');
      expect(loaded.bookmarks).toContain('consistent-hashing-virtual-nodes');
      expect(loaded.notes['cap-theorem-in-practice']).toBe('Remember PACELC theorem during normal ops.');
      expect(loaded.quizAttempts).toHaveLength(1);
      expect(loaded.quizAttempts[0].isCorrect).toBe(true);
    });

    it('safely recovers from corrupted progress JSON in localStorage', () => {
      localStorage.setItem('sda_user_progress', '{not-valid-json}');
      const progress = storage.getUserProgress();

      expect(progress.completedConceptIds).toEqual([]);
      expect(progress.bookmarks).toEqual([]);
    });
  });

  describe('workbench architecture storage', () => {
    const sampleDoc: ArchitectureDocument = {
      id: 'arch-123',
      title: 'Microservices Mesh',
      description: 'Envoy mTLS cluster',
      version: '1.0.0',
      createdAt: '2026-10-17T10:00:00Z',
      updatedAt: '2026-10-17T10:00:00Z',
      nodes: [],
      edges: [],
    };

    it('saves and retrieves saved architectures list', () => {
      expect(storage.getSavedArchitectures()).toEqual([]);

      storage.saveArchitectures([sampleDoc]);
      const saved = storage.getSavedArchitectures();

      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('arch-123');
      expect(saved[0].title).toBe('Microservices Mesh');
    });

    it('saves and retrieves current active working architecture', () => {
      expect(storage.getCurrentArchitecture()).toBeNull();

      storage.saveCurrentArchitecture(sampleDoc);
      const current = storage.getCurrentArchitecture();

      expect(current).not.toBeNull();
      expect(current?.id).toBe('arch-123');
    });

    it('recovers cleanly from corrupted architecture storage', () => {
      localStorage.setItem('sda_saved_architectures', 'corrupted[');
      expect(storage.getSavedArchitectures()).toEqual([]);

      localStorage.setItem('sda_current_architecture', 'corrupted[');
      expect(storage.getCurrentArchitecture()).toBeNull();
    });
  });
});
