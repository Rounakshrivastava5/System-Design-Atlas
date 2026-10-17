import { describe, it, expect } from 'vitest';
import { validateArchitectureDocument } from '../utils/validation';

describe('validateArchitectureDocument', () => {
  const validDoc = {
    id: 'test-arch-1',
    title: 'Scalable Web App',
    description: 'A 3-tier architecture with cache',
    version: '1.0.0',
    nodes: [
      {
        id: 'node-lb',
        name: 'Load Balancer',
        type: 'load_balancer',
        category: 'routing',
        x: 100,
        y: 150,
        replicas: 2,
        capacityQps: 20000,
        avgLatencyMs: 2,
      },
      {
        id: 'node-app',
        name: 'App Cluster',
        type: 'service_instance',
        category: 'compute',
        x: 350,
        y: 150,
        replicas: 4,
        capacityQps: 15000,
        avgLatencyMs: 25,
      },
      {
        id: 'node-db',
        name: 'PostgreSQL Primary',
        type: 'sql_primary',
        category: 'storage',
        x: 600,
        y: 150,
        replicas: 1,
        capacityQps: 3000,
        avgLatencyMs: 15,
      },
    ],
    edges: [
      {
        id: 'edge-1',
        fromNodeId: 'node-lb',
        toNodeId: 'node-app',
        protocol: 'http_rest',
        estimatedQps: 10000,
        latencyMs: 3,
      },
      {
        id: 'edge-2',
        fromNodeId: 'node-app',
        toNodeId: 'node-db',
        protocol: 'tcp_raw',
        estimatedQps: 3000,
        latencyMs: 10,
      },
    ],
  };

  it('validates and accepts a correct architecture document', () => {
    const json = JSON.stringify(validDoc);
    const result = validateArchitectureDocument(json);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.document).toBeDefined();
    expect(result.document?.id).toBe('test-arch-1');
    expect(result.document?.nodes).toHaveLength(3);
    expect(result.document?.edges).toHaveLength(2);
  });

  it('rejects invalid or empty json strings', () => {
    expect(validateArchitectureDocument('').isValid).toBe(false);
    expect(validateArchitectureDocument('{"invalid json').isValid).toBe(false);
  });

  it('rejects documents missing required root fields', () => {
    expect(validateArchitectureDocument(JSON.stringify({ title: 'No ID' })).isValid).toBe(false);
    expect(validateArchitectureDocument(JSON.stringify({ id: 'no-title' })).isValid).toBe(false);
    expect(validateArchitectureDocument(JSON.stringify({ id: '1', title: 't' })).isValid).toBe(false); // missing nodes
  });

  it('rejects nodes with missing required properties', () => {
    const invalidNodes = {
      ...validDoc,
      nodes: [{ id: 'broken' }], // missing name, type, category
    };
    const result = validateArchitectureDocument(JSON.stringify(invalidNodes));
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('missing required fields');
  });

  it('rejects edges referencing non-existent nodes', () => {
    const brokenEdgeFrom = {
      ...validDoc,
      edges: [
        {
          id: 'edge-ghost',
          fromNodeId: 'non-existent-node',
          toNodeId: 'node-app',
        },
      ],
    };
    const resFrom = validateArchitectureDocument(JSON.stringify(brokenEdgeFrom));
    expect(resFrom.isValid).toBe(false);
    expect(resFrom.error).toContain('non-existent node ID');

    const brokenEdgeTo = {
      ...validDoc,
      edges: [
        {
          id: 'edge-ghost-2',
          fromNodeId: 'node-lb',
          toNodeId: 'non-existent-target',
        },
      ],
    };
    const resTo = validateArchitectureDocument(JSON.stringify(brokenEdgeTo));
    expect(resTo.isValid).toBe(false);
    expect(resTo.error).toContain('non-existent node ID');
  });

  it('provides safe fallbacks for non-finite values in nodes', () => {
    const missingOptionalProps = {
      id: 'doc-minimal',
      title: 'Minimal Doc',
      nodes: [
        {
          id: 'node-1',
          name: 'Node 1',
          type: 'service',
          category: 'compute',
          // x, y, replicas omitted
        },
      ],
      edges: [],
    };

    const res = validateArchitectureDocument(JSON.stringify(missingOptionalProps));
    expect(res.isValid).toBe(true);
    expect(res.document?.nodes[0].replicas).toBe(1);
    expect(typeof res.document?.nodes[0].x).toBe('number');
    expect(typeof res.document?.nodes[0].y).toBe('number');
  });
});
