import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Layers, Play, Pause, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const MessageQueueLab: React.FC = () => {
  const [producerRate, setProducerRate] = useState<number>(5); // events/sec
  const [consumerRate, setConsumerRate] = useState<number>(3); // events/sec
  const [bufferCapacity, setBufferCapacity] = useState<number>(20);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [queue, setQueue] = useState<string[]>(['msg-1', 'msg-2', 'msg-3']);
  const [deadLetterQueue, setDeadLetterQueue] = useState<string[]>([]);
  const [stats, setStats] = useState({ produced: 3, consumed: 0, dropped: 0 });

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Produce messages
      const produceCount = Math.floor(producerRate / 2);
      const consumeCount = Math.floor(consumerRate / 2);

      setQueue(prevQueue => {
        let newQueue = [...prevQueue];
        let newDropped = 0;
        const newDlq: string[] = [];

        for (let i = 0; i < produceCount; i++) {
          const msgId = `msg-${Date.now().toString().slice(-4)}-${i}`;
          if (newQueue.length < bufferCapacity) {
            newQueue.push(msgId);
          } else {
            // Buffer overflow -> Route to DLQ
            newDropped++;
            newDlq.push(msgId);
          }
        }

        if (newDlq.length > 0) {
          setDeadLetterQueue(d => [...d.slice(-10), ...newDlq]);
        }

        // Consume messages
        const consumedActual = Math.min(newQueue.length, consumeCount);
        newQueue = newQueue.slice(consumedActual);

        setStats(s => ({
          produced: s.produced + produceCount,
          consumed: s.consumed + consumedActual,
          dropped: s.dropped + newDropped,
        }));

        return newQueue;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, producerRate, consumerRate, bufferCapacity]);

  const handleManualPush = () => {
    const msgId = `msg-${Date.now().toString().slice(-4)}`;
    if (queue.length < bufferCapacity) {
      setQueue(prev => [...prev, msgId]);
      setStats(s => ({ ...s, produced: s.produced + 1 }));
    } else {
      setDeadLetterQueue(prev => [...prev, msgId]);
      setStats(s => ({ ...s, dropped: s.dropped + 1 }));
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setProducerRate(5);
    setConsumerRate(3);
    setBufferCapacity(20);
    setQueue(['msg-1', 'msg-2', 'msg-3']);
    setDeadLetterQueue([]);
    setStats({ produced: 3, consumed: 0, dropped: 0 });
  };

  const isOverflowing = queue.length >= bufferCapacity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Layers className="w-4 h-4 mr-2 text-pink-500" />
            Queue & Backpressure Engine
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Slider
            label="Producer Publishing Rate"
            value={producerRate}
            min={1}
            max={20}
            step={1}
            unit=" msg/sec"
            onChange={setProducerRate}
            description="Rate of events emitted into broker queue."
          />

          <Slider
            label="Consumer Processing Rate"
            value={consumerRate}
            min={1}
            max={20}
            step={1}
            unit=" msg/sec"
            onChange={setConsumerRate}
            description="Drain velocity of worker consumers."
          />

          <Slider
            label="Queue Buffer Capacity"
            value={bufferCapacity}
            min={10}
            max={50}
            step={5}
            unit=" slots"
            onChange={setBufferCapacity}
            description="Max memory queue limit before DLQ overflow occurs."
          />

          <div className="flex space-x-2 pt-2">
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={() => setIsRunning(!isRunning)}
              icon={isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {isRunning ? 'Pause Flow' : 'Start Simulation'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualPush}
            >
              Emit +1
            </Button>
          </div>
        </div>
      </Card>

      {/* Visual Queue & Consumers */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Total Produced</span>
            <div className="text-2xl font-bold font-mono text-blue-500">{stats.produced}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Total Consumed</span>
            <div className="text-2xl font-bold font-mono text-emerald-500">{stats.consumed}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Dead Letter Dropped</span>
            <div className="text-2xl font-bold font-mono text-rose-500">{stats.dropped}</div>
          </Card>
        </div>

        {/* Live Queue Buffer */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Primary Buffer Queue (RabbitMQ / Kafka)
            </span>
            <span className="font-mono text-xs text-slate-400">
              {queue.length}/{bufferCapacity} slots occupied
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverflowing ? 'bg-rose-500' : 'bg-pink-500'
              }`}
              style={{ width: `${(queue.length / bufferCapacity) * 100}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-50 dark:bg-gray-800 min-h-[60px] max-h-[140px] overflow-y-auto">
            {queue.map((msg, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
              >
                {msg}
              </span>
            ))}
            {queue.length === 0 && (
              <div className="text-xs text-slate-400 italic">Queue is idle.</div>
            )}
          </div>
        </Card>

        {/* Dead Letter Queue */}
        <Card className="p-4 border-rose-500/30 bg-rose-50/10 space-y-2">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Dead Letter Queue (DLQ) Overflow</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto">
            {deadLetterQueue.map((msg, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200"
              >
                {msg}
              </span>
            ))}
            {deadLetterQueue.length === 0 && (
              <span className="text-xs text-slate-400 italic">No dropped messages in DLQ.</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
