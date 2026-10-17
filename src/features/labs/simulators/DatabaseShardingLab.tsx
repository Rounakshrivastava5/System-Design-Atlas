import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Database, Plus, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';

interface ShardNode {
  id: string;
  name: string;
  rangeMin?: number;
  rangeMax?: number;
  keys: string[];
}

export const DatabaseShardingLab: React.FC = () => {
  const [strategy, setStrategy] = useState<'hash' | 'range' | 'directory'>('hash');
  const [shards, setShards] = useState<ShardNode[]>([
    { id: 'shard-0', name: 'Shard Node 0', rangeMin: 1, rangeMax: 333, keys: ['user:12', 'user:88', 'user:140', 'user:210'] },
    { id: 'shard-1', name: 'Shard Node 1', rangeMin: 334, rangeMax: 666, keys: ['user:350', 'user:412', 'user:555'] },
    { id: 'shard-2', name: 'Shard Node 2', rangeMin: 667, rangeMax: 999, keys: ['user:710', 'user:820', 'user:930', 'user:990'] },
  ]);
  const [inputUserId, setInputUserId] = useState<string>('user:452');
  const [lookupResult, setLookupResult] = useState<string | null>(null);

  const getTargetShard = (key: string): ShardNode => {
    const num = parseInt(key.replace(/\D/g, '')) || 100;
    if (strategy === 'range') {
      const match = shards.find(s => num >= (s.rangeMin || 0) && num <= (s.rangeMax || 999));
      return match || shards[0];
    } else if (strategy === 'hash') {
      // Hash key % shard count
      let hash = 0;
      for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
      const index = Math.abs(hash) % shards.length;
      return shards[index];
    } else {
      // Directory-based
      const index = num % shards.length;
      return shards[index];
    }
  };

  const handleInsert = (key: string) => {
    const target = getTargetShard(key);
    setShards(prev => prev.map(s => {
      if (s.id === target.id) {
        if (s.keys.includes(key)) return s;
        return { ...s, keys: [...s.keys, key] };
      }
      return s;
    }));
    setLookupResult(`Inserted "${key}" into [${target.name}]`);
  };

  const handleAddShard = () => {
    if (shards.length >= 6) return;
    const newId = `shard-${shards.length}`;
    const newName = `Shard Node ${shards.length}`;
    setShards(prev => [...prev, { id: newId, name: newName, keys: [] }]);
    setLookupResult(`Added new node "${newName}". Note: Hash keys may require re-sharding.`);
  };

  const handleRebalance = () => {
    // Collect all keys
    const allKeys = shards.flatMap(s => s.keys);
    const newShards = shards.map(s => ({ ...s, keys: [] as string[] }));

    for (const key of allKeys) {
      let hash = 0;
      for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
      const idx = Math.abs(hash) % newShards.length;
      newShards[idx].keys.push(key);
    }

    setShards(newShards);
    setLookupResult('Cluster rebalanced across all active nodes.');
  };

  const handleReset = () => {
    setStrategy('hash');
    setShards([
      { id: 'shard-0', name: 'Shard Node 0', rangeMin: 1, rangeMax: 333, keys: ['user:12', 'user:88', 'user:140', 'user:210'] },
      { id: 'shard-1', name: 'Shard Node 1', rangeMin: 334, rangeMax: 666, keys: ['user:350', 'user:412', 'user:555'] },
      { id: 'shard-2', name: 'Shard Node 2', rangeMin: 667, rangeMax: 999, keys: ['user:710', 'user:820', 'user:930', 'user:990'] },
    ]);
    setLookupResult(null);
  };

  const totalKeys = shards.reduce((acc, s) => acc + s.keys.length, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Database className="w-4 h-4 mr-2 text-amber-500" />
            Sharding Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-1.5">
              Partitioning Strategy
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'hash', label: 'Hash' },
                { id: 'range', label: 'Range' },
                { id: 'directory', label: 'Directory' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStrategy(opt.id as any)}
                  className={`p-2 rounded-lg border text-center font-medium transition ${
                    strategy === opt.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block">
              Test Key Routing / Insertion
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputUserId}
                onChange={e => setInputUserId(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-gray-100"
                placeholder="user:ID"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleInsert(inputUserId)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Insert
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddShard}
              disabled={shards.length >= 6}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Add Node
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRebalance}
              className="flex-1"
            >
              Rebalance Keys
            </Button>
          </div>
        </div>

        {lookupResult && (
          <div className="p-3 bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 text-xs font-mono text-amber-600 dark:text-amber-400">
            {lookupResult}
          </div>
        )}
      </Card>

      {/* Visual Shard Cluster */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Active Shards: {shards.length}</span>
          <span>Total Records: {totalKeys}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shards.map((shard, idx) => {
            const loadPercent = totalKeys > 0 ? Math.round((shard.keys.length / totalKeys) * 100) : 0;
            const isHotspot = loadPercent > 50 && totalKeys > 4;

            return (
              <Card
                key={shard.id}
                className={`p-4 space-y-3 border transition-all ${
                  isHotspot ? 'border-rose-500 bg-rose-50/10' : 'border-slate-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {shard.name}
                    </span>
                  </div>
                  {isHotspot && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      HOTSPOT
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isHotspot ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>Keys: {shard.keys.length}</span>
                  <span>{loadPercent}% cluster load</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-gray-800 flex flex-wrap gap-1">
                  {shard.keys.map(k => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 font-mono text-[10px]"
                    >
                      {k}
                    </span>
                  ))}
                  {shard.keys.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic">No keys partitioned here.</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
