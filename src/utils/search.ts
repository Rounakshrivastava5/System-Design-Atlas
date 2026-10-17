import { Concept } from '../types/concept';
import { LabDefinition } from '../types/lab';
import { CaseStudy } from '../types/practice';

export interface SearchResultItem {
  id: string;
  type: 'concept' | 'lab' | 'case_study';
  title: string;
  subtitle: string;
  domain: string;
  difficulty?: string;
  targetRoute: string;
}

export function searchAtlas(
  query: string,
  concepts: Concept[],
  labs: LabDefinition[],
  caseStudies: CaseStudy[]
): SearchResultItem[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: SearchResultItem[] = [];

  // Match Concepts
  for (const c of concepts) {
    const titleMatch = c.title.toLowerCase().includes(cleanQuery);
    const descMatch = c.shortDescription.toLowerCase().includes(cleanQuery);
    const tagMatch = c.tags.some(t => t.toLowerCase().includes(cleanQuery));

    if (titleMatch || descMatch || tagMatch) {
      results.push({
        id: c.id,
        type: 'concept',
        title: c.title,
        subtitle: c.shortDescription,
        domain: c.domain,
        difficulty: c.difficulty,
        targetRoute: `#/concepts/${c.id}`,
      });
    }
  }

  // Match Labs
  for (const l of labs) {
    const titleMatch = l.title.toLowerCase().includes(cleanQuery);
    const descMatch = l.shortDescription.toLowerCase().includes(cleanQuery);

    if (titleMatch || descMatch) {
      results.push({
        id: l.id,
        type: 'lab',
        title: l.title,
        subtitle: l.shortDescription,
        domain: l.domain,
        difficulty: l.difficulty,
        targetRoute: `#/labs/${l.id}`,
      });
    }
  }

  // Match Case Studies
  for (const cs of caseStudies) {
    const titleMatch = cs.title.toLowerCase().includes(cleanQuery);
    const companyMatch = cs.targetCompany.toLowerCase().includes(cleanQuery);
    const descMatch = cs.problemStatement.toLowerCase().includes(cleanQuery);

    if (titleMatch || companyMatch || descMatch) {
      results.push({
        id: cs.id,
        type: 'case_study',
        title: cs.title,
        subtitle: `${cs.targetCompany} Architecture Case Study`,
        domain: cs.domain,
        difficulty: cs.difficulty,
        targetRoute: `#/practice/case-studies/${cs.id}`,
      });
    }
  }

  return results.slice(0, 15);
}
