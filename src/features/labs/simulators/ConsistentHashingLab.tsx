import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Boxes, Plus, Trash2, ArrowRight } from 'lucide-react';
import { mathUtils } from '../../../utils/math';

interface PhysicalNode {
  id: string;
  name: string;
  color: string;
}

export const ConsistentHashingLab: React.FC = () => {
  const [nodes, setNodes] = useState<PhysicalNode[]>([
    { id: 'node-A', name: 'Node A', color: '#3B82F6' },
    { id: 'node-B', name: 'Node B', color: '#10B981' },
    { id: 'node-C', name: 'Node C', color: '#F59E0B' },
  ]);
  const [vnodesPerNode, setVnodesPerNode] = useState<number>(3);
  const [totalKeysCount, setTotalKeysCount] = useState<number>(50);

  // Generate hash points for vnodes
  const ringPoints = useMemo(() => {
    const points: { angle: number; nodeId: string; nodeName: string; color: string }[] = [];
    nodes.forEach(node => {
      for (let v = 0; v < vnodesPerNode; v++) {
        const hash = mathUtils.hashString(`${node.id}-vnode-${v}`);
        const angle = hash % 360;
        points.push({ angle, nodeId: node.id, nodeName: node.name, color: node.color });
      }
    });
    return points.sort((a, b) => a.angle - b.angle);
  }, [nodes, vnodesPerNode]);

  // Distribute keys around the ring
  const keyDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    nodes.forEach(n => dist[n.id] = 0);

    if (ringPoints.length === 0) return dist;

    for (let k = 0; k < totalKeysCount; k++) {
      const keyHash = mathUtils.hashString(`user-record-key-${k}`) % 360;
      // Find first vnode point >= keyHash (clockwise)
      const targetPoint = ringPoints.find(p => p.angle >= keyHash) || ringPoints[0];
      if (targetPoint) {
        dist[targetPoint.nodeId] = (dist[targetPoint.nodeId] || 0) + 1;
      }
    }
    return dist;
  }, [ringPoints, totalKeysCount, nodes]);

  const handleAddNode = () => {
    if (nodes.length >= 6) return;
    const colors = ['#8B5CF6', '#EC4899', '#06B6D4'];
    const newId = `node-${String.fromCharCode(65 + nodes.length)}`;
    setNodes(prev => [...prev, {
      id: newId,
      name: `Node ${String.fromCharCode(65 + prev.length)}`,
      color: colors[prev.length % colors.length],
    }]);
  };

  const handleRemoveNode = () => {
    if (nodes.length <= 2) return;
    setNodes(prev => prev.slice(0, prev.length - 1));
  };

  const handleReset = () => {
    setNodes([
      { id: 'node-A', name: 'Node A', color: '#3B82F6' },
      { id: 'node-B', name: 'Node B', color: '#10B981' },
      { id: 'node-C', name: 'Node C', color: '#F59E0B' },
    ]);
    setVnodesPerNode(3);
    setTotalKeysCount(50);
  };

  // Expected migration on addition/removal: roughly 1/N
  const expectedMigration = nodes.length > 0 ? Math.round((1 / nodes.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Boxes className="w-4 h-4 mr-2 text-indigo-500" />
            Hash Ring Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Slider
            label="Virtual Nodes per Physical Node (vnodes)"
            value={vnodesPerNode}
            min={1}
            max={8}
            step={1}
            unit=" vnodes"
            onChange={setVnodesPerNode}
            description="Increases hash distribution uniformity and eliminates hot-spots."
          />

          <Slider
            label="Key Sample Size"
            value={totalKeysCount}
            min={20}
            max={200}
            step={10}
            unit=" keys"
            onChange={setTotalKeysCount}
            description="Number of keys distributed around the 360° ring."
          />

          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNode}
              disabled={nodes.length >= 6}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Add Node ({nodes.length}/6)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveNode}
              disabled={nodes.length <= 2}
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              className="flex-1"
            >
              Remove Node
            </Button>
          </div>
        </div>

        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
          <div className="font-bold text-indigo-700 dark:text-indigo-300">
            Minimal Key Redistribution
          </div>
          <p className="text-indigo-600 dark:text-indigo-400">
            When adding a new node to an N={nodes.length} cluster, only ~{expectedMigration}% of total keys are re-mapped (K/N), unlike conventional modulo hashing which re-maps ~{(100 - (100 / nodes.length)).toFixed(0)}% of all keys!
          </p>
        </div>
      </Card>

      {/* Visual Hash Ring Canvas & Distribution Bars */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            360° Hash Ring Topology ({ringPoints.length} vnode points)
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Ring circle */}
            <div className="w-56 h-56 rounded-full border-4 border-slate-200 dark:border-gray-700 flex items-center justify-center relative">
              <span className="text-xs font-mono text-slate-400 font-bold">Ring: 0° - 359°</span>

              {/* Vnode points plotted on perimeter */}
              {ringPoints.map((point, idx) => {
                const rad = (point.angle - 90) * (Math.PI / 180);
                const x = 112 + 112 * Math.cos(rad);
                const y = 112 + 112 * Math.sin(rad);

                return (
                  <div
                    key={idx}
                    className="absolute w-3.5 h-3.5 rounded-full shadow-xs cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-150"
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      backgroundColor: point.color,
                    }}
                    title={`${point.nodeName} (${point.angle}°)`}
                  />
                );
              })}
            </div>
          </div>
        </Card>

        {/* Node Distribution Bars */}
        <Card className="p-5 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Key Distribution Across Physical Nodes ({totalKeysCount} Total Keys)
          </div>

          <div className="space-y-3">
            {nodes.map(node => {
              const count = keyDistribution[node.id] || 0;
              const percent = totalKeysCount > 0 ? Math.round((count / totalKeysCount) * 100) : 0;

              return (
                <div key={node.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: node.color }} />
                      <span className="text-slate-800 dark:text-gray-200">{node.name}</span>
                    </span>
                    <span className="font-mono text-slate-500">
                      {count} keys ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: node.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
