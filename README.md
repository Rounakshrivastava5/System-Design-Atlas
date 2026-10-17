# System Design Atlas

> **An interactive, client-side, visual learning platform and architecture workbench for mastering distributed systems and large-scale software engineering.**

---



https://github.com/user-attachments/assets/fa88d3c7-2fc8-4bf2-94d4-52b62ead392c




## 🌟 Overview

**System Design Atlas** is a comprehensive educational environment designed to bridge the gap between high-level architectural theory and tangible engineering intuition. Rather than presenting static diagrams and passive text, the Atlas pairs deeply researched concept guides with **12 interactive simulation laboratories**, a full **drag-and-drop architecture workbench**, **10 worked FAANG-grade case studies**, and a **self-paced practice center** featuring quizzes, incorrect-answer reviews, and active-recall flashcards.

The entire application runs **100% in the browser** with **zero backend dependencies**, **zero authentication requirements**, and **zero external paid APIs**. All user progress, bookmarks, personal markdown notes, quiz records, and custom architectural diagrams persist reliably in local browser storage (`localStorage`).

---

## 🚀 Key Highlights & Capabilities

### 1. Concept Catalog & Flagship Lessons
- **52 substantive concept entries** across 6 core architectural domains:
  1. **Core Fundamentals** (Latency vs Throughput, CAP Theorem, PACELC, Little's Law, Back-of-the-Envelope Math, ACID vs BASE)
  2. **Scalability & Traffic** (Vertical vs Horizontal, Load Balancing, Reverse Proxies, Rate Limiting, CDN Edge, Auto-scaling)
  3. **Data Storage & Access** (SQL vs NoSQL, B+ Trees vs LSM Trees, Sync vs Async Replication, Sharding, Consistent Hashing)
  4. **Networking & Communication** (TCP vs UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3, WebSockets vs SSE, REST vs gRPC vs GraphQL, Protobuf)
  5. **Distributed Systems & Coordination** (Message Queues, Pub/Sub, CQRS, Event Sourcing, Circuit Breaker, Raft Consensus, Sagas, Distributed IDs)
  6. **Observability & Resilience** (Distributed Tracing, Pull vs Push Metrics, Health Checks, Graceful Degradation, Zero Trust mTLS, Disaster Recovery)
- **27 Flagship Deep Dives** with mathematical equations, trade-off matrices, failure modes with mitigations, real-world case comparisons (Netflix, Stripe, Uber, Discord, Amazon, Cloudflare), interview tips, and personal markdown note-taking.

### 2. The 12 Interactive Simulation Laboratories
Every lab runs in real time with parameter sliders, live metrics, visual state machines, and documented real-world simplifications:
1. **Load Balancer Simulator**: Round Robin, Least Connections, Weighted RR, and Source IP Hash with server outage toggles.
2. **Caching Strategies Lab**: Cache-Aside, Write-Through, Write-Back, and Write-Around with LRU cache eviction and hit-ratio tracking.
3. **Database Sharding & Partitioning Lab**: Hash vs Range vs Directory partitioning with hotspot detection and cluster rebalancing.
4. **Rate Limiting Algorithms Lab**: Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window under burst and sustained QPS.
5. **CAP & Quorum Consensus Lab**: Network partition toggling, tunable $R$ and $W$ quorums, and stale read detection ($R + W > N$).
6. **Message Queue & Backpressure Lab**: Producer vs Consumer throughput tuning, buffer limits, and Dead-Letter Queue (DLQ) overflow routing.
7. **Consistent Hashing Ring Visualizer**: 360° hash ring with configurable virtual nodes per server and minimal key redistribution metrics.
8. **CDN Edge Latency & POP Simulator**: Multi-region POP routing, dynamic content acceleration, cache hit/miss latency comparisons, and origin offload.
9. **Circuit Breaker State Machine Lab**: Closed $\rightarrow$ Open $\rightarrow$ Half-Open transitions, failure thresholds, sleep windows, and fallback responses.
10. **Distributed Snowflake ID Generator Lab**: 64-bit component breakdown (timestamp, worker ID, sequence), collision-free concurrency, and clock drift handling.
11. **Replication Lag & Failover Lab**: Master-Replica sync vs async replication, lag accumulation, and automated Raft leader election.
12. **CQRS & Event Sourcing Projection Lab**: Command submission pipeline, append-only event log, async read-projection lag, and query view verification.

### 3. Architecture Modeling Workbench
- **Pure SVG Vector Canvas**: Pan, zoom, drag-and-drop, and dynamic Bézier curves with zero heavy canvas dependencies.
- **Component Palette**: 6 categories (Clients, Edge & Gateways, Compute, Storage, Messaging, Observability).
- **Interactive Connections**: Connect nodes with specific communication protocols (HTTP/REST, gRPC, WebSocket, TCP, Async Event).
- **Heuristic Bottleneck & SPOF Analyzer**: Real-time graph analysis flagging Single Points of Failure, capacity mismatches, and path latencies.
- **Starter Templates**: Pre-configured production architectures (Three-Tier Scalable Web App, Event-Driven Streaming, Multi-Region Microservices Mesh).
- **Local Persistence & JSON Export/Import**: Save designs to browser storage or export/import valid JSON files with defensive schema validation.

### 4. Practice Environment & Worked Case Studies
- **Interactive Quizzes**: Question banks featuring deep multi-option rationales, scored attempts, and a dedicated **Review Incorrect Answers** mode.
- **Active Recall Flashcards**: 18 high-yield flashcards with front/back flip animations, mastery toggles, and key takeaways.
- **10 Worked FAANG-Grade Case Studies**: Standardized 7-step architectural breakdowns:
  1. Designing a URL Shortener (TinyURL / Bitly)
  2. Designing a High-Scale Real-Time Chat Platform (WhatsApp / Discord)
  3. Designing a Global Video Streaming Platform (Netflix / YouTube)
  4. Designing a Distributed Web Crawler (Googlebot)
  5. Designing a Real-Time Ride-Hailing Dispatch Service (Uber / Lyft)
  6. Designing a Scalable Social Media Feed System (Twitter / Instagram)
  7. Designing a Collaborative Real-Time Document Editor (Google Docs / Figma)
  8. Designing a Distributed Rate Limiter & API Gateway (Cloudflare / Stripe)
  9. Designing an E-Commerce Flash Sale Platform (Amazon Prime Day / Ticketmaster)
  10. Designing a Distributed Multi-Channel Push Notification Service

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Runtime & Language** | Node.js v24 LTS / Browser, TypeScript 5.7+ (Strict Mode) |
| **Framework & Tooling** | React 18, Vite 6 |
| **Styling & Icons** | Tailwind CSS 3.4+, Lucide React |
| **State & Persistence** | React Context + Custom Hooks, `localStorage` with JSON Schema validation |
| **Testing** | Vitest 3.0, `@testing-library/react`, `@testing-library/jest-dom`, JSDOM |
| **Routing** | Client-Side Hash-Based Router (`#/`, `#/concepts`, `#/labs`, `#/workbench`, `#/practice`) |

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended, tested on Node.js v24)
- npm or yarn

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/system-design-atlas.git
cd system-design-atlas
npm install
```

### Development Server
Launch the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Running Automated Tests
Run the comprehensive Vitest test suite (unit calculations, schema validation, persistence, curriculum taxonomy, and component tests):
```bash
npm test
```

### Production Build & Preview
Compile the optimized production bundle with strict TypeScript checking:
```bash
npm run build
npm run preview
```
The static build artifacts are generated cleanly in `dist/`.

---

## 🗺️ Application Routes

| Hash Route | Page / Feature | Description |
|---|---|---|
| `#/` | **Dashboard** | Learning metrics, domain mastery bars, continue learning card, flagship highlights, and quick lab launchers. |
| `#/concepts` | **Concept Catalog** | Searchable catalog of 52 concepts filterable by domain, difficulty, completion, and bookmarks. |
| `#/concepts/:id` | **Concept Detail** | In-depth architectural lesson, trade-offs, formulas, failure modes, interview tips, paired lab launch, and personal markdown notes. |
| `#/labs` | **Labs Catalog** | Showcase of 12 interactive simulation laboratories organized by domain. |
| `#/labs/:id` | **Lab Workspace** | Interactive simulator with controls, real-time visualization, live telemetry, reset buttons, and explicit assumptions. |
| `#/workbench` | **Architecture Workbench** | Drag-and-drop vector canvas, component palette, connection routing, real-time bottleneck detection, templates, and import/export. |
| `#/practice` | **Practice Center** | Tabbed interface for multi-choice quizzes with explanations, flashcard revision deck, and case study catalog. |
| `#/practice/case-studies/:id` | **Case Study Walkthrough** | 7-step architectural deep dive from requirements and capacity estimation to deep-dive diagrams and failure modes. |

---

## 🧪 Verification & Test Results

The application includes automated test coverage across:
- **Math Utilities (`src/test/math.test.ts`)**: Little's Law calculations, storage sizing, path latencies, and 32-bit hash ring distributions.
- **Schema Validation (`src/test/validation.test.ts`)**: Defensive parsing, node coordinate sanitization, dangling edge prevention, and JSON payload verification.
- **Persistence Layer (`src/test/localStorage.test.ts`)**: Light/Dark theme toggles, user progress tracking, bookmarks, note-saving, quiz histories, and corruption fallbacks.
- **Curriculum Taxonomy (`src/test/concepts.test.ts`)**: Verifies 52 concepts, 27 flagship lessons, 12 labs, 10 case studies, quizzes, and flashcards with zero dangling link references.
- **UI Components & Simulators (`src/test/components.test.tsx`)**: Validates buttons, badges, cards, tabs, sliders, load balancer traffic dispatch, and rate limiter burst processing.

```
 Test Files  5 passed (5)
      Tests  43 passed (43)
```

TypeScript strict compilation:
```
tsc --noEmit  # Exited with code 0 (zero errors)
```

Production build:
```
dist/index.html                   1.20 kB │ gzip:   0.68 kB
dist/assets/index-ByorDBBR.css   53.30 kB │ gzip:   8.94 kB
dist/assets/index-CMLXyYXl.js   600.12 kB │ gzip: 176.11 kB
✓ built in 2.71s
```

---

## 🔒 Privacy & Offline Operation

System Design Atlas operates completely client-side:
- No user data is sent over the internet.
- No analytics trackers, third-party cookies, or remote telemetries are bundled.
- All notes, bookmarks, diagram designs, and quiz records remain exclusively in your browser's `localStorage`.
- Can be deployed to any static host (GitHub Pages, Netlify, Cloudflare Pages, S3) or run completely offline.

---

## 📄 License

MIT License. Designed and built for engineering students, distributed system practitioners, and software architects worldwide.
