import { ConceptDomain, ConceptDifficulty } from './concept';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  domain: ConceptDomain;
  difficulty: ConceptDifficulty;
  question: string;
  scenario?: string;
  codeSnippet?: string;
  options: QuizOption[];
  generalExplanation: string;
  relatedConceptId?: string;
}

export interface Flashcard {
  id: string;
  domain: ConceptDomain;
  difficulty: ConceptDifficulty;
  frontQuestion: string;
  backAnswer: string;
  keyTakeaway: string;
  relatedConceptId?: string;
}

export interface CapacityEstimationItem {
  metric: string;
  calculation: string;
  result: string;
  notes?: string;
}

export interface CaseStudyArchitectureStep {
  stepNumber: number;
  title: string;
  description: string;
  diagramAsciiOrSvg?: string;
  componentsInvolved: string[];
  tradeoffsConsidered: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  targetCompany: string;
  domain: ConceptDomain;
  difficulty: ConceptDifficulty;
  estimatedMinutes: number;
  problemStatement: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  capacityEstimations: CapacityEstimationItem[];
  highLevelDesign: string;
  detailedSteps: CaseStudyArchitectureStep[];
  deepDiveBottlenecks: {
    bottleneck: string;
    challenge: string;
    architecturalSolution: string;
  }[];
  resiliencyAndFailover: string[];
  relatedConceptIds: string[];
}
