import { ConceptDomain } from './concept';

export type LabCategory = 'traffic' | 'storage' | 'distributed' | 'reliability';

export interface LabControlParam {
  id: string;
  label: string;
  type: 'slider' | 'select' | 'toggle' | 'step';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string | boolean;
  options?: { label: string; value: string | number }[];
  unit?: string;
  description?: string;
}

export interface LabMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  status?: 'optimal' | 'warning' | 'critical' | 'neutral';
  description?: string;
}

export interface LabAssumption {
  assumption: string;
  realWorldDifference: string;
}

export interface LabDefinition {
  id: string;
  title: string;
  shortDescription: string;
  domain: ConceptDomain;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  estimatedMinutes: number;
  pairedConceptId?: string;
  learningObjectives: string[];
  controls: LabControlParam[];
  assumptions: LabAssumption[];
}
