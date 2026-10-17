export type ConceptDomain = 
  | 'fundamentals'
  | 'scalability'
  | 'storage'
  | 'networking'
  | 'distributed'
  | 'observability';

export type ConceptDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ConceptTradeoff {
  advantage: string;
  drawback: string;
}

export interface ConceptFormula {
  name: string;
  equation: string;
  explanation: string;
}

export interface ConceptFailureMode {
  failure: string;
  consequence: string;
  mitigation: string;
}

export interface ConceptRealWorldExample {
  companyOrSystem: string;
  usage: string;
  details?: string;
}

export interface ConceptContent {
  overview: string;
  architectureDetails?: string;
  keyTradeoffs: ConceptTradeoff[];
  formulas?: ConceptFormula[];
  failureModes: ConceptFailureMode[];
  realWorldExamples: ConceptRealWorldExample[];
  interviewTips?: string[];
  implementationChecklist?: string[];
}

export interface Concept {
  id: string;
  title: string;
  shortDescription: string;
  domain: ConceptDomain;
  difficulty: ConceptDifficulty;
  readTimeMinutes: number;
  tags: string[];
  prerequisites: string[]; // List of concept IDs
  relatedConcepts: string[]; // List of concept IDs
  pairedLabId?: string; // Optional ID of an interactive lab
  isFlagship: boolean; // Indicates if this is one of the 20 flagship deep dives
  content: ConceptContent;
}

export interface DomainMeta {
  id: ConceptDomain;
  name: string;
  shortName: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}
