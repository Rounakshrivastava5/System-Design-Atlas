import { Concept } from '../../types/concept';

export const STORAGE_CONCEPTS: Concept[] = [
  {
    id: 'relational-vs-nosql',
    title: 'Relational (SQL) vs NoSQL Databases',
    shortDescription: 'Comparing relational normalization and ACID guarantees against document, key-value, and wide-column NoSQL distributed engines.',
    domain: 'storage',
    difficulty: 'beginner',
    readTimeMinutes: 16,
    tags: ['databases', 'sql', 'nosql', 'postgres', 'mongodb', 'cassandra'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['database-indexing-btree', 'lsm-trees-sstables', 'polyglot-persistence'],
    isFlagship: true,
    content: {
      overview: `The choice between Relational (SQL) and Non-Relational (NoSQL) databases is one of the most critical decisions in system design.

Relational Databases (PostgreSQL, MySQL, Oracle):
- Store data in structured tables with strict schemas and foreign key constraints.
- Emphasize relational normalization to eliminate data duplication.
- Provide strong ACID guarantees (Atomicity, Consistency, Isolation, Durability) for multi-table transactions.
- Best for complex JOIN queries, structured data, and financial ledgers.

NoSQL Databases (MongoDB, Cassandra, DynamoDB, Redis):
- Break away from rigid tabular schemas; data is modeled as Documents (JSON/BSON), Key-Value pairs, Wide-Columns, or Graph nodes.
- Embrace denormalization: data that is read together is stored together.
- Designed from the ground up for horizontal partitioning across distributed clusters.
- Best for unstructured data, extreme write velocity, and massive petabyte-scale storage.`,
      architectureDetails: `Four Main NoSQL Families:
1. Document Stores (MongoDB, Couchbase): Semi-structured hierarchical JSON documents. Flexible schemas; rich querying on nested fields.
2. Key-Value Stores (Redis, Memcached, DynamoDB): O(1) hash table lookups by primary key. Extremely fast, lightweight.
3. Wide-Column Stores (Cassandra, ScyllaDB, HBase): Log-structured merge trees organized into column families. Unmatched write throughput across large clusters.
4. Graph Databases (Neo4j, AWS Neptune): Highly optimized for traversing complex relationships (social graphs, fraud networks, recommendation engines).`,
      keyTradeoffs: [
        {
          advantage: 'Relational databases guarantee financial correctness and prevent orphaned data via foreign key constraints and ACID transactions.',
          drawback: 'Difficult to horizontally partition across multiple servers; cross-node joins incur severe network latency.',
        },
        {
          advantage: 'NoSQL horizontally scales across hundreds of nodes with linear write capacity and flexible schemas.',
          drawback: 'Lack of multi-table ACID transactions; denormalization requires updating multiple records when shared data changes.',
        },
      ],
      failureModes: [
        {
          failure: 'Unbounded Table Growth in Relational Database',
          consequence: 'A single audit table grows to 500 million rows. B-Tree indexes exceed RAM size, causing queries to trigger heavy disk reads, dropping database QPS from 5,000 to 50.',
          mitigation: 'Implement table partitioning (range/list) and archive historical data to cold object storage.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Uber / Airbnb',
          usage: 'Use PostgreSQL for critical billing, user identity, and trip checkout; use Cassandra/Redis for driver location telemetry and search feeds.',
        },
      ],
      implementationChecklist: [
        'Default to PostgreSQL for transactional applications unless massive scale or schema variability requires NoSQL.',
        'Denormalize data in NoSQL based on specific application query patterns (design queries first, schema second).',
      ],
    },
  },
  {
    id: 'database-indexing-btree',
    title: 'Database Indexing: B-Trees & Hash Indexes',
    shortDescription: 'Internal mechanics of B+ Trees, clustered vs secondary indexes, compound index prefix rules, and index selectivities.',
    domain: 'storage',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['indexing', 'b-tree', 'sql', 'performance'],
    prerequisites: ['relational-vs-nosql'],
    relatedConcepts: ['lsm-trees-sstables', 'relational-vs-nosql'],
    isFlagship: true,
    content: {
      overview: `A database index is a specialized auxiliary data structure that improves the speed of data retrieval operations at the cost of slower writes and additional storage. Without an index, the database must execute a Full Table Scan (O(N)), inspecting every single page on disk.

The industry-standard index structure for relational databases is the B+ Tree.`,
      architectureDetails: `B+ Tree Structure & Mechanics:
- Self-balancing multi-way search tree optimized for systems that read and write large blocks of memory (4KB/8KB disk pages).
- All actual data pointers or row records reside strictly in the Leaf Nodes; Internal Nodes store only routing keys and page pointers.
- Leaf nodes are linked together in a doubly linked list, allowing lightning-fast range queries: find start key via tree traversal (O(log N)), then scan sequentially along the leaf chain!

Clustered vs Secondary Indexes:
- Clustered Index (Primary Key): Dictates the physical order of data on disk. A table can have only ONE clustered index.
- Secondary Index: Stores the indexed column value alongside a pointer to the clustered primary key. Lookups require an index scan followed by an index seek to the clustered table (known as a bookmark lookup).`,
      keyTradeoffs: [
        {
          advantage: 'Reduces query lookup times from O(N) full table scans to O(log N) tree traversals; enables rapid range queries (BETWEEN, >, <).',
          drawback: 'Slows down every INSERT, UPDATE, and DELETE because all associated B-Tree indexes must be updated and re-balanced synchronously.',
        },
      ],
      formulas: [
        {
          name: 'B+ Tree Height / Fan-Out Formula',
          equation: 'Capacity = Fanout^(Height - 1)',
          explanation: 'With a fan-out of 100 keys per page, a 3-level B+ Tree can index 1,000,000 rows in just 3 disk page reads!',
        },
      ],
      failureModes: [
        {
          failure: 'Low Selectivity Index (Index Ignored by Optimizer)',
          consequence: 'Creating an index on a boolean column (is_active) where 95% of rows are TRUE causes the query planner to bypass the index and perform a full table scan anyway.',
          mitigation: 'Only create indexes on high-cardinality columns (unique IDs, emails, dates) or use partial indexes (WHERE is_active = FALSE).',
        },
        {
          failure: 'Leftmost Prefix Rule Violation on Compound Index',
          consequence: 'Creating an index on (last_name, first_name) does NOT accelerate queries filtering only on WHERE first_name = \'John\'.',
          mitigation: 'Order compound index columns starting with the most selective equality filter.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'PostgreSQL & MySQL InnoDB',
          usage: 'InnoDB tables are physically organized as clustered B+ Trees ordered by the Primary Key.',
        },
      ],
      implementationChecklist: [
        'Always inspect EXPLAIN ANALYZE execution plans to verify indexes are being used.',
        'Never index columns that undergo frequent write updates unless queried extensively.',
      ],
    },
  },
  {
    id: 'lsm-trees-sstables',
    title: 'LSM Trees & SSTables in Modern Storage',
    shortDescription: 'Log-Structured Merge Trees, write-ahead logs (WAL), MemTables, immutable SSTables, Bloom filters, and compaction strategies.',
    domain: 'storage',
    difficulty: 'advanced',
    readTimeMinutes: 18,
    tags: ['lsm-tree', 'sstable', 'rocksdb', 'cassandra', 'storage-engine'],
    prerequisites: ['database-indexing-btree'],
    relatedConcepts: ['bloom-filters', 'relational-vs-nosql'],
    isFlagship: true,
    content: {
      overview: `Log-Structured Merge Trees (LSM Trees) are the storage engine architecture behind high-throughput NoSQL and NewSQL databases (RocksDB, Cassandra, ScyllaDB, CockroachDB, ClickHouse).

Traditional B-Trees overwrite data in-place on disk pages, causing random I/O bottlenecks. LSM Trees solve this by turning all disk writes into sequential append-only operations, maximizing physical hardware write performance.`,
      architectureDetails: `The Lifecycle of a Write in an LSM Tree:
1. Write-Ahead Log (WAL): The write is appended sequentially to a disk log for crash recovery.
2. MemTable: In parallel, the write is inserted into an in-memory sorted data structure (typically a Skiplist or Red-Black Tree). Write is now complete and acknowledged to the client in microseconds!
3. Flushing to SSTables: When the MemTable fills up (e.g. 64MB), it is flushed to disk as an immutable Sorted String Table (SSTable) file.
4. Compaction: Because keys are written repeatedly across multiple SSTables, background compaction merges overlapping SSTables (similar to merge sort), discarding overwritten values and tombstoned deletions.

The Read Path:
To read a key, the engine checks: MemTable -> Bloom Filter per SSTable -> SSTables from newest to oldest.`,
      keyTradeoffs: [
        {
          advantage: 'Extraordinary write throughput; sequential I/O saturates NVMe/SSD drive bandwidth without lock contention.',
          drawback: 'Read amplification (must check multiple SSTable files on disk) and write amplification caused by background compaction cycles.',
        },
      ],
      failureModes: [
        {
          failure: 'Compaction Debt / I/O Starvation',
          consequence: 'Under continuous heavy write pressure, the background compaction thread falls behind. Hundreds of uncompacted SSTables accumulate, causing read queries to slow down to hundreds of milliseconds.',
          mitigation: 'Tune compaction thread priorities, allocate dedicated NVMe I/O bandwidth, and choose Leveled Compaction over Size-Tiered.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'RocksDB (Meta)',
          usage: 'Embedded storage engine powering Kafka Streams, CockroachDB storage layer, and high-performance caching infrastructure.',
        },
      ],
      implementationChecklist: [
        'Pair every SSTable with a Bloom filter to skip disk reads for keys not in that file.',
        'Select Leveled Compaction for read-heavy workloads; Size-Tiered for write-heavy append workloads.',
      ],
    },
  },
  {
    id: 'database-replication',
    title: 'Database Replication: Sync vs Async',
    shortDescription: 'Master-replica topologies, replication lag, split-brain syndromes, automated leader election, and raft-based failover.',
    domain: 'storage',
    difficulty: 'intermediate',
    readTimeMinutes: 14,
    tags: ['replication', 'high-availability', 'postgres', 'failover'],
    prerequisites: ['relational-vs-nosql'],
    relatedConcepts: ['database-sharding', 'eventual-consistency-quorums'],
    pairedLabId: 'replication-lab',
    isFlagship: true,
    content: {
      overview: `Database replication copies data across multiple servers to increase read throughput, provide disaster recovery redundancy, and minimize user latency by placing replicas close to clients.

Replication Topologies:
1. Single Leader (Master-Replica): All writes go to the Leader; Leader streams change events (WAL/binlog) to Read Replicas.
2. Multi-Leader (Active-Active): Multiple nodes accept writes and replicate to each other. Useful across multi-region datacenters, but requires complex conflict resolution.
3. Leaderless (Dynamo-style): Clients write to any replica; consistency is resolved via quorums (R + W > N).`,
      architectureDetails: `Synchronous vs Asynchronous Replication:
- Synchronous Replication: The leader waits for replica acknowledgement before confirming success to the client. Guarantees zero data loss (RPO = 0), but any slow replica halts write throughput.
- Asynchronous Replication: The leader confirms the write immediately after local commit, streaming changes asynchronously. Blazing fast writes, but if the leader crashes before replication, un-replicated transactions are permanently lost (data loss window).
- Semi-Synchronous: Leader waits for at least ONE replica to acknowledge, blending safety with speed.`,
      keyTradeoffs: [
        {
          advantage: 'Synchronous replication ensures 100% durability and zero data loss on leader crash.',
          drawback: 'Write latency equals the round-trip latency to the slowest replica; node failure halts writes.',
        },
        {
          advantage: 'Asynchronous replication decouples write latency from replica performance and network delay.',
          drawback: 'Failover can cause silent data loss and replication lag can serve stale data to users.',
        },
      ],
      failureModes: [
        {
          failure: 'Split-Brain Syndrome during Network Partition',
          consequence: 'A network blip isolates the primary. Replicas assume the leader is dead and elect a new primary. When network heals, two primaries exist with conflicting data.',
          mitigation: 'Implement consensus quorums (Raft/Paxos) requiring a strict majority vote (N/2 + 1) to elect leaders, and use fencing tokens.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'PostgreSQL Streaming Replication',
          usage: 'Supports synchronous_commit levels ranging from off (async) to remote_apply (full sync across replicas).',
        },
      ],
      implementationChecklist: [
        'Monitor replication lag metrics (pg_stat_replication byte lag) continuously.',
        'Use connection pooling to route SELECT queries to read replicas and INSERT/UPDATE/DELETE to primary.',
      ],
    },
  },
  {
    id: 'database-sharding',
    title: 'Database Sharding & Partitioning',
    shortDescription: 'Horizontal database partitioning, shard key selection, range vs hash vs directory sharding, resharding, and cross-shard queries.',
    domain: 'storage',
    difficulty: 'advanced',
    readTimeMinutes: 18,
    tags: ['sharding', 'partitioning', 'horizontal-scale', 'vitess', 'citus'],
    prerequisites: ['database-replication'],
    relatedConcepts: ['consistent-hashing', 'relational-vs-nosql'],
    pairedLabId: 'sharding-lab',
    isFlagship: true,
    content: {
      overview: `Sharding (Horizontal Partitioning) is the technique of breaking a single database into smaller, faster, more manageable pieces called Shards, distributed across multiple physical database servers.
Each shard holds a subset of total rows, sharing the exact same schema.

Sharding is the ultimate technique to scale database writes beyond the physical hardware limits of a single machine. However, it introduces significant operational complexity: cross-shard joins become impossible or slow, and resharding requires moving terabytes of live data.`,
      architectureDetails: `Sharding Strategies:
1. Range-Based Sharding: Partitions data based on continuous ranges of a key (e.g. user_id 1–1M on Shard A, 1M–2M on Shard B). Simple to implement, but causes massive write hotspots if IDs are sequential.
2. Hash-Based Sharding: Computes a hash of the partition key: Shard = Hash(Key) % N. Evenly scatters data across nodes, but makes range queries scatter-gather across all shards.
3. Directory-Based Sharding: A central lookup service maps shard keys to database nodes. Highly flexible for rebalancing, but introduces an extra lookup network hop.`,
      keyTradeoffs: [
        {
          advantage: 'Enables limitless database write throughput and terabyte/petabyte storage scaling.',
          drawback: 'Cross-shard transactions require complex two-phase commit (2PC); foreign key constraints across shards cannot be enforced.',
        },
      ],
      failureModes: [
        {
          failure: 'Celebrity Key Shard Hotspot',
          consequence: 'Sharding Twitter by user_id places Justin Bieber on Shard 4. Millions of users interact with his posts, driving Shard 4 CPU to 100% while Shards 1, 2, 3 sit idle at 5%.',
          mitigation: 'Salt the partition key (e.g. user_id + hash(timestamp % 10)) to split hot entity writes across multiple shards.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'YouTube Vitess / Slack',
          usage: 'YouTube engineered Vitess as a sharding proxy in front of MySQL to scale to billions of videos; Slack shards MySQL databases by team_id.',
        },
      ],
      implementationChecklist: [
        'Choose a sharding key with high cardinality and even distribution across all queries.',
        'Never shard prematurely; exhaust read replicas, caching, and vertical scaling first.',
      ],
    },
  },
  {
    id: 'consistent-hashing',
    title: 'Consistent Hashing & Virtual Nodes',
    shortDescription: 'The 360-degree hash ring, Ketama algorithm, virtual nodes distribution, and minimal key redistribution during cluster resizing.',
    domain: 'storage',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['consistent-hashing', 'ring', 'vnodes', 'caching', 'sharding'],
    prerequisites: ['database-sharding'],
    relatedConcepts: ['database-sharding', 'caching-strategies'],
    pairedLabId: 'consistent-hashing-lab',
    isFlagship: true,
    content: {
      overview: `In conventional modulo hashing (server = hash(key) % N), whenever a server is added or removed (N changes to N+1 or N-1), nearly 100% of all keys are remapped to different servers! This causes a catastrophic cache stampede on backend databases.

Consistent Hashing solves this problem. When a cluster resized from N to N+1 nodes, only K/N keys are moved (where K is total keys and N is server count). The other (1 - 1/N) keys remain mapped to their original servers!`,
      architectureDetails: `How the Hash Ring Works:
1. Map the hash output space onto a conceptual 360-degree circle (0 to 2^32 - 1).
2. Hash server identifiers (e.g. IP or hostname) to place them at specific points on the ring.
3. To locate the server for a data key, hash the key to place it on the ring, then walk clockwise until you encounter the first server token.
4. Adding a new node only steals keys from its immediate clockwise neighbor.

Virtual Nodes (vnodes):
If you place only 3 physical servers on the ring, geometric spacing is uneven. We map each physical server to 100–256 virtual nodes (vnodes) around the ring. This spreads load statistically evenly across all physical machines.`,
      keyTradeoffs: [
        {
          advantage: 'Adding or removing nodes causes minimal key migration (only 1/N keys re-mapped); eliminates cluster re-shuffling outages.',
          drawback: 'More complex routing logic than simple modulo hashing; requires storing the ring in memory on routing clients.',
        },
      ],
      formulas: [
        {
          name: 'Key Redistribution Ratio',
          equation: 'Reallocated Keys = Total_Keys / New_Server_Count',
          explanation: 'Only 1/N fraction of keys migrate during a node addition or deletion.',
        },
      ],
      failureModes: [
        {
          failure: 'Cascading Failure from Ring Neighbor Overload',
          consequence: 'When Server A crashes, all of its keys immediately fall onto Server B. Server B is overwhelmed by double load and crashes, knocking down Server C in a cascade.',
          mitigation: 'Use virtual nodes so Server A\'s keys are scattered across ALL surviving servers rather than dumped onto one neighbor.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Amazon DynamoDB / Discord',
          usage: 'Dynamo and Cassandra use consistent hashing rings to partition data across storage nodes; Discord uses it for routing gateway connections.',
        },
      ],
      implementationChecklist: [
        'Assign at least 150-200 virtual nodes per physical machine for uniform variance < 5%.',
        'Use MurmurHash3 or MD5 for fast uniform distribution across the 32-bit ring.',
      ],
    },
  },
  {
    id: 'object-vs-block-storage',
    title: 'Object Storage vs Block Storage vs File Storage',
    shortDescription: 'Comparing AWS S3 object stores, EBS block volumes, and EFS network file systems for distributed workloads.',
    domain: 'storage',
    difficulty: 'beginner',
    readTimeMinutes: 10,
    tags: ['storage', 's3', 'ebs', 'cloud'],
    prerequisites: ['relational-vs-nosql'],
    relatedConcepts: ['relational-vs-nosql'],
    isFlagship: false,
    content: {
      overview: `Cloud storage systems fall into three fundamental paradigms:
1. Block Storage (AWS EBS, SAN): Raw blocks of bytes attached directly to a single compute server as a virtual hard drive. Blazing fast, low latency, supports databases and file systems.
2. File Storage (NFS, AWS EFS): Hierarchical folder and file structure shared concurrently across multiple compute instances.
3. Object Storage (AWS S3, Google Cloud Storage): Flat storage of immutable data blobs referenced by a unique key/URI with rich metadata. Accessed via HTTP REST APIs. Highly scalable, infinitely elastic, lowest cost.`,
      keyTradeoffs: [
        {
          advantage: 'Object Storage offers limitless elastic capacity, 99.999999999% durability, and lowest cost per gigabyte.',
          drawback: 'Objects are immutable (cannot modify a single byte in place; must rewrite entire object); higher latency than block storage.',
        },
      ],
      failureModes: [
        {
          failure: 'Running Databases on Object Storage',
          consequence: 'Attempting to run a relational database directly on S3 yields unacceptable latency because random page updates require downloading and re-uploading entire multi-gigabyte files.',
          mitigation: 'Run database storage engines on local NVMe or high-performance Block Storage (EBS gp3/io2).',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'AWS S3',
          usage: 'Stores trillions of media files, backups, and data lake files for millions of global companies.',
        },
      ],
      implementationChecklist: [
        'Store static assets, media, PDFs, and data backups in Object Storage (S3).',
        'Use pre-signed S3 URLs so mobile clients upload media directly to S3 without passing through API servers.',
      ],
    },
  },
  {
    id: 'bloom-filters',
    title: 'Bloom Filters in Distributed Lookups',
    shortDescription: 'Probabilistic space-efficient data structure for testing set membership without expensive disk I/O.',
    domain: 'storage',
    difficulty: 'intermediate',
    readTimeMinutes: 12,
    tags: ['bloom-filter', 'algorithms', 'storage-engine', 'probabilistic'],
    prerequisites: ['lsm-trees-sstables'],
    relatedConcepts: ['lsm-trees-sstables'],
    isFlagship: false,
    content: {
      overview: `A Bloom Filter is a space-efficient probabilistic data structure used to test whether an element is a member of a set.
It returns one of two outcomes:
1. "Definitely NOT in the set" (100% certainty, zero false negatives).
2. "Possibly in the set" (small configurable false positive probability, e.g. 1%).

Because a negative result is 100% guaranteed, database storage engines use Bloom filters in memory to skip searching disk SSTable files when a key does not exist.`,
      formulas: [
        {
          name: 'False Positive Probability',
          equation: 'p ≈ (1 - e^(-kn/m))^k',
          explanation: 'where m is bit array size, n is inserted elements, and k is number of hash functions.',
        },
      ],
      keyTradeoffs: [
        {
          advantage: 'Uses only ~10 bits per element in RAM (1GB of memory can index 800 million items with 1% false positive rate).',
          drawback: 'Elements cannot be deleted from a standard Bloom filter (requires Counting Bloom Filter with 4x memory).',
        },
      ],
      failureModes: [
        {
          failure: 'Over-saturating Bloom Filter Capacity',
          consequence: 'Inserting 10x more keys than initially sized causes the bit array to fill with 1s, driving the false positive rate to 100% and nullifying its benefit.',
          mitigation: 'Pre-size filter bit arrays based on expected max capacity or use Scalable Bloom Filters.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Google Chrome / Cassandra',
          usage: 'Chrome uses Bloom filters to check malicious URLs locally before querying Google servers; Cassandra uses them to skip reading SSTables on disk.',
        },
      ],
      implementationChecklist: [
        'Use 10 bits per element and 7 hash functions to target a standard 1% false positive rate.',
      ],
    },
  },
  {
    id: 'eventual-consistency-quorums',
    title: 'Quorum Reads & Writes (R + W > N)',
    shortDescription: 'Mathematical rigor of distributed quorum consensus, tuneable consistency levels in Cassandra/DynamoDB, and sloppy quorums.',
    domain: 'storage',
    difficulty: 'advanced',
    readTimeMinutes: 14,
    tags: ['quorum', 'consistency', 'dynamo', 'cassandra'],
    prerequisites: ['cap-theorem'],
    relatedConcepts: ['cap-theorem', 'database-replication'],
    pairedLabId: 'cap-lab',
    isFlagship: true,
    content: {
      overview: `In leaderless distributed databases (Apache Cassandra, Amazon DynamoDB), replication is coordinated via Quorums rather than a single master.
A cluster with replication factor N permits tuning the number of nodes required to acknowledge a write (Write Quorum, W) and the number of nodes consulted during a read (Read Quorum, R).`,
      architectureDetails: `The Quorum Equation for Strong Consistency:
R + W > N
If R + W > N, the set of nodes written to and the set of nodes read from MUST overlap by at least one node. That overlapping node will contain the latest version of the data.

Common Quorum Configurations (for N = 3):
- Strong Consistency: W = 2, R = 2 (2 + 2 = 4 > 3). Tolerate 1 node failure.
- Fast Writes: W = 1, R = 3 (1 + 3 = 4 > 3). Writes return instantly, reads incur higher latency.
- Fast Reads: W = 3, R = 1 (3 + 1 = 4 > 3). Reads return instantly, writes require unanimous consent.
- Eventual Consistency: W = 1, R = 1 (1 + 1 = 2 <= 3). Low latency, but reads may return stale data.`,
      keyTradeoffs: [
        {
          advantage: 'Enables fine-grained per-query tuning of consistency vs latency trade-offs without schema changes.',
          drawback: 'When R > 1, client or coordinator must execute read repair to resolve data conflicts across nodes.',
        },
      ],
      failureModes: [
        {
          failure: 'Sloppy Quorum Data Drift',
          consequence: 'When network partitions prevent reaching strict quorum, hinted handoff accepts writes on temporary surrogate nodes, causing temporary inconsistency.',
          mitigation: 'Enforce strict quorums (disable sloppy quorums) for critical financial records.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Apache Cassandra',
          usage: 'Supports ONE, TWO, THREE, QUORUM, LOCAL_QUORUM, and EACH_QUORUM consistency levels per CQL query.',
        },
      ],
      implementationChecklist: [
        'Use LOCAL_QUORUM across multi-datacenter clusters to prevent cross-ocean WAN latency from blocking writes.',
      ],
    },
  },
  {
    id: 'polyglot-persistence',
    title: 'Polyglot Persistence Architecture',
    shortDescription: 'Using specialized database engines tailored for specific data access patterns across a modern microservice ecosystem.',
    domain: 'storage',
    difficulty: 'intermediate',
    readTimeMinutes: 10,
    tags: ['polyglot', 'databases', 'architecture'],
    prerequisites: ['relational-vs-nosql'],
    relatedConcepts: ['relational-vs-nosql'],
    isFlagship: false,
    content: {
      overview: `No single database engine is optimal for all data access patterns. Relational databases struggle with unstructured logs; key-value stores cannot execute complex relational joins; document stores fail on high-depth graph traversals.

Polyglot Persistence is the architectural practice of selecting the right tool for the job by using different specialized databases for different services:
- Financial Transactions: PostgreSQL (ACID)
- Shopping Cart & Sessions: Redis (In-Memory Key-Value)
- Social Graph & Followers: Neo4j (Graph DB)
- Catalog Full-Text Search: OpenSearch / Elasticsearch (Inverted Index)
- Analytical Clickstream Logs: ClickHouse / BigQuery (Columnar OLAP)`,
      keyTradeoffs: [
        {
          advantage: 'Optimal performance, query capability, and storage efficiency tailored to each specific data domain.',
          drawback: 'High operational burden (managing 5 different database clusters, backup strategies, and cross-database data syncing).',
        },
      ],
      failureModes: [
        {
          failure: 'Dual-Write Data Inconsistency',
          consequence: 'An API writes to PostgreSQL, then attempts to update Elasticsearch. If the second write fails, search results permanently drift out of sync with the primary database.',
          mitigation: 'Implement Change Data Capture (CDC via Debezium) streaming database transaction logs into an event bus (Kafka) to asynchronously update secondary search views.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Amazon.com',
          usage: 'Employs Aurora for orders, DynamoDB for shopping carts, OpenSearch for product search, and Neptune for recommendation graphs.',
        },
      ],
      implementationChecklist: [
        'Use Change Data Capture (CDC) to synchronize data across specialized search and caching engines.',
        'Establish single authoritative sources of truth for each domain entity.',
      ],
    },
  },
];
