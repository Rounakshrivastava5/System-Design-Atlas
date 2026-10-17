import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, ShieldAlert, Play, CheckCircle2, XCircle, Activity } from 'lucide-react';

export const RateLimiterLab: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'token_bucket' | 'leaky_bucket' | 'fixed_window' | 'sliding_window'>('token_bucket');
  const [capacity, setCapacity] = useState<number>(10);
  const [refillRate, setRefillRate] = useState<number>(2); // tokens/requests per second

  // State for token bucket
  const [tokens, setTokens] = useState<number>(10);
  // State for leaky bucket
  const [queueLength, setQueueLength] = useState<number>(0);
  // Metrics
  const [stats, setStats] = useState({ allowed: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState<{ id: string; time: string; status: '200' | '429' }[]>([]);

  // Simulation timer for tokens refill / leak
  useEffect(() => {
    const timer = setInterval(() => {
      if (algorithm === 'token_bucket') {
        setTokens(prev => Math.min(capacity, prev + refillRate));
      } else if (algorithm === 'leaky_bucket') {
        setQueueLength(prev => Math.max(0, prev - refillRate));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [algorithm, capacity, refillRate]);

  const handleSendRequest = (burstCount: number = 1) => {
    let newAllowed = 0;
    let newRejected = 0;
    const nowStr = new Date().toLocaleTimeString();
    const newLogs = [...recentRequests];

    for (let i = 0; i < burstCount; i++) {
      let isAllowed = false;

      if (algorithm === 'token_bucket') {
        if (tokens > 0) {
          isAllowed = true;
          setTokens(prev => Math.max(0, prev - 1));
        }
      } else if (algorithm === 'leaky_bucket') {
        if (queueLength < capacity) {
          isAllowed = true;
          setQueueLength(prev => prev + 1);
        }
      } else {
        // Window algorithm approximation
        if (tokens > 0) {
          isAllowed = true;
          setTokens(prev => Math.max(0, prev - 1));
        }
      }

      if (isAllowed) {
        newAllowed++;
        newLogs.unshift({ id: Math.random().toString(36).substr(2, 5), time: nowStr, status: '200' });
      } else {
        newRejected++;
        newLogs.unshift({ id: Math.random().toString(36).substr(2, 5), time: nowStr, status: '429' });
      }
    }

    setStats(prev => ({
      allowed: prev.allowed + newAllowed,
      rejected: prev.rejected + newRejected,
    }));
    setRecentRequests(newLogs.slice(0, 8));
  };

  const handleReset = () => {
    setTokens(capacity);
    setQueueLength(0);
    setStats({ allowed: 0, rejected: 0 });
    setRecentRequests([]);
  };

  const total = stats.allowed + stats.rejected;
  const rejectRatio = total > 0 ? Math.round((stats.rejected / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />
            Rate Limiter Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-1.5">
              Algorithm Type
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'token_bucket', label: 'Token Bucket' },
                { id: 'leaky_bucket', label: 'Leaky Bucket' },
                { id: 'fixed_window', label: 'Fixed Window' },
                { id: 'sliding_window', label: 'Sliding Window' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAlgorithm(opt.id as any)}
                  className={`p-2 rounded-lg border text-left transition ${
                    algorithm === opt.id
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Bucket Capacity"
            value={capacity}
            min={5}
            max={25}
            step={1}
            unit=" units"
            onChange={val => {
              setCapacity(val);
              setTokens(val);
            }}
            description="Max burst allowance before requests are throttled."
          />

          <Slider
            label="Refill / Outflow Rate"
            value={refillRate}
            min={1}
            max={8}
            step={1}
            unit=" /sec"
            onChange={setRefillRate}
            description="Continuous rate at which quota is replenished."
          />

          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium"
              onClick={() => handleSendRequest(1)}
              icon={<Play className="w-4 h-4" />}
            >
              Send 1 Request
            </Button>
            <Button
              variant="secondary"
              className="w-full text-xs"
              onClick={() => handleSendRequest(5)}
            >
              Simulate Burst (5 Requests)
            </Button>
          </div>
        </div>

        {/* Recent Influx Stream */}
        <div className="pt-3 border-t border-slate-200 dark:border-gray-800 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            HTTP Response Stream
          </div>
          <div className="space-y-1">
            {recentRequests.map(r => (
              <div
                key={r.id}
                className="p-1.5 rounded text-xs flex items-center justify-between font-mono bg-slate-50 dark:bg-gray-800"
              >
                <span className="text-slate-500">{r.time}</span>
                <span
                  className={`font-bold ${
                    r.status === '200' ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  HTTP {r.status} {r.status === '200' ? 'OK' : 'Too Many Requests'}
                </span>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <div className="text-xs text-slate-400 italic">No traffic emitted yet.</div>
            )}
          </div>
        </div>
      </Card>

      {/* Visualizer & Metrics */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Requests Accepted</span>
            <div className="text-2xl font-bold font-mono text-emerald-500">{stats.allowed}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Requests Throttled (429)</span>
            <div className="text-2xl font-bold font-mono text-rose-500">{stats.rejected}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Drop Ratio</span>
            <div className="text-2xl font-bold font-mono text-amber-500">{rejectRatio}%</div>
          </Card>
        </div>

        {/* Bucket Visualization */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {algorithm === 'token_bucket' ? 'Token Bucket Visualizer' : 'Leaky Bucket Visualizer'}
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {algorithm === 'token_bucket' ? `${tokens} tokens available` : `${queueLength}/${capacity} buffer used`}
            </span>
          </div>

          <div className="flex justify-center py-6">
            <div className="w-48 h-64 border-4 border-slate-300 dark:border-gray-700 rounded-b-3xl relative flex flex-col justify-end p-2 bg-slate-100/50 dark:bg-gray-800/30 overflow-hidden">
              {/* Liquid / Token fill */}
              <div
                className={`w-full rounded-b-2xl transition-all duration-300 ${
                  algorithm === 'token_bucket' ? 'bg-emerald-500/60' : 'bg-cyan-500/60'
                }`}
                style={{
                  height: `${
                    algorithm === 'token_bucket'
                      ? (tokens / capacity) * 100
                      : (queueLength / capacity) * 100
                  }%`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-slate-800 dark:text-gray-100 pointer-events-none">
                {algorithm === 'token_bucket' ? `${tokens} Tokens` : `${queueLength} In Queue`}
              </div>
            </div>
          </div>

          <div className="text-xs text-center text-slate-500 dark:text-gray-400">
            {algorithm === 'token_bucket'
              ? `Refilling at +${refillRate} tokens/sec up to capacity ${capacity}. Burst allows immediate spending.`
              : `Leaking out at ${refillRate} req/sec. Incoming requests exceeding capacity ${capacity} are rejected.`}
          </div>
        </Card>
      </div>
    </div>
  );
};
