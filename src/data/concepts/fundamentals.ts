import { Concept } from '../../types/concept';

export const FUNDAMENTALS_CONCEPTS: Concept[] = [
  {
    id: 'scalability-vs-performance',
    title: 'Scalability vs Performance',
    shortDescription: 'Understanding the crucial distinction between how fast a system processes a single task versus its ability to maintain throughput under expanding load.',
    domain: 'fundamentals',
    difficulty: 'beginner',
    readTimeMinutes: 12,
    tags: ['scalability', 'performance', 'latency', 'amdahl'],
    prerequisites: [],
    relatedConcepts: ['latency-vs-throughput', 'horizontal-vs-vertical', 'amdahls-law'],
    isFlagship: true,
    content: {
      overview: `A system is considered performant if it completes a single given unit of work quickly and efficiently using minimal compute, memory, and I/O resources.
In contrast, a system is scalable if it can handle increased work simply by adding computational resources, without degrading its performance or requiring an architectural redesign.

A common fallacy is confusing performance with scalability. You can have a system that is blindingly fast for one user (high performance) but locks shared state so severely that it collapses when 100 users arrive (unscalable). Conversely, a distributed map-reduce pipeline may take several minutes to run a query (lower single-query performance) but can scale linearly to petabytes of data across 10,000 servers.`,
      architectureDetails: `When evaluating systems, identify whether your bottleneck is algorithmic or concurrency-constrained:
1. Performance optimization focuses on reducing single-request execution time (e.g. optimizing SQL queries, algorithmic complexity, CPU cache efficiency, or binary serialization).
2. Scalability optimization focuses on removing contention points, eliminating centralized single points of serialization, making components stateless, and enabling parallel horizontal execution across clusters.`,
      keyTradeoffs: [
        {
          advantage: 'High Single-Node Performance minimizes infrastructure costs by extracting maximum throughput per CPU core before requiring clustering.',
          drawback: 'Premature single-node optimization can lead to overly complex, tightly coupled code that is difficult to horizontally shard later.',
        },
        {
          advantage: 'Horizontal Scalability allows near-infinite linear capacity expansion by provisioning additional commodity cloud servers.',
          drawback: 'Distributed scalability introduces network latency, serialization overhead, eventual consistency complexities, and split-brain risks.',
        },
      ],
      formulas: [
        {
          name: "Amdahl's Law",
          equation: "S(N) = 1 / ((1 - P) + (P / N))",
          explanation: "Calculates the theoretical maximum speedup S of a system using N processors, where P is the proportion of parallelizable work and (1 - P) is the strictly serial portion.",
        },
      ],
      failureModes: [
        {
          failure: 'Shared Mutex Bottleneck at Scale',
          consequence: 'Increasing server CPU cores from 16 to 64 yields zero throughput increase because worker threads spend 90% of cycles blocked on a single global lock.',
          mitigation: 'Implement lock-free data structures, thread-local storage, or partition the data so each worker processes an isolated queue.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Redis vs Memcached',
          usage: 'Redis uses a single-threaded event loop yielding ultra-low latency and predictable performance per core; Memcached uses multi-threaded locks for scale-up multi-core throughput.',
        },
      ],
      implementationChecklist: [
        'Profile latency percentiles (p50, p95, p99) under simulated concurrent load, not just single-user benchmarks.',
        'Identify all shared resources (databases, locks, disk I/O, singleton services) that could serialize traffic.',
        'Ensure compute services remain completely stateless to facilitate horizontal autoscaling.',
      ],
    },
  },
  {
    id: 'latency-vs-throughput',
    title: 'Latency vs Throughput',
    shortDescription: 'Deconstructing response time, network round-trips, tail latency percentiles (p99/p99.9), and pipeline throughput.',
    domain: 'fundamentals',
    difficulty: 'beginner',
    readTimeMinutes: 14,
    tags: ['latency', 'throughput', 'littles-law', 'p99'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['littles-law', 'load-balancing-algorithms'],
    isFlagship: true,
    content: {
      overview: `Latency is the duration elapsed between a client dispatching a request and receiving the full response (often measured in milliseconds).
Throughput is the volume of operations or data the system successfully processes per unit of time (measured in Queries Per Second, QPS, or Megabytes/sec).

While latency and throughput are related, optimizing for one can degrade the other. For example, batching 500 database writes into a single disk sync maximizes throughput (MB/sec) because it avoids repeated disk head seeks, but increases latency for individual records waiting in the batch buffer.`,
      architectureDetails: `In modern microservice architectures, focus on Tail Latency (p99 and p99.9) rather than median (p50). If a user request fans out to 50 microservices in parallel, the user's total latency is bound by the slowest response:
P(User experiences p99 latency) = 1 - (0.99)^50 ≈ 39.5%.
Nearly 40% of all user requests will experience tail latency if service fan-out is left unmitigated!`,
      keyTradeoffs: [
        {
          advantage: 'Batching & Pipelining drastically increases system throughput by amortizing connection and I/O overhead.',
          drawback: 'Introduces queuing delays that elevate individual request latency.',
        },
        {
          advantage: 'Immediate processing delivers lowest possible p50 latency for individual user transactions.',
          drawback: 'Severely caps maximum system throughput due to frequent context switching and unbatched disk/network handshakes.',
        },
      ],
      formulas: [
        {
          name: "Little's Law",
          equation: "L = λ × W",
          explanation: "In a stable queuing system, the average concurrency L equals the arrival throughput λ multiplied by the average latency W.",
        },
      ],
      failureModes: [
        {
          failure: 'Tail Latency Amplification via Microservice Fan-Out',
          consequence: 'A dashboard making 30 downstream microservice calls exhibits frequent 2-second lag spikes due to a single slow backend node.',
          mitigation: 'Implement hedged requests (duplicate request sent if no response within p95) and strict timeout deadlines with fallback defaults.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Apache Kafka',
          usage: 'Kafka defaults to batching records (batch.size and linger.ms) to achieve multi-gigabyte throughput per second across commodity disks.',
        },
      ],
      implementationChecklist: [
        'Always instrument and monitor p50, p95, p99, and p99.9 metrics rather than simple averages.',
        'Apply Little’s Law when provisioning connection pools and worker thread counts.',
        'Use deadlines/context timeouts across all internal RPC calls.',
      ],
    },
  },
  {
    id: 'availability-vs-reliability',
    title: 'Availability vs Reliability & SLAs',
    shortDescription: 'Quantifying uptime, Mean Time Between Failures (MTBF), Mean Time to Recover (MTTR), and designing for 99.99% availability.',
    domain: 'fundamentals',
    difficulty: 'beginner',
    readTimeMinutes: 10,
    tags: ['availability', 'reliability', 'sla', 'slo', 'sli'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['disaster-recovery-strategies', 'circuit-breaker-pattern'],
    isFlagship: false,
    content: {
      overview: `Availability measures the percentage of time a system is operational and responsive when invoked (e.g. "four nines" 99.99% allows ~52 minutes of downtime per year).
Reliability measures the probability that a system performs its required functions without failure under specified conditions over a given duration.

A system can be available without being reliable (e.g. an API always returns HTTP 200 within 10ms, but returns corrupted or incorrect data). Conversely, a system can be highly reliable while undergoing scheduled weekend maintenance downtime.`,
      keyTradeoffs: [
        {
          advantage: 'Designing for 99.999% ("five nines") guarantees enterprise business continuity and prevents contractual SLA penalty payouts.',
          drawback: 'The infrastructure and engineering cost to move from 99.9% to 99.999% increases exponentially due to multi-region active-active complexity.',
        },
      ],
      formulas: [
        {
          name: 'Availability Ratio',
          equation: 'Availability = MTBF / (MTBF + MTTR)',
          explanation: 'Calculated as Mean Time Between Failures divided by the sum of MTBF and Mean Time To Recover.',
        },
      ],
      failureModes: [
        {
          failure: 'Hidden Dependency Outage',
          consequence: 'A payment gateway drops availability because an internal third-party fraud scoring API went down without a fallback circuit.',
          mitigation: 'Decouple critical user flows from non-critical dependencies using asynchronous buffers and degraded fallback paths.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Amazon Web Services',
          usage: 'S3 Standard provides 99.99% availability SLA and 99.999999999% (11 nines) durability SLA across multiple availability zones.',
        },
      ],
      implementationChecklist: [
        'Define explicit SLIs (indicators), SLOs (internal targets), and SLAs (contractual commitments).',
        'Automate health checks and fast failover to minimize MTTR.',
      ],
    },
  },
  {
    id: 'cap-theorem',
    title: 'The CAP Theorem in Practice',
    shortDescription: 'Proving why distributed data stores must choose between Consistency and Availability during network partitions.',
    domain: 'fundamentals',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['cap', 'consistency', 'availability', 'partitions', 'quorum'],
    prerequisites: ['availability-vs-reliability'],
    relatedConcepts: ['pacelc-theorem', 'acid-vs-base', 'eventual-consistency-quorums'],
    pairedLabId: 'cap-lab',
    isFlagship: true,
    content: {
      overview: `The CAP Theorem (formulated by Eric Brewer and proven by Seth Gilbert and Nancy Lynch) states that any distributed data store can simultaneously provide at most two of the following three guarantees:
1. Consistency (Linearizability): Every read receives the most recent write or an error.
2. Availability: Every non-failing node returns a non-error response for every request (without guaranteeing it is the most recent write).
3. Partition Tolerance: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

In the real world, physical networks inevitably experience packet drops, fiber cuts, and router restarts. Therefore, Partition Tolerance (P) is a physical reality that cannot be negotiated away. When a network partition occurs, architects must choose between Consistency (CP) and Availability (AP).`,
      architectureDetails: `During a network partition between Region 1 and Region 2:
- A CP system (e.g. HBase, CockroachDB, ZooKeeper, etcd) rejects writes or halts processing on the minority partition to prevent split-brain inconsistencies.
- An AP system (e.g. Cassandra, DynamoDB with eventual consistency, CouchDB) accepts writes on both sides of the partition, allowing data to temporarily diverge and resolving conflicts asynchronously when the partition heals.`,
      keyTradeoffs: [
        {
          advantage: 'CP Systems ensure zero data divergence, preventing dangerous double-spending or conflicting state mutations.',
          drawback: 'Nodes in a partitioned minority cluster will reject client requests or time out, hurting availability.',
        },
        {
          advantage: 'AP Systems ensure users can always read and write, maximizing uptime and user satisfaction during infrastructure failures.',
          drawback: 'Clients may read stale or conflicting data, requiring complex reconciliation mechanisms (vector clocks, CRDTs, last-write-wins).',
        },
      ],
      formulas: [
        {
          name: 'Quorum Overlap Condition',
          equation: 'R + W > N',
          explanation: 'Strong consistency requires the sum of Read Quorum (R) and Write Quorum (W) to strictly exceed Total Replicas (N).',
        },
      ],
      failureModes: [
        {
          failure: 'Split-Brain Inconsistency in AP Systems',
          consequence: 'Two isolated halves of a cluster both elect themselves leaders and accept writes for the same account, resulting in irreconcilable financial discrepancy.',
          mitigation: 'Require a strict quorum majority (N/2 + 1) to elect leaders or accept state modifications.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Apache Cassandra vs ZooKeeper',
          usage: 'Cassandra defaults to AP for massive global social feeds; ZooKeeper implements strict CP for distributed lock coordination and metadata election.',
        },
      ],
      implementationChecklist: [
        'Map every business transaction to either CP or AP requirements (payments = CP; social media comments = AP).',
        'Configure Quorum levels (e.g. LOCAL_QUORUM in Cassandra) to meet specific consistency SLAs.',
      ],
    },
  },
  {
    id: 'pacelc-theorem',
    title: 'The PACELC Theorem',
    shortDescription: 'Extending CAP to account for the fundamental trade-off between Latency and Consistency during normal network conditions.',
    domain: 'fundamentals',
    difficulty: 'advanced',
    readTimeMinutes: 14,
    tags: ['pacelc', 'cap', 'latency', 'consistency'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['cap-theorem', 'eventual-consistency-quorums'],
    isFlagship: true,
    content: {
      overview: `Formulated by Daniel Abadi, the PACELC theorem addresses a major limitation of the CAP theorem: CAP only discusses system behavior during rare network partitions. But what trade-offs occur during the 99.9% of the time when the network is healthy?

PACELC states:
If there is a Partition (P), how does the system choose between Availability (A) and Consistency (C)?
Else (E), when the network is running normally, how does the system choose between Latency (L) and Consistency (C)?

This yields four distinct system classifications: PC/EC, PC/EL, PA/EC, and PA/EL.`,
      architectureDetails: `System Classifications:
1. PC/EC (e.g. Bigtable, Spanner): Choose Consistency during partitions, and Consistency over Latency during normal operations (synchronous replication across replicas).
2. PA/EL (e.g. Cassandra, DynamoDB): Choose Availability during partitions, and Latency over Consistency during normal operations (asynchronous replication, quick local returns).
3. PC/EL (e.g. MongoDB, PostgreSQL with async replicas): Choose Consistency during partition, but optimize for Latency during normal operations by reading from async secondaries.`,
      keyTradeoffs: [
        {
          advantage: 'Choosing Latency over Consistency (EL) yields single-digit millisecond response times by avoiding cross-node synchronous handshakes.',
          drawback: 'Introduces dirty reads or read-your-own-writes inconsistencies if a client immediately queries after mutation.',
        },
      ],
      formulas: [
        {
          name: 'PACELC Structure',
          equation: 'If (P) -> [A or C]; Else -> [L or C]',
          explanation: 'Governs distributed state decisions both during failures and during steady-state normal operations.',
        },
      ],
      failureModes: [
        {
          failure: 'Unexpected Replication Lag in PC/EL System',
          consequence: 'A user creates a new post, is redirected to the timeline, and does not see their own post because the read replica has not synchronized yet.',
          mitigation: 'Implement Read-Your-Own-Writes consistency routing: send reads to the primary node for 5 seconds after a write before falling back to read replicas.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Amazon DynamoDB',
          usage: 'Configured by default as PA/EL (Eventual consistency); can be toggled per request to Strongly Consistent Reads at double the cost.',
        },
      ],
      implementationChecklist: [
        'Determine whether users require monotonic read consistency or if eventual consistency is acceptable.',
        'Use sticky sessions or primary-routing for write-followed-by-read flows.',
      ],
    },
  },
  {
    id: 'back-of-the-envelope',
    title: 'Back-of-the-Envelope Calculations',
    shortDescription: 'Mastering powers of two, latency numbers every programmer should know, storage sizing, and bandwidth capacity math.',
    domain: 'fundamentals',
    difficulty: 'beginner',
    readTimeMinutes: 15,
    tags: ['estimation', 'math', 'capacity', 'interview'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['littles-law', 'database-sharding'],
    isFlagship: true,
    content: {
      overview: `Back-of-the-envelope estimation is the art of performing rough, order-of-magnitude mathematical calculations to validate system design feasibility before writing code.
It allows engineers to quickly determine whether an architecture requires 2 servers or 2,000 servers, whether a relational database can handle the write QPS, and how much RAM/SSD storage must be provisioned.`,
      architectureDetails: `Numbers Every Programmer Should Know (Latency Cheat Sheet):
- L1 cache reference: 0.5 ns
- L2 cache reference: 7 ns
- Main memory (RAM) reference: 100 ns
- Read 1 MB sequentially from memory: 3,000 ns (3 µs)
- Read 1 MB sequentially from SSD: 1,000,000 ns (1 ms)
- Read 1 MB sequentially from HDD: 20,000,000 ns (20 ms)
- Send packet CA to Netherlands & back: 150,000,000 ns (150 ms)

Key takeaways: Memory is ~1,000x faster than disk, and disk is ~100,000x faster than cross-continent fiber networks. Keep hot data in memory!`,
      keyTradeoffs: [
        {
          advantage: 'Quick estimations prevent catastrophic architectural miscalculations before expensive cloud commitments.',
          drawback: 'Estimations ignore tail latencies, GC pauses, burst spikes, and network packet retransmissions.',
        },
      ],
      formulas: [
        {
          name: 'Traffic to QPS Formula',
          equation: 'QPS = Total Daily Requests / 86,400 ≈ Total Daily Requests / 100,000',
          explanation: 'Quick rule of thumb: 100,000 seconds per day simplifies mental division during system design interviews.',
        },
        {
          name: 'Powers of Two Scale',
          equation: '2^10 = 1 Thousand (KB), 2^20 = 1 Million (MB), 2^30 = 1 Billion (GB), 2^40 = 1 Trillion (TB)',
          explanation: 'Binary exponent rules for rapid storage and capacity translation.',
        },
      ],
      failureModes: [
        {
          failure: 'Underestimating Peak-to-Average Traffic Ratio',
          consequence: 'A system sized for average 1,000 QPS collapses on Black Friday because peak traffic reached 10x average (10,000 QPS).',
          mitigation: 'Always multiply average QPS by a peak factor (typically 3x to 5x, or 10x for flash sales).',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Twitter Firehose Sizing',
          usage: '500M tweets/day ≈ 6,000 tweets/sec average, with peak surges exceeding 150,000 tweets/sec during the World Cup.',
        },
      ],
      implementationChecklist: [
        'Calculate QPS (Read QPS and Write QPS separately).',
        'Calculate Storage required per day, per month, and for 5 years.',
        'Apply the 80/20 rule: 20% of content generates 80% of read traffic to size cache memory.',
      ],
    },
  },
  {
    id: 'acid-vs-base',
    title: 'ACID vs BASE Consistency Models',
    shortDescription: 'Comparing strict transactional guarantees against eventual consistency and soft-state models in distributed stores.',
    domain: 'fundamentals',
    difficulty: 'intermediate',
    readTimeMinutes: 10,
    tags: ['acid', 'base', 'transactions', 'consistency'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['cap-theorem', 'relational-vs-nosql', 'saga-pattern'],
    isFlagship: false,
    content: {
      overview: `ACID and BASE represent two opposing philosophical models of database transaction guarantees:
- ACID (Atomicity, Consistency, Isolation, Durability) focuses on strict correctness and immediate transaction finality, typical of traditional RDBMS (PostgreSQL, Oracle).
- BASE (Basically Available, Soft state, Eventual consistency) prioritizes availability and horizontal scale over immediate correctness, typical of NoSQL stores (Cassandra, DynamoDB).`,
      keyTradeoffs: [
        {
          advantage: 'ACID guarantees financial correctness; transactions either succeed entirely or roll back cleanly.',
          drawback: 'Requires heavy locking (pessimistic or multi-version) and synchronous coordination, capping horizontal write throughput.',
        },
        {
          advantage: 'BASE scales to millions of concurrent writes across global clusters with near-zero latency.',
          drawback: 'Applications must tolerate temporary data inconsistencies and handle conflict resolution logic in application code.',
        },
      ],
      failureModes: [
        {
          failure: 'Distributed Deadlocks under ACID across Microservices',
          consequence: 'Cross-service two-phase commit locks rows indefinitely when network packets drop.',
          mitigation: 'Transition from distributed ACID transactions to the BASE Saga Pattern with compensating workflows.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Stripe Payment Processing',
          usage: 'Ledgers and money transfers utilize strict ACID PostgreSQL transactions; webhook event broadcasting uses BASE eventual consistency.',
        },
      ],
      implementationChecklist: [
        'Reserve ACID transactions for core ledgers, inventory decrement, and authentication.',
        'Use BASE for social feeds, activity tracking, analytics, and messaging queues.',
      ],
    },
  },
  {
    id: 'littles-law',
    title: "Little's Law & Concurrency Limits",
    shortDescription: 'Mathematical foundation of queue lengths, system capacity, connection pools, and thread pool sizing.',
    domain: 'fundamentals',
    difficulty: 'intermediate',
    readTimeMinutes: 10,
    tags: ['math', 'concurrency', 'queuing'],
    prerequisites: ['latency-vs-throughput'],
    relatedConcepts: ['latency-vs-throughput', 'rate-limiting-algorithms'],
    isFlagship: false,
    content: {
      overview: `Little's Law is a foundational theorem in queuing theory proven by John Little in 1961:
L = λ × W
Where:
- L = Average number of concurrent requests in the system.
- λ = Long-term average arrival rate (throughput in requests per second).
- W = Average time a request spends in the system (latency in seconds).

This law holds true regardless of the arrival distribution, service distribution, or internal queuing mechanism.`,
      formulas: [
        {
          name: "Little's Law",
          equation: 'L = λ × W',
          explanation: 'System Concurrency = Throughput (req/s) × Latency (seconds).',
        },
      ],
      keyTradeoffs: [
        {
          advantage: 'Provides exact sizing requirements for database connection pools, thread pools, and memory buffers.',
          drawback: 'Assumes steady-state equilibrium; temporary burst spikes require queue buffers to prevent rejection.',
        },
      ],
      failureModes: [
        {
          failure: 'Thread Pool Starvation via Upstream Latency Increase',
          consequence: 'If downstream database latency increases from 50ms to 500ms, concurrency L surges by 10x, exhausting the server’s 200 worker threads and dropping new requests.',
          mitigation: 'Implement asynchronous I/O (event loops) and strict request timeouts.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Tomcat / Netty Sizing',
          usage: 'Engineers calculate exact thread counts needed to sustain 10,000 QPS given a 20ms database SLA: 10,000 × 0.02 = 200 concurrent threads required.',
        },
      ],
      implementationChecklist: [
        'Size database connection pools using Little\'s Law based on target QPS and query duration.',
        'Calculate memory footprint per concurrent connection to prevent Out-Of-Memory (OOM) crashes.',
      ],
    },
  },
  {
    id: 'amdahls-law',
    title: "Amdahl's Law & Parallelism Limits",
    shortDescription: 'The mathematical upper limit of speedup achieved by adding parallel worker threads or compute nodes.',
    domain: 'fundamentals',
    difficulty: 'advanced',
    readTimeMinutes: 10,
    tags: ['math', 'parallelism', 'performance'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['scalability-vs-performance'],
    isFlagship: false,
    content: {
      overview: `Amdahl's Law predicts the theoretical maximum speedup of a task when processing resources are increased.
If a program has a sequential component that cannot be parallelized (e.g. 5% of execution time must be serial), no matter how many processors you add (even 1,000,000 CPUs), the maximum theoretical speedup can NEVER exceed 1 / 0.05 = 20x.`,
      formulas: [
        {
          name: "Amdahl's Law",
          equation: 'Speedup = 1 / ((1 - P) + (P / N))',
          explanation: 'P is parallelizable fraction, (1 - P) is serial fraction, N is processor count.',
        },
      ],
      keyTradeoffs: [
        {
          advantage: 'Identifies diminishing returns of scaling up hardware before wasting cloud expenditure.',
          drawback: 'Focuses on fixed problem sizes; Gustafson’s law should be used when problem size scales with compute.',
        },
      ],
      failureModes: [
        {
          failure: 'Over-provisioning Compute on Serial Workloads',
          consequence: 'Spending $50,000/month scaling a batch cluster from 100 to 500 nodes yields only 3% job speedup due to a single sequential sorting step.',
          mitigation: 'Profile the serial critical path and re-architect the sequential step into map-reduce shards.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Spark / Hadoop MapReduce',
          usage: 'Map steps scale linearly with workers, but the final Reduce and shuffle aggregation forms the serial bottleneck governed by Amdahl’s law.',
        },
      ],
      implementationChecklist: [
        'Profile CPU wait times on locks and serialization before adding more instances.',
      ],
    },
  },
];
