import { ArchitectureDocument, ArchitectureNode, ArchitectureEdge } from '../types/workbench';

export interface ValidationResult {
  isValid: boolean;
  document?: ArchitectureDocument;
  error?: string;
}

export function validateArchitectureDocument(jsonString: string): ValidationResult {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return { isValid: false, error: 'Empty or invalid file payload provided.' };
    }

    const data = JSON.parse(jsonString);

    if (typeof data !== 'object' || data === null) {
      return { isValid: false, error: 'JSON root must be an object.' };
    }

    if (!data.id || typeof data.id !== 'string') {
      return { isValid: false, error: 'Document is missing a valid "id" string.' };
    }

    if (!data.title || typeof data.title !== 'string') {
      return { isValid: false, error: 'Document is missing a valid "title" string.' };
    }

    if (!Array.isArray(data.nodes)) {
      return { isValid: false, error: 'Document is missing a valid "nodes" array.' };
    }

    if (!Array.isArray(data.edges)) {
      return { isValid: false, error: 'Document is missing a valid "edges" array.' };
    }

    // Validate each node
    const validNodes: ArchitectureNode[] = [];
    const nodeIds = new Set<string>();

    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i];
      if (!n || typeof n !== 'object' || !n.id || !n.name || !n.type || !n.category) {
        return { isValid: false, error: `Node at index ${i} is missing required fields (id, name, type, category).` };
      }
      nodeIds.add(String(n.id));
      validNodes.push({
        id: String(n.id),
        name: String(n.name),
        type: String(n.type),
        category: n.category,
        x: Number.isFinite(n.x) ? Number(n.x) : 100 + i * 40,
        y: Number.isFinite(n.y) ? Number(n.y) : 100 + i * 40,
        replicas: Number.isFinite(n.replicas) && n.replicas > 0 ? Number(n.replicas) : 1,
        capacityQps: Number.isFinite(n.capacityQps) ? Number(n.capacityQps) : 5000,
        avgLatencyMs: Number.isFinite(n.avgLatencyMs) ? Number(n.avgLatencyMs) : 10,
        failureRatePercent: Number.isFinite(n.failureRatePercent) ? Number(n.failureRatePercent) : 0,
        notes: typeof n.notes === 'string' ? n.notes : undefined,
      });
    }

    // Validate each edge
    const validEdges: ArchitectureEdge[] = [];
    for (let i = 0; i < data.edges.length; i++) {
      const e = data.edges[i];
      if (!e || typeof e !== 'object' || !e.id || !e.fromNodeId || !e.toNodeId) {
        return { isValid: false, error: `Edge at index ${i} is missing required fields (id, fromNodeId, toNodeId).` };
      }
      if (!nodeIds.has(String(e.fromNodeId))) {
        return { isValid: false, error: `Edge ${e.id} points from non-existent node ID: ${e.fromNodeId}` };
      }
      if (!nodeIds.has(String(e.toNodeId))) {
        return { isValid: false, error: `Edge ${e.id} points to non-existent node ID: ${e.toNodeId}` };
      }
      validEdges.push({
        id: String(e.id),
        fromNodeId: String(e.fromNodeId),
        toNodeId: String(e.toNodeId),
        label: typeof e.label === 'string' ? e.label : undefined,
        protocol: e.protocol || 'http_rest',
        estimatedQps: Number.isFinite(e.estimatedQps) ? Number(e.estimatedQps) : undefined,
        latencyMs: Number.isFinite(e.latencyMs) ? Number(e.latencyMs) : undefined,
      });
    }

    const document: ArchitectureDocument = {
      id: String(data.id),
      title: String(data.title),
      description: typeof data.description === 'string' ? data.description : '',
      version: typeof data.version === 'string' ? data.version : '1.0.0',
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: validNodes,
      edges: validEdges,
    };

    return { isValid: true, document };
  } catch (err: any) {
    return { isValid: false, error: `Invalid JSON syntax: ${err.message || 'Parse failed'}` };
  }
}
