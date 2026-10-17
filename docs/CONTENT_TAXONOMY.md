# System Design Atlas — Content Taxonomy & Curriculum Specification

This document enumerates the comprehensive curriculum taxonomy, flagship deep-dive lessons, interactive simulation labs, and worked architectural case studies included in the System Design Atlas platform.

---

## 1. Curriculum Domains

The curriculum is structured across 6 core architectural domains:

1. **Fundamentals & Theoretical Foundations (`fundamentals`)**: Core principles, laws of scalability, availability vs reliability, consistency theorems, and mathematical estimation frameworks.
2. **Scalability & Traffic Management (`scalability`)**: Techniques for horizontal scale, load shedding, traffic balancing, edge routing, caching, and rate limiting.
3. **Data Storage & Management (`storage`)**: Storage engines, indexing structures, replication strategies, partitioning, sharding, and relational vs non-relational trade-offs.
4. **Networking & Communication (`networking`)**: Layer 4 vs Layer 7 protocols, modern web transports (HTTP/2, HTTP/3, WebSockets, gRPC), serialization, and API paradigms.
5. **Distributed Systems Patterns (`distributed`)**: Coordination algorithms, consistent hashing, consensus, event sourcing, CQRS, sagas, circuit breakers, and distributed idempotency.
6. **Observability, Reliability & Operations (`observability`)**: Distributed tracing, metrics aggregation, health check topologies, graceful degradation, and resilient operational design.

---

## 2. Concept Catalog (50+ Detailed Concepts)

Below is the complete registry of 52 structured concepts implemented in the Atlas:

| # | Concept ID | Title | Domain | Difficulty | Flagship | Paired Lab |
|---|------------|-------|--------|------------|----------|------------|
| 1 | `scalability-vs-performance` | Scalability vs Performance | Fundamentals | Beginner | Yes | — |
| 2 | `latency-vs-throughput` | Latency vs Throughput | Fundamentals | Beginner | Yes | — |
| 3 | `availability-vs-reliability` | Availability vs Reliability & SLAs | Fundamentals | Beginner | No | — |
| 4 | `cap-theorem` | The CAP Theorem in Practice | Fundamentals | Intermediate | Yes | `cap-lab` |
| 5 | `pacelc-theorem` | The PACELC Theorem | Fundamentals | Advanced | Yes | — |
| 6 | `back-of-the-envelope` | Back-of-the-Envelope Calculations | Fundamentals | Beginner | Yes | — |
| 7 | `acid-vs-base` | ACID vs BASE Consistency Models | Fundamentals | Intermediate | No | — |
| 8 | `littles-law` | Little's Law & Concurrency Limits | Fundamentals | Intermediate | No | — |
| 9 | `amdahls-law` | Amdahl's Law & Parallelism Limits | Fundamentals | Advanced | No | — |
| 10 | `horizontal-vs-vertical` | Horizontal vs Vertical Scaling | Scalability | Beginner | No | — |
| 11 | `load-balancing-algorithms` | Load Balancing Algorithms | Scalability | Intermediate | Yes | `lb-lab` |
| 12 | `reverse-proxy-vs-gateway` | Reverse Proxy vs API Gateway | Scalability | Beginner | No | — |
| 13 | `rate-limiting-algorithms` | Rate Limiting & Throttling Algorithms | Scalability | Intermediate | Yes | `rate-limit-lab` |
| 14 | `cdn-architecture` | Content Delivery Networks (CDN) & Edge | Scalability | Intermediate | Yes | `cdn-lab` |
| 15 | `dns-routing-anycast` | DNS Resolution, Geo-DNS & Anycast | Scalability | Advanced | No | — |
| 16 | `caching-strategies` | Caching Strategies & Topologies | Scalability | Intermediate | Yes | `cache-lab` |
| 17 | `cache-eviction-policies` | Cache Eviction: LRU, LFU, FIFO & ARC | Scalability | Intermediate | No | `cache-lab` |
| 18 | `relational-vs-nosql` | Relational (SQL) vs NoSQL Databases | Storage | Beginner | Yes | — |
| 19 | `database-indexing-btree` | Database Indexing: B-Trees & Hash Indexes | Storage | Intermediate | Yes | — |
| 20 | `lsm-trees-sstables` | LSM Trees & SSTables in Modern Storage | Storage | Advanced | Yes | — |
| 21 | `database-replication` | Database Replication: Sync vs Async | Storage | Intermediate | Yes | `replication-lab` |
| 22 | `database-sharding` | Database Sharding & Partitioning | Storage | Advanced | Yes | `sharding-lab` |
| 23 | `consistent-hashing` | Consistent Hashing & Virtual Nodes | Storage | Intermediate | Yes | `consistent-hashing-lab` |
| 24 | `object-vs-block-storage` | Object Storage vs Block Storage vs File | Storage | Beginner | No | — |
| 25 | `bloom-filters` | Bloom Filters in Distributed Lookups | Storage | Intermediate | No | — |
| 26 | `eventual-consistency-quorums` | Quorum Reads & Writes (R + W > N) | Storage | Advanced | Yes | `cap-lab` |
| 27 | `polyglot-persistence` | Polyglot Persistence Architecture | Storage | Intermediate | No | — |
| 28 | `tcp-vs-udp` | TCP vs UDP: Transport Layer Decisions | Networking | Beginner | No | — |
| 29 | `http-evolution` | HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC) | Networking | Intermediate | Yes | — |
| 30 | `websockets-vs-sse` | WebSockets vs Server-Sent Events (SSE) | Networking | Intermediate | Yes | — |
| 31 | `rest-vs-grpc-graphql` | REST vs gRPC vs GraphQL | Networking | Intermediate | Yes | — |
| 32 | `protocol-buffers` | Protocol Buffers & Binary Serialization | Networking | Intermediate | No | — |
| 33 | `osi-model-practical` | Practical OSI Model for System Designers | Networking | Beginner | No | — |
| 34 | `message-queues-brokers` | Message Queues vs Event Streams | Distributed | Intermediate | Yes | `queue-lab` |
| 35 | `publish-subscribe-pattern` | The Publish-Subscribe Pattern | Distributed | Beginner | No | — |
| 36 | `cqrs-pattern` | Command Query Responsibility Segregation | Distributed | Advanced | Yes | `cqrs-lab` |
| 37 | `event-sourcing` | Event Sourcing & Event Stores | Distributed | Advanced | Yes | `cqrs-lab` |
| 38 | `circuit-breaker-pattern` | Circuit Breaker & Bulkhead Patterns | Distributed | Intermediate | Yes | `circuit-breaker-lab` |
| 39 | `distributed-locks` | Distributed Locks (Redlock, Chubby, ZK) | Distributed | Advanced | No | — |
| 40 | `raft-consensus` | The Raft Consensus Algorithm | Distributed | Advanced | Yes | — |
| 41 | `two-phase-commit-2pc` | Two-Phase Commit (2PC) vs 3PC | Distributed | Advanced | No | — |
| 42 | `saga-pattern` | The Saga Pattern for Distributed Sagas | Distributed | Advanced | Yes | — |
| 43 | `idempotency-keys` | API Idempotency & Unique Request Tokens | Distributed | Intermediate | Yes | — |
| 44 | `snowflake-distributed-id` | Distributed ID Generation (Snowflake) | Distributed | Intermediate | Yes | `snowflake-lab` |
| 45 | `vector-clocks` | Vector Clocks & Lamport Timestamps | Distributed | Advanced | No | — |
| 46 | `gossip-protocol` | Gossip Protocol for Cluster Membership | Distributed | Advanced | No | — |
| 47 | `distributed-tracing` | Distributed Tracing & W3C Trace Context | Observability | Intermediate | No | — |
| 48 | `metrics-collection-pull-push`| Metrics Collection: Pull (Prometheus) vs Push | Observability | Intermediate | No | — |
| 49 | `health-checks-heartbeats` | Health Checks, Heartbeats & Liveness | Observability | Beginner | No | — |
| 50 | `graceful-degradation-shedding`| Graceful Degradation & Load Shedding | Observability | Intermediate | No | — |
| 51 | `zero-trust-architecture` | Zero Trust Security & Mutual TLS (mTLS)| Observability | Advanced | No | — |
| 52 | `disaster-recovery-strategies` | Disaster Recovery: RTO, RPO & Multi-Region| Observability | Intermediate | No | — |

---

## 3. The 20 Flagship Deep-Dive Lessons

The following 20 concepts receive extended, flagship-grade architectural treatments:
1. **Scalability vs Performance**: Amdahl's Law, Little's Law, throughput curves, resource contention, and scaling inflection points.
2. **Latency vs Throughput**: Tail latency (p99/p99.9), latency amplification in fan-out microservices, and queuing delays.
3. **The CAP Theorem in Practice**: Proof, CP vs AP trade-offs in network partitions, and real-world system classifications.
4. **The PACELC Theorem**: Latency vs Consistency trade-offs during normal operations, Cassandra vs MongoDB vs DynamoDB configurations.
5. **Back-of-the-Envelope Calculations**: System design math cheat sheet (Powers of two, latency numbers every programmer should know, storage sizing, bandwidth equations).
6. **Load Balancing Algorithms**: Layer 4 vs Layer 7 proxies, algorithm mathematics (Round Robin, Least Conn, Weighted, Consistent Hash IP), session affinity, and health probe design.
7. **Rate Limiting & Throttling Algorithms**: Token Bucket, Leaky Bucket, Sliding Window Log, Sliding Window Counter; distributed counter storage in Redis with Lua scripts.
8. **Content Delivery Networks (CDN) & Edge**: Anycast routing, Origin Shielding, Cache-Control headers, dynamic content acceleration, and cache invalidation.
9. **Caching Strategies & Topologies**: Cache-Aside, Write-Through, Write-Back, Write-Around, multi-level caching, stampede/thundering herd prevention.
10. **Relational (SQL) vs NoSQL Databases**: Relational normalization vs document/wide-column denormalization, query patterns, consistency guarantees, and schema migration strategies.
11. **Database Indexing: B-Trees & Hash Indexes**: Internal structure of B+ Trees, clustered vs secondary indexes, compound index prefix rules, and index selectivities.
12. **LSM Trees & SSTables in Modern Storage**: Log-Structured Merge Trees, write-ahead logs (WAL), MemTables, immutable SSTables, Bloom filters, and compaction strategies (Leveled vs Size-Tiered).
13. **Database Replication: Sync vs Async**: Master-replica topology, replication lag, split-brain syndromes, automated leader election, and raft-based failover.
14. **Database Sharding & Partitioning**: Sharding keys, range vs hash vs directory sharding, resharding strategies, hot partition mitigation, and cross-shard transaction avoidance.
15. **Consistent Hashing & Virtual Nodes**: The hash ring, ketama algorithm, virtual nodes distribution, minimal key redistribution during cluster resizing.
16. **HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)**: Head-of-line blocking in TCP vs HTTP/2 multiplexing vs QUIC UDP streams, connection migration, and TLS 1.3 handshakes.
17. **REST vs gRPC vs GraphQL**: Performance benchmarks, schema contracts (Protobuf), streaming capabilities, network efficiency, and internal service communication.
18. **Message Queues vs Event Streams**: Point-to-point queues (RabbitMQ) vs distributed append-only commit logs (Kafka/Pulsar), consumer groups, ordering guarantees, and retention semantics.
19. **CQRS & Event Sourcing**: Read/write separation, event store immutability, asynchronous projection builders, optimistic concurrency control, and snapshotting.
20. **Circuit Breaker & Bulkhead Patterns**: State transitions (Closed, Open, Half-Open), error percentages, failure thresholds, bulkhead isolation, and fallback degradation.

---

## 4. The 12 Interactive Simulation Labs

1. **Load Balancer Simulator**: Compare Round Robin, Least Connections, Weighted, and IP Hash under server outages and traffic spikes.
2. **Caching Strategies Lab**: Test Cache-Aside, Write-Through, Write-Back, and Write-Around with LRU/LFU memory constraints.
3. **Database Sharding & Partitioning Lab**: Sharding key analyzer, hotspot simulator, and cluster rebalancing.
4. **Rate Limiting Algorithms Lab**: Token Bucket vs Leaky Bucket vs Sliding Window under burst and sustained QPS.
5. **CAP & Quorum Consensus Lab**: Network partition simulator, tunable `R` and `W` quorums, consistency vs availability analyzer.
6. **Message Queue & Backpressure Lab**: Producer vs Consumer throughput tuning, buffer limits, dead-letter queue routing.
7. **Consistent Hashing Ring Visualizer**: Interactive ring with virtual nodes, key hash allocation, and node churn remapping.
8. **CDN Edge Latency & POP Simulator**: Multi-region client requests, edge cache hits vs misses, origin offload calculations.
9. **Circuit Breaker State Machine Lab**: Trip thresholds, half-open trial windows, and fallback responses under backend faults.
10. **Distributed Snowflake ID Generator Lab**: 64-bit component breakdown, concurrent worker generation, and clock-rollback mitigation.
11. **Replication Lag & Failover Lab**: Master-Replica sync vs async replication, replication lag, and automated leader election.
12. **CQRS & Event Sourcing Projection Lab**: Command submission, event store append, projection lag, and query view verification.

---

## 5. The 10 Worked Architecture Case Studies

1. **Designing a URL Shortener (TinyURL / Bitly)**: 100M URLs/month, base62 encoding vs MD5 hash truncation, range-based distributed ID allocation, multi-region caching, 301 vs 302 redirects.
2. **Designing a High-Scale Real-Time Chat Platform (WhatsApp / Discord)**: 1B daily active users, WebSocket connection management, gateway session registries, message ordering with snowflake IDs, offline push pipelines, end-to-end encryption.
3. **Designing a Global Video Streaming Platform (Netflix / YouTube)**: Ingestion & chunking, adaptive bitrate streaming (HLS/DASH), multi-tier CDN architecture, metadata storage in Cassandra, recommendations pipeline.
4. **Designing a Distributed Web Crawler (Googlebot)**: 10B pages/month, frontier queue management, politeness delays, DNS caching, Bloom filter deduplication, distributed document storage.
5. **Designing a Real-Time Ride-Hailing Dispatch Service (Uber / Lyft)**: Geospatial indexing (H3 / S2 / Geohash), driver location ingestion (10s updates), dispatch matching algorithm, trip state machines, surge pricing engine.
6. **Designing a Scalable Social Media Feed System (Twitter / Instagram)**: Fan-out on write (push) vs Fan-out on read (pull) hybrid model, celebrity user handling, feed ranking cache, Redis timeline lists.
7. **Designing a Collaborative Real-Time Document Editor (Google Docs / Figma)**: Operational Transformation (OT) vs Conflict-free Replicated Data Types (CRDTs), centralized server coordinator, local optimistic updates, undo/redo stacks.
8. **Designing a Distributed Rate Limiter & API Gateway (Cloudflare / Stripe)**: Token bucket in Redis cluster, local memory leaky bucket tiers, Geo-DNS routing, TLS termination, API key validation and quota enforcement.
9. **Designing an E-Commerce Flash Sale Platform (Amazon Prime Day / Ticketmaster)**: Extreme write concurrency, inventory decrement race conditions, distributed locking, virtual waiting rooms / queues, payment gateway async webhooks.
10. **Designing a Distributed Multi-Channel Push Notification Service**: Millions of notifications per minute, user notification preferences, rate limiting per user, template rendering, provider adapters (APNs, FCM, Twilio, SendGrid), dead-letter queues.
