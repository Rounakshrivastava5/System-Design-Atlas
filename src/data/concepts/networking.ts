import { Concept } from '../../types/concept';

export const NETWORKING_CONCEPTS: Concept[] = [
  {
    id: 'tcp-vs-udp',
    title: 'TCP vs UDP: Transport Layer Decisions',
    shortDescription: 'Connection-oriented reliable delivery with flow control versus low-overhead stateless datagram streaming.',
    domain: 'networking',
    difficulty: 'beginner',
    readTimeMinutes: 12,
    tags: ['networking', 'tcp', 'udp', 'transport'],
    prerequisites: ['scalability-vs-performance'],
    relatedConcepts: ['http-evolution', 'websockets-vs-sse'],
    isFlagship: false,
    content: {
      overview: `At Layer 4 (Transport Layer) of the internet protocol suite, two protocols dominate:
- TCP (Transmission Control Protocol): Connection-oriented, guarantees in-order, reliable packet delivery with congestion control, flow control, and checksum error checking via a 3-way handshake (SYN, SYN-ACK, ACK).
- UDP (User Datagram Protocol): Connectionless, fire-and-forget datagram delivery with zero handshake, zero guarantees of packet ordering, and zero retransmissions.

Choose TCP when data integrity and completeness are mandatory (file transfers, financial transactions, web APIs). Choose UDP when low latency and real-time streaming outweigh occasional dropped packets (live video calling, online gaming, DNS queries, VoIP).`,
      keyTradeoffs: [
        {
          advantage: 'TCP guarantees 100% in-order data arrival and automatically throttles transmission to prevent network buffer bloat.',
          drawback: '3-way handshake adds latency; dropped packets stall all subsequent packets until retransmitted (Head-of-Line blocking).',
        },
        {
          advantage: 'UDP has near-zero header overhead (8 bytes vs TCP\'s 20-60 bytes) and zero handshake delay.',
          drawback: 'Packets can arrive out of order, duplicated, or disappear completely; application code must implement any needed reliability checks.',
        },
      ],
      failureModes: [
        {
          failure: 'TCP Connection Reset (RST) Exhaustion',
          consequence: 'Opening and closing TCP connections for every HTTP request exhausts available local port ranges (ephemeral port exhaustion) and wastes CPU on repeated handshakes.',
          mitigation: 'Enable TCP Keep-Alive and HTTP persistent connection pooling.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Zoom / Discord Voice vs Stripe API',
          usage: 'Zoom uses UDP for live voice/video streaming; Stripe uses HTTPS over TCP for credit card charges.',
        },
      ],
      implementationChecklist: [
        'Use connection pools to reuse persistent TCP connections.',
        'Consider UDP-based QUIC for mobile applications on unreliable cellular networks.',
      ],
    },
  },
  {
    id: 'http-evolution',
    title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)',
    shortDescription: 'Head-of-line blocking in TCP vs HTTP/2 multiplexing streams vs QUIC UDP zero-RTT handshakes.',
    domain: 'networking',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['http', 'http2', 'http3', 'quic', 'protocols'],
    prerequisites: ['tcp-vs-udp'],
    relatedConcepts: ['tcp-vs-udp', 'rest-vs-grpc-graphql'],
    isFlagship: true,
    content: {
      overview: `The evolution of the Hypertext Transfer Protocol (HTTP) reflects thirty years of engineering battles against network latency:
- HTTP/1.1 (1997): Text-based protocol. Required opening multiple parallel TCP connections (browsers opened 6 per domain) to fetch assets. Suffered from application-layer Head-of-Line (HoL) blocking.
- HTTP/2 (2015): Binary framing layer. Multiplexed hundreds of concurrent bidirectional request/response streams over a single TCP connection. Introduced HPACK header compression and server push.
- HTTP/3 (2022): Completely replaces TCP with QUIC over UDP. Eliminates transport-layer Head-of-Line blocking, supports 0-RTT connection resumption, and provides seamless connection migration across IP changes (e.g. Wi-Fi to 5G).`,
      architectureDetails: `The Head-of-Line (HoL) Blocking Evolution:
1. In HTTP/1.1, if Request 1 takes 5 seconds, Request 2 behind it in the queue cannot proceed over that socket.
2. In HTTP/2, multiplexing solves application-layer HoL blocking. But because it runs over a single TCP connection, if ONE packet is dropped, TCP pauses ALL streams until the missing packet is retransmitted.
3. In HTTP/3, QUIC runs over UDP. Each stream is acknowledged independently; packet loss on Stream A has zero impact on Stream B!`,
      keyTradeoffs: [
        {
          advantage: 'HTTP/2 multiplexing reduces browser connection overhead and accelerates page load times significantly.',
          drawback: 'Vulnerable to transport-layer TCP stall on packet loss networks.',
        },
        {
          advantage: 'HTTP/3 eliminates HoL blocking and enables instant mobile handoff without dropping active streaming sessions.',
          drawback: 'Higher server CPU utilization for UDP processing compared to kernel-accelerated TCP.',
        },
      ],
      failureModes: [
        {
          failure: 'Enterprise Firewall Blocking UDP (HTTP/3)',
          consequence: 'Corporate firewalls block UDP port 443, causing HTTP/3 connections to fail.',
          mitigation: 'Implement Alt-Svc header fallback: browsers attempt HTTP/3 while seamlessly falling back to HTTP/2 over TCP.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Google & Meta',
          usage: 'Over 80% of Google and Meta traffic runs over HTTP/3 (QUIC), cutting search and video buffering latencies worldwide.',
        },
      ],
      implementationChecklist: [
        'Terminate HTTP/3 at edge CDN providers (Cloudflare, Fastly) with automated fallback to HTTP/2.',
        'Use binary framing and HPACK to minimize mobile header payload sizes.',
      ],
    },
  },
  {
    id: 'websockets-vs-sse',
    title: 'WebSockets vs Server-Sent Events (SSE)',
    shortDescription: 'Bidirectional full-duplex TCP sockets versus lightweight HTTP streaming for real-time notifications, feeds, and chat.',
    domain: 'networking',
    difficulty: 'intermediate',
    readTimeMinutes: 14,
    tags: ['websockets', 'sse', 'real-time', 'streaming'],
    prerequisites: ['tcp-vs-udp'],
    relatedConcepts: ['http-evolution', 'message-queues-brokers'],
    isFlagship: true,
    content: {
      overview: `Real-time web applications require pushing data from server to client instantly without wasteful client polling. Two primary protocols serve this need:

1. WebSockets: A persistent, full-duplex bidirectional TCP connection established via an HTTP Upgrade handshake. Both client and server can send arbitrary binary or text frames at any time with minimal 2-byte framing overhead.
2. Server-Sent Events (SSE): A unidirectional HTTP response stream (Content-Type: text/event-stream) where the server pushes UTF-8 events to the client over standard HTTP. The client cannot send messages upstream over the same channel (upstream uses standard HTTP POST).`,
      architectureDetails: `When to Choose Which:
- Choose WebSockets for bidirectional applications: multi-player gaming, collaborative document editors (Google Docs/Figma), and chat applications (WhatsApp/Slack).
- Choose SSE for unidirectional server-push applications: live financial ticker prices, AI LLM token streaming (ChatGPT), social media notification bells, and order tracking dashboards.
- Key SSE advantage: Built directly into HTTP! Works through corporate firewalls, supports HTTP/2 multiplexing out of the box, and browsers automatically reconnect with Last-Event-ID if the connection drops!`,
      keyTradeoffs: [
        {
          advantage: 'WebSockets provide lowest possible latency for high-frequency bidirectional interactions.',
          drawback: 'Bypasses standard HTTP infrastructure: requires custom load balancing, cannot use standard HTTP caching, and reconnect logic must be manually engineered.',
        },
        {
          advantage: 'Server-Sent Events (SSE) use standard HTTP/2, auto-reconnect natively, and support proxy caching.',
          drawback: 'Unidirectional only (server to client); binary data must be base64-encoded.',
        },
      ],
      failureModes: [
        {
          failure: 'HTTP/1.1 6-Connection Browser Limit in SSE',
          consequence: 'In HTTP/1.1, browsers enforce a hard limit of 6 open TCP connections per domain. Opening 6 SSE browser tabs blocks all subsequent HTTP requests in that browser!',
          mitigation: 'Always serve SSE over HTTP/2, where hundreds of streams multiplex over a single TCP connection.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'OpenAI ChatGPT / Discord',
          usage: 'ChatGPT streams AI token responses via SSE over HTTP/2; Discord uses WebSockets for real-time voice and text messaging.',
        },
      ],
      implementationChecklist: [
        'Use SSE for LLM streaming and dashboard notifications.',
        'Use WebSockets with ping/pong heartbeats for chat apps and collaborative canvases.',
      ],
    },
  },
  {
    id: 'rest-vs-grpc-graphql',
    title: 'REST vs gRPC vs GraphQL',
    shortDescription: 'Comparing RESTful resource conventions, high-performance binary gRPC over HTTP/2, and client-driven GraphQL query graphs.',
    domain: 'networking',
    difficulty: 'intermediate',
    readTimeMinutes: 16,
    tags: ['api', 'rest', 'grpc', 'graphql', 'protobuf'],
    prerequisites: ['http-evolution'],
    relatedConcepts: ['protocol-buffers', 'http-evolution'],
    isFlagship: true,
    content: {
      overview: `Modern software architectures utilize three dominant API paradigms:
1. REST (Representational State Transfer): Resource-centric, uses standard HTTP verbs (GET, POST, PUT, DELETE) and JSON payloads. Universal compatibility, human-readable, excellent caching.
2. gRPC (Google Remote Procedure Call): Contract-first RPC framework running over HTTP/2 using Protocol Buffers binary serialization. Extremely fast, strongly typed, supports bidirectional streaming.
3. GraphQL: Query language and runtime developed by Meta. Allows clients to request exactly the fields they need in a single query, eliminating over-fetching and under-fetching.`,
      architectureDetails: `Recommended Hybrid Architecture in Production:
- Edge / Public Facing: REST or GraphQL for mobile and web clients (flexible, firewall-friendly, developer ecosystem).
- Internal Microservice Mesh: gRPC for service-to-service communication (10x faster serialization, strict protobuf schemas, low CPU consumption).`,
      keyTradeoffs: [
        {
          advantage: 'gRPC delivers up to 7-10x higher throughput and lower CPU overhead than REST+JSON; strict schemas prevent runtime type bugs.',
          drawback: 'Binary format is not human-readable; difficult to test via curl/Postman without specialized tooling; limited browser native support.',
        },
        {
          advantage: 'GraphQL eliminates over-fetching on mobile networks by letting clients query precise nested graphs.',
          drawback: 'Complex caching (all queries are HTTP POST); risk of unbounded nested queries (N+1 database query problem).',
        },
      ],
      failureModes: [
        {
          failure: 'GraphQL N+1 Database Explosion',
          consequence: 'A client queries 100 authors and their 10 books; the naive resolver executes 1 query for authors and 100 individual queries for books (101 SQL queries total).',
          mitigation: 'Use DataLoader to batch and memoize database lookups into a single IN (...) query.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Netflix / Shopify',
          usage: 'Netflix uses gRPC for inter-service communication across thousands of internal microservices; Shopify exposes GraphQL for public merchant APIs.',
        },
      ],
      implementationChecklist: [
        'Adopt gRPC for internal backend microservices.',
        'Use DataLoader on all GraphQL relational resolvers to prevent N+1 queries.',
      ],
    },
  },
  {
    id: 'protocol-buffers',
    title: 'Protocol Buffers & Binary Serialization',
    shortDescription: 'How Google Protobuf serializes data into compact binary tags, wire formats, schema evolution, and backward compatibility.',
    domain: 'networking',
    difficulty: 'intermediate',
    readTimeMinutes: 12,
    tags: ['protobuf', 'serialization', 'grpc', 'binary'],
    prerequisites: ['rest-vs-grpc-graphql'],
    relatedConcepts: ['rest-vs-grpc-graphql'],
    isFlagship: false,
    content: {
      overview: `JSON is human-readable, but computationally expensive: keys are repeated in every message (e.g. "user_id": 123456 repeats "user_id" on the wire every time), numbers are encoded as ASCII text, and parsing requires CPU-intensive string tokenization.

Protocol Buffers (Protobuf) is Google's language-neutral binary serialization mechanism. Messages are defined in .proto schema files, and compiled into native language code (Go, Java, C++, TypeScript).`,
      architectureDetails: `Protobuf Wire Format:
- Field numbers (not field names) are sent over the wire.
- Uses Tag-Length-Value (TLV) binary encoding.
- Variable-length integer encoding (Varints): small numbers like 5 use only 1 byte instead of 4 or 8 bytes.
- Backward & Forward Compatibility: If an old service encounters a new field number, it ignores it safely; if a new service reads an old message, it assigns default values.`,
      keyTradeoffs: [
        {
          advantage: '3x to 10x smaller payload size than JSON and 5x to 10x faster CPU serialization/deserialization.',
          drawback: 'Requires maintaining .proto schema definitions and compiling code generators during CI/CD builds.',
        },
      ],
      failureModes: [
        {
          failure: 'Field Number Reassignment Disaster',
          consequence: 'A developer deletes field number 3 (email) and re-assigns field 3 to (credit_card). Old clients send emails that new services interpret as credit card numbers!',
          mitigation: 'Never reuse field numbers! Mark deleted fields as reserved (e.g. reserved 3;).',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'Google Internal Infrastructure',
          usage: 'Virtually all internal inter-process communication across Google datacenters is serialized using Protocol Buffers.',
        },
      ],
      implementationChecklist: [
        'Always mark deprecated fields as reserved in .proto files.',
        'Check generated protobuf code into version control or automate via CI.',
      ],
    },
  },
  {
    id: 'osi-model-practical',
    title: 'Practical OSI Model for System Designers',
    shortDescription: 'Demystifying the 7 OSI layers through the lens of modern cloud proxies, TLS termination, and network debugging.',
    domain: 'networking',
    difficulty: 'beginner',
    readTimeMinutes: 10,
    tags: ['osi', 'networking', 'layers'],
    prerequisites: ['tcp-vs-udp'],
    relatedConcepts: ['load-balancing-algorithms'],
    isFlagship: false,
    content: {
      overview: `The Open Systems Interconnection (OSI) model divides network communication into seven abstract layers.
For modern distributed systems architects, the focus centers primarily on:
- Layer 3 (Network Layer - IP): Packet routing, BGP, Anycast.
- Layer 4 (Transport Layer - TCP/UDP): Sockets, port forwarding, connection pooling, L4 load balancing.
- Layer 7 (Application Layer - HTTP, gRPC, WebSocket): URL routing, headers, TLS termination, authentication, WAF.`,
      keyTradeoffs: [
        {
          advantage: 'Lower layers (L3/L4) provide maximum throughput and lower latency; higher layers (L7) provide intelligent policy routing.',
          drawback: 'Higher layers incur greater compute overhead due to payload parsing and buffer management.',
        },
      ],
      failureModes: [
        {
          failure: 'Layer 4 Proxy Dropping Client Real IP',
          consequence: 'A Layer 4 TCP proxy forwards packets, but the backend server sees the proxy\'s IP instead of the client\'s original IP, breaking geolocation and fraud scoring.',
          mitigation: 'Enable PROXY Protocol (v1/v2) to prepend original client IP metadata to the TCP stream.',
        },
      ],
      realWorldExamples: [
        {
          companyOrSystem: 'AWS Elastic Load Balancing',
          usage: 'Network Load Balancer (NLB) operates at Layer 4; Application Load Balancer (ALB) operates at Layer 7.',
        },
      ],
      implementationChecklist: [
        'Use L4 NLBs when handling non-HTTP protocols or extreme million-packet-per-second spikes.',
        'Use L7 ALBs for microservice path routing, host header matching, and JWT verification.',
      ],
    },
  },
];
