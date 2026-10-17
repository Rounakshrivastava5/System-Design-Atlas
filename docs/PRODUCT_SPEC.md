# System Design Atlas — Product Specification

## 1. Executive Summary

**System Design Atlas** is a comprehensive, production-grade, interactive educational web platform and architectural workbench designed to help software engineers, systems architects, and technical interview candidates master large-scale distributed systems design.

The platform combines five foundational pillars:
1. **Interactive Concept Catalog & Curriculum**: 50+ thoroughly detailed concept entries across 6 architectural domains, including 20 deep flagship lessons with complete technical explanations, mathematical formulations, architectural trade-offs, and failure mode analyses.
2. **Interactive Simulation Labs**: 12 fully functional, browser-based simulation labs allowing users to adjust operational parameters, trigger traffic bursts and failures, observe live metric responses, and understand concrete trade-offs under real-world conditions.
3. **Visual Architecture Workbench**: An interactive visual diagramming and system modeling canvas with component palettes (clients, edge, services, storage, message brokers, observability), editable directed connections, real-time metrics estimation, pre-built industry starter templates, and robust JSON import/export capabilities.
4. **Practice & Evaluation Environment**: Knowledge-testing quizzes with immediate feedback, detailed multi-option explanations, dedicated incorrect-answer review mode, spaced-repetition flashcards, and 10 worked real-world architecture case studies (e.g., TinyURL, Netflix, Uber, WhatsApp, Google Docs).
5. **Personalized Progress & Persistence**: 100% client-side persistence (zero account or backend requirements) tracking lesson completions, bookmarks, rich personal notes per concept, quiz scores, and saved custom architectures across browser sessions.

---

## 2. Target Audience & Core Use Cases

- **Software Engineers (Mid to Senior)** preparing for system design interviews at tier-1 tech companies.
- **Architects & Tech Leads** designing microservices, data pipelines, caching layers, and distributed storage systems who need a rapid modeling and trade-off validation workbench.
- **Computer Science Students & Self-Taught Developers** seeking an intuitive, visual, and interactive medium to bridge theoretical computer networking/OS concepts with practical production engineering.

---

## 3. Product Principles

1. **Zero Fake Features**: Every button, slider, metric, and switch executes working logic. No dummy placeholders, no static mockups posing as labs, no simulated saving flows that drop data.
2. **Deep Technical Substance**: Content goes beyond superficial bullet points to cover internal data structures (e.g., LSM Trees, Bloom filters, Consistent Hash rings, Quorum equations `R + W > N`), failure edge cases, and concrete industry implementations (Kafka, Cassandra, Redis, Envoy).
3. **Simulated with Clarity**: Interactive labs are distinct from actual cloud infrastructure. All simplifications, algorithmic models, and assumptions are clearly documented directly in the lab interface.
4. **Completely Local & Zero Friction**: Works directly in modern web browsers without server deployments, database setups, API keys, or subscriptions. All data persists reliably in `localStorage`.
5. **Modern, Polished & Accessible UX**: Responsive layout supporting mobile, tablet, and desktop viewports, comprehensive dark/light modes, keyboard shortcuts (`Cmd/Ctrl+K` global search), and accessible contrast and semantics.

---

## 4. The Five Core Routes

```
/                       Dashboard & Learning Hub
/concepts               Concept Catalog (Filters, Search, Domains)
  /concepts/:id         Concept Detail / Flagship Lesson View
/labs                   Interactive Labs Catalog
  /labs/:id             Dedicated Interactive Lab Workspace
/workbench              Architecture Canvas & System Modeling Workbench
/practice               Practice Center (Quizzes, Flashcards, Case Studies)
  /practice/case-studies/:id  Worked Architecture Case Study Deep Dive
```

### Route 1: Dashboard (`/`)
- User summary: Total concepts completed, active bookmarks, quiz mastery score, saved architecture count.
- Curriculum Domain Mastery progress bars across all 6 domains.
- "Continue Learning" shortcut card pointing to next unread concept or active lab.
- Daily Architecture Challenge / Question of the Day.
- Featured Flagship Lessons & Featured Interactive Labs spotlight cards.

### Route 2: Concepts & Flagship Lessons (`/concepts`, `/concepts/:id`)
- **Catalog View**:
  - Filter by Domain (Fundamentals, Scalability, Storage, Networking, Distributed Patterns, Observability & Reliability).
  - Filter by Difficulty (Beginner, Intermediate, Advanced) and Status (All, Completed, Bookmarked, In Progress).
  - Real-time search query matching titles, descriptions, and tags.
  - Visual cards with domain badge, difficulty indicator, reading time estimate, prerequisite tags, and completion toggle.
- **Concept Detail View**:
  - Breadcrumbs navigation and bookmarking button.
  - Hero header with difficulty, domain, estimated read time, and completion checkbox.
  - Structured tabs or sections:
    - **Core Theory & Architectural Overview**
    - **Key Trade-offs & When to Use vs When to Avoid**
    - **Mathematical Formulations & Formulas** (e.g., Little's Law, Amdahl's Law, Quorum consistency)
    - **Failure Modes & Mitigation Strategies**
    - **Real-World Case Studies & Tech Stacks**
    - **Prerequisites & Related Concepts** (clickable internal links)
    - **Interactive Lab Integration** (embedded lab launcher or inline lab widget for topics with paired labs)
    - **Personal Markdown Notes Editor** (auto-saved to local storage)

### Route 3: Interactive Simulation Labs (`/labs`, `/labs/:id`)
- Suite of 12 fully interactive simulation labs:
  1. **Load Balancing & Distribution Lab**: Compare Round Robin, Least Connections, Weighted Round Robin, and IP Hash under dynamic request surges and server health degradations.
  2. **Caching Topologies & Eviction Lab**: Compare Cache-Aside, Write-Through, Write-Back, and Write-Around with LRU, LFU, and FIFO eviction under memory constraints.
  3. **Database Sharding & Partitioning Lab**: Test Range, Hash, and Directory-based partitioning, identify hotspots, and rebalance node clusters.
  4. **Rate Limiting Algorithms Lab**: Visualize and benchmark Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, and Sliding Window Counter against burst traffic.
  5. **CAP & PACELC Distributed Consensus Lab**: Simulate network partitions between replicas, adjust Quorum `R` and `W` against `N`, observe stale reads vs write rejections.
  6. **Message Queue, Buffer & Backpressure Lab**: Tune producer and consumer rates, inspect buffer fill rates, handle queue overflow, and route to Dead Letter Queues (DLQ).
  7. **Consistent Hashing Ring Visualizer Lab**: Add/remove physical nodes, adjust virtual node (vnode) multipliers, and inspect key migration percentages and load variance.
  8. **CDN Edge Caching & Global Latency Lab**: Simulate client requests from various global regions (Americas, Europe, Asia-Pacific) to Origin vs Edge POPs, measuring TTFB and bandwidth savings.
  9. **Circuit Breaker State Machine Lab**: Monitor Closed -> Open -> Half-Open states, tune error rate thresholds and sleep windows, and verify fallback behavior under cascading backend faults.
  10. **Distributed Snowflake ID Generator Lab**: Deconstruct 64-bit ID generation (epoch timestamp, worker ID, datacenter ID, sequence), simulate high-frequency concurrency, and handle clock drift anomalies.
  11. **Replication Lag & Failover Lab**: Compare Synchronous vs Asynchronous master-replica replication, induce replica lag, and perform manual and automated leader elections.
  12. **CQRS & Event Sourcing Projection Lab**: Submit write commands to an immutable event store, observe asynchronous projection pipelines, and evaluate eventual consistency read lag.
- Every lab provides:
  - Working parameter controls (sliders, select menus, toggle switches, step buttons).
  - Live metric readouts and visual representations (charts, animated queues, node graphs, rings).
  - One-click "Reset to Defaults" button.
  - "Simulation Assumptions & Simplifications" accordion documenting real-world variances.

### Route 4: Architecture Workbench (`/workbench`)
- Interactive drag-and-drop / click-to-place system modeling canvas.
- Comprehensive Component Palette:
  - **Clients**: Web Browser, Mobile App, IoT Device, Third-Party Webhook.
  - **Edge & Gateway**: DNS / Route53, CDN, API Gateway, Reverse Proxy / Load Balancer.
  - **Compute & Services**: Stateless Web App, Microservice, Background Worker / Cron, Serverless Function, Auth Service.
  - **Data Stores**: Relational Database (PostgreSQL/MySQL), NoSQL Document (MongoDB/DynamoDB), Wide-Column (Cassandra), Cache (Redis/Memcached), Object Store (S3), Time-Series (Prometheus/InfluxDB).
  - **Messaging & Streaming**: Event Stream / Kafka, Message Broker (RabbitMQ), In-Memory Pub/Sub.
  - **Observability**: Distributed Tracing, Centralized Logging (ELK), Metrics Collector.
- Editable Directed Connections:
  - Add connection from source node to target node.
  - Choose communication protocol: HTTP/REST, gRPC, WebSocket, GraphQL, Async AMQP/Kafka, TCP Socket, Database Driver.
  - Annotate with latency and estimated QPS.
- Node Inspector Panel:
  - Edit node label, instance count (replicas), capacity, and notes.
- Real-time System Metrics Estimation:
  - Calculate total estimated end-to-end latency, potential single points of failure (SPOFs), and bottleneck warnings.
- Starter Architecture Templates:
  - TinyURL / URL Shortener
  - Scalable E-Commerce Platform
  - Real-Time Video Streaming (HLS / Transcoding)
  - Global Microservices with Event Streaming
  - Scalable Chat Application
- File Operations:
  - Save to local browser storage with custom names.
  - Export system architecture as standard JSON file.
  - Import previously exported JSON architecture with schema validation and friendly error handling.
  - Export diagram canvas as PNG or SVG image.

### Route 5: Practice Environment (`/practice`)
- **Architectural Quizzes**:
  - Filter questions by domain or run comprehensive random tests.
  - Instant answer validation with comprehensive explanations for why the correct option is right and why the other distractors fail in real-world systems.
  - Score tracking and persistent answer history.
  - **"Review Incorrect Answers"** mode to re-attempt previously missed questions.
- **Spaced Repetition Flashcards**:
  - Flashcard decks categorized by domain.
  - Interactive flip animations with front question/scenario and back architectural solution.
  - "Mark Known" vs "Needs Practice" tracking.
- **10 Worked Case Studies (`/practice/case-studies/:id`)**:
  - Structured standard interview format:
    1. Problem Statement & Business Scope
    2. Functional & Non-Functional Requirements
    3. Back-of-the-Envelope Capacity Estimations (Traffic, Storage, Bandwidth, Memory)
    4. High-Level Architecture Diagram & Component Flow
    5. Deep Dives into Core Bottlenecks & Concurrency Issues
    6. Fault Tolerance, Resiliency & Disaster Recovery
    7. Future Scale & Technology Evolutions
  - Covered Systems:
    1. Designing a URL Shortener (TinyURL / Bitly)
    2. Designing a High-Scale Real-Time Chat Platform (WhatsApp / Discord)
    3. Designing a Global Video Streaming Platform (Netflix / YouTube)
    4. Designing a Distributed Web Crawler (Googlebot)
    5. Designing a Real-Time Ride-Hailing Dispatch Service (Uber / Lyft)
    6. Designing a Scalable Social Media Feed System (Twitter / Instagram)
    7. Designing a Collaborative Real-Time Document Editor (Google Docs / OT)
    8. Designing a Distributed Rate Limiter & API Gateway (Cloudflare / Stripe)
    9. Designing a High-Throughput E-Commerce Flash Sale Platform (Amazon / Ticketmaster)
    10. Designing a Distributed Push Notification Service (Multi-Channel Delivery)

---

## 5. Non-Functional & Technical Requirements

- **Performance**: Initial bundle load < 500KB gzipped; sub-50ms route transition latency; 60fps canvas operations and simulation loops.
- **Persistence**: All state (read concepts, notes, bookmarks, quiz results, custom workbench diagrams, theme settings) serialized to `localStorage` under namespaced keys.
- **Reliability**: Graceful error boundaries preventing blank screen crashes; fallback states for corrupted localStorage data.
- **Accessibility**: High contrast ratios compliant with WCAG AA; full keyboard navigation for interactive widgets; descriptive ARIA attributes.
