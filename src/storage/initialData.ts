import { DomainMeta } from '../types/concept';
import { ArchitectureDocument, ComponentPaletteItem } from '../types/workbench';

export const DOMAINS: DomainMeta[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals & Theorems',
    shortName: 'Fundamentals',
    description: 'Foundational laws, mathematical formulations, latency trade-offs, and distributed consensus principles.',
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400 border-blue-500/20',
    iconName: 'Scale',
  },
  {
    id: 'scalability',
    name: 'Scalability & Traffic Management',
    shortName: 'Scalability',
    description: 'Load balancing, rate limiting, CDNs, Anycast routing, reverse proxies, and horizontal elasticity.',
    color: '#06B6D4', // Cyan
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    badgeText: 'text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    iconName: 'Network',
  },
  {
    id: 'storage',
    name: 'Data Storage & Management',
    shortName: 'Storage',
    description: 'Relational vs NoSQL, LSM Trees, indexing structures, replication strategies, and database sharding.',
    color: '#F59E0B', // Amber
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconName: 'Database',
  },
  {
    id: 'networking',
    name: 'Networking & Communication',
    shortName: 'Networking',
    description: 'Transports, HTTP/2 & HTTP/3, WebSockets, gRPC, Protobuf serialization, and communication protocols.',
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    badgeText: 'text-purple-600 dark:text-purple-400 border-purple-500/20',
    iconName: 'Radio',
  },
  {
    id: 'distributed',
    name: 'Distributed Systems Patterns',
    shortName: 'Distributed',
    description: 'Consistent hashing, message brokers, CQRS & event sourcing, circuit breakers, and distributed transactions.',
    color: '#EC4899', // Pink
    badgeBg: 'bg-pink-500/10 dark:bg-pink-500/20',
    badgeText: 'text-pink-600 dark:text-pink-400 border-pink-500/20',
    iconName: 'Boxes',
  },
  {
    id: 'observability',
    name: 'Observability & Reliability',
    shortName: 'Observability',
    description: 'Distributed tracing, telemetry collection, health checks, load shedding, and disaster recovery.',
    color: '#10B981', // Emerald
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    iconName: 'Activity',
  },
];

export const COMPONENT_PALETTE: ComponentPaletteItem[] = [
  // Clients
  { type: 'web_client', name: 'Web Client', category: 'client', defaultQps: 1000, defaultLatencyMs: 40, iconName: 'Globe', description: 'Single-Page React / Browser Application' },
  { type: 'mobile_client', name: 'Mobile App', category: 'client', defaultQps: 5000, defaultLatencyMs: 80, iconName: 'Smartphone', description: 'iOS / Android Native Client' },
  { type: 'iot_device', name: 'IoT Sensor', category: 'client', defaultQps: 20000, defaultLatencyMs: 120, iconName: 'Cpu', description: 'Low-power telemetry emitter' },

  // Edge & Routing
  { type: 'dns', name: 'DNS (Route 53 / Anycast)', category: 'edge', defaultQps: 50000, defaultLatencyMs: 15, iconName: 'Compass', description: 'Geo-distributed domain resolution' },
  { type: 'cdn', name: 'Cloud CDN', category: 'edge', defaultQps: 40000, defaultLatencyMs: 10, iconName: 'Share2', description: 'Edge cached static and video assets' },
  { type: 'api_gateway', name: 'API Gateway', category: 'edge', defaultQps: 15000, defaultLatencyMs: 5, iconName: 'ShieldAlert', description: 'Auth, TLS termination, routing, and rate limiting' },
  { type: 'load_balancer', name: 'Load Balancer (L4/L7)', category: 'edge', defaultQps: 30000, defaultLatencyMs: 3, iconName: 'GitFork', description: 'Reverse proxy distributing requests to workers' },

  // Compute & Services
  { type: 'auth_service', name: 'Auth & Session Service', category: 'service', defaultQps: 8000, defaultLatencyMs: 12, iconName: 'Key', description: 'JWT issue/verify and OAuth provider' },
  { type: 'core_api', name: 'Core API Service', category: 'service', defaultQps: 10000, defaultLatencyMs: 25, iconName: 'Server', description: 'Stateless backend business logic nodes' },
  { type: 'worker_service', name: 'Background Worker', category: 'service', defaultQps: 3000, defaultLatencyMs: 150, iconName: 'Cog', description: 'Asynchronous task and batch processor' },
  { type: 'search_service', name: 'Search Engine', category: 'service', defaultQps: 5000, defaultLatencyMs: 35, iconName: 'Search', description: 'Inverted index search service (Elastic/OpenSearch)' },

  // Data Stores
  { type: 'sql_db', name: 'Relational DB (Postgres)', category: 'storage', defaultQps: 2500, defaultLatencyMs: 15, iconName: 'Database', description: 'ACID transactional data store with read replicas' },
  { type: 'nosql_db', name: 'NoSQL Document Store', category: 'storage', defaultQps: 12000, defaultLatencyMs: 8, iconName: 'HardDrive', description: 'Horizontally partitioned key-value / document store' },
  { type: 'distributed_cache', name: 'Redis Cache Cluster', category: 'storage', defaultQps: 80000, defaultLatencyMs: 2, iconName: 'Zap', description: 'In-memory key-value cache and session store' },
  { type: 'object_storage', name: 'Object Storage (S3)', category: 'storage', defaultQps: 5000, defaultLatencyMs: 50, iconName: 'Archive', description: 'Durable blob storage for media, files, and backups' },

  // Messaging & Events
  { type: 'message_queue', name: 'Message Broker (RabbitMQ)', category: 'messaging', defaultQps: 25000, defaultLatencyMs: 5, iconName: 'Layers', description: 'AMQP task distribution and work queues' },
  { type: 'event_stream', name: 'Event Stream (Kafka)', category: 'messaging', defaultQps: 100000, defaultLatencyMs: 4, iconName: 'ListOrdered', description: 'Distributed append-only event commit log' },

  // Observability
  { type: 'telemetry_collector', name: 'OpenTelemetry & Metrics', category: 'observability', defaultQps: 50000, defaultLatencyMs: 3, iconName: 'Activity', description: 'Tracing, Prometheus metrics, and Grafana collector' },
];

export const STARTER_ARCHITECTURES: ArchitectureDocument[] = [
  {
    id: 'starter-tinyurl',
    title: 'URL Shortener (TinyURL)',
    description: 'High-read scale URL redirect service featuring Anycast DNS, CDN, Redis cache cluster, and partitioned SQL databases.',
    version: '1.0.0',
    createdAt: '2026-10-17T00:00:00.000Z',
    updatedAt: '2026-10-17T00:00:00.000Z',
    nodes: [
      { id: 'n-client', name: 'Web & Mobile Clients', type: 'web_client', category: 'client', x: 80, y: 220, replicas: 1, capacityQps: 50000, avgLatencyMs: 30 },
      { id: 'n-lb', name: 'Load Balancer (Nginx)', type: 'load_balancer', category: 'edge', x: 280, y: 220, replicas: 2, capacityQps: 40000, avgLatencyMs: 4 },
      { id: 'n-api', name: 'Shortener API Nodes', type: 'core_api', category: 'service', x: 480, y: 220, replicas: 4, capacityQps: 20000, avgLatencyMs: 15 },
      { id: 'n-cache', name: 'Redis Cache (Top 20% URLs)', type: 'distributed_cache', category: 'storage', x: 680, y: 140, replicas: 3, capacityQps: 60000, avgLatencyMs: 2 },
      { id: 'n-db', name: 'Postgres (Range Partitioned)', type: 'sql_db', category: 'storage', x: 680, y: 300, replicas: 2, capacityQps: 5000, avgLatencyMs: 18 },
      { id: 'n-analytics', name: 'Kafka Click Stream', type: 'event_stream', category: 'messaging', x: 480, y: 380, replicas: 3, capacityQps: 80000, avgLatencyMs: 3 },
    ],
    edges: [
      { id: 'e1', fromNodeId: 'n-client', toNodeId: 'n-lb', protocol: 'http_rest', estimatedQps: 15000, latencyMs: 25 },
      { id: 'e2', fromNodeId: 'n-lb', toNodeId: 'n-api', protocol: 'http_rest', estimatedQps: 15000, latencyMs: 3 },
      { id: 'e3', fromNodeId: 'n-api', toNodeId: 'n-cache', protocol: 'tcp', label: 'Cache Lookup (80% Hit)', estimatedQps: 15000, latencyMs: 2 },
      { id: 'e4', fromNodeId: 'n-api', toNodeId: 'n-db', protocol: 'sql', label: 'Cache Miss Fallback', estimatedQps: 3000, latencyMs: 15 },
      { id: 'e5', fromNodeId: 'n-api', toNodeId: 'n-analytics', protocol: 'async_event', label: 'Async Analytics Event', estimatedQps: 15000, latencyMs: 2 },
    ],
  },
  {
    id: 'starter-chat-app',
    title: 'Real-Time Chat Platform',
    description: 'Low-latency bidirectional messaging architecture with WebSocket gateways, Redis Pub/Sub, Cassandra message store, and push workers.',
    version: '1.0.0',
    createdAt: '2026-10-17T00:00:00.000Z',
    updatedAt: '2026-10-17T00:00:00.000Z',
    nodes: [
      { id: 'n-chat-clients', name: 'Chat Users', type: 'mobile_client', category: 'client', x: 80, y: 220, replicas: 1, capacityQps: 30000, avgLatencyMs: 50 },
      { id: 'n-ws-gateway', name: 'WebSocket Gateway Cluster', type: 'api_gateway', category: 'edge', x: 280, y: 220, replicas: 6, capacityQps: 50000, avgLatencyMs: 8 },
      { id: 'n-pubsub', name: 'Redis Pub/Sub Sessions', type: 'distributed_cache', category: 'storage', x: 480, y: 120, replicas: 4, capacityQps: 90000, avgLatencyMs: 2 },
      { id: 'n-msg-service', name: 'Message Service', type: 'core_api', category: 'service', x: 480, y: 280, replicas: 4, capacityQps: 15000, avgLatencyMs: 20 },
      { id: 'n-cassandra', name: 'Cassandra Message Store', type: 'nosql_db', category: 'storage', x: 700, y: 280, replicas: 6, capacityQps: 35000, avgLatencyMs: 10 },
      { id: 'n-kafka', name: 'Kafka Push Queue', type: 'event_stream', category: 'messaging', x: 480, y: 400, replicas: 3, capacityQps: 50000, avgLatencyMs: 4 },
      { id: 'n-push-worker', name: 'APNs / FCM Workers', type: 'worker_service', category: 'service', x: 700, y: 400, replicas: 4, capacityQps: 10000, avgLatencyMs: 80 },
    ],
    edges: [
      { id: 'ce1', fromNodeId: 'n-chat-clients', toNodeId: 'n-ws-gateway', protocol: 'websocket', estimatedQps: 20000, latencyMs: 15 },
      { id: 'ce2', fromNodeId: 'n-ws-gateway', toNodeId: 'n-pubsub', protocol: 'tcp', label: 'Session Routing', estimatedQps: 20000, latencyMs: 2 },
      { id: 'ce3', fromNodeId: 'n-ws-gateway', toNodeId: 'n-msg-service', protocol: 'grpc', label: 'Store & Route', estimatedQps: 20000, latencyMs: 5 },
      { id: 'ce4', fromNodeId: 'n-msg-service', toNodeId: 'n-cassandra', protocol: 'tcp', label: 'Append Chat Message', estimatedQps: 20000, latencyMs: 8 },
      { id: 'ce5', fromNodeId: 'n-msg-service', toNodeId: 'n-kafka', protocol: 'async_event', label: 'Offline Recipient Event', estimatedQps: 4000, latencyMs: 3 },
      { id: 'ce6', fromNodeId: 'n-kafka', toNodeId: 'n-push-worker', protocol: 'async_event', label: 'Push Notification Jobs', estimatedQps: 4000, latencyMs: 5 },
    ],
  },
  {
    id: 'starter-ecommerce',
    title: 'High-Concurrency E-Commerce Platform',
    description: 'Resilient checkout and flash-sale architecture with Redis inventory reservation, payment gateway webhooks, and Kafka order pipelines.',
    version: '1.0.0',
    createdAt: '2026-10-17T00:00:00.000Z',
    updatedAt: '2026-10-17T00:00:00.000Z',
    nodes: [
      { id: 'ec-client', name: 'Shoppers (Web & Mobile)', type: 'web_client', category: 'client', x: 80, y: 220, replicas: 1, capacityQps: 40000, avgLatencyMs: 35 },
      { id: 'ec-gateway', name: 'API Gateway & Rate Limiter', type: 'api_gateway', category: 'edge', x: 280, y: 220, replicas: 4, capacityQps: 30000, avgLatencyMs: 6 },
      { id: 'ec-order-api', name: 'Order Service', type: 'core_api', category: 'service', x: 480, y: 160, replicas: 4, capacityQps: 8000, avgLatencyMs: 25 },
      { id: 'ec-redis-stock', name: 'Redis Atomic Inventory Lock', type: 'distributed_cache', category: 'storage', x: 700, y: 100, replicas: 3, capacityQps: 50000, avgLatencyMs: 3 },
      { id: 'ec-order-db', name: 'Postgres Orders DB (ACID)', type: 'sql_db', category: 'storage', x: 700, y: 220, replicas: 2, capacityQps: 3000, avgLatencyMs: 20 },
      { id: 'ec-event-bus', name: 'Kafka Order Events', type: 'event_stream', category: 'messaging', x: 480, y: 340, replicas: 3, capacityQps: 60000, avgLatencyMs: 4 },
      { id: 'ec-payment-worker', name: 'Payment & Fulfillment Worker', type: 'worker_service', category: 'service', x: 700, y: 340, replicas: 5, capacityQps: 4000, avgLatencyMs: 120 },
    ],
    edges: [
      { id: 'ece1', fromNodeId: 'ec-client', toNodeId: 'ec-gateway', protocol: 'http_rest', estimatedQps: 10000, latencyMs: 20 },
      { id: 'ece2', fromNodeId: 'ec-gateway', toNodeId: 'ec-order-api', protocol: 'grpc', estimatedQps: 8000, latencyMs: 5 },
      { id: 'ece3', fromNodeId: 'ec-order-api', toNodeId: 'ec-redis-stock', protocol: 'tcp', label: 'Atomic DECR inventory', estimatedQps: 8000, latencyMs: 2 },
      { id: 'ece4', fromNodeId: 'ec-order-api', toNodeId: 'ec-order-db', protocol: 'sql', label: 'Persist Pending Order', estimatedQps: 3000, latencyMs: 18 },
      { id: 'ece5', fromNodeId: 'ec-order-api', toNodeId: 'ec-event-bus', protocol: 'async_event', label: 'OrderPlaced Event', estimatedQps: 3000, latencyMs: 4 },
      { id: 'ece6', fromNodeId: 'ec-event-bus', toNodeId: 'ec-payment-worker', protocol: 'async_event', label: 'Process Charge', estimatedQps: 3000, latencyMs: 6 },
    ],
  },
];
