import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight, Play } from 'lucide-react';

type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export const CircuitBreakerLab: React.FC = () => {
  const [state, setState] = useState<BreakerState>('CLOSED');
  const [failureThreshold, setFailureThreshold] = useState<number>(50); // % failure to trip
  const [sleepWindowSec, setSleepWindowSec] = useState<number>(5); // seconds open before half-open
  const [backendFailureRate, setBackendFailureRate] = useState<number>(75); // % simulated backend errors

  const [rollingWindow, setRollingWindow] = useState<('SUCCESS' | 'FAILURE')[]>(['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS']);
  const [consecutiveSuccesses, setConsecutiveSuccesses] = useState<number>(0);
  const [secondsRemainingInOpen, setSecondsRemainingInOpen] = useState<number>(0);

  const [stats, setStats] = useState({ requestsExecuted: 0, fallbacksServed: 0, backendCalls: 0 });

  // Open timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'OPEN' && secondsRemainingInOpen > 0) {
      timer = setTimeout(() => {
        setSecondsRemainingInOpen(prev => prev - 1);
      }, 1000);
    } else if (state === 'OPEN' && secondsRemainingInOpen === 0) {
      setState('HALF_OPEN');
      setConsecutiveSuccesses(0);
    }
    return () => clearTimeout(timer);
  }, [state, secondsRemainingInOpen]);

  const handleExecuteRequest = () => {
    setStats(prev => ({ ...prev, requestsExecuted: prev.requestsExecuted + 1 }));

    if (state === 'OPEN') {
      // Circuit is open: fail-fast directly to fallback
      setStats(prev => ({ ...prev, fallbacksServed: prev.fallbacksServed + 1 }));
      return;
    }

    // Call backend
    setStats(prev => ({ ...prev, backendCalls: prev.backendCalls + 1 }));
    const isFailed = Math.random() * 100 < backendFailureRate;

    const statusItem: 'SUCCESS' | 'FAILURE' = isFailed ? 'FAILURE' : 'SUCCESS';
    const newWindow: ('SUCCESS' | 'FAILURE')[] = [...rollingWindow.slice(-9), statusItem];
    setRollingWindow(newWindow);

    if (state === 'CLOSED') {
      // Check failure percentage in rolling window
      const failureCount = newWindow.filter(w => w === 'FAILURE').length;
      const failurePct = (failureCount / newWindow.length) * 100;

      if (failurePct >= failureThreshold && newWindow.length >= 4) {
        setState('OPEN');
        setSecondsRemainingInOpen(sleepWindowSec);
      }
    } else if (state === 'HALF_OPEN') {
      if (isFailed) {
        // Any failure in half-open trips back to OPEN immediately
        setState('OPEN');
        setSecondsRemainingInOpen(sleepWindowSec);
        setConsecutiveSuccesses(0);
      } else {
        const nextSuccess = consecutiveSuccesses + 1;
        setConsecutiveSuccesses(nextSuccess);
        if (nextSuccess >= 3) {
          // Recover back to CLOSED
          setState('CLOSED');
          setRollingWindow(['SUCCESS', 'SUCCESS']);
        }
      }
    }
  };

  const handleReset = () => {
    setState('CLOSED');
    setFailureThreshold(50);
    setSleepWindowSec(5);
    setBackendFailureRate(75);
    setRollingWindow(['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS']);
    setConsecutiveSuccesses(0);
    setSecondsRemainingInOpen(0);
    setStats({ requestsExecuted: 0, fallbacksServed: 0, backendCalls: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-rose-500" />
            Circuit Breaker Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Slider
            label="Backend Service Failure Rate"
            value={backendFailureRate}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={setBackendFailureRate}
            description="Probability that remote backend service returns 500 error or times out."
          />

          <Slider
            label="Failure Trip Threshold"
            value={failureThreshold}
            min={20}
            max={80}
            step={5}
            unit="%"
            onChange={setFailureThreshold}
            description="Error percentage in rolling window that trips breaker to OPEN."
          />

          <Slider
            label="Sleep Window (Cooldown)"
            value={sleepWindowSec}
            min={3}
            max={15}
            step={1}
            unit="s"
            onChange={setSleepWindowSec}
            description="Duration breaker remains OPEN before trial requests in HALF-OPEN."
          />

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              onClick={handleExecuteRequest}
              icon={<Play className="w-4 h-4" />}
            >
              Dispatch Client Request
            </Button>
          </div>
        </div>
      </Card>

      {/* State Machine & Visual Metrics */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Requests Dispatched</span>
            <div className="text-2xl font-bold font-mono text-slate-800 dark:text-gray-200">{stats.requestsExecuted}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Backend Calls</span>
            <div className="text-2xl font-bold font-mono text-blue-500">{stats.backendCalls}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Fast Fallbacks Served</span>
            <div className="text-2xl font-bold font-mono text-amber-500">{stats.fallbacksServed}</div>
          </Card>
        </div>

        {/* State Machine Visualizer */}
        <Card className="p-6 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Circuit Breaker Finite State Machine
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                state === 'CLOSED'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 ring-2 ring-emerald-500/30'
                  : 'border-slate-200 dark:border-gray-800 opacity-40'
              }`}
            >
              <div className="font-bold text-sm">CLOSED</div>
              <div className="text-[11px] text-slate-500 mt-1">Normal Traffic Flow</div>
            </div>

            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                state === 'OPEN'
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 ring-2 ring-rose-500/30'
                  : 'border-slate-200 dark:border-gray-800 opacity-40'
              }`}
            >
              <div className="font-bold text-sm">OPEN</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {state === 'OPEN' ? `Sleeping (${secondsRemainingInOpen}s)` : 'Fail-Fast Fallback'}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                state === 'HALF_OPEN'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 ring-2 ring-amber-500/30'
                  : 'border-slate-200 dark:border-gray-800 opacity-40'
              }`}
            >
              <div className="font-bold text-sm">HALF-OPEN</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {state === 'HALF_OPEN' ? `Trial (${consecutiveSuccesses}/3 OK)` : 'Trial Recovery'}
              </div>
            </div>
          </div>

          {/* Rolling window tape */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-500">
              Recent Rolling Window (Last 10 Backend Invocations):
            </div>
            <div className="flex space-x-1.5 overflow-x-auto">
              {rollingWindow.map((item, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                    item === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
