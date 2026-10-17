import { describe, it, expect } from 'vitest';
import { CONCEPTS } from '../data/concepts';
import { LABS } from '../data/labs';
import { CASE_STUDIES } from '../data/caseStudies';
import { QUIZ_QUESTIONS } from '../data/quizzes';
import { FLASHCARDS } from '../data/flashcards';

describe('Curriculum Content Integrity', () => {
  it('contains at least 50 concepts (taxonomic target is 52)', () => {
    expect(CONCEPTS.length).toBeGreaterThanOrEqual(50);
    expect(CONCEPTS.length).toBe(52);
  });

  it('contains at least 20 flagship deep dives', () => {
    const flagships = CONCEPTS.filter(c => c.isFlagship);
    expect(flagships.length).toBeGreaterThanOrEqual(20);
  });

  it('has representation across all 6 core architecture domains', () => {
    const domains = new Set(CONCEPTS.map(c => c.domain));
    expect(domains.has('fundamentals')).toBe(true);
    expect(domains.has('scalability')).toBe(true);
    expect(domains.has('storage')).toBe(true);
    expect(domains.has('networking')).toBe(true);
    expect(domains.has('distributed')).toBe(true);
    expect(domains.has('observability')).toBe(true);
  });

  it('guarantees unique IDs for all concepts', () => {
    const ids = new Set<string>();
    for (const c of CONCEPTS) {
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
    }
  });

  it('verifies every concept has deep educational sections and no placeholders', () => {
    for (const c of CONCEPTS) {
      expect(c.title.trim().length).toBeGreaterThan(3);
      expect(c.shortDescription.trim().length).toBeGreaterThan(15);
      expect(c.content.overview.trim().length).toBeGreaterThan(100);
      expect(c.content.keyTradeoffs.length).toBeGreaterThanOrEqual(1);
      for (const t of c.content.keyTradeoffs) {
        expect(t.advantage.trim().length).toBeGreaterThan(10);
        expect(t.drawback.trim().length).toBeGreaterThan(10);
      }
      expect(c.content.failureModes.length).toBeGreaterThanOrEqual(1);
      for (const f of c.content.failureModes) {
        expect(f.failure.trim().length).toBeGreaterThan(3);
        expect(f.consequence.trim().length).toBeGreaterThan(10);
        expect(f.mitigation.trim().length).toBeGreaterThan(10);
      }
      expect(c.content.realWorldExamples.length).toBeGreaterThanOrEqual(1);
      for (const ex of c.content.realWorldExamples) {
        expect(ex.companyOrSystem.trim().length).toBeGreaterThan(2);
        expect(ex.usage.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it('verifies that prerequisites and related concepts do not contain dangling links', () => {
    const conceptIdSet = new Set(CONCEPTS.map(c => c.id));

    for (const c of CONCEPTS) {
      for (const prereq of c.prerequisites) {
        expect(
          conceptIdSet.has(prereq),
          `Concept "${c.id}" references unknown prerequisite "${prereq}"`
        ).toBe(true);
      }

      for (const rel of c.relatedConcepts) {
        expect(
          conceptIdSet.has(rel),
          `Concept "${c.id}" references unknown related concept "${rel}"`
        ).toBe(true);
      }
    }
  });

  it('verifies that pairedLabId references valid labs', () => {
    const labIdSet = new Set(LABS.map(l => l.id));

    for (const c of CONCEPTS) {
      if (c.pairedLabId) {
        expect(
          labIdSet.has(c.pairedLabId),
          `Concept "${c.id}" references unknown pairedLabId "${c.pairedLabId}"`
        ).toBe(true);
      }
    }
  });

  it('contains exactly 12 fully defined simulation labs', () => {
    expect(LABS).toHaveLength(12);
    for (const lab of LABS) {
      expect(lab.id).toBeTruthy();
      expect(lab.title).toBeTruthy();
      expect(lab.shortDescription).toBeTruthy();
      expect(lab.assumptions.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('contains exactly 10 comprehensive worked case studies', () => {
    expect(CASE_STUDIES).toHaveLength(10);
    for (const cs of CASE_STUDIES) {
      expect(cs.id).toBeTruthy();
      expect(cs.title).toBeTruthy();
      expect(cs.functionalRequirements.length).toBeGreaterThan(0);
      expect(cs.nonFunctionalRequirements.length).toBeGreaterThan(0);
      expect(cs.capacityEstimations.length).toBeGreaterThan(0);
      expect(cs.detailedSteps.length).toBeGreaterThan(0);
    }
  });

  it('contains quizzes and flashcards for practice', () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.generalExplanation.length).toBeGreaterThan(15);
      expect(q.options.some(opt => opt.isCorrect)).toBe(true);
    }

    expect(FLASHCARDS.length).toBeGreaterThanOrEqual(15);
    for (const fc of FLASHCARDS) {
      expect(fc.frontQuestion).toBeTruthy();
      expect(fc.backAnswer).toBeTruthy();
      expect(fc.keyTakeaway).toBeTruthy();
    }
  });
});
