import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Database, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

interface DbNode {
  id: string;
  role: 'PRIMARY' | 'REPLICA';
  logOffset: number;
  status: 'ONLINE' | 'FAILED';
  region: string;
}

export const ReplicationFailoverLab: React.FC = () => {
  const [replicationMode, setReplicationMode] = useState<'sync' | 'async'>('async');
  const [replicationLagMs, setReplicationLagMs] = useState<number>(150);

  const [nodes, setNodes] = useState<DbNode[]>([
    { id: 'db-1', role: 'PRIMARY', logOffset: 4500, status: 'ONLINE', region: 'us-east-1' },
    { id: 'db-2', role: 'REPLICA', logOffset: 4495, status: 'ONLINE', region: 'us-east-2' },
    { id: 'db-3', role: 'REPLICA', logOffset: 4480, status: 'ONLINE', region: 'eu-west-1' },
  ]);

  const [lastActionLog, setLastActionLog] = useState<string>('Cluster operational. Primary receiving writes.');

  const handleWriteTransaction = () => {
    const primary = nodes.find(n => n.role === 'PRIMARY');
    if (!primary || primary.status === 'FAILED') {
      setLastActionLog('TRANSACTION REJECTED: No healthy Primary available. Cluster is read-only.');
      return;
    }

    const newOffset = primary.logOffset + 10;

    if (replicationMode === 'sync') {
      // Sync: all replicas update before ack
      setNodes(prev => prev.map(n => n.status === 'ONLINE' ? { ...n, logOffset: newOffset } : n));
      setLastActionLog(`Sync write committed at WAL offset ${newOffset}. Replicas acknowledged synchronously.`);
    } else {
      // Async: primary updates immediately, replicas lag
      setNodes(prev => prev.map(n => {
        if (n.role === 'PRIMARY') return { ...n, logOffset: newOffset };
        return { ...n, logOffset: Math.max(0, newOffset - Math.floor(replicationLagMs / 10)) };
      }));
      setLastActionLog(`Async write acked instantly at offset ${newOffset}. Replicas catching up asynchronously.`);
    }
  };

  const handleFailPrimary = () => {
    setNodes(prev => prev.map(n => n.role === 'PRIMARY' ? { ...n, status: 'FAILED' } : n));
    setLastActionLog('PRIMARY OUTAGE INDUCED: Leader is down. Initiating health check timeout...');
  };

  const handleElectLeader = () => {
    const healthyReplicas = nodes.filter(n => n.role === 'REPLICA' && n.status === 'ONLINE');
    if (healthyReplicas.length === 0) {
      setLastActionLog('ELECTION FAILED: No online replicas available to promote.');
      return;
    }

    // Elect replica with highest logOffset
    const highest = healthyReplicas.reduce((prev, curr) => curr.logOffset > prev.logOffset ? curr : prev);

    setNodes(prev => prev.map(n => {
      if (n.id === highest.id) {
        return { ...n, role: 'PRIMARY' };
      }
      return n;
    }));

    setLastActionLog(`LEADER ELECTED: Promoted ${highest.id} (highest WAL offset ${highest.logOffset}) to new PRIMARY.`);
  };

  const handleReset = () => {
    setReplicationMode('async');
    setReplicationLagMs(150);
    setNodes([
      { id: 'db-1', role: 'PRIMARY', logOffset: 4500, status: 'ONLINE', region: 'us-east-1' },
      { id: 'db-2', role: 'REPLICA', logOffset: 4495, status: 'ONLINE', region: 'us-east-2' },
      { id: 'db-3', role: 'REPLICA', logOffset: 4480, status: 'ONLINE', region: 'eu-west-1' },
    ]);
    setLastActionLog('Cluster reset to default state.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Database className="w-4 h-4 mr-2 text-amber-500" />
            Replication Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-1.5">
              Replication Topology
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setReplicationMode('async')}
                className={`p-2 rounded-lg border text-left font-medium transition ${
                  replicationMode === 'async'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-semibold'
                    : 'border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400'
                }`}
              >
                Asynchronous (Fast writes, replication lag)
              </button>
              <button
                onClick={() => setReplicationMode('sync')}
                className={`p-2 rounded-lg border text-left font-medium transition ${
                  replicationMode === 'sync'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-semibold'
                    : 'border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400'
                }`}
              >
                Synchronous (Zero data loss, high write latency)
              </button>
            </div>
          </div>

          <Slider
            label="Simulated Network Replication Lag"
            value={replicationLagMs}
            min={10}
            max={500}
            step={10}
            unit=" ms"
            onChange={setReplicationLagMs}
            description="Inter-datacenter network delay between primary and read replicas."
          />

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleWriteTransaction}
            >
              Commit Write Transaction (+10 Offset)
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1 text-rose-600 border-rose-300 hover:bg-rose-50"
                onClick={handleFailPrimary}
              >
                Kill Primary
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleElectLeader}
              >
                Trigger Election
              </Button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-slate-700 dark:text-gray-300">
          {lastActionLog}
        </div>
      </Card>

      {/* Cluster Visualizer */}
      <div className="lg:col-span-2 space-y-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Database Cluster Topology ({replicationMode.toUpperCase()} Replication)
        </div>

        <div className="space-y-3">
          {nodes.map(node => (
            <Card
              key={node.id}
              className={`p-4 border transition-all ${
                node.status === 'FAILED'
                  ? 'border-rose-300 bg-rose-50/20 opacity-70'
                  : node.role === 'PRIMARY'
                  ? 'border-amber-500 ring-1 ring-amber-500/20'
                  : 'border-slate-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${node.role === 'PRIMARY' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-gray-800 text-slate-600'}`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{node.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${node.role === 'PRIMARY' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-gray-800'}`}>
                        {node.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Region: {node.region}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">WAL Log Offset</div>
                  <div className="font-mono font-bold text-sm text-slate-800 dark:text-gray-200">
                    {node.logOffset}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
