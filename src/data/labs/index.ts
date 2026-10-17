import { LabDefinition } from '../../types/lab';

export const LABS: LabDefinition[] = [
  {
    id: 'lb-lab',
    title: 'Load Balancing & Distribution Lab',
    shortDescription: 'Compare Round Robin, Least Connections, Weighted Round Robin, and IP Hash under traffic bursts and backend server failures.',
    domain: 'scalability',
    difficulty: 'intermediate',
    icon: 'Network',
    estimatedMinutes: 10,
    pairedConceptId: 'load-balancing-algorithms',
    learningObjectives: [
      'Observe request distribution dynamics across heterogeneously weighted servers',
      'Test failover reaction when a backend node goes unhealthy',
      'Evaluate session affinity benefits vs hotspot risks with IP Hash',
    ],
    controls: [
      { id: 'algorithm', label: 'Algorithm', type: 'select', defaultValue: 'round_robin', options: [
        { label: 'Round Robin', value: 'round_robin' },
        { label: 'Least Connections', value: 'least_conn' },
        { label: 'Weighted Round Robin', value: 'weighted' },
        { label: 'Source IP Hash', value: 'ip_hash' },
      ]},
      { id: 'requestRate', label: 'Request Influx', type: 'slider', min: 10, max: 200, step: 10, defaultValue: 50, unit: 'reqs' },
    ],
    assumptions: [
      {
        assumption: 'All healthy servers respond with uniform synthetic execution latencies.',
        realWorldDifference: 'Real production servers experience GC pauses, thread pool starvation, and varying I/O query times.',
      },
      {
        assumption: 'Server failure is binary (healthy vs failed).',
        realWorldDifference: 'Real nodes often enter gray-failure states (intermittent 503s, slow leaks, degraded TCP sockets).',
      },
    ],
  },
  {
    id: 'cache-lab',
    title: 'Caching Topologies & Eviction Lab',
    shortDescription: 'Benchmark Cache-Aside, Write-Through, Write-Back, and Write-Around strategies with LRU and LFU eviction algorithms.',
    domain: 'scalability',
    difficulty: 'intermediate',
    icon: 'Zap',
    estimatedMinutes: 12,
    pairedConceptId: 'caching-strategies',
    learningObjectives: [
      'Analyze cache hit ratio changes as memory capacity limits are reached',
      'Compare dirty data risks in Write-Back versus synchronous latency in Write-Through',
      'Verify how Cache-Aside handles cache invalidation on database mutations',
    ],
    controls: [
      { id: 'strategy', label: 'Caching Strategy', type: 'select', defaultValue: 'cache_aside', options: [
        { label: 'Cache-Aside', value: 'cache_aside' },
        { label: 'Write-Through', value: 'write_through' },
        { label: 'Write-Back', value: 'write_back' },
        { label: 'Write-Around', value: 'write_around' },
      ]},
      { id: 'evictionPolicy', label: 'Eviction Policy', type: 'select', defaultValue: 'lru', options: [
        { label: 'LRU (Least Recently Used)', value: 'lru' },
        { label: 'LFU (Least Frequently Used)', value: 'lfu' },
      ]},
      { id: 'cacheCapacity', label: 'Memory Slots', type: 'slider', min: 3, max: 8, step: 1, defaultValue: 5, unit: 'slots' },
    ],
    assumptions: [
      {
        assumption: 'Cache entries have uniform memory size in fixed discrete slots.',
        realWorldDifference: 'Real Redis instances allocate variable memory with jemalloc; fragmentation and large payloads affect eviction.',
      },
      {
        assumption: 'Cache invalidation is instantaneous.',
        realWorldDifference: 'Distributed caches face replication lag, race conditions between DB commits and cache deletes, and thundering herds.',
      },
    ],
  },
  {
    id: 'sharding-lab',
    title: 'Database Sharding & Hotspot Lab',
    shortDescription: 'Simulate Range, Hash, and Directory-based partitioning, identify shard hotspots, and test cluster rebalancing.',
    domain: 'storage',
    difficulty: 'advanced',
    icon: 'Database',
    estimatedMinutes: 15,
    pairedConceptId: 'database-sharding',
    learningObjectives: [
      'Identify how range-based partitioning creates severe write hotspots on sequential IDs',
      'Examine how modulo hashing scatters keys across database instances',
      'Experience the operational pain of cluster rebalancing when adding shard nodes',
    ],
    controls: [
      { id: 'strategy', label: 'Partitioning Strategy', type: 'select', defaultValue: 'hash', options: [
        { label: 'Hash Partitioning', value: 'hash' },
        { label: 'Range Partitioning', value: 'range' },
        { label: 'Directory Lookup', value: 'directory' },
      ]},
    ],
    assumptions: [
      {
        assumption: 'Queries are single-key point lookups on the shard key.',
        realWorldDifference: 'Real applications frequently execute scatter-gather cross-shard joins that introduce massive latency spikes.',
      },
      {
        assumption: 'Rebalancing copies all keys instantly in memory.',
        realWorldDifference: 'Production resharding involves gigabytes/terabytes over live replication links without downtime.',
      },
    ],
  },
  {
    id: 'rate-limit-lab',
    title: 'Rate Limiting Algorithms Lab',
    shortDescription: 'Benchmark Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window algorithms under high-burst traffic.',
    domain: 'scalability',
    difficulty: 'intermediate',
    icon: 'ShieldAlert',
    estimatedMinutes: 10,
    pairedConceptId: 'rate-limiting-algorithms',
    learningObjectives: [
      'Compare burst absorption capabilities of Token Bucket against smooth outflow of Leaky Bucket',
      'Observe HTTP 429 throttling metrics under sustained traffic spikes',
      'Understand how refill rates prevent denial-of-service downstream',
    ],
    controls: [
      { id: 'algorithm', label: 'Algorithm', type: 'select', defaultValue: 'token_bucket', options: [
        { label: 'Token Bucket', value: 'token_bucket' },
        { label: 'Leaky Bucket', value: 'leaky_bucket' },
        { label: 'Fixed Window', value: 'fixed_window' },
        { label: 'Sliding Window', value: 'sliding_window' },
      ]},
      { id: 'capacity', label: 'Bucket Capacity', type: 'slider', min: 5, max: 25, step: 1, defaultValue: 10, unit: 'units' },
      { id: 'refillRate', label: 'Refill Rate', type: 'slider', min: 1, max: 8, step: 1, defaultValue: 2, unit: '/sec' },
    ],
    assumptions: [
      {
        assumption: 'Rate limits are evaluated in a local single-node process.',
        realWorldDifference: 'Distributed rate limiters use Redis with Redis Lua scripts, distributed counters, and clock synchronization across nodes.',
      },
      {
        assumption: 'All API requests have equal unit cost.',
        realWorldDifference: 'Production systems use tiered cost weighting (e.g., search = 5 tokens, simple read = 1 token).',
      },
    ],
  },
  {
    id: 'cap-lab',
    title: 'CAP & Quorum Consensus Lab',
    shortDescription: 'Simulate network partitions between replica groups, adjust R/W quorum sizes, and observe stale reads vs write rejections.',
    domain: 'fundamentals',
    difficulty: 'advanced',
    icon: 'Network',
    estimatedMinutes: 15,
    pairedConceptId: 'cap-theorem',
    learningObjectives: [
      'Validate the strong consistency quorum inequality: R + W > N',
      'Observe how CP systems reject writes during network partitions to guarantee consistency',
      'Inspect stale read occurrences when reading from an isolated minority partition',
    ],
    controls: [
      { id: 'writeQuorum', label: 'Write Quorum (W)', type: 'slider', min: 1, max: 5, step: 1, defaultValue: 3, unit: 'nodes' },
      { id: 'readQuorum', label: 'Read Quorum (R)', type: 'slider', min: 1, max: 5, step: 1, defaultValue: 3, unit: 'nodes' },
      { id: 'isPartitioned', label: 'Partition Active', type: 'toggle', defaultValue: true },
    ],
    assumptions: [
      {
        assumption: 'Network partition cleanly divides nodes into 3 vs 2 static partitions.',
        realWorldDifference: 'Real network partitions can be asymmetric, partial, flapping, or packet-loss degraded.',
      },
      {
        assumption: 'Version tracking uses simple integer monotonic versioning.',
        realWorldDifference: 'Dynamo-style databases utilize vector clocks or dotted version vectors to detect concurrent conflicting writes.',
      },
    ],
  },
  {
    id: 'queue-lab',
    title: 'Message Queue & Backpressure Lab',
    shortDescription: 'Tune producer and consumer rates, inspect queue buffer depth, and trigger dead-letter queue (DLQ) overflow.',
    domain: 'distributed',
    difficulty: 'intermediate',
    icon: 'Layers',
    estimatedMinutes: 10,
    pairedConceptId: 'message-queues-brokers',
    learningObjectives: [
      'Understand buffer accumulation when consumer velocity lags behind producer throughput',
      'Observe dead-letter queue (DLQ) routing upon queue capacity exhaustion',
      'Demonstrate backpressure pacing to stabilize upstream systems',
    ],
    controls: [
      { id: 'producerRate', label: 'Producer Velocity', type: 'slider', min: 1, max: 20, step: 1, defaultValue: 5, unit: 'msg/s' },
      { id: 'consumerRate', label: 'Consumer Velocity', type: 'slider', min: 1, max: 20, step: 1, defaultValue: 3, unit: 'msg/s' },
      { id: 'bufferCapacity', label: 'Buffer Capacity', type: 'slider', min: 10, max: 50, step: 5, defaultValue: 20, unit: 'slots' },
    ],
    assumptions: [
      {
        assumption: 'Messages are uniform in size and processing complexity.',
        realWorldDifference: 'Production messages contain poison pills, large JSON payloads, and network timeouts during consumer ACK processing.',
      },
      {
        assumption: 'In-memory FIFO buffer without persistence disk sync.',
        realWorldDifference: 'Enterprise brokers (Kafka, RabbitMQ) write to write-ahead logs (WAL) with fsync policies affecting throughput.',
      },
    ],
  },
  {
    id: 'consistent-hashing-lab',
    title: 'Consistent Hashing Ring Visualizer',
    shortDescription: 'Explore the 360-degree hash ring with virtual nodes (vnodes), test node additions/removals, and measure minimal key remapping.',
    domain: 'storage',
    difficulty: 'intermediate',
    icon: 'Boxes',
    estimatedMinutes: 12,
    pairedConceptId: 'consistent-hashing',
    learningObjectives: [
      'Visualize how hash tokens space physical nodes around a 360-degree circle',
      'Demonstrate how virtual nodes (vnodes) eliminate severe load imbalances',
      'Verify that adding/removing a node only re-maps approximately 1/N keys (K/N)',
    ],
    controls: [
      { id: 'vnodesPerNode', label: 'Virtual Nodes per Node', type: 'slider', min: 1, max: 8, step: 1, defaultValue: 3, unit: 'vnodes' },
      { id: 'totalKeysCount', label: 'Sample Keys', type: 'slider', min: 20, max: 200, step: 10, defaultValue: 50, unit: 'keys' },
    ],
    assumptions: [
      {
        assumption: 'Ring is visualized on a 360-degree integer circle using simplified 32-bit integer hashing.',
        realWorldDifference: 'Production libraries (e.g., Ketama, Murmur3) map onto a 2^32 - 1 or 2^128 - 1 integer space.',
      },
      {
        assumption: 'All physical servers have identical capacity and weighting.',
        realWorldDifference: 'Heterogeneous hardware utilizes proportional virtual node multipliers (e.g. 200 vnodes vs 100 vnodes).',
      },
    ],
  },
  {
    id: 'cdn-lab',
    title: 'CDN Edge Latency & POP Simulator',
    shortDescription: 'Simulate client requests from global regions, compare Edge POP latency against direct Origin latency, and measure bandwidth savings.',
    domain: 'scalability',
    difficulty: 'intermediate',
    icon: 'Globe',
    estimatedMinutes: 10,
    pairedConceptId: 'cdn-architecture',
    learningObjectives: [
      'Quantify Time-to-First-Byte (TTFB) reductions when assets are served from regional edge caches',
      'Analyze origin server offload percentages under high cache hit conditions',
      'Observe the latency penalty of cache misses and global cache purges',
    ],
    controls: [
      { id: 'cacheTTL', label: 'Cache TTL', type: 'slider', min: 60, max: 86400, step: 300, defaultValue: 3600, unit: 's' },
    ],
    assumptions: [
      {
        assumption: 'Network speed of light latencies are modeled with fixed regional baseline medians.',
        realWorldDifference: 'Actual internet routing experiences BGP anomalies, fiber cuts, congestion, and packet retransmissions.',
      },
      {
        assumption: 'Origin server has infinite capacity and zero compute queue delay.',
        realWorldDifference: 'Origin servers degrade and queue connections under heavy cache-miss stampedes (thundering herd).',
      },
    ],
  },
  {
    id: 'circuit-breaker-lab',
    title: 'Circuit Breaker State Machine Lab',
    shortDescription: 'Monitor Closed -> Open -> Half-Open transitions, failure threshold percentages, sleep windows, and fast fallback degradation.',
    domain: 'distributed',
    difficulty: 'intermediate',
    icon: 'AlertTriangle',
    estimatedMinutes: 12,
    pairedConceptId: 'circuit-breaker-pattern',
    learningObjectives: [
      'Observe fail-fast behavior when backend error rates exceed the trip threshold',
      'Inspect sleep window cooldown before trial requests are admitted in Half-Open',
      'Verify how fast fallbacks shield downstream services from cascading collapse',
    ],
    controls: [
      { id: 'backendFailureRate', label: 'Backend Failure Rate', type: 'slider', min: 0, max: 100, step: 5, defaultValue: 75, unit: '%' },
      { id: 'failureThreshold', label: 'Trip Threshold', type: 'slider', min: 20, max: 80, step: 5, defaultValue: 50, unit: '%' },
      { id: 'sleepWindowSec', label: 'Sleep Window', type: 'slider', min: 3, max: 15, step: 1, defaultValue: 5, unit: 's' },
    ],
    assumptions: [
      {
        assumption: 'Failure is based on simulated random boolean error generation.',
        realWorldDifference: 'Production circuit breakers (Resilience4j, Envoy) monitor slow calls (P99 latency) as well as HTTP 5xx responses.',
      },
      {
        assumption: 'Rolling window retains the last 10 requests in memory.',
        realWorldDifference: 'Enterprise implementations use time-sliced sliding window buckets (e.g. 10 buckets of 1 second).',
      },
    ],
  },
  {
    id: 'snowflake-lab',
    title: 'Distributed Snowflake ID Generator Lab',
    shortDescription: 'Deconstruct the 64-bit ID generator structure (epoch timestamp, worker ID, datacenter ID, sequence) and simulate clock drift anomalies.',
    domain: 'distributed',
    difficulty: 'intermediate',
    icon: 'Cpu',
    estimatedMinutes: 10,
    pairedConceptId: 'snowflake-distributed-id',
    learningObjectives: [
      'Deconstruct the 64-bit composition of Twitter Snowflake IDs',
      'Verify how sequence bits prevent ID collisions within the same millisecond',
      'Observe system behavior and mitigation strategies during NTP clock rollback events',
    ],
    controls: [
      { id: 'datacenterId', label: 'Datacenter ID', type: 'slider', min: 0, max: 31, step: 1, defaultValue: 1, unit: '' },
      { id: 'workerId', label: 'Worker ID', type: 'slider', min: 0, max: 31, step: 1, defaultValue: 7, unit: '' },
    ],
    assumptions: [
      {
        assumption: 'Clock drift is simulated as an explicit user toggle.',
        realWorldDifference: 'Real NTP clock drift occurs gradually or during leap-second adjustments, requiring robust clock-watchers.',
      },
      {
        assumption: 'Sequence counter resets automatically when millisecond advances.',
        realWorldDifference: 'High concurrency generators spin-wait if 4,096 sequence numbers are exhausted in a single millisecond.',
      },
    ],
  },
  {
    id: 'replication-lab',
    title: 'Database Replication & Failover Lab',
    shortDescription: 'Compare Synchronous vs Asynchronous replication, induce replication lag, and perform automated leader election failovers.',
    domain: 'storage',
    difficulty: 'intermediate',
    icon: 'Database',
    estimatedMinutes: 12,
    pairedConceptId: 'database-replication',
    learningObjectives: [
      'Compare write latency overhead of Synchronous versus Asynchronous replication',
      'Observe replication lag and WAL log offset divergence',
      'Perform leader election and promote the replica with highest log offset to prevent data loss',
    ],
    controls: [
      { id: 'replicationLagMs', label: 'Replication Delay', type: 'slider', min: 10, max: 500, step: 10, defaultValue: 150, unit: 'ms' },
    ],
    assumptions: [
      {
        assumption: 'Replication lag is a linear simulated offset difference.',
        realWorldDifference: 'Real replication lag depends on network bandwidth, disk I/O contention on replicas, and large transactions.',
      },
      {
        assumption: 'Failover promotes the replica with highest offset with a single click.',
        realWorldDifference: 'Production failover requires consensus quorums (Raft/Paxos/ZooKeeper) and fencing tokens to prevent split-brain.',
      },
    ],
  },
  {
    id: 'cqrs-lab',
    title: 'CQRS & Event Sourcing Projection Lab',
    shortDescription: 'Submit domain commands, append immutable events to the Event Store, and observe asynchronous projection lag into read models.',
    domain: 'distributed',
    difficulty: 'advanced',
    icon: 'ListOrdered',
    estimatedMinutes: 12,
    pairedConceptId: 'cqrs-pattern',
    learningObjectives: [
      'Trace how domain commands transform into append-only immutable events',
      'Inspect asynchronous projection worker lag updating materialized read views',
      'Evaluate eventual consistency implications when querying immediately after writes',
    ],
    controls: [
      { id: 'projectionLagMs', label: 'Projection Worker Lag', type: 'slider', min: 200, max: 3000, step: 200, defaultValue: 1000, unit: 'ms' },
    ],
    assumptions: [
      {
        assumption: 'Event projection occurs sequentially in browser memory.',
        realWorldDifference: 'Enterprise event sourcing uses distributed stream consumers (Kafka Streams/Flink) with partition keys and exactly-once semantics.',
      },
      {
        assumption: 'Events have pre-defined simple schemas.',
        realWorldDifference: 'Long-running event stores require schema upcasting and event version migration strategies over years of operational change.',
      },
    ],
  },
];
