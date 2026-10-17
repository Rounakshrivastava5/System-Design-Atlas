# System Design Atlas — System Architecture & Technical Design

## 1. Technology Stack

- **Runtime & Language**: Node.js v24 LTS / Browser runtime, TypeScript 5.6+ with strict mode enabled.
- **Frontend Framework**: React 18 / 19 with Vite 6.
- **Styling & Design Tokens**: Tailwind CSS 3.4+ configured with CSS Custom Properties for dynamic Light/Dark mode switching and custom semantic design tokens.
- **Icons**: Lucide React for modern, consistent, tree-shakeable SVG icons.
- **State Management**: Lightweight React Context providers with atomic Custom Hooks, backed by reactive `localStorage` persistence layer.
- **Canvas / Diagramming Engine**: Pure SVG + HTML5 Canvas hybrid renderer providing high performance, crisp vector scaling, pan & zoom, drag-and-drop, and high-DPI export without heavy external canvas dependencies.
- **Unit & Component Testing**: Vitest with React Testing Library and JSDOM.
- **Build & Bundle**: Vite build targeting modern ES2022+ standards with code splitting for fast initial page load.

---

## 2. Directory Structure

```
system-design-atlas/
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── CONTENT_TAXONOMY.md
│   ├── UX_AND_DESIGN.md
│   └── IMPLEMENTATION_PLAN.md
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/             # Reusable UI primitives (Button, Modal, Card, Badge, Slider, Switch, Tabs, Alert)
│   │   ├── layout/             # Shell, Sidebar, TopNav, Breadcrumbs, MobileDrawer
│   │   └── search/             # Global Cmd+K Search Palette Modal
│   ├── features/
│   │   ├── dashboard/          # Metric counters, domain progress, continue card, quick challenge
│   │   ├── concepts/           # Concept catalog grid, filter bar, concept detail view, notes editor
│   │   ├── labs/               # 12 Interactive lab simulations & interactive visualizer components
│   │   ├── workbench/          # Architecture canvas, component palette, connection manager, inspector, templates
│   │   └── practice/           # Quiz runner, score review, flashcard deck, 10 case study readers
│   ├── data/
│   │   ├── concepts/           # 50+ typed concepts & 20 flagship deep-dive lessons
│   │   ├── labs/               # Lab metadata, presets, and configuration specs
│   │   ├── caseStudies/        # 10 comprehensive worked architecture case studies
│   │   ├── quizzes/            # Categorized question bank with deep explanations
│   │   ├── flashcards/         # Interview revision flashcards
│   │   └── starters/           # Pre-configured architecture workbench templates
│   ├── storage/
│   │   ├── localStorage.ts     # Namespaced, safe local storage wrappers with schema validation
│   │   └── initialData.ts      # Default seed states and fallback configurations
│   ├── types/
│   │   ├── concept.ts          # Concept, Domain, Difficulty, FlagshipLesson types
│   │   ├── lab.ts              # LabDefinition, SimulationState, LabMetric types
│   │   ├── workbench.ts        # Node, Edge, ComponentType, ArchitectureDocument types
│   │   ├── practice.ts         # QuizQuestion, Flashcard, CaseStudy types
│   │   └── user.ts             # UserProgress, Note, Bookmark, AppPreferences types
│   ├── hooks/
│   │   ├── useTheme.ts         # Light / Dark mode management with system preference fallback
│   │   ├── useUserProgress.ts  # Track concept reads, quiz scores, bookmarks, and notes
│   │   ├── useWorkbench.ts     # Canvas manipulation, node dragging, connection routing, export/import
│   │   └── useKeyboardShortcuts.ts # Cmd+K, Esc, canvas hotkeys
│   ├── utils/
│   │   ├── math.ts             # Capacity estimations, distribution formulas, latency calculators
│   │   ├── validation.ts       # JSON schema validators for architecture import/export
│   │   └── search.ts           # Tokenized fuzzy search across concepts, labs, and case studies
│   ├── App.tsx                 # Root router and context providers
│   ├── main.tsx                # Application bootstrap
│   └── index.css               # Tailwind directives, CSS variables, and typography styles
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

---

## 3. Data Architecture & Types

### 3.1 Concept Model
```typescript
export type ConceptDomain = 
  | 'fundamentals'
  | 'scalability'
  | 'storage'
  | 'networking'
  | 'distributed'
  | 'observability';

export type ConceptDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Concept {
  id: string;
  title: string;
  shortDescription: string;
  domain: ConceptDomain;
  difficulty: ConceptDifficulty;
  readTimeMinutes: number;
  tags: string[];
  prerequisites: string[]; // Concept IDs
  relatedConcepts: string[]; // Concept IDs
  pairedLabId?: string;
  isFlagship: boolean;
  content: {
    overview: string;
    keyTradeoffs: { advantage: string; drawback: string }[];
    formulas?: { name: string; equation: string; explanation: string }[];
    failureModes: { failure: string; consequence: string; mitigation: string }[];
    realWorldExamples: { companyOrSystem: string; usage: string }[];
    implementationChecklist?: string[];
  };
}
```

### 3.2 Workbench Architecture Document Model
```typescript
export type NodeCategory = 'client' | 'edge' | 'service' | 'storage' | 'messaging' | 'observability';

export interface ArchitectureNode {
  id: string;
  name: string;
  type: string;
  category: NodeCategory;
  x: number;
  y: number;
  replicas: number;
  capacityQps: number;
  avgLatencyMs: number;
  notes?: string;
}

export type ConnectionProtocol = 'http_rest' | 'grpc' | 'websocket' | 'graphql' | 'async_event' | 'tcp' | 'sql';

export interface ArchitectureEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  protocol: ConnectionProtocol;
  estimatedQps?: number;
  latencyMs?: number;
}

export interface ArchitectureDocument {
  id: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}
```

### 3.3 Practice & Quiz Model
```typescript
export interface QuizQuestion {
  id: string;
  domain: ConceptDomain;
  difficulty: ConceptDifficulty;
  question: string;
  scenario?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  generalExplanation: string;
  relatedConceptId?: string;
}
```

---

## 4. Local Persistence Layer

All user interaction and custom configuration is persisted through an abstraction layer (`storage/localStorage.ts`) using the following namespace:
- `sda_theme`: `'light' | 'dark'`
- `sda_progress`: `{ completedConceptIds: string[], completedLabIds: string[] }`
- `sda_bookmarks`: `string[]` (concept IDs)
- `sda_notes`: `Record<string, string>` (conceptId -> markdown note)
- `sda_quiz_history`: `{ questionId: string; selectedOptionId: string; isCorrect: boolean; timestamp: number }[]`
- `sda_workbench_saved`: `ArchitectureDocument[]`
- `sda_workbench_current`: `ArchitectureDocument`

Defensive deserialization with JSON schema validation ensures corrupted or legacy localStorage values gracefully fall back to default seeds without throwing uncaught runtime exceptions.

---

## 5. Client-Side Routing Strategy

A hash-based or history-based lightweight SPA router provides instantaneous page loads without any external server dependency:
- `#/` (or `/`): Dashboard
- `#/concepts`: Concept Catalog
- `#/concepts/:id`: Detailed Concept & Flagship Lesson
- `#/labs`: Labs Catalog
- `#/labs/:id`: Dedicated Interactive Lab
- `#/workbench`: Architecture Modeling Canvas
- `#/practice`: Practice Center (Quizzes, Flashcards, Case Study list)
- `#/practice/case-studies/:id`: Case Study Deep Dive

---

## 6. Verification and Test Strategy

- **Unit & Component Testing with Vitest**:
  - Test calculation utilities (back-of-envelope math, quota algorithms, consistent hashing math).
  - Test persistence layer serialization and defensive validation against corrupted payloads.
  - Test workbench connection creation, cycle detection, and JSON schema import validation.
  - Test quiz scoring, answer recording, and incorrect-answer filtering.
- **Production Compilation (`vite build`)**:
  - Strict TypeScript check (`tsc --noEmit`) to verify zero type mismatches.
  - Verification of asset chunks and CSS generation.

---

## 7. Implementation Decisions & Verification Results

### 7.1 Architecture & Implementation Decisions
- **Zero-Dependency Vector Canvas**: Implemented using pure React SVG elements with coordinate transforms rather than bundling heavy canvas libraries (like Konva or Fabric.js). This keeps bundle size under ~176 KB gzipped while providing smooth dragging, dynamic Bézier connection curves, and SVG export.
- **Hash-Based Routing (`#/`)**: Chosen to ensure seamless hosting on GitHub Pages, static CDNs, local filesystems, or offline environments without requiring server-side URL rewrite rules.
- **Unified Reactive Persistence (`AppContext`)**: All persistence flows through a single centralized React context backed by `localStorage.ts`. This ensures that bookmark toggling, note auto-saving, quiz score records, and workbench updates reactively synchronize across all views without race conditions.
- **Heuristic Bottleneck Engine**: The workbench includes a real-time topology analyzer evaluating Single Points of Failure (SPOFs), downstream capacity mismatches, and path latencies, turning diagrams into learning instruments.

### 7.2 Final Verification Metrics
- **Curriculum Taxonomy**: 52 complete concepts (exceeding 50 minimum), 27 flagship deep dives (exceeding 20 minimum).
- **Interactive Labs**: 12 fully functional simulation laboratories with interactive controls and assumptions documentation.
- **Worked Case Studies**: 10 comprehensive FAANG-grade case studies covering capacity estimation, high-level design, and failure modes.
- **Test Suite**: 43/43 tests passing across 5 test suites (`math.test.ts`, `validation.test.ts`, `localStorage.test.ts`, `concepts.test.ts`, `components.test.tsx`).
- **TypeScript**: Strict mode with zero compilation errors (`tsc --noEmit` exits with 0).
- **Production Build**: Clean bundle generated in `dist/` with total gzipped JS of ~176 KB.

