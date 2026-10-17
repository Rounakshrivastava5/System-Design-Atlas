import { Concept } from '../../types/concept';

export const SCALABILITY_CONCEPTS: Concept[] = [
  {
    id: 'horizontal-vs-vertical',
    title: 'Horizontal vs Vertical Scaling',
    shortDescription: 'Scaling out across commodity distributed clusters versus scaling up with larger hardware CPUs and memory.',
    domain: 'scalability',
    difficulty: 'beginner',
    readTimeMinutes: 10,
    tags: ['scaling', 'infrastructure', 'cloud'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['load-balancing-algorithms', 'database-sharding'],
    isFlagship: false,
    content: {
      overview: `Vertical scaling (Scale Up) means adding more power to an existing server (e.g. upgrading from 8 CPU cores and 32GB RAM to 128 cores and 1TB RAM).
Horizontal scaling (Scale Out) means adding more machines to your resource pool (e.g. running 50 smaller stateless nodes behind a load balancer).

While vertical scaling is initially simpler because it requires zero architectural changes, it hits physical hardware ceilings and introduces severe cost curves. Horizontal scaling provides theoretically limitless scale and fault tolerance.`,
      keyTradeoffs: [
        {
          advantage: 'Vertical Scaling involves zero network latency overhead between nodes and requires no distributed coordination.',
          drawback: 'Expensive exponential pricing curve; hard hardware ceiling; single point of failure (server restart causes complete downtime).',
        },
        {
          advantage: 'Horizontal Scaling enables linear cost scaling on commodity hardware and resilience against single-node crashes.',
          drawback: 'Requires stateless application tiers, distributed logging, service discovery, and complex database partitioning.',
        },
      ],
      failureModes: [
        {
          failure: 'Stateful Sessions Trapping Horizontal Scaling',
          consequence: 'Adding 10 new API servers fails to balance load because user login sessions are stored in local server RAM.',
          mitigation: 'Externalize session state into a distributed Redis cluster or use stateless JWT tokens.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Modern Web Architectures (Netflix / Uber)',
          usage: 'Stateless API tiers autoscaled across thousands of small EC2 instances, while relational databases often vertically scale until sharding is unavoidable.',
        },
      ],
      implementationChecklist: [
        'Ensure compute instances are 100% stateless (no local disk persistence, no local in-memory session caches).',
        'Configure autoscaling groups based on CPU utilization and request queue depth.',
      ],
    },
  },
  {
    id: 'load-balancing-algorithms',
    title: 'Load Balancing Algorithms & Topologies',
    shortDescription: 'Layer 4 vs Layer 7 routing, algorithm mathematics (Round Robin, Least Connections, Weighted, IP Hash), and health probe topologies.',
    domain: 'scalability',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['load-balancing', 'algorithms', 'networking', 'nginx', 'envoy'],
    prerequisites: ['horizontal-vs-vertical'],
    relatedConcepts: ['reverse-proxy-vs-gateway', 'dns-routing-anycast'],
    pairedLabId: 'lb-lab',
    isFlagship: true,
    content: {
      overview: `A Load Balancer distributes incoming network traffic across a pool of backend servers to ensure no single server becomes overwhelmed, maximizing throughput and system availability.

Load balancers operate primarily at two OSI layers:
1. Layer 4 (Transport Layer): Routes TCP/UDP packets based on IP address and port without inspecting application payload. Extremely fast (can handle millions of packets/sec per node) but cannot inspect HTTP headers or URLs.
2. Layer 7 (Application Layer): Inspects full HTTP/HTTPS payloads, headers, cookies, and URI paths. Enables intelligent routing (e.g. /api/video goes to Video cluster, /api/auth goes to Auth cluster) and TLS termination, at the cost of higher CPU overhead.`,
      architectureDetails: `Common Routing Algorithms:
- Round Robin: Cycles sequentially through servers. Best when requests have uniform execution times and servers have identical specs.
- Least Connections: Routes to the node with fewest active open sockets. Ideal for long-lived transactions (WebSocket sessions, database queries).
- Weighted Round Robin / Least Conn: Proportional routing based on assigned server hardware capacity weights.
- Source IP Hash: Hashes client IP to assign them to a fixed backend server. Enables session stickiness without external session caches.`,
      keyTradeoffs: [
        {
          advantage: 'Layer 7 Load Balancing enables smart content-based routing, header rewrites, and TLS offloading.',
          drawback: 'Higher compute overhead due to full TCP connection termination, TLS decryption, and HTTP parsing.',
        },
        {
          advantage: 'Layer 4 Load Balancing provides raw line-rate packet forwarding with microsecond latency.',
          drawback: 'Cannot route based on URL paths, inspect cookies, or modify HTTP payloads.',
        },
      ],
      formulas: [
        {
          name: 'Weighted Round Robin Probability',
          equation: 'P(Server_i) = Weight_i / Σ(Weight_total)',
          explanation: 'Traffic fraction allocated to Server i proportional to its assigned capacity weight.',
        },
      ],
      failureModes: [
        {
          failure: 'Flapping Health Check Cascade',
          consequence: 'Under high load, servers respond slightly slower than the health check timeout. The load balancer marks them unhealthy and removes them, dumping 100% of traffic onto remaining servers, crashing the entire fleet.',
          mitigation: 'Use consecutive failure thresholds (e.g. 3 consecutive failed probes before removing) and implement graceful degradation.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'HAProxy / Envoy Proxy',
          usage: 'Industry-standard L7 proxies powering modern Kubernetes service meshes with sub-millisecond routing and dynamic service discovery.',
        },
      ],
      implementationChecklist: [
        'Deploy redundant load balancers in Active-Passive or Anycast Active-Active configurations to prevent the LB from becoming a SPOF.',
        'Configure health check probes on dedicated lightweight health endpoints (/healthz).',
      ],
    },
  },
  {
    id: 'reverse-proxy-vs-gateway',
    title: 'Reverse Proxy vs API Gateway',
    shortDescription: 'Dissecting the boundaries between reverse proxies (Nginx/HAProxy) and feature-rich API gateways (Kong/Apisix).',
    domain: 'scalability',
    difficulty: 'beginner',
    readTimeMinutes: 10,
    tags: ['proxy', 'api-gateway', 'architecture'],
    prerequisites: ['load-balancing-algorithms'],
    relatedConcepts: ['rate-limiting-algorithms', 'zero-trust-architecture'],
    isFlagship: false,
    content: {
      overview: `A Reverse Proxy sits in front of web servers and forwards client requests to those servers. It specializes in TLS termination, caching static assets, compression (gzip/brotli), and basic load balancing (e.g. Nginx).

An API Gateway is a specialized reverse proxy tailored specifically for microservice architectures. In addition to proxying, it provides advanced application-layer policies: OAuth2/JWT authentication, distributed rate limiting, request validation, API transformation, telemetry, and dynamic service routing.`,
      keyTradeoffs: [
        {
          advantage: 'API Gateways centralize cross-cutting concerns (auth, telemetry, rate limits) so individual microservices don\'t duplicate security logic.',
          drawback: 'Can become an architectural bottleneck, organizational dependency friction point, and single point of failure if bloated with business logic.',
        },
      ],
      failureModes: [
        {
          failure: 'Business Logic Infiltration in API Gateway',
          consequence: 'Developers write database queries and custom transformations inside API Gateway scripts, creating an unmaintainable monolithic proxy.',
          mitigation: 'Keep API Gateways strictly for routing, security, and policies; business logic belongs in domain microservices.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Kong / AWS API Gateway',
          usage: 'Translates external public HTTPS requests into internal gRPC calls while verifying JWT signatures and enforcing rate limits.',
        },
      ],
      implementationChecklist: [
        'Offload TLS termination and CORS validation at the gateway edge.',
        'Never place database access or business domain logic inside API gateway scripts.',
      ],
    },
  },
  {
    id: 'rate-limiting-algorithms',
    title: 'Rate Limiting & Throttling Algorithms',
    shortDescription: 'Deep dive into Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, and Sliding Window Counter in distributed Redis setups.',
    domain: 'scalability',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['rate-limiting', 'security', 'redis', 'lua', 'algorithms'],
    prerequisites: ['load-balancing-algorithms'],
    relatedConcepts: ['reverse-proxy-vs-gateway', 'graceful-degradation-shedding'],
    pairedLabId: 'rate-limit-lab',
    isFlagship: true,
    content: {
      overview: `Rate Limiting is a defensive mechanism that controls the rate at which network traffic is admitted into an API. It prevents denial-of-service (DoS) attacks, stops brute-force credential stuffing, shields downstream services from cascading overload, and enforces paid API pricing tiers.

When incoming traffic exceeds the allocated limit, the rate limiter responds with HTTP 429 Too Many Requests, accompanied by standard headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After).`,
      architectureDetails: `The Five Core Algorithms:
1. Token Bucket: Tokens are added to a bucket of capacity B at a constant refill rate R. Each request consumes 1 token. If tokens remain, request is allowed; if empty, throttled. Uniquely allows short bursts while preserving average rate.
2. Leaky Bucket: Requests enter a FIFO queue and leak out to the backend at a constant smooth rate. Excess requests overflow and drop. Smooths bursty traffic into steady outflow.
3. Fixed Window: Counts requests in static time windows (e.g. 10:00 - 10:01). Prone to 2x burst vulnerability at boundary edges.
4. Sliding Window Log: Keeps exact timestamps of every request in a sorted set. 100% accurate, but excessive O(N) memory consumption.
5. Sliding Window Counter: Blends current and previous window counts using weighted time overlap. Highly accurate with constant O(1) memory!`,
      keyTradeoffs: [
        {
          advantage: 'Token Bucket allows legitimate client bursts (e.g. loading a dashboard with 10 assets) while bounding sustained QPS.',
          drawback: 'Requires storing timestamp and token count per user in distributed cache.',
        },
        {
          advantage: 'Sliding Window Counter uses O(1) minimal memory while eliminating boundary reset spikes.',
          drawback: 'Assumes uniform request distribution across previous window (minor approximation error < 0.1%).',
        },
      ],
      formulas: [
        {
          name: 'Sliding Window Counter Weight Formula',
          equation: 'Total = Current_Count + (Previous_Count × (1 - Elapsed_Time / Window_Size))',
          explanation: 'Estimates requests in the trailing 60 seconds by weighting the previous window by remaining time overlap.',
        },
      ],
      failureModes: [
        {
          failure: 'Redis Concurrency Race Condition',
          consequence: 'Two concurrent requests read counter=99 simultaneously; both increment to 100 and allow traffic, exceeding the 100-request limit.',
          mitigation: 'Execute rate limit checks atomically using Redis Lua scripts (EVALSHA) or atomic Redis MULTI transactions.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Stripe API Rate Limiter',
          usage: 'Stripe employs Token Bucket rate limiters written in Redis Lua scripts to throttle traffic per merchant API key and IP address.',
        },
      ],
      implementationChecklist: [
        'Enforce rate limits at the API Gateway or Edge CDN before requests touch application servers.',
        'Return standard RFC 6585 headers: Retry-After, RateLimit-Limit, RateLimit-Remaining.',
        'Implement fail-open policy so a rate-limiter outage does not halt legitimate customer business.',
      ],
    },
  },
  {
    id: 'cdn-architecture',
    title: 'Content Delivery Networks (CDN) & Edge Caching',
    shortDescription: 'Anycast routing, Origin Shielding, Cache-Control headers, dynamic content acceleration, and instant cache invalidation.',
    domain: 'scalability',
    difficulty: 'intermediate',
    readTimeMinutes: 14,
    tags: ['cdn', 'edge', 'caching', 'anycast', 'cloudflare'],
    prerequisites: ['load-balancing-algorithms'],
    relatedConcepts: ['dns-routing-anycast', 'caching-strategies'],
    pairedLabId: 'cdn-lab',
    isFlagship: true,
    content: {
      overview: `A Content Delivery Network (CDN) is a geographically distributed network of proxy servers (Points of Presence, POPs) strategically placed close to end users.
Instead of an Australian user making a 250ms round-trip to an origin server in Virginia for every image or CSS file, the asset is fetched once and cached at a Sydney Edge POP, dropping latency to < 15ms.

Modern CDNs handle both static content (images, videos, JS/CSS bundles) and dynamic content acceleration (terminating TLS handshakes at the edge and proxying requests over optimized private fiber backbones).`,
      architectureDetails: `Core Concepts:
- Anycast IP Routing: Routers announce the same IP from hundreds of locations; BGP routes clients to the geometrically nearest edge POP.
- Origin Shield: A centralized caching layer between Edge POPs and the Origin server, preventing thousands of POPs from simultaneously slamming the origin on a cache miss.
- Cache Invalidation: Purging content via API (by URL, Cache Tag, or Prefix) when an asset is updated.`,
      keyTradeoffs: [
        {
          advantage: 'Dramatically reduces Time-To-First-Byte (TTFB) and offloads 80–95% of bandwidth from origin infrastructure.',
          drawback: 'Cache invalidation latency; serving stale content if Cache-Control headers are misconfigured.',
        },
      ],
      formulas: [
        {
          name: 'Origin Offload Ratio',
          equation: 'Offload % = ((Total_Requests - Origin_Requests) / Total_Requests) × 100',
          explanation: 'Measures the percentage of total customer traffic absorbed by edge CDN caches.',
        },
      ],
      failureModes: [
        {
          failure: 'Thundering Herd on Cache Invalidation',
          consequence: 'Purging a viral image from a CDN triggers 50,000 edge POP misses within 1 second, crashing the origin server.',
          mitigation: 'Enable Origin Shielding and request collapsing (coalescing multiple identical origin fetches into a single flight).',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Cloudflare / Fastly',
          usage: 'Serves over 20% of global web traffic from hundreds of Anycast edge data centers worldwide.',
        },
      ],
      implementationChecklist: [
        'Set Cache-Control: public, max-age=31536000, immutable for hashed static bundles.',
        'Use surrogate keys (cache tags) to purge related pages atomically when CMS content changes.',
      ],
    },
  },
  {
    id: 'dns-routing-anycast',
    title: 'DNS Resolution, Geo-DNS & Anycast',
    shortDescription: 'How the global Domain Name System resolves queries, Anycast BGP routing, and latency-based traffic routing.',
    domain: 'scalability',
    difficulty: 'advanced',
    readTimeMinutes: 12,
    tags: ['dns', 'anycast', 'bgp', 'networking'],
    prerequisites: ['load-balancing-algorithms'],
    relatedConcepts: ['cdn-architecture'],
    isFlagship: false,
    content: {
      overview: `DNS translates human-readable domain names (e.g. atlas.com) into machine IP addresses.
Advanced DNS architectures use Geo-DNS and Anycast BGP to route users to the closest datacenter:
- Geo-DNS: Authoritative nameservers inspect the querying client's IP and return an IP address corresponding to the geographically closest region.
- Anycast BGP: Multiple servers in different datacenters worldwide advertise the exact same IP address over BGP routing. Internet routers send packets along the shortest network path.`,
      keyTradeoffs: [
        {
          advantage: 'Anycast provides natural DDoS absorption; attack traffic is split across hundreds of global edge data centers.',
          drawback: 'BGP routing changes can cause active TCP connections to migrate to a different server mid-stream, requiring stateless packet handling.',
        },
      ],
      failureModes: [
        {
          failure: 'DNS TTL Caching Blocking Fast Disaster Recovery',
          consequence: 'Primary datacenter goes down, but DNS TTL is 86,400 seconds (24 hours); 50% of global clients continue attempting to connect to dead IPs.',
          mitigation: 'Set DNS TTL to 60–300 seconds for critical public endpoints; use Anycast BGP for instantaneous failover.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Amazon Route 53',
          usage: 'Provides latency-based routing, weighted routing, and automated DNS health checks for multi-region failover.',
        },
      ],
      implementationChecklist: [
        'Keep DNS TTL low (60s - 300s) on endpoints subject to emergency failover.',
        'Use Anycast for Layer 4 load balancing entry points.',
      ],
    },
  },
  {
    id: 'caching-strategies',
    title: 'Caching Strategies & Topologies',
    shortDescription: 'Mastering Cache-Aside, Write-Through, Write-Back, Write-Around, multi-level caching, and thundering herd prevention.',
    domain: 'scalability',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['caching', 'redis', 'memcached', 'cache-aside'],
    prerequisites: ['horizontal-vs-vertical'],
    relatedConcepts: ['cache-eviction-policies', 'relational-vs-nosql'],
    pairedLabId: 'cache-lab',
    isFlagship: true,
    content: {
      overview: `Caching is the single most effective technique to scale read-heavy architectures. By storing expensive query results, rendered HTML, or API responses in high-speed in-memory data structures (RAM), response times drop from tens of milliseconds to sub-millisecond speeds.

However, caching introduces distributed state synchronization challenges. Selecting the correct caching topology determines data freshness and consistency.`,
      architectureDetails: `The Four Core Topologies:
1. Cache-Aside (Lazy Loading): The application code coordinates cache lookups. On read: check cache; if hit, return; if miss, query DB, write to cache, return. On write: update DB, then invalidate (delete) cache key. Most popular and resilient pattern!
2. Write-Through: The application writes to the cache; the cache synchronously writes to the database before acknowledging. Guarantees cache freshness at the cost of higher write latency.
3. Write-Back (Write-Behind): The application writes to the cache immediately; the cache marks data as dirty and asynchronously flushes batches to the database. Extreme write speed, but risks data loss if cache node crashes before flush.
4. Write-Around: Data is written directly to the database, bypassing the cache entirely. Only read operations populate the cache. Prevents cache pollution on write-heavy data that is rarely re-read.`,
      keyTradeoffs: [
        {
          advantage: 'Cache-Aside is resilient to cache crashes (system gracefully falls back to database).',
          drawback: 'Cache misses incur a latency penalty (3 round trips: cache check -> DB query -> cache populate).',
        },
        {
          advantage: 'Write-Back provides blazing-fast write throughput by deferring disk persistence.',
          drawback: 'Data loss risk if in-memory cache server experiences unexpected hardware or power failure.',
        },
      ],
      failureModes: [
        {
          failure: 'Cache Stampede / Thundering Herd',
          consequence: 'When a popular key expires, 10,000 concurrent threads experience a cache miss at the exact same instant, crushing the database with identical queries.',
          mitigation: 'Use mutex locking (Single Flight pattern) so only 1 worker queries DB, or implement probabilistic early expiration (XFetch algorithm).',
        },
        {
          failure: 'Cache Invalidation Race Condition',
          consequence: 'Thread A queries DB on miss; Thread B updates DB and deletes cache; Thread A writes stale data into cache, leaving cache permanently corrupted.',
          mitigation: 'Use TTLs as a safety net on all cached keys, and consider versioned keys.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Redis & Memcached at Meta',
          usage: 'Meta uses thousands of Memcached servers with Cache-Aside to handle billions of feed requests with >98% hit ratios.',
        },
      ],
      implementationChecklist: [
        'Always set a sensible Time-To-Live (TTL) on every single cache key (never use infinite TTL without automated invalidation).',
        'Add random jitter to TTLs (e.g. 300s + rand(0, 30)s) to prevent thousands of keys from expiring at the exact same second.',
      ],
    },
  },
  {
    id: 'cache-eviction-policies',
    title: 'Cache Eviction: LRU, LFU, FIFO & ARC',
    shortDescription: 'Algorithmic mechanics of Least Recently Used, Least Frequently Used, First-In First-Out, and Adaptive Replacement Cache.',
    domain: 'scalability',
    difficulty: 'intermediate',
    readTimeMinutes: 12,
    tags: ['caching', 'lru', 'lfu', 'eviction', 'algorithms'],
    prerequisites: ['caching-strategies'],
    relatedConcepts: ['caching-strategies'],
    pairedLabId: 'cache-lab',
    isFlagship: false,
    content: {
      overview: `Cache memory is finite and expensive. When cache memory reaches its allocated limit, an eviction policy decides which existing items must be discarded to make room for incoming entries.

The optimal eviction policy depends on workload access patterns (temporal locality vs frequency locality).`,
      architectureDetails: `Eviction Algorithms:
- LRU (Least Recently Used): Evicts the item that has not been accessed for the longest period of time. Implemented in O(1) time using a Doubly Linked List paired with a Hash Map.
- LFU (Least Frequently Used): Tracks access frequency counters; evicts items with the lowest access count. Best for stable popularity distributions, but slow to adapt when user trends shift.
- FIFO (First-In First-Out): Evicts the oldest created item regardless of how frequently it is accessed. Simplest, but poor hit ratios.
- ARC (Adaptive Replacement Cache): Dynamically self-tunes between LRU and LFU based on recent hit history.`,
      keyTradeoffs: [
        {
          advantage: 'LRU excels on temporal locality (items accessed recently are very likely to be accessed again soon).',
          drawback: 'Vulnerable to batch scans (a full table scan flushes the entire hot cache with one-time items).',
        },
      ],
      failureModes: [
        {
          failure: 'Cache Pollution via Batch Scans in LRU',
          consequence: 'A nightly backup job scans all records, evicting the entire working set of popular daytime items from Redis.',
          mitigation: 'Use LRU-2 (require 2 hits before promoting to main cache) or bypass the cache for batch scans.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Redis Eviction Policies',
          usage: 'Redis provides volatile-lru, allkeys-lru, and allkeys-lfu using randomized sampling approximations to achieve O(1) performance without heavy pointer overhead.',
        },
      ],
      implementationChecklist: [
        'Select allkeys-lru in Redis when your traffic follows a standard power-law (Pareto) distribution.',
      ],
    },
  },
];
