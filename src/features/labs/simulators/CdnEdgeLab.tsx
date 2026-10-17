import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Slider } from '../../../components/common/Slider';
import { RotateCcw, Share2, Globe, Zap, ArrowRight } from 'lucide-react';

interface EdgeRegion {
  id: string;
  name: string;
  originLatencyMs: number;
  edgeLatencyMs: number;
  isCached: boolean;
}

export const CdnEdgeLab: React.FC = () => {
  const [regions, setRegions] = useState<EdgeRegion[]>([
    { id: 'na', name: 'North America (US-East)', originLatencyMs: 45, edgeLatencyMs: 12, isCached: true },
    { id: 'eu', name: 'Europe (London POP)', originLatencyMs: 140, edgeLatencyMs: 15, isCached: true },
    { id: 'ap', name: 'Asia-Pacific (Tokyo POP)', originLatencyMs: 230, edgeLatencyMs: 20, isCached: false },
    { id: 'sa', name: 'South America (Sao Paulo)', originLatencyMs: 190, edgeLatencyMs: 25, isCached: false },
  ]);

  const [cacheTTL, setCacheTTL] = useState<number>(3600);
  const [stats, setStats] = useState({ edgeHits: 12, originMisses: 4, bandwidthSavedMb: 850 });
  const [lastRequestLog, setLastRequestLog] = useState<string>('Ready to test regional latencies.');

  const handleSimulateRequest = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    if (!region) return;

    if (region.isCached) {
      setStats(prev => ({
        ...prev,
        edgeHits: prev.edgeHits + 1,
        bandwidthSavedMb: prev.bandwidthSavedMb + 15,
      }));
      setLastRequestLog(`EDGE HIT in ${region.name}: Response served in ${region.edgeLatencyMs}ms (Saved ${region.originLatencyMs - region.edgeLatencyMs}ms latency).`);
    } else {
      setStats(prev => ({ ...prev, originMisses: prev.originMisses + 1 }));
      setLastRequestLog(`EDGE MISS in ${region.name}: Round-trip to Origin took ${region.originLatencyMs}ms. Asset now cached at edge POP.`);

      // Mark as cached
      setRegions(prev => prev.map(r => r.id === regionId ? { ...r, isCached: true } : r));
    }
  };

  const handlePurgeAll = () => {
    setRegions(prev => prev.map(r => ({ ...r, isCached: false })));
    setLastRequestLog('Global CDN Cache Purged. All edge POPs cleared.');
  };

  const handleReset = () => {
    setRegions([
      { id: 'na', name: 'North America (US-East)', originLatencyMs: 45, edgeLatencyMs: 12, isCached: true },
      { id: 'eu', name: 'Europe (London POP)', originLatencyMs: 140, edgeLatencyMs: 15, isCached: true },
      { id: 'ap', name: 'Asia-Pacific (Tokyo POP)', originLatencyMs: 230, edgeLatencyMs: 20, isCached: false },
      { id: 'sa', name: 'South America (Sao Paulo)', originLatencyMs: 190, edgeLatencyMs: 25, isCached: false },
    ]);
    setStats({ edgeHits: 0, originMisses: 0, bandwidthSavedMb: 0 });
    setLastRequestLog('CDN simulator reset.');
  };

  const totalReqs = stats.edgeHits + stats.originMisses;
  const offloadRatio = totalReqs > 0 ? Math.round((stats.edgeHits / totalReqs) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="p-5 space-y-6 lg:col-span-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-gray-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Globe className="w-4 h-4 mr-2 text-cyan-500" />
            CDN & Edge Controls
          </h3>
          <Button variant="ghost" size="sm" onClick={handleReset} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          <Slider
            label="Cache-Control max-age (TTL)"
            value={cacheTTL}
            min={60}
            max={86400}
            step={300}
            unit="s"
            onChange={setCacheTTL}
            description="Duration edge POPs preserve assets before revalidating with Origin."
          />

          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Simulate User Request From:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {regions.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSimulateRequest(r.id)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-left font-medium transition"
                >
                  {r.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-rose-500 hover:bg-rose-50"
              onClick={handlePurgeAll}
            >
              Purge Global CDN Cache
            </Button>
          </div>
        </div>

        <div className="p-3 bg-slate-100 dark:bg-gray-800 rounded-lg text-xs font-mono text-cyan-600 dark:text-cyan-400">
          {lastRequestLog}
        </div>
      </Card>

      {/* Regional POPs and Latency Comparison */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Origin Offload Ratio</span>
            <div className="text-2xl font-bold font-mono text-cyan-500">{offloadRatio}%</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Edge Cache Hits</span>
            <div className="text-2xl font-bold font-mono text-emerald-500">{stats.edgeHits}</div>
          </Card>
          <Card className="p-4 text-center">
            <span className="text-xs text-slate-500 uppercase">Bandwidth Offloaded</span>
            <div className="text-2xl font-bold font-mono text-blue-500">{stats.bandwidthSavedMb} MB</div>
          </Card>
        </div>

        <Card className="p-5 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Global Edge POP Performance vs Origin (us-central1)
          </div>

          <div className="space-y-4">
            {regions.map(region => (
              <div key={region.id} className="p-3 rounded-lg border border-slate-200 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 dark:text-white">{region.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${region.isCached ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40' : 'bg-slate-100 text-slate-500'}`}>
                    {region.isCached ? 'Edge Cached' : 'Cache Expired'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Direct Origin Latency:</span>
                    <span className="font-mono text-rose-500 font-bold">{region.originLatencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">CDN Edge POP Latency:</span>
                    <span className="font-mono text-emerald-500 font-bold">{region.edgeLatencyMs} ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
