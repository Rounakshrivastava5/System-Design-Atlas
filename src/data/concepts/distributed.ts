import { Concept } from '../../types/concept';

export const DISTRIBUTED_CONCEPTS: Concept[] = [
  {
    id: 'message-queues-brokers',
    title: 'Message Queues vs Event Streams',
    shortDescription: 'Point-to-point queues (RabbitMQ/SQS) versus distributed append-only commit logs (Kafka/Pulsar), retention, and consumer groups.',
    domain: 'distributed',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['messaging', 'kafka', 'rabbitmq', 'event-streaming'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['publish-subscribe-pattern', 'cqrs-pattern'],
    pairedLabId: 'queue-lab',
    isFlagship: true,
    content: {
      overview: `Asynchronous messaging is the backbone of decoupled, resilient microservices. However, engineers frequently conflate traditional Message Queues with Event Streaming platforms:

1. Message Queues (RabbitMQ, AWS SQS): Point-to-point, ephemeral message routing. Messages are placed in a queue, consumed by a single worker, and deleted upon acknowledgement (ACK). Best for task distribution, job processing, and complex routing exchanges.
2. Event Streams (Apache Kafka, Apache Pulsar): Immutable, append-only distributed commit logs partitioned across a cluster. Messages are NOT deleted when read; consumers maintain their own read offsets. Multiple independent consumer groups can read the exact same event stream at their own pace, and replay historical events from days or months ago.`,
      architectureDetails: `Kafka Architecture & Partitioning:
- Topics are divided into Partitions. Each partition is strictly ordered and replicated across broker nodes.
- Partition Key: Kafka hashes the message key (e.g. user_id) to guarantee that all events for a given user land in the exact same partition, ensuring strict chronological ordering per entity.
- Consumer Groups: Workers scale by joining a consumer group. Each partition is assigned to exactly one consumer within the group.`,
      keyTradeoffs: [
        {
          advantage: 'Event Streams (Kafka) support massive multi-gigabyte throughput, event replayability, and multiple independent consumer groups.',
          drawback: 'More complex to operate than queues; cannot delete individual messages out of order.',
        },
        {
          advantage: 'Message Queues (RabbitMQ) support sophisticated routing topologies (topic, fanout, headers) and per-message dead-lettering.',
          drawback: 'Throughput degrades under deep backlogs because deleted messages incur disk write/re-indexing overhead.',
        },
      ],
      failureModes: [
        {
          failure: 'Kafka Consumer Lag Avalanche',
          consequence: 'A downstream database slows down, causing consumer processing time to increase from 5ms to 500ms. Kafka partition lag balloons into millions of unread records.',
          mitigation: 'Autoscale consumer pods up to the number of partitions; optimize downstream batching or push heavy work to a secondary worker pool.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'LinkedIn / Uber',
          usage: 'LinkedIn created Kafka to process over 7 trillion messages daily for activity tracking and real-time data pipelines.',
        },
      ],
      implementationChecklist: [
        'Use RabbitMQ/SQS for discrete background jobs (image resizing, email dispatch).',
        'Use Kafka for high-throughput event sourcing, audit logging, and change-data-capture (CDC).',
      ],
    },
  },
  {
    id: 'publish-subscribe-pattern',
    title: 'The Publish-Subscribe (Pub/Sub) Pattern',
    shortDescription: 'Decoupling event producers from multiple independent subscribers using topics, channels, and message brokers.',
    domain: 'distributed',
    difficulty: 'beginner',
    readTimeMinutes: 10,
    tags: ['pubsub', 'messaging', 'architecture'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['message-queues-brokers'],
    isFlagship: false,
    content: {
      overview: `The Publish-Subscribe pattern is an architectural messaging pattern where senders of messages (Publishers) do not program the messages to be sent directly to specific receivers (Subscribers).
Instead, published messages are characterized into channels or topics without knowledge of what subscribers, if any, there may be.

Similarly, subscribers express interest in one or more topics and only receive messages that are of interest, without knowledge of what publishers exist. This provides complete spatial and temporal decoupling.`,
      keyTradeoffs: [
        {
          advantage: 'Complete loose coupling: new microservices can subscribe to existing business events without modifying publisher code.',
          drawback: 'Event flow becomes less explicit and harder to trace through static code analysis; requires distributed tracing.',
        },
      ],
      failureModes: [
        {
          failure: 'Slow Subscriber Poisoning Broker',
          consequence: 'In an in-memory pub/sub broker (e.g. Redis Pub/Sub), a slow client buffer fills up, causing the broker to disconnect the client or consume excessive RAM.',
          mitigation: 'Use disk-backed brokers (Kafka) or buffer-isolated queues.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Google Cloud Pub/Sub / AWS SNS',
          usage: 'Broadcasts order events to analytics, inventory, email, and fraud detection microservices concurrently.',
        },
      ],
      implementationChecklist: [
        'Design event payloads with standardized metadata (event_id, event_type, timestamp, schema_version).',
      ],
    },
  },
  {
    id: 'cqrs-pattern',
    title: 'Command Query Responsibility Segregation (CQRS)',
    shortDescription: 'Segregating write operations (Commands) from read operations (Queries) using specialized datastores and materialized views.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 16,
    tags: ['cqrs', 'architecture', 'event-sourcing', 'microservices'],
    prerequisites: ['relational-vs-nosql', 'message-queues-brokers'],
    relatedConcepts: ['event-sourcing', 'polyglot-persistence'],
    pairedLabId: 'cqrs-lab',
    isFlagship: true,
    content: {
      overview: `In traditional architectures, the same database schema and domain model are used for both reading and writing data. While simple, this creates conflicts: writes require strict normalization, validations, and transactional locking, whereas reads require flattened denormalized views and fast indexes.

Command Query Responsibility Segregation (CQRS) splits the application into two distinct paths:
1. Command (Write) Side: Handles business operations (e.g. BookHotelRoom). Validates state, writes to an append-only event store or normalized relational database, and emits domain events.
2. Query (Read) Side: Dedicated read models (Materialized Views) optimized purely for fast queries (e.g. Elasticsearch, Redis, denormalized read-tables). Subscribes to domain events and updates asynchronously.`,
      architectureDetails: `The CQRS Data Flow:
Client -> Sends Command -> Command Handler (validates rules) -> Writes to Write Store -> Emits Event -> Async Event Bus (Kafka) -> Projection Worker -> Updates Read Store -> Client queries Read Store.

Key Consequence: The Query side is Eventually Consistent. There is a small time window (typically 10ms - 500ms) between a command completing and the read model reflecting the change.`,
      keyTradeoffs: [
        {
          advantage: 'Independent scaling: scale the read side to 50,000 QPS with elastic caches without locking the transactional write database.',
          drawback: 'Eventual consistency complexity: users may submit a form and not see the new record if they query before the projection completes.',
        },
      ],
      failureModes: [
        {
          failure: 'Projection Worker Desynchronization',
          consequence: 'A bug in the projection worker causes it to drop discount events, leaving the read model displaying incorrect order totals.',
          mitigation: 'Implement idempotent projection handlers and build automated rebuild scripts to replay historical events from zero.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'E-Commerce Order Systems',
          usage: 'Write side uses PostgreSQL ACID transactions to charge credit cards; read side uses Elasticsearch to power customer order search and status dashboards.',
        },
      ],
      implementationChecklist: [
        'Only adopt CQRS in complex domains with distinct read/write asymmetries (don\'t use on simple CRUD apps).',
        'Design UI components to handle eventual consistency (e.g. show optimistic pending states).',
      ],
    },
  },
  {
    id: 'event-sourcing',
    title: 'Event Sourcing & Event Stores',
    shortDescription: 'Storing state as an immutable sequence of domain events rather than mutating current-state records in-place.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 16,
    tags: ['event-sourcing', 'cqrs', 'audit-log', 'architecture'],
    prerequisites: ['cqrs-pattern'],
    relatedConcepts: ['cqrs-pattern', 'message-queues-brokers'],
    pairedLabId: 'cqrs-lab',
    isFlagship: true,
    content: {
      overview: `Traditional databases store current state: if Alice changes her address from New York to London, the row is overwritten with "London", and the historical fact that she lived in New York is permanently destroyed.

Event Sourcing flips this paradigm: instead of storing current state, you store all changes to state as an immutable, append-only sequence of domain events:
- UserRegistered { id: 1, name: "Alice" }
- AddressChanged { id: 1, newAddress: "New York" }
- AddressChanged { id: 1, newAddress: "London" }

The current state of any entity is computed by replaying its historical events from the beginning of time.`,
      architectureDetails: `Core Components:
- Event Store: Append-only database (EventStoreDB, Apache Kafka, or Postgres with strict INSERT-only table).
- Optimistic Concurrency Control: Events contain an expected_version number. If two threads append concurrently, the second write fails with a concurrency conflict.
- Snapshots: To avoid replaying 100,000 events to compute an account balance, periodic snapshots (e.g. balance at event #50,000) are cached. Replay starts from the latest snapshot!`,
      keyTradeoffs: [
        {
          advantage: 'Perfect, tamper-proof audit trail; enables time-travel debugging and re-projecting historical data into new read views retroactively.',
          drawback: 'Steep learning curve; schema evolution of old serialized events over years requires version upcasters.',
        },
      ],
      failureModes: [
        {
          failure: 'Schema Evolution Breakage on Historical Events',
          consequence: 'A developer changes a serialized event schema, causing the application to crash when trying to replay 3-year-old historical events.',
          mitigation: 'Implement Event Upcasters (transformation pipelines that convert v1 events to v2 events in memory during replay).',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Accounting & Banking Ledgers',
          usage: 'Banks never overwrite balances. They append debit and credit ledger events, computing balances dynamically to guarantee forensic auditability.',
        },
      ],
      implementationChecklist: [
        'Take periodic snapshots every 100–500 events to bound reconstruction latency.',
        'Never mutate or delete events in the Event Store.',
      ],
    },
  },
  {
    id: 'circuit-breaker-pattern',
    title: 'Circuit Breaker & Bulkhead Patterns',
    shortDescription: 'Finite state machine (Closed, Open, Half-Open), failure thresholds, bulkhead isolation, and fallback degradation.',
    domain: 'distributed',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['resilience', 'circuit-breaker', 'bulkhead', 'fault-tolerance'],
    prerequisites: ['availability-vs-reliability'],
    relatedConcepts: ['graceful-degradation-shedding', 'message-queues-brokers'],
    pairedLabId: 'circuit-breaker-lab',
    isFlagship: true,
    content: {
      overview: `In a distributed microservice mesh, remote service calls can fail or hang indefinitely due to network partitions, database deadlocks, or server crashes.
If Service A calls Service B, and Service B hangs, Service A\'s worker threads wait on timeouts. Soon, Service A runs out of threads and crashes, causing a cascading failure that knocks down the entire platform.

The Circuit Breaker pattern wraps remote calls in a state machine that detects failures and fails fast, preventing cascading collapse.`,
      architectureDetails: `The Three Circuit Breaker States:
1. CLOSED (Normal Operation): Requests flow through to the remote service. Successes and failures are tracked in a rolling window. If the failure rate exceeds a threshold (e.g. 50% errors), the breaker trips to OPEN.
2. OPEN (Fail-Fast): Remote service calls are immediately blocked! The breaker returns an instant cached fallback response or error without touching the network, allowing the struggling backend service time to recover. A sleep window timer (e.g. 10s) begins.
3. HALF-OPEN (Trial Probe): When the sleep timer expires, the breaker admits a limited trial batch of requests. If they succeed, the breaker resets to CLOSED. If any fail, it trips back to OPEN.

The Bulkhead Pattern:
Named after watertight compartments in ships. Isolates resources (thread pools, memory, connection pools) so that a failure in one component cannot sink the entire application.`,
      keyTradeoffs: [
        {
          advantage: 'Prevents catastrophic cascading outages across microservice architectures; shields degraded backend services.',
          drawback: 'Requires engineering degraded fallback logic for every service call.',
        },
      ],
      failureModes: [
        {
          failure: 'Misconfigured Sleep Window Flapping',
          consequence: 'Sleep window is set to 500ms; breaker trips to Half-Open too quickly before the backend database can recover from GC pauses, causing constant state oscillation.',
          mitigation: 'Set sleep windows with exponential backoff (e.g. 5s, 15s, 60s) upon repeated trip events.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Netflix Hystrix / Resilience4j / Envoy',
          usage: 'Netflix pioneered circuit breakers across their microservice fleet to ensure video streaming works even if recommendations and user ratings go down.',
        },
      ],
      implementationChecklist: [
        'Configure circuit breakers on all external third-party API calls (payment gateways, notification providers).',
        'Always provide meaningful fallback responses (e.g. default recommendations, cached profile data).',
      ],
    },
  },
  {
    id: 'distributed-locks',
    title: 'Distributed Locks: Redlock, Chubby, ZooKeeper',
    shortDescription: 'Coordinating mutual exclusion across multiple servers using Redis, ZooKeeper, etcd, and fencing tokens.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 14,
    tags: ['distributed-locks', 'redlock', 'zookeeper', 'etcd'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['raft-consensus', 'idempotency-keys'],
    isFlagship: false,
    content: {
      overview: `A local mutex lock (synchronized in Java, sync.Mutex in Go) only guarantees mutual exclusion within a single operating system process.
When an application scales across 50 servers, you need a Distributed Lock to ensure only one worker accesses a shared resource at any given moment (e.g. processing a scheduled cron payout, reserving a hotel room, or claiming an inventory batch).`,
      architectureDetails: `Common Distributed Lock Engines:
1. Redis (SET resource_name my_random_token NX PX 30000): Fast and simple. For multi-node safety, the Redlock algorithm acquires locks across 5 independent Redis masters.
2. Apache ZooKeeper / Etcd: Strong consensus via ephemeral sequential znodes. If the client dies, the session closes and the lock node automatically deletes.
3. Fencing Tokens (Martin Kleppmann\'s Critical Safety Rule): A distributed lock cannot guarantee absolute safety if a process experiences a long GC pause or network stall. The lock service must issue a monotonically increasing Fencing Token (e.g. 101, 102). Storage services reject write requests containing an older fencing token than the current high-water mark!`,
      keyTradeoffs: [
        {
          advantage: 'Guarantees single-worker execution on critical resources across distributed fleets.',
          drawback: 'Prone to deadlocks if TTL is omitted and holder crashes; performance bottleneck if held for long operations.',
        },
      ],
      failureModes: [
        {
          failure: 'GC Pause Causing Lock Expiration Overwrite',
          consequence: 'Client 1 acquires lock with 10s TTL, enters a 15s Java stop-the-world GC pause. Lock expires. Client 2 acquires lock. Client 1 wakes up and writes, corrupting state!',
          mitigation: 'Always validate fencing tokens at the storage tier before committing writes.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Google Chubby',
          usage: 'Chubby provides distributed coarse-grained locking for GFS (Google File System) and Bigtable master election.',
        },
      ],
      implementationChecklist: [
        'Always use random unique tokens when acquiring Redis locks to ensure a client never deletes another client\'s lock.',
        'Use fencing tokens for non-idempotent storage writes.',
      ],
    },
  },
  {
    id: 'raft-consensus',
    title: 'The Raft Consensus Algorithm',
    shortDescription: 'Leader election, log replication, safety invariants, and state machine consistency in modern distributed systems.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 18,
    tags: ['raft', 'consensus', 'etcd', 'distributed-systems'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['cap-theorem', 'distributed-locks'],
    isFlagship: true,
    content: {
      overview: `Consensus is the fundamental problem of getting multiple distributed servers to agree on a single shared state or sequence of values, even when some servers crash or network messages drop.
For decades, Paxos was the standard consensus algorithm, but it was notoriously difficult to understand and implement.

Designed by Diego Ongaro and John Ousterhout at Stanford in 2014, Raft was engineered specifically for Understandability. It divides consensus into three modular sub-problems:
1. Leader Election
2. Log Replication
3. Safety Invariants`,
      architectureDetails: `How Raft Works:
- Node States: Each server is in one of three states: Follower, Candidate, or Leader.
- Randomized Election Timers: Followers expect regular heartbeats from the Leader. If a follower hears no heartbeat within a randomized window (e.g. 150ms–300ms), it transitions to Candidate, increments its term number, and votes for itself, requesting votes from peers. Randomized timers prevent split-vote ties!
- Log Replication: Clients send commands to the Leader. The leader appends the command to its log and sends AppendEntries RPCs to followers.
- Commit Rule: Once a majority (N/2 + 1) of followers append the entry, the leader commits it and executes it in its state machine, replying to the client.`,
      keyTradeoffs: [
        {
          advantage: 'Guarantees strict linearizable consistency and automatic zero-downtime failover with provable mathematical safety.',
          drawback: 'Requires an odd number of nodes (3, 5, 7) to form a majority; write latency is bound by the slowest node in the majority.',
        },
      ],
      failureModes: [
        {
          failure: 'Partitioned Stale Leader Accepting Writes',
          consequence: 'A leader is partitioned into a minority partition and accepts client writes while a new leader is elected in the majority.',
          mitigation: 'Raft Leaders cannot commit entries without confirming majority acknowledgement, so minority writes are never committed and are cleanly rolled back.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'etcd (Kubernetes) / CockroachDB',
          usage: 'Kubernetes stores all cluster state and secrets in etcd, which coordinates state across nodes using the Raft consensus algorithm.',
        },
      ],
      implementationChecklist: [
        'Deploy Raft clusters across 3 or 5 nodes (tolerating 1 or 2 node failures respectively).',
        'Never run even-numbered clusters (4 nodes has the same failure tolerance as 3 nodes).',
      ],
    },
  },
  {
    id: 'two-phase-commit-2pc',
    title: 'Two-Phase Commit (2PC) vs 3PC',
    shortDescription: 'Atomic distributed transactions across multiple databases, coordinator bottlenecks, and blocking coordinator failures.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 12,
    tags: ['2pc', 'transactions', 'consistency'],
    prerequisites: ['acid-vs-base'],
    relatedConcepts: ['saga-pattern', 'acid-vs-base'],
    isFlagship: false,
    content: {
      overview: `Two-Phase Commit (2PC) is a distributed transaction protocol that ensures an atomic write across multiple separate databases: either all databases commit the transaction, or all roll back (all-or-nothing atomicity).

The Two Phases:
1. Phase 1 (Prepare): The Coordinator sends a PREPARE message to all participants. Each participant executes the transaction locally, locks the rows, writes to its WAL, and replies "VOTE_COMMIT" or "VOTE_ABORT".
2. Phase 2 (Commit): If ALL participants voted commit, the coordinator sends "GLOBAL_COMMIT". If any participant voted abort (or timed out), the coordinator sends "GLOBAL_ABORT".`,
      keyTradeoffs: [
        {
          advantage: 'Provides absolute ACID atomicity across disparate databases.',
          drawback: 'Blocking protocol: if the Coordinator crashes mid-commit, participants remain locked indefinitely, holding database resources.',
        },
      ],
      failureModes: [
        {
          failure: 'Coordinator Crash During Phase 2',
          consequence: 'Participants that voted commit in Phase 1 must hold table locks indefinitely because they cannot know whether the coordinator decided commit or abort.',
          mitigation: 'Replace 2PC in modern distributed microservices with the Saga Pattern.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'XA Transactions / Distributed Databases',
          usage: 'Java JTA/XA standards implement 2PC; Google Spanner uses TrueTime atomic clocks + 2PC across Paxos groups.',
        },
      ],
      implementationChecklist: [
        'Avoid 2PC across microservices; reserve only for tightly coupled homogeneous database engines.',
      ],
    },
  },
  {
    id: 'saga-pattern',
    title: 'The Saga Pattern for Distributed Transactions',
    shortDescription: 'Managing multi-service transactions using sequences of local transactions and compensating rollback actions.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 16,
    tags: ['saga', 'transactions', 'microservices', 'resilience'],
    prerequisites: ['two-phase-commit-2pc'],
    relatedConcepts: ['two-phase-commit-2pc', 'message-queues-brokers'],
    isFlagship: true,
    content: {
      overview: `In modern microservice architectures, a single business process often spans multiple independent services (e.g. Order Service, Payment Service, Inventory Service). Because 2PC is blocking and fragile, modern systems implement the Saga Pattern.

A Saga is a sequence of local transactions where each service updates its own database and emits an event. If a local transaction fails (e.g. card declined), the Saga executes a series of Compensating Transactions in reverse order to undo the changes made by preceding steps (e.g. release reserved inventory).`,
      architectureDetails: `Two Saga Implementation Styles:
1. Choreography-Based Saga: Decentralized. Services listen to events and decide their next local step autonomously. Simple for small workflows (2–3 steps), but becomes spaghetti architecture for complex flows.
2. Orchestration-Based Saga: Centralized. A dedicated Saga Orchestrator (e.g. Temporal, AWS Step Functions, Cadence) manages state and tells services when to execute transactions and when to execute compensations. Recommended for enterprise architectures!`,
      keyTradeoffs: [
        {
          advantage: 'Non-blocking: no distributed locks held across services; high throughput and resilience against single-service downtime.',
          drawback: 'Eventual consistency: intermediate states are visible to users (ACID Isolation is sacrificed); compensating transactions must be explicitly coded.',
        },
      ],
      failureModes: [
        {
          failure: 'Compensating Transaction Failure',
          consequence: 'Payment failed, but the compensating transaction to release reserved inventory fails due to a network glitch, leaving stock permanently locked.',
          mitigation: 'Compensating transactions MUST be idempotent and retried indefinitely using dead-letter queues and automated alerts.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Uber / Airbnb Trip Booking',
          usage: 'Uber uses orchestration sagas (Temporal / Cadence) to coordinate driver dispatch, trip billing, payment authorization, and receipts.',
        },
      ],
      implementationChecklist: [
        'Use Orchestration (Temporal / AWS Step Functions) for sagas involving 4 or more microservices.',
        'Ensure every forward action has a matching, idempotent compensating action.',
      ],
    },
  },
  {
    id: 'idempotency-keys',
    title: 'API Idempotency & Unique Request Tokens',
    shortDescription: 'Preventing duplicate payment charges and unintended side effects during client network retries and timeout ambiguities.',
    domain: 'distributed',
    difficulty: 'intermediate',
    readTimeMinutes: 14,
    tags: ['idempotency', 'api-design', 'payments', 'reliability'],
    prerequisites: ['rest-vs-grpc-graphql'],
    relatedConcepts: ['snowflake-distributed-id', 'message-queues-brokers'],
    isFlagship: true,
    content: {
      overview: `An operation is idempotent if performing it multiple times produces the exact same outcome as performing it once:
f(f(x)) = f(x).

In distributed systems, network packets drop frequently. When a client submits a credit card payment (HTTP POST /charge), and the connection times out, the client cannot know whether:
1. The request failed to reach the server (not charged).
2. The server charged the card, but the HTTP response dropped on the return path (charged!).

If the client blindly retries, the customer will be charged twice. Idempotency Keys solve this fundamental ambiguity.`,
      architectureDetails: `The Idempotency Key Workflow (Stripe Standard):
1. Client generates a unique UUID (Idempotency-Key: e82f...) and passes it in the HTTP header.
2. Server checks Redis/Postgres for the key:
   - If not found: insert key with status "IN_PROGRESS", execute the charge, cache the final response JSON, and return.
   - If found with status "IN_PROGRESS": return HTTP 409 Conflict or wait for lock.
   - If found with status "COMPLETED": immediately return the cached response JSON without executing the charge again!`,
      keyTradeoffs: [
        {
          advantage: 'Guarantees zero duplicate charges or resource creations during client network retries.',
          drawback: 'Requires storing idempotency tokens and responses in a fast database with a retention TTL (e.g. 24 hours).',
        },
      ],
      failureModes: [
        {
          failure: 'Reusing Idempotency Key with Different Parameters',
          consequence: 'Client submits a $50 payment with Key X, then mistakenly submits a $500 payment with the same Key X; the server returns the cached $50 response without charging $500.',
          mitigation: 'Store the SHA-256 hash of the request payload alongside the idempotency key; if payload hash differs, reject with HTTP 400 Bad Request.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Stripe Payment API',
          usage: 'Stripe pioneered header-based Idempotency-Key support across all mutation endpoints, preventing billions in duplicate charges.',
        },
      ],
      implementationChecklist: [
        'Require Idempotency-Key headers on all critical financial and state-mutating POST endpoints.',
        'Store request body hashes to detect payload mismatches on key reuse.',
      ],
    },
  },
  {
    id: 'snowflake-distributed-id',
    title: 'Distributed ID Generation (Twitter Snowflake)',
    shortDescription: 'Generating 64-bit unique, time-ordered IDs at scale without centralized database lock bottlenecks.',
    domain: 'distributed',
    difficulty: 'intermediate',
    readTimeMinutes: 14,
    tags: ['snowflake', 'id-generator', 'distributed-systems', 'twitter'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['idempotency-keys', 'database-indexing-btree'],
    pairedLabId: 'snowflake-lab',
    isFlagship: true,
    content: {
      overview: `Relational databases use auto-incrementing integer IDs (AUTO_INCREMENT / SERIAL). However, a central database counter cannot scale horizontally across thousands of distributed servers, and creates a catastrophic single point of failure.

UUID v4 creates 128-bit random strings, but UUIDs are not time-ordered. Inserting random strings into clustered B+ Tree database indexes causes massive index fragmentation, page splits, and slow disk I/O.

Twitter solved this with Snowflake: a 64-bit globally unique, roughly time-sortable ID generator that requires zero network coordination between worker machines!`,
      architectureDetails: `The 64-Bit Snowflake Composition:
- 1 bit: Unused sign bit (always 0, keeping IDs positive numbers).
- 41 bits: Millisecond timestamp since a custom epoch (e.g. company founding date). 2^41 milliseconds = 69.7 years of unique timestamps.
- 5 bits: Datacenter ID (supports up to 32 datacenters).
- 5 bits: Worker / Machine ID (supports up to 32 worker nodes per datacenter).
- 12 bits: Sequence number (0 to 4095). Increments for every ID generated within the same millisecond on that worker; resets to 0 when the millisecond ticks over.

Capacity: A single worker node can generate 4,096 unique IDs per millisecond (over 4 million IDs per second per machine)!`,
      keyTradeoffs: [
        {
          advantage: 'Generates 64-bit integer IDs (half the size of UUIDs); fits in standard 64-bit CPU registers; naturally time-ordered for fast B+ Tree inserts.',
          drawback: 'Vulnerable to system clock drift (NTP clock moving backwards can cause ID collisions).',
        },
      ],
      formulas: [
        {
          name: 'Snowflake Bit Packing Formula',
          equation: 'ID = (Timestamp << 22) | (DatacenterID << 17) | (WorkerID << 12) | Sequence',
          explanation: 'Bitwise shift and OR operations pack 64-bit components with microsecond CPU speed.',
        },
      ],
      failureModes: [
        {
          failure: 'Clock Rollback Collision',
          consequence: 'Network Time Protocol (NTP) synchronizes the server clock, rolling it backwards by 100ms. The worker generates IDs with timestamps it already used, causing duplicate primary key collisions.',
          mitigation: 'If current_time < last_timestamp, refuse to generate IDs and sleep until the clock catches up, or switch to backup worker IDs.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Twitter / Discord / Instagram',
          usage: 'Twitter uses Snowflake for Tweet IDs; Discord uses Snowflake for every message, user, channel, and server ID.',
        },
      ],
      implementationChecklist: [
        'Define a custom epoch timestamp in the recent past (e.g. 2026-01-01) to maximize the 69-year lifespan of 41 bits.',
        'Implement clock-drift checks in the generator loop.',
      ],
    },
  },
  {
    id: 'vector-clocks',
    title: 'Vector Clocks & Lamport Timestamps',
    shortDescription: 'Causal ordering, detecting concurrent conflicting writes, and resolving split-brain state without synchronized physical clocks.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 12,
    tags: ['clocks', 'vector-clocks', 'causality', 'dynamo'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['cap-theorem', 'eventual-consistency-quorums'],
    isFlagship: false,
    content: {
      overview: `In distributed systems, physical wall-clock time cannot be trusted. Clock drift, NTP adjustments, and relativistic delays mean that two servers cannot agree on the exact microsecond an event occurred.

Leslie Lamport proved that physical time is unnecessary to establish causality. Logical Clocks and Vector Clocks track causality (whether Event A happened before Event B, or whether they occurred concurrently as conflicting writes).`,
      keyTradeoffs: [
        {
          advantage: 'Mathematically detects concurrent conflicting writes without physical clock synchronization.',
          drawback: 'Vector size grows linearly with the number of actors/nodes in the cluster, requiring pruning heuristics.',
        },
      ],
      failureModes: [
        {
          failure: 'Unbounded Vector Clock Bloat',
          consequence: 'In systems with thousands of participating nodes, vector clock metadata exceeds payload data size.',
          mitigation: 'Implement vector clock truncation based on timestamp thresholds (as in Riak and Dynamo).',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Amazon Dynamo / Riak KV',
          usage: 'Uses vector clocks to detect concurrent shopping cart updates and return siblings to clients for application-level reconciliation.',
        },
      ],
      implementationChecklist: [
        'Use Lamport timestamps for total ordering when conflict detection is not required.',
        'Use Vector Clocks when multi-master concurrent writes must be detected and preserved for reconciliation.',
      ],
    },
  },
  {
    id: 'gossip-protocol',
    title: 'Gossip Protocol for Cluster Membership',
    shortDescription: 'Decentralized peer-to-peer epidemic protocols for cluster discovery, node failure detection, and metadata dissemination.',
    domain: 'distributed',
    difficulty: 'advanced',
    readTimeMinutes: 12,
    tags: ['gossip', 'p2p', 'cassandra', 'consul'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['cap-theorem', 'database-sharding'],
    isFlagship: false,
    content: {
      overview: `In large distributed clusters (e.g. 1,000 Cassandra nodes), having every node poll every other node creates O(N^2) network traffic, saturating switches.
A Gossip Protocol (Epidemic Protocol) is a decentralized peer-to-peer communication mechanism inspired by how rumors spread through a human social network.

Periodically (e.g. every 1 second), each node randomly selects k peers and shares its internal state digest. Information spreads exponentially throughout the entire cluster in O(log N) time!`,
      keyTradeoffs: [
        {
          advantage: 'Extremely resilient to node churn and network partitions; requires zero centralized master coordinator.',
          drawback: 'Information dissemination is probabilistic and eventually consistent; slight delay before all nodes detect a failure.',
        },
      ],
      failureModes: [
        {
          failure: 'Flapping Node Phantom Failures',
          consequence: 'A node experiencing brief GC pauses is marked dead and revived repeatedly, causing gossip churn.',
          mitigation: 'Use the Phi Accrual Failure Detector, which calculates a continuous suspicion probability rather than binary up/down states.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'HashiCorp Consul / Apache Cassandra',
          usage: 'Consul uses the Serf gossip protocol for datacenter node membership; Cassandra uses gossip for node ring topology and heartbeat detection.',
        },
      ],
      implementationChecklist: [
        'Tune gossip fan-out factor k (typically k=3) to balance network packet volume against propagation speed.',
      ],
    },
  },
];
