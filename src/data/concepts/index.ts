import { Concept } from '../../types/concept';
import { FUNDAMENTALS_CONCEPTS } from './fundamentals';
import { SCALABILITY_CONCEPTS } from './scalability';
import { STORAGE_CONCEPTS } from './storage';
import { NETWORKING_CONCEPTS } from './networking';
import { DISTRIBUTED_CONCEPTS } from './distributed';
import { OBSERVABILITY_CONCEPTS } from './observability';

export const CONCEPTS: Concept[] = [
  ...FUNDAMENTALS_CONCEPTS,
  ...SCALABILITY_CONCEPTS,
  ...STORAGE_CONCEPTS,
  ...NETWORKING_CONCEPTS,
  ...DISTRIBUTED_CONCEPTS,
  ...OBSERVABILITY_CONCEPTS,
];

export const getConceptById = (id: string): Concept | undefined => {
  return CONCEPTS.find(c => c.id === id);
};

export const getConceptsByDomain = (domain: string): Concept[] => {
  return CONCEPTS.filter(c => c.domain === domain);
};

export {
  FUNDAMENTALS_CONCEPTS,
  SCALABILITY_CONCEPTS,
  STORAGE_CONCEPTS,
  NETWORKING_CONCEPTS,
  DISTRIBUTED_CONCEPTS,
  OBSERVABILITY_CONCEPTS,
};
