import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Zap, Database, ArrowRight, Play, CheckCircle2, XCircle } from 'lucide-react';

interface CacheItem {
  key: string;
  value: string;
  lastAccessed: number;
  accessCount: number;
  isDirty?: boolean; // For write-back cache
}

export const CachingStrategiesLab: React.FC = () => {
  const [strategy, setStrategy] = useState<'cache_aside' | 'write_through' | 'write_back' | 'write_around'>('cache_aside');
  const [evictionPolicy, setEvictionPolicy] = useState<'lru' | 'lfu'>('lru');
  const [cacheCapacity, setCacheCapacity] = useState<number>(5);

  const [cache, setCache] = useState<CacheItem[]>([
    { key: 'user:101', value: 'Alice (Pro)', lastAccessed: 1, accessCount: 12 },
    { key: 'user:102', value: 'Bob (Free)', lastAccessed: 2, accessCount: 4 },
    { key: 'user:103', value: 'Charlie (Team)', lastAccessed: 3, accessCount: 8 },
  ]);

  const [database, setDatabase] = useState<Record<string, string>>({
    'user:101': 'Alice (Pro)',
    'user:102': 'Bob (Free)',
    'user:103': 'Charlie (Team)',
    'user:104': 'Diana (Enterprise)',
    'user:105': 'Evan (Pro)',
    'user:106': 'Fiona (Free)',
  });

  const [stats, setStats] = useState({ hits: 18, misses: 5, dbReads: 5, dbWrites: 2 });
  const [recentAction, setRecentAction] = useState<string>('Ready for cache operations.');

  const handleRead = (key: string) => {
    const foundInCache = cache.find(item => item.key === key);

    if (foundInCache) {
      // CACHE HIT
      setStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      setRecentAction(`CACHE HIT for "${key}". Served in ~2ms from memory.`);

      setCache(prev => prev.map(item => {
        if (item.key === key) {
          return {
            ...item,
            lastAccessed: Date.now(),
            accessCount: item.accessCount + 1,
          };
        }
        return item;
      }));
    } else {
      // CACHE MISS
      const valInDb = database[key] || 'Generated Record';
      setStats(prev => ({ ...prev, misses: prev.misses + 1, dbReads: prev.dbReads + 1 }));
      setRecentAction(`CACHE MISS for "${key}". Read from DB (~25ms), loaded into cache.`);

      // Add to cache with eviction if full
      setCache(prev => {
        let items = [...prev];
        if (items.length >= cacheCapacity) {
          // Evict
          if (evictionPolicy === 'lru') {
            items.sort((a, b) => a.lastAccessed - b.lastAccessed);
          } else {
            items.sort((a, b) => a.accessCount - b.accessCount);
          }
          const evicted = items.shift();
          if (evicted && evicted.isDirty) {
            // Write-back flush to DB
            setDatabase(db => ({ ...db, [evicted.key]: evicted.value }));
            setStats(s => ({ ...s, dbWrites: s.dbWrites + 1 }));
          }
        }
        items.push({
          key,
          value: valInDb,
          lastAccessed: Date.now(),
          accessCount: 1,
        });
        return items;
      });
    }
  };

  const handleWrite = (key: string, newValue: string) => {
    if (strategy === 'cache_aside') {
      // Update DB, invalidate/evict cache key
      setDatabase(prev => ({ ...prev, [key]: newValue }));
      setCache(prev => prev.filter(item => item.key !== key));
      setStats(prev => ({ ...prev, dbWrites: prev.dbWrites + 1 }));
      setRecentAction(`Cache-Aside Write: Updated DB, invalidated cache key "${key}".`);
    } else if (strategy === 'write_through') {
      // Write to cache and DB synchronously
      setDatabase(prev => ({ ...prev, [key]: newValue }));
      setCache(prev => {
        const exists = prev.some(i => i.key === key);
        if (exists) {
          return prev.map(i => i.key === key ? { ...i, value: newValue, lastAccessed: Date.now() } : i);
        }
        let items = [...prev];
        if (items.length >= cacheCapacity) {
          items.sort((a, b) => a.lastAccessed - b.lastAccessed);
          items.shift();
        }
        items.push({ key, value: newValue, lastAccessed: Date.now(), accessCount: 1 });
        return items;
      });
      setStats(prev => ({ ...prev, dbWrites: prev.dbWrites + 1 }));
      setRecentAction(`Write-Through: Synchronously updated both Cache and Database.`);
    } else if (strategy === 'write_back') {
      // Write to cache immediately, mark dirty, flush to DB asynchronously
      setCache(prev => {
        const exists = prev.some(i => i.key === key);
        if (exists) {
          return prev.map(i => i.key === key ? { ...i, value: newValue, lastAccessed: Date.now(), isDirty: true } : i);
        }
        let items = [...prev];
        if (items.length >= cacheCapacity) {
          items.sort((a, b) => a.lastAccessed - b.lastAccessed);
          const evicted = items.shift();
          if (evicted && evicted.isDirty) {
            setDatabase(db => ({ ...db, [evicted.key]: evicted.value }));
            setStats(s => ({ ...s, dbWrites: s.dbWrites + 1 }));
          }
        }
        items.push({ key, value: newValue, lastAccessed: Date.now(), accessCount: 1, isDirty: true });
        return items;
      });
      setRecentAction(`Write-Back: Updated memory cache instantly (~1ms). Marked DIRTY for background flush.`);
    } else {
      // Write-Around: write directly to DB, bypass cache
      setDatabase(prev => ({ ...prev, [key]: newValue }));
      setStats(prev => ({ ...prev, dbWrites: prev.dbWrites + 1 }));
      setRecentAction(`Write-Around: Written directly to DB. Cache untouched (prevents cache pollution).`);
    }
  };

  const handleReset = () => {
    setStrategy('cache_aside');
    setEvictionPolicy('lru');
    setCacheCapacity(5);
    setCache([
      { key: 'user:101', value: 'Alice (Pro)', lastAccessed: 1, accessCount: 12 },
      { key: 'user:102', value: 'Bob (Free)', lastAccessed: 2, accessCount: 4 },
      { key: 'user:103', value: 'Charlie (Team)', lastAccessed: 3, accessCount: 8 },
    ]);
    setDatabase({
      'user:101': 'Alice (Pro)',
      'user:102': 'Bob (Free)',
      'user:103': 'Charlie (Team)',
      'user:104': 'Diana (Enterprise)',
      'user:105': 'Evan (Pro)',
      'user:106': 'Fiona (Free)',
    });
    setStats({ hits: 0, misses: 0, dbReads: 0, dbWrites: 0 });
    setRecentAction('Cache reset to default state.');
  };

  const totalReqs = stats.hits + stats.misses;
  const hitRatio = totalReqs > 0 ? Math.round((stats.hits / totalReqs) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration & Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Zap className="w-4 h-4 mr-2 text-amber-500" />
            Caching Engine Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-1.5">
              Caching Strategy
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'cache_aside', label: 'Cache-Aside' },
                { id: 'write_through', label: 'Write-Through' },
                { id: 'write_back', label: 'Write-Back (Write-Behind)' },
                { id: 'write_around', label: 'Write-Around' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setStrategy(opt.id as any)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
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

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 block mb-1.5">
              Eviction Algorithm
            </label>
            <div className="flex space-x-2 text-xs">
              <button
                onClick={() => setEvictionPolicy('lru')}
                className={`flex-1 py-1.5 rounded-lg border text-center transition ${
                  evictionPolicy === 'lru'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400'
                }`}
              >
                Least Recently Used (LRU)
              </button>
              <button
                onClick={() => setEvictionPolicy('lfu')}
                className={`flex-1 py-1.5 rounded-lg border text-center transition ${
                  evictionPolicy === 'lfu'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400'
                }`}
              >
                Least Frequently Used (LFU)
              </button>
            </div>
          </div>

          <Slider
            label="Cache Memory Capacity (Slots)"
            value={cacheCapacity}
            min={3}
            max={8}
            step={1}
            unit=" slots"
            onChange={setCacheCapacity}
            description="Slot limit triggers automatic eviction when exceeded."
          />

          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Trigger Read Requests:
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['user:101', 'user:102', 'user:103', 'user:104', 'user:105', 'user:106'].map(key => (
                <button
                  key={key}
                  onClick={() => handleRead(key)}
                  className="px-2 py-1.5 bg-slate-100 dark:bg-gray-800 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40 rounded text-xs font-mono transition"
                >
                  Read {key.split(':')[1]}
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">
              Trigger Write Mutation:
            </div>
            <button
              onClick={() => handleWrite('user:101', `Alice (Updated ${Math.floor(Math.random() * 900 + 100)})`)}
              className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium transition"
            >
              Write update to user:101
            </button>
          </div>
        </div>

        {/* Live Action Callout */}
        <div className="p-3 bg-slate-100 dark:bg-gray-800/60 rounded-lg border border-slate-200 dark:border-gray-700 text-xs">
          <span className="font-semibold text-slate-700 dark:text-gray-300 block mb-0.5">Last Operation:</span>
          <span className="font-mono text-slate-600 dark:text-gray-400">{recentAction}</span>
        </div>
      </Card>

      {/* Visual Cache & Database State */}
      <div className="lg:col-span-2 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <span className="text-[11px] text-slate-500 uppercase">Cache Hit Ratio</span>
            <div className="text-xl font-bold font-mono text-amber-500">{hitRatio}%</div>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[11px] text-slate-500 uppercase">Cache Hits</span>
            <div className="text-xl font-bold font-mono text-emerald-500">{stats.hits}</div>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[11px] text-slate-500 uppercase">Cache Misses</span>
            <div className="text-xl font-bold font-mono text-rose-500">{stats.misses}</div>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-[11px] text-slate-500 uppercase">Database Queries</span>
            <div className="text-xl font-bold font-mono text-blue-500">{stats.dbReads + stats.dbWrites}</div>
          </Card>
        </div>

        {/* In-Memory Cache Visualizer */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                In-Memory Cache (Redis)
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {cache.length}/{cacheCapacity} slots used
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cache.map(item => (
              <div
                key={item.key}
                className="p-3 rounded-lg border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 text-xs space-y-1 relative"
              >
                {item.isDirty && (
                  <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500 text-white">
                    DIRTY
                  </span>
                )}
                <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {item.key}
                </div>
                <div className="text-slate-800 dark:text-gray-200 truncate">
                  {item.value}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-gray-800">
                  <span>Hits: {item.accessCount}</span>
                  <span>{evictionPolicy.toUpperCase()} safe</span>
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, cacheCapacity - cache.length) }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-gray-800 text-center text-xs text-slate-400 flex items-center justify-center min-h-[75px]"
              >
                Empty Slot
              </div>
            ))}
          </div>
        </Card>

        {/* Database Visualizer */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Persistent Database (PostgreSQL)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(database).map(([k, v]) => (
              <div
                key={k}
                className="p-2.5 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs"
              >
                <div className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{k}</div>
                <div className="text-slate-600 dark:text-gray-300 truncate">{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
