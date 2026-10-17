import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { Play, RotateCcw, AlertTriangle, CheckCircle2, Server, ArrowDown, Activity } from 'lucide-react';

interface ServerNode {
  id: string;
  name: string;
  weight: number;
  activeConnections: number;
  totalServed: number;
  isHealthy: boolean;
}

export const LoadBalancerLab: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'round_robin' | 'least_conn' | 'weighted' | 'ip_hash'>('round_robin');
  const [requestRate, setRequestRate] = useState<number>(50);
  const [rrPointer, setRrPointer] = useState<number>(0);
  const [servers, setServers] = useState<ServerNode[]>([
    { id: 's1', name: 'Server A (us-east-1a)', weight: 1, activeConnections: 12, totalServed: 140, isHealthy: true },
    { id: 's2', name: 'Server B (us-east-1b)', weight: 2, activeConnections: 24, totalServed: 280, isHealthy: true },
    { id: 's3', name: 'Server C (us-east-1c)', weight: 1, activeConnections: 8, totalServed: 135, isHealthy: true },
    { id: 's4', name: 'Server D (us-east-1d)', weight: 3, activeConnections: 45, totalServed: 420, isHealthy: false },
  ]);
  const [recentRoutingLog, setRecentRoutingLog] = useState<{ id: string; clientIp: string; targetServer: string; algo: string }[]>([]);

  const handleSendBatch = (count: number = 10) => {
    const healthyServers = servers.filter(s => s.isHealthy);
    if (healthyServers.length === 0) return;

    let targetIndex = 0;
    const newServers = [...servers];
    const newLogs = [...recentRoutingLog];

    for (let i = 0; i < count; i++) {
      const clientIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      let chosenServer: ServerNode;

      if (algorithm === 'round_robin') {
        const idx = (rrPointer + i) % healthyServers.length;
        chosenServer = healthyServers[idx];
      } else if (algorithm === 'least_conn') {
        chosenServer = healthyServers.reduce((prev, curr) => 
          curr.activeConnections < prev.activeConnections ? curr : prev
        );
      } else if (algorithm === 'weighted') {
        const totalWeight = healthyServers.reduce((acc, s) => acc + s.weight, 0);
        let randomWeight = Math.random() * totalWeight;
        chosenServer = healthyServers[0];
        for (const s of healthyServers) {
          randomWeight -= s.weight;
          if (randomWeight <= 0) {
            chosenServer = s;
            break;
          }
        }
      } else {
        // IP Hash
        let hash = 0;
        for (let ch = 0; ch < clientIp.length; ch++) {
          hash = (hash << 5) - hash + clientIp.charCodeAt(ch);
          hash |= 0;
        }
        const idx = Math.abs(hash) % healthyServers.length;
        chosenServer = healthyServers[idx];
      }

      // Update chosen server metrics
      const target = newServers.find(s => s.id === chosenServer.id);
      if (target) {
        target.totalServed += 1;
        target.activeConnections = Math.max(1, target.activeConnections + Math.floor(Math.random() * 3) - 1);
      }

      newLogs.unshift({
        id: Math.random().toString(36).substr(2, 6),
        clientIp,
        targetServer: chosenServer.name,
        algo: algorithm,
      });
    }

    setRrPointer(prev => (prev + count) % healthyServers.length);
    setServers(newServers);
    setRecentRoutingLog(newLogs.slice(0, 8));
  };

  const toggleServerHealth = (id: string) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, isHealthy: !s.isHealthy } : s));
  };

  const handleReset = () => {
    setAlgorithm('round_robin');
    setRequestRate(50);
    setRrPointer(0);
    setServers([
      { id: 's1', name: 'Server A (us-east-1a)', weight: 1, activeConnections: 12, totalServed: 140, isHealthy: true },
      { id: 's2', name: 'Server B (us-east-1b)', weight: 2, activeConnections: 24, totalServed: 280, isHealthy: true },
      { id: 's3', name: 'Server C (us-east-1c)', weight: 1, activeConnections: 8, totalServed: 135, isHealthy: true },
      { id: 's4', name: 'Server D (us-east-1d)', weight: 3, activeConnections: 0, totalServed: 420, isHealthy: false },
    ]);
    setRecentRoutingLog([]);
  };

  const totalHealthyServed = servers.reduce((acc, s) => acc + s.totalServed, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls & Algorithm Config */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Activity className="w-4 h-4 mr-2 text-cyan-500" />
            Load Balancer Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-1.5">
              Balancing Algorithm
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'round_robin', label: 'Round Robin' },
                { id: 'least_conn', label: 'Least Connections' },
                { id: 'weighted', label: 'Weighted RR' },
                { id: 'ip_hash', label: 'Source IP Hash' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAlgorithm(opt.id as any)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    algorithm === opt.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Simulated Batch Influx (Requests)"
            value={requestRate}
            min={10}
            max={200}
            step={10}
            unit=" reqs"
            onChange={setRequestRate}
            description="Simulates incoming burst of requests routed by the load balancer."
          />

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
              onClick={() => handleSendBatch(requestRate)}
              icon={<Play className="w-4 h-4" />}
            >
              Dispatch {requestRate} Requests
            </Button>
          </div>
        </div>

        {/* Real-time Routing Log */}
        <div className="pt-4 border-t border-slate-200 dark:border-gray-800 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Recent Routing Stream
          </div>
          <div className="space-y-1.5">
            {recentRoutingLog.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No requests dispatched yet. Click above to send traffic.</div>
            ) : (
              recentRoutingLog.map(log => (
                <div key={log.id} className="p-2 rounded bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-800 text-xs flex items-center justify-between font-mono">
                  <span className="text-slate-500 truncate">{log.clientIp}</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-medium truncate ml-2">→ {log.targetServer.split(' ')[0]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Visual Server Nodes Cluster */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Backend Server Pool Topology
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Traffic Routed: {totalHealthyServed}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servers.map(server => {
              const sharePercent = totalHealthyServed > 0 
                ? Math.round((server.totalServed / totalHealthyServed) * 100) 
                : 0;

              return (
                <div
                  key={server.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !server.isHealthy
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 opacity-75'
                      : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${server.isHealthy ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {server.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Weight: {server.weight}x
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleServerHealth(server.id)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition ${
                        server.isHealthy
                          ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
                          : 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300'
                      }`}
                    >
                      {server.isHealthy ? 'Healthy (Up)' : 'Failed (Down)'}
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-gray-400">
                      <span>Active Connections:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-gray-200">
                        {server.isHealthy ? server.activeConnections : 0}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500 dark:text-gray-400">
                      <span>Total Requests Served:</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {server.totalServed} ({sharePercent}%)
                      </span>
                    </div>

                    {/* Load distribution bar */}
                    <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          server.isHealthy ? 'bg-cyan-500' : 'bg-rose-400'
                        }`}
                        style={{ width: `${server.isHealthy ? sharePercent : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Algorithm Behavior Explanation Callout */}
        <Card className="p-4 bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-xs text-slate-600 dark:text-gray-400 space-y-1.5">
          <div className="font-bold text-slate-900 dark:text-white">
            Current Algorithm Analysis: {algorithm.replace('_', ' ').toUpperCase()}
          </div>
          {algorithm === 'round_robin' && (
            <p>
              Cycles sequentially through healthy nodes. Simple and stateless, but ignores server capacity differences and varying transaction lengths.
            </p>
          )}
          {algorithm === 'least_conn' && (
            <p>
              Directs incoming requests to the node with lowest active connection count. Prevents worker overload when query execution durations vary drastically.
            </p>
          )}
          {algorithm === 'weighted' && (
            <p>
              Distributes load proportionally to configured server capacity weights (e.g., Server B receives 2x requests, Server D receives 3x when healthy).
            </p>
          )}
          {algorithm === 'ip_hash' && (
            <p>
              Computes a deterministic hash of the client's IP address to map them consistently to the same backend server (useful for session stickiness without distributed sessions).
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
