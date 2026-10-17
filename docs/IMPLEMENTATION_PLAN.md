# System Design Atlas — Implementation Plan

This implementation plan breaks down the construction of the System Design Atlas into seven sequential, testable vertical milestones with explicit acceptance criteria.

---

## Milestone Checklist & Acceptance Criteria

### Milestone 1 — Foundation: Shell, Routing, Navigation, Design Tokens & Persistence
- [ ] Task 1.1: Project initialization with Vite + React + TypeScript + Tailwind CSS + Lucide Icons + Vitest.
- [ ] Task 1.2: Design token implementation (CSS custom variables for light/dark mode, typography, surfaces, borders).
- [ ] Task 1.3: Client-side router supporting the 5 main routes (`/`, `/concepts`, `/labs`, `/workbench`, `/practice`) and sub-routes (`/concepts/:id`, `/labs/:id`, `/practice/case-studies/:id`).
- [ ] Task 1.4: App shell layout with responsive sidebar, sticky top navbar, breadcrumbs, theme switcher, and mobile drawer.
- [ ] Task 1.5: Local persistence service (`storage/localStorage.ts`) managing theme, progress, bookmarks, notes, quiz history, and saved architectures with schema validation and safe fallbacks.
- [ ] Task 1.6: Global Search Palette (`Cmd+K` / `Ctrl+K`) indexing all concepts, labs, case studies, and quizzes.
*Acceptance Criteria*:
- App renders without console errors in both Light and Dark themes.
- Navigating between all five core routes updates URL and breadcrumbs seamlessly.
- State persists across page reloads in `localStorage`.
- Global search modal opens on shortcut and filters content accurately.

---

### Milestone 2 — Educational Engine: Curriculum, Concept Catalog, Detail Layout & Progress
- [ ] Task 2.1: Implement typed data schemas for Concepts, Domains, Difficulties, Flagship Lessons, Notes, and Bookmarks.
- [ ] Task 2.2: Implement Concept Catalog page with multi-dimensional filtering (domain tabs, difficulty filter, completion status, search query).
- [ ] Task 2.3: Implement Concept Detail view with structured tabs/sections: Theory Overview, Key Trade-offs, Mathematical Formulations, Failure Modes, Real-World Examples, Implementation Checklist.
- [ ] Task 2.4: Implement prerequisite and related concept links with smooth navigation.
- [ ] Task 2.5: Implement live Markdown personal notes editor per concept with auto-save to `localStorage`.
- [ ] Task 2.6: Implement concept completion tracker and bookmark toggle with instant UI reflection and dashboard synchronization.
*Acceptance Criteria*:
- All 52 concepts are accessible in the catalog and navigable to detail views.
- Marking a concept as completed or bookmarked updates the counter in the sidebar and dashboard.
- Notes typed in concept detail persist across reloads.
- Prerequisite links navigate to the correct concept page.

---

### Milestone 3 — Interactive Labs: 12 Simulation Engines & Visualizers
- [ ] Task 3.1: Build Load Balancer Simulator (Round Robin, Least Conn, Weighted, IP Hash; node health toggles, traffic bursts, request log).
- [ ] Task 3.2: Build Caching Strategies Lab (Cache-Aside, Write-Through, Write-Back, Write-Around; LRU/LFU eviction, hit/miss ratios, memory limits).
- [ ] Task 3.3: Build Database Sharding Lab (Range, Hash, Directory sharding; hotspot visualizer, node add/remove, cluster rebalance).
- [ ] Task 3.4: Build Rate Limiting Lab (Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, Sliding Window Counter; burst sliders, 429 drops).
- [ ] Task 3.5: Build CAP & Quorum Consensus Lab (Network partition toggles, R/W/N quorum controls, stale reads vs split-brain visualizer).
- [ ] Task 3.6: Build Message Queue & Backpressure Lab (Producer rate, Consumer rate, queue depth, dead-letter queue routing).
- [ ] Task 3.7: Build Consistent Hashing Ring Visualizer (Ring canvas, node addition/removal, virtual node count slider, key redistribution stats).
- [ ] Task 3.8: Build CDN Edge Latency Lab (Global POPs, client regional latency, cache hit/miss latency comparison, origin bandwidth offload).
- [ ] Task 3.9: Build Circuit Breaker State Machine Lab (Closed -> Open -> Half-Open transitions, failure threshold, sleep window, fallback response).
- [ ] Task 3.10: Build Distributed Snowflake ID Generator Lab (64-bit component breakdown, concurrent generator simulation, clock drift detection).
- [ ] Task 3.11: Build Replication Lag & Failover Lab (Sync vs Async replication, master failure, replica lag, leader election).
- [ ] Task 3.12: Build CQRS & Event Sourcing Projection Lab (Command input, immutable event log, projection worker, query read model sync).
- [ ] Task 3.13: Document educational simplifications and real-world trade-offs for each lab.
*Acceptance Criteria*:
- All 12 labs load cleanly and respond immediately to parameter adjustments.
- Deterministic step execution and continuous simulation modes work properly.
- Reset button restores default parameters and clean state in every lab.
- No static placeholder images; all visualizers render live DOM/SVG elements.

---

### Milestone 4 — Architecture Workbench: Canvas, Palette, Connections, Starters & Import/Export
- [ ] Task 4.1: High-performance interactive diagramming canvas with grid, pan, zoom, and node drag-and-drop.
- [ ] Task 4.2: Comprehensive component palette across 6 categories (Clients, Edge, Services, Storage, Messaging, Observability).
- [ ] Task 4.3: Interactive connection manager allowing users to connect nodes with protocol selection (HTTP, gRPC, WebSocket, Kafka, SQL) and annotated QPS/latency.
- [ ] Task 4.4: Node and connection inspector panel to customize labels, instance replicas, capacity QPS, and notes.
- [ ] Task 4.5: System metrics & bottleneck estimator calculating end-to-end latency, SPOF warnings, and throughput bounds.
- [ ] Task 4.6: Pre-configured starter architectures (TinyURL, Video Streaming, E-Commerce, Chat App, Microservices).
- [ ] Task 4.7: Local document management (save diagram, load saved diagrams, rename, delete).
- [ ] Task 4.8: Robust JSON import/export with schema validation, malformed input error handling, and image export (PNG/SVG).
*Acceptance Criteria*:
- Users can add, reposition, configure, connect, and delete nodes and edges on the canvas.
- Starter architectures load with accurate topologies.
- Exported JSON can be re-imported seamlessly without loss of configuration.
- Corrupted or invalid JSON displays helpful user alerts instead of crashing.

---

### Milestone 5 — Practice Environment: Quizzes, Flashcards & Worked Case Studies
- [ ] Task 5.1: Multi-domain Quiz engine with multiple-choice questions, scenario problems, and immediate grading.
- [ ] Task 5.2: Deep answer explanations for every option (why correct option works and why distractors fail).
- [ ] Task 5.3: Quiz score history and dedicated "Review Incorrect Answers" filter mode.
- [ ] Task 5.4: Interactive spaced repetition flashcards with category filters and flip animations.
- [ ] Task 5.5: 10 Worked Architecture Case Studies with standardized 7-step interview frameworks, back-of-the-envelope capacity estimations, high-level diagrams, and bottleneck deep dives.
*Acceptance Criteria*:
- Quizzes compute accurate scores and store question attempts in `localStorage`.
- Incorrect answer review mode allows focused re-testing of missed questions.
- All 10 case studies render complete, in-depth architectural breakdowns.

---

### Milestone 6 — Content Completion: 52 Concepts, 20 Flagship Lessons, 10 Case Studies, 12 Labs
- [ ] Task 6.1: Author 52 detailed concept data models with real architectural content (no dummy text or repeated snippets).
- [ ] Task 6.2: Complete the 20 flagship deep-dive lessons with comprehensive theoretical foundations, equations, and diagrams.
- [ ] Task 6.3: Complete the 10 full worked case studies with exact numbers, capacity calculations, and component topologies.
- [ ] Task 6.4: Cross-link concepts, flagship lessons, interactive labs, and case studies into a cohesive educational graph.
*Acceptance Criteria*:
- At least 50 concept entries present with non-trivial technical depth.
- 20 flagship lessons contain deep architectural insights and formulas.
- 10 case studies provide end-to-end designs matching FAANG interview standards.
- 12 interactive labs function with verified mathematical and algorithmic behaviors.

---

### Milestone 7 — Quality, Polish, Verification & Production Build
- [ ] Task 7.1: Responsive layout testing across mobile (375px), tablet (768px), and desktop (1440px).
- [ ] Task 7.2: Dark/Light theme consistency verification across all UI components, modals, and canvas elements.
- [ ] Task 7.3: Accessibility audit (ARIA labels, focus outlines, contrast ratios, keyboard navigation).
- [ ] Task 7.4: Automated unit and component test suite execution using Vitest.
- [ ] Task 7.5: Production compilation (`npm run build`) and verification of clean bundle output with zero TypeScript/lint errors.
- [ ] Task 7.6: Documentation finalization (README.md, setup guides, and walkthrough).
*Acceptance Criteria*:
- Zero TypeScript errors (`tsc --noEmit`).
- All unit and component tests pass.
- Production build succeeds without bundle or chunk errors.
- All user interactions, route switches, simulations, and persistence mechanisms operate flawlessly.
