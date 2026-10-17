import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Cpu, Play, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SnowflakeId {
  id: string;
  timestampMs: number;
  datacenterId: number;
  workerId: number;
  sequence: number;
  binaryString: string;
}

export const SnowflakeIdLab: React.FC = () => {
  const [datacenterId, setDatacenterId] = useState<number>(1);
  const [workerId, setWorkerId] = useState<number>(7);
  const [sequenceCounter, setSequenceCounter] = useState<number>(0);
  const [generatedIds, setGeneratedIds] = useState<SnowflakeId[]>([]);
  const [clockDriftActive, setClockDriftActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerateId = (count: number = 1) => {
    if (clockDriftActive) {
      setErrorMessage('CLOCK DRIFT DETECTED: System clock moved backwards by 142ms. ID generation paused to prevent collisions.');
      return;
    }

    setErrorMessage(null);
    const newItems: SnowflakeId[] = [];
    let currentSeq = sequenceCounter;

    for (let i = 0; i < count; i++) {
      const now = Date.now();
      const seq = currentSeq % 4096;
      currentSeq++;

      // Build simulated 64-bit structure
      const tsBits = (now % 1000000).toString(2).padStart(41, '0');
      const dcBits = datacenterId.toString(2).padStart(5, '0');
      const wkBits = workerId.toString(2).padStart(5, '0');
      const sqBits = seq.toString(2).padStart(12, '0');
      const binary = `0${tsBits}${dcBits}${wkBits}${sqBits}`;

      // Pseudo 64-bit decimal ID representation
      const decimalId = `${now}${datacenterId.toString().padStart(2, '0')}${workerId.toString().padStart(2, '0')}${seq.toString().padStart(4, '0')}`;

      newItems.push({
        id: decimalId,
        timestampMs: now,
        datacenterId,
        workerId,
        sequence: seq,
        binaryString: binary,
      });
    }

    setSequenceCounter(currentSeq);
    setGeneratedIds(prev => [...newItems, ...prev.slice(0, 7)]);
  };

  const handleReset = () => {
    setDatacenterId(1);
    setWorkerId(7);
    setSequenceCounter(0);
    setGeneratedIds([]);
    setClockDriftActive(false);
    setErrorMessage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-indigo-500" />
            Snowflake Generator Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Slider
            label="Datacenter ID (5 bits: 0-31)"
            value={datacenterId}
            min={0}
            max={31}
            step={1}
            onChange={setDatacenterId}
            description="Identifies regional datacenter node group."
          />

          <Slider
            label="Worker / Machine ID (5 bits: 0-31)"
            value={workerId}
            min={0}
            max={31}
            step={1}
            onChange={setWorkerId}
            description="Identifies individual generator process."
          />

          <div className="pt-2">
            <button
              onClick={() => {
                setClockDriftActive(!clockDriftActive);
                if (clockDriftActive) setErrorMessage(null);
              }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                clockDriftActive
                  ? 'border-rose-500 bg-rose-50 text-rose-600'
                  : 'border-slate-300 dark:border-gray-700 hover:bg-slate-50'
              }`}
            >
              {clockDriftActive ? 'Clock Drift Anomaly ACTIVE' : 'Simulate NTP Clock Rollback'}
            </button>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              variant="primary"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => handleGenerateId(1)}
              icon={<Play className="w-4 h-4" />}
            >
              Generate 1 ID
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handleGenerateId(5)}
            >
              Generate 5 IDs
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 text-xs text-rose-600 font-mono">
            {errorMessage}
          </div>
        )}
      </Card>

      {/* Bit Layout & Generated IDs */}
      <div className="lg:col-span-2 space-y-6">
        {/* 64-bit structural breakdown */}
        <Card className="p-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            64-Bit Binary Layout Breakdown
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-slate-100 dark:bg-gray-800">
              <span className="font-bold text-slate-400 block text-[10px]">1 Bit</span>
              <span className="font-mono text-slate-600 dark:text-gray-300">Sign (0)</span>
            </div>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
              <span className="font-bold text-blue-500 block text-[10px]">41 Bits</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">Epoch Timestamp</span>
            </div>
            <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
              <span className="font-bold text-purple-500 block text-[10px]">10 Bits</span>
              <span className="font-mono text-purple-600 dark:text-purple-400">DC + Worker ID</span>
            </div>
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
              <span className="font-bold text-emerald-500 block text-[10px]">12 Bits</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">Sequence (0-4095)</span>
            </div>
          </div>
        </Card>

        {/* Generated IDs list */}
        <Card className="p-5 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Generated 64-Bit IDs Stream ({generatedIds.length} generated)
          </div>

          <div className="space-y-2">
            {generatedIds.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 font-mono text-xs space-y-1"
              >
                <div className="flex justify-between items-center text-slate-900 dark:text-white font-bold">
                  <span>ID: {item.id}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Seq: #{item.sequence}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3">
                  <span>Timestamp: {item.timestampMs}</span>
                  <span>DC: {item.datacenterId}</span>
                  <span>Worker: {item.workerId}</span>
                </div>
              </div>
            ))}
            {generatedIds.length === 0 && (
              <div className="text-xs text-slate-400 italic">No IDs generated yet. Click "Generate" to create IDs.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
