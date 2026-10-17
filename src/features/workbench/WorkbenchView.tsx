import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../storage/localStorage';
import { COMPONENT_PALETTE, STARTER_ARCHITECTURES } from '../../storage/initialData';
import {
  ArchitectureDocument,
  ArchitectureNode,
  ArchitectureEdge,
  ComponentPaletteItem,
  ConnectionProtocol,
  NodeCategory,
} from '../../types/workbench';
import { validateArchitectureDocument } from '../../utils/validation';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Link as LinkIcon,
  X,
  FileCode,
  CheckCircle2,
  Info,
  ChevronRight,
} from 'lucide-react';

export const WorkbenchView: React.FC = () => {
  // Load saved or default architecture
  const [doc, setDoc] = useState<ArchitectureDocument>(() => {
    const current = storage.getCurrentArchitecture();
    return current || STARTER_ARCHITECTURES[0];
  });

  const [savedDocs, setSavedDocs] = useState<ArchitectureDocument[]>(() => storage.getSavedArchitectures());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to model distributed architecture.');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<SVGSVGElement>(null);

  // Auto-save current architecture
  useEffect(() => {
    storage.saveCurrentArchitecture(doc);
  }, [doc]);

  const selectedNode = doc.nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = doc.edges.find(e => e.id === selectedEdgeId);

  // System Bottleneck & Reliability Analysis
  const analysis = useMemo(() => {
    const spofs: string[] = [];
    const warnings: string[] = [];

    // Check replicas & SPOFs
    doc.nodes.forEach(node => {
      if (node.replicas === 1 && (node.category === 'service' || node.category === 'storage' || node.category === 'edge')) {
        spofs.push(node.id);
        warnings.push(`Single point of failure detected on [${node.name}]: only 1 replica configured.`);
      }
    });

    // Calculate throughput bound
    const bottleneckNode = doc.nodes.length > 0 
      ? [...doc.nodes].sort((a, b) => (a.capacityQps * a.replicas) - (b.capacityQps * b.replicas))[0] 
      : undefined;

    const maxThroughputQps = bottleneckNode 
      ? bottleneckNode.capacityQps * bottleneckNode.replicas 
      : 0;

    // Total estimated latency
    const totalLatency = doc.nodes.reduce((acc, n) => acc + n.avgLatencyMs, 0) + 
      doc.edges.reduce((acc, e) => acc + (e.latencyMs || 2), 0);

    return {
      spofs,
      warnings,
      bottleneckNode,
      maxThroughputQps,
      totalLatency,
    };
  }, [doc]);

  // Node Drag handlers
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingSourceId) {
      if (connectingSourceId !== nodeId) {
        // Create new edge
        const newEdge: ArchitectureEdge = {
          id: `edge-${Date.now()}`,
          fromNodeId: connectingSourceId,
          toNodeId: nodeId,
          protocol: 'http_rest',
          latencyMs: 3,
          estimatedQps: 5000,
        };
        setDoc(prev => ({ ...prev, edges: [...prev.edges, newEdge] }));
        setStatusMessage(`Connected nodes: ${connectingSourceId} → ${nodeId}`);
      }
      setConnectingSourceId(null);
      return;
    }

    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    setDraggingNodeId(nodeId);

    const targetNode = doc.nodes.find(n => n.id === nodeId);
    if (targetNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - targetNode.x,
        y: e.clientY - rect.top - targetNode.y,
      });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 160, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(20, Math.min(rect.height - 100, e.clientY - rect.top - dragOffset.y));

    setDoc(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n),
    }));
  };

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null);
  };

  // Add component from palette
  const handleAddComponent = (item: ComponentPaletteItem) => {
    const newNodeId = `node-${Date.now().toString().slice(-4)}`;
    const newNode: ArchitectureNode = {
      id: newNodeId,
      name: item.name,
      type: item.type,
      category: item.category,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      replicas: 2,
      capacityQps: item.defaultQps,
      avgLatencyMs: item.defaultLatencyMs,
    };
    setDoc(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedNodeId(newNodeId);
    setStatusMessage(`Added [${item.name}] to canvas.`);
  };

  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      setDoc(prev => ({
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== selectedNodeId),
        edges: prev.edges.filter(e => e.fromNodeId !== selectedNodeId && e.toNodeId !== selectedNodeId),
      }));
      setSelectedNodeId(null);
      setStatusMessage('Node and associated edges deleted.');
    } else if (selectedEdgeId) {
      setDoc(prev => ({
        ...prev,
        edges: prev.edges.filter(e => e.id !== selectedEdgeId),
      }));
      setSelectedEdgeId(null);
      setStatusMessage('Connection deleted.');
    }
  };

  // Document management
  const handleSaveDocument = () => {
    const updatedDocs = [...savedDocs.filter(d => d.id !== doc.id), doc];
    setSavedDocs(updatedDocs);
    storage.saveArchitectures(updatedDocs);
    setStatusMessage(`Architecture "${doc.title}" saved locally.`);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}-architecture.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Architecture exported as JSON.');
  };

  const handleImportSubmit = () => {
    const result = validateArchitectureDocument(importJsonText);
    if (!result.isValid || !result.document) {
      setImportError(result.error || 'Invalid architecture schema.');
      return;
    }
    setDoc(result.document);
    setIsImportModalOpen(false);
    setImportJsonText('');
    setImportError(null);
    setStatusMessage(`Successfully imported "${result.document.title}".`);
  };

  const handleLoadStarter = (starter: ArchitectureDocument) => {
    setDoc(starter);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setStatusMessage(`Loaded starter template: "${starter.title}".`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden select-none bg-slate-50 dark:bg-gray-950">
      {/* Workbench Toolbar */}
      <div className="h-13 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={doc.title}
            onChange={e => setDoc(prev => ({ ...prev, title: e.target.value }))}
            className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-gray-700 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white px-1 py-0.5"
          />

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ({doc.nodes.length} nodes, {doc.edges.length} connections)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Starters selector */}
          <select
            onChange={e => {
              const found = STARTER_ARCHITECTURES.find(s => s.id === e.target.value);
              if (found) handleLoadStarter(found);
            }}
            className="text-xs bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-gray-300 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Load Starter Templates...</option>
            {STARTER_ARCHITECTURES.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDocument}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportJsonText('');
              setImportError(null);
              setIsImportModalOpen(true);
            }}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Import JSON
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDoc({
                id: `arch-${Date.now()}`,
                title: 'New Distributed Architecture',
                description: '',
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                nodes: [],
                edges: [],
              });
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
              setStatusMessage('Created new blank architecture.');
            }}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Component Palette */}
        <div className="w-56 bg-white dark:bg-gray-900 border-r border-slate-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto p-3 space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
            System Components
          </div>

          <div className="space-y-1">
            {COMPONENT_PALETTE.map(item => (
              <button
                key={item.type}
                onClick={() => handleAddComponent(item)}
                className="w-full p-2 rounded-lg text-left border border-slate-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.name}
                  </span>
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                  {item.category} • {item.defaultQps} QPS
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Interactive SVG Canvas */}
        <div 
          className="flex-1 relative overflow-hidden canvas-grid-pattern cursor-crosshair"
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
        >
          {/* Status Message pill */}
          <div className="absolute top-3 left-4 z-10 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs border border-slate-200 dark:border-gray-800 text-xs text-slate-600 dark:text-gray-400 shadow-sm flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{connectingSourceId ? `Click another node to connect from [${connectingSourceId}]...` : statusMessage}</span>
          </div>

          {/* SVG Canvas */}
          <svg
            ref={canvasRef}
            className="w-full h-full"
            onClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
              setConnectingSourceId(null);
            }}
          >
            {/* Draw Edges / Connections */}
            {doc.edges.map(edge => {
              const fromNode = doc.nodes.find(n => n.id === edge.fromNodeId);
              const toNode = doc.nodes.find(n => n.id === edge.toNodeId);
              if (!fromNode || !toNode) return null;

              const isSelected = selectedEdgeId === edge.id;
              const x1 = fromNode.x + 75;
              const y1 = fromNode.y + 35;
              const x2 = toNode.x + 75;
              const y2 = toNode.y + 35;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={edge.id} onClick={e => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isSelected ? '#3B82F6' : '#94A3B8'}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray={edge.protocol === 'async_event' ? '4 4' : 'none'}
                    className="cursor-pointer hover:stroke-blue-400 transition"
                  />
                  {/* Midpoint Label badge */}
                  <rect
                    x={midX - 35}
                    y={midY - 10}
                    width={70}
                    height={20}
                    rx={4}
                    fill={isSelected ? '#2563EB' : '#1E293B'}
                    opacity={0.9}
                    className="cursor-pointer"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9px"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {edge.protocol.replace('_', ' ')}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {doc.nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const isSource = connectingSourceId === node.id;
              const isSpof = analysis.spofs.includes(node.id);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={e => handleMouseDownNode(e, node.id)}
                  className="cursor-move select-none"
                >
                  <rect
                    width={150}
                    height={70}
                    rx={8}
                    fill={isSelected ? '#1E293B' : '#0F172A'}
                    stroke={
                      isSource
                        ? '#06B6D4'
                        : isSelected
                        ? '#3B82F6'
                        : isSpof
                        ? '#EF4444'
                        : '#334155'
                    }
                    strokeWidth={isSelected || isSource ? 2.5 : 1.5}
                    className="shadow-lg transition-all"
                  />

                  {/* Node Title */}
                  <text
                    x={12}
                    y={24}
                    fill="#F8FAFC"
                    fontSize="12px"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {node.name.length > 18 ? node.name.slice(0, 16) + '...' : node.name}
                  </text>

                  {/* Replicas & Category */}
                  <text
                    x={12}
                    y={44}
                    fill="#94A3B8"
                    fontSize="10px"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {node.replicas}x replicas • {node.category}
                  </text>

                  {/* Metrics */}
                  <text
                    x={12}
                    y={58}
                    fill="#38BDF8"
                    fontSize="9px"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {node.capacityQps} QPS • {node.avgLatencyMs}ms
                  </text>

                  {/* Connect port trigger */}
                  <circle
                    cx={140}
                    cy={35}
                    r={6}
                    fill={isSource ? '#06B6D4' : '#64748B'}
                    className="cursor-pointer hover:fill-blue-400"
                    onClick={e => {
                      e.stopPropagation();
                      setConnectingSourceId(node.id);
                    }}
                  >
                    <title>Click to draw connection</title>
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Inspector & System Analysis Panel */}
        <div className="w-72 bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
          {/* Selected Node or Edge Inspector */}
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Node Inspector
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Node Label</label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={e => setDoc(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, name: e.target.value } : n),
                    }))}
                    className="w-full p-2 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Instance Replicas</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={selectedNode.replicas}
                    onChange={e => setDoc(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, replicas: Number(e.target.value) } : n),
                    }))}
                    className="w-full p-2 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Per-Instance Capacity (QPS)</label>
                  <input
                    type="number"
                    step={1000}
                    value={selectedNode.capacityQps}
                    onChange={e => setDoc(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, capacityQps: Number(e.target.value) } : n),
                    }))}
                    className="w-full p-2 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Average Latency (ms)</label>
                  <input
                    type="number"
                    min={1}
                    value={selectedNode.avgLatencyMs}
                    onChange={e => setDoc(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, avgLatencyMs: Number(e.target.value) } : n),
                    }))}
                    className="w-full p-2 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200 font-mono"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setConnectingSourceId(selectedNode.id)}
                  icon={<LinkIcon className="w-3.5 h-3.5" />}
                >
                  Connect to Node...
                </Button>
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-gray-800">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Connection Inspector
                </span>
                <button
                  onClick={handleDeleteSelected}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete connection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Transport Protocol</label>
                  <select
                    value={selectedEdge.protocol}
                    onChange={e => setDoc(prev => ({
                      ...prev,
                      edges: prev.edges.map(ed => ed.id === selectedEdge.id ? { ...ed, protocol: e.target.value as ConnectionProtocol } : ed),
                    }))}
                    className="w-full p-2 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-800 dark:text-gray-200"
                  >
                    <option value="http_rest">HTTP / REST</option>
                    <option value="grpc">gRPC / Protobuf</option>
                    <option value="websocket">WebSocket</option>
                    <option value="graphql">GraphQL</option>
                    <option value="async_event">Async Event (Kafka/AMQP)</option>
                    <option value="tcp">TCP Socket</option>
                    <option value="sql">SQL Database Connection</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Estimated QPS</label>
                  <input
                    type="number"
                    value={selectedEdge.estimatedQps || 5000}
                    onChange={e => setDoc(prev => ({
                      ...prev,
                      edges: prev.edges.map(ed => ed.id === selectedEdge.id ? { ...ed, estimatedQps: Number(e.target.value) } : ed),
                    }))}
                    className="w-full p-2 rounded bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-gray-500 italic text-center py-4">
              Click any node or connection on the canvas to inspect and configure properties.
            </div>
          )}

          {/* Real-time System Analysis */}
          <div className="pt-4 border-t border-slate-200 dark:border-gray-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              System Health & Latency Analysis
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Total Latency:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {analysis.totalLatency} ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cluster Max Throughput:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {analysis.maxThroughputQps.toLocaleString()} QPS
                </span>
              </div>
              {analysis.bottleneckNode && (
                <div className="flex justify-between">
                  <span className="text-slate-500">System Bottleneck:</span>
                  <span className="font-mono text-amber-500 font-semibold truncate ml-2">
                    {analysis.bottleneckNode.name}
                  </span>
                </div>
              )}
            </div>

            {/* Warnings & SPOFs */}
            {analysis.warnings.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {analysis.warnings.map((w, idx) => (
                  <div key={idx} className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-600 dark:text-rose-400 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Import Architecture JSON
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste a previously exported System Design Atlas JSON document. The schema will be safely validated before loading.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              placeholder="Paste JSON document here..."
              className="w-full p-3 text-xs font-mono bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />

            {importError && (
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 text-xs font-mono">
                {importError}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleImportSubmit}>
                Validate & Load
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
