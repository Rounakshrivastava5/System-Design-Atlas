export type NodeCategory = 
  | 'client' 
  | 'edge' 
  | 'service' 
  | 'storage' 
  | 'messaging' 
  | 'observability';

export interface ComponentPaletteItem {
  type: string;
  name: string;
  category: NodeCategory;
  defaultQps: number;
  defaultLatencyMs: number;
  iconName: string;
  description: string;
}

export interface ArchitectureNode {
  id: string;
  name: string;
  type: string;
  category: NodeCategory;
  x: number;
  y: number;
  replicas: number;
  capacityQps: number;
  avgLatencyMs: number;
  failureRatePercent?: number;
  notes?: string;
}

export type ConnectionProtocol = 
  | 'http_rest' 
  | 'grpc' 
  | 'websocket' 
  | 'graphql' 
  | 'async_event' 
  | 'tcp' 
  | 'sql';

export interface ArchitectureEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  protocol: ConnectionProtocol;
  estimatedQps?: number;
  latencyMs?: number;
}

export interface ArchitectureDocument {
  id: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface SystemAnalysisResult {
  totalEstimatedLatencyMs: number;
  maxThroughputQps: number;
  bottleneckNodeId?: string;
  singlePointsOfFailure: string[]; // node IDs
  warnings: string[];
}
