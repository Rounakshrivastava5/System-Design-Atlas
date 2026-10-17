import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Network, AlertOctagon, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface ReplicaNode {
  id: string;
  partition: 'A' | 'B';
  version: number;
  value: string;
}

export const CapConsensusLab: React.FC = () => {
  const [totalNodes] = useState<number>(5); // N = 5
  const [writeQuorum, setWriteQuorum] = useState<number>(3); // W = 3
  const [readQuorum, setReadQuorum] = useState<number>(3); // R = 3
  const [isPartitioned, setIsPartitioned] = useState<boolean>(true);

  const [replicas, setReplicas] = useState<ReplicaNode[]>([
    { id: 'node-1', partition: 'A', version: 2, value: 'balance: $250' },
    { id: 'node-2', partition: 'A', version: 2, value: 'balance: $250' },
    { id: 'node-3', partition: 'A', version: 2, value: 'balance: $250' },
    { id: 'node-4', partition: 'B', version: 1, value: 'balance: $100' },
    { id: 'node-5', partition: 'B', version: 1, value: 'balance: $100' },
  ]);

  const [statusMessage, setStatusMessage] = useState<string>('System initialized.');

  // Check Quorum Strong Consistency: R + W > N
  const isQuorumStrong = writeQuorum + readQuorum > totalNodes;

  const handleWrite = (targetPartition: 'A' | 'B', newValue: string) => {
    // How many nodes are reachable in this partition?
    const reachableNodes = replicas.filter(r => !isPartitioned || r.partition === targetPartition);

    if (reachableNodes.length >= writeQuorum) {
      // Write SUCCESS
      setReplicas(prev => prev.map(r => {
        if (!isPartitioned || r.partition === targetPartition) {
          return { ...r, version: r.version + 1, value: newValue };
        }
        return r;
      }));
      setStatusMessage(`WRITE SUCCEEDED in Partition ${targetPartition}: Reached ${reachableNodes.length}/${writeQuorum} quorum.`);
    } else {
      // Write FAILED (Consistency prioritized over Availability)
      setStatusMessage(`WRITE REJECTED in Partition ${targetPartition}: Only ${reachableNodes.length} nodes reachable, needed W=${writeQuorum}.`);
    }
  };

  const handleRead = (targetPartition: 'A' | 'B') => {
    const reachableNodes = replicas.filter(r => !isPartitioned || r.partition === targetPartition);

    if (reachableNodes.length >= readQuorum) {
      // Find highest version among reachable
      const highest = reachableNodes.reduce((prev, curr) => curr.version > prev.version ? curr : prev);
      const isStale = highest.version < 2;
      setStatusMessage(`READ from Partition ${targetPartition}: Highest Version v${highest.version} -> "${highest.value}" ${isStale ? '(STALE DATA!)' : '(UP-TO-DATE)'}`);
    } else {
      setStatusMessage(`READ FAILED in Partition ${targetPartition}: Only ${reachableNodes.length} nodes reachable, needed R=${readQuorum}.`);
    }
  };

  const handleReset = () => {
    setWriteQuorum(3);
    setReadQuorum(3);
    setIsPartitioned(true);
    setReplicas([
      { id: 'node-1', partition: 'A', version: 2, value: 'balance: $250' },
      { id: 'node-2', partition: 'A', version: 2, value: 'balance: $250' },
      { id: 'node-3', partition: 'A', version: 2, value: 'balance: $250' },
      { id: 'node-4', partition: 'B', version: 1, value: 'balance: $100' },
      { id: 'node-5', partition: 'B', version: 1, value: 'balance: $100' },
    ]);
    setStatusMessage('Cluster reset to default state.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Network className="w-4 h-4 mr-2 text-purple-500" />
            Consensus & Partition Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
            <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">
              Quorum Equation: R + W &gt; N
            </div>
            <div className="font-mono text-purple-600 dark:text-purple-400">
              {readQuorum} + {writeQuorum} = {readQuorum + writeQuorum} {isQuorumStrong ? '> 5 (Strong Consistency)' : '≤ 5 (Eventual / Weak)'}
            </div>
          </div>

          <Slider
            label="Write Quorum (W)"
            value={writeQuorum}
            min={1}
            max={5}
            step={1}
            unit=" nodes"
            onChange={setWriteQuorum}
            description="Number of replica acknowledgements required before write succeeds."
          />

          <Slider
            label="Read Quorum (R)"
            value={readQuorum}
            min={1}
            max={5}
            step={1}
            unit=" nodes"
            onChange={setReadQuorum}
            description="Number of replica responses consulted during read."
          />

          <div className="pt-2">
            <button
              onClick={() => setIsPartitioned(!isPartitioned)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 border ${
                isPartitioned
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                  : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{isPartitioned ? 'Network Partition ACTIVE (Split)' : 'Network Healthy (Connected)'}</span>
            </button>
          </div>

          {/* Operation Triggers */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Test Operations:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWrite('A', 'balance: $500')}
              >
                Write to Partition A
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWrite('B', 'balance: $500')}
              >
                Write to Partition B
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRead('A')}
              >
                Read from Partition A
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRead('B')}
              >
                Read from Partition B
              </Button>
            </div>
          </div>
        </div>

        {/* Live Status */}
        <div className="p-3 bg-slate-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-slate-700 dark:text-gray-300">
          {statusMessage}
        </div>
      </Card>

      {/* Visual Cluster Partition */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total Cluster Nodes N = 5</span>
          <span>{isPartitioned ? 'Split into 2 isolated subgraphs' : 'Single connected graph'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Partition A */}
          <Card className={`p-4 space-y-3 ${isPartitioned ? 'border-blue-500/40 bg-blue-50/10' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Partition A (Major Subgraph: 3 Nodes)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 font-bold">
                Nodes: 3
              </span>
            </div>

            <div className="space-y-2">
              {replicas.filter(r => r.partition === 'A').map(node => (
                <div
                  key={node.id}
                  className="p-2.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex justify-between items-center text-xs"
                >
                  <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{node.id}</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">v{node.version}</span>
                  <span className="font-mono text-slate-600 dark:text-gray-300">{node.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Partition B */}
          <Card className={`p-4 space-y-3 ${isPartitioned ? 'border-amber-500/40 bg-amber-50/10' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Partition B (Minor Subgraph: 2 Nodes)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-600 font-bold">
                Nodes: 2
              </span>
            </div>

            <div className="space-y-2">
              {replicas.filter(r => r.partition === 'B').map(node => (
                <div
                  key={node.id}
                  className="p-2.5 rounded bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex justify-between items-center text-xs"
                >
                  <span className="font-mono font-bold text-slate-800 dark:text-gray-200">{node.id}</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">v{node.version}</span>
                  <span className="font-mono text-slate-600 dark:text-gray-300">{node.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tradeoff Explanation */}
        <Card className="p-4 bg-slate-50 dark:bg-gray-900 text-xs text-slate-600 dark:text-gray-400 space-y-2">
          <div className="font-bold text-slate-900 dark:text-white">
            Architectural Principle: CAP Theorem in Action
          </div>
          <p>
            When network partition is active, Partition B has only 2 nodes. Because W=3, writes to Partition B are rejected to guarantee Consistency (CP system). If we relaxed W to 1, Partition B would accept writes, causing split-brain inconsistency (AP system).
          </p>
        </Card>
      </div>
    </div>
  );
};
