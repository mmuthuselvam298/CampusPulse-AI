import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Layers, 
  Calendar, 
  Mail, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  Info,
  Maximize2,
  Table as TableIcon
} from 'lucide-react';
import { KnowledgeGraphData, KnowledgeGraphNode, KnowledgeGraphEdge, GraphNodeType } from '../../types';
import { ApiService } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const KnowledgeGraphPage: React.FC = () => {
  const { openEmailById, setCurrentTab } = useApp();
  const [data, setData] = useState<KnowledgeGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getKnowledgeGraph();
      setData(res);
      if (res.nodes.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load knowledge graph:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = data?.nodes.filter(n => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'GMAIL') return n.type === 'GMAIL';
    if (activeFilter === 'CLASSROOM') return n.type === 'CLASSROOM' || n.type === 'COURSE' || n.type === 'ANNOUNCEMENT';
    if (activeFilter === 'CALENDAR') return n.type === 'CALENDAR';
    if (activeFilter === 'ACTIONS') return n.type === 'ACTION';
    if (activeFilter === 'DEADLINES') return n.type === 'DEADLINE';
    return true;
  }) || [];

  const getNodeColor = (type: GraphNodeType) => {
    switch (type) {
      case 'COURSE':
        return '#4F46E5'; // indigo
      case 'GMAIL':
        return '#EF4444'; // red
      case 'CLASSROOM':
        return '#10B981'; // emerald
      case 'CALENDAR':
        return '#3B82F6'; // blue
      case 'ACTION':
        return '#F59E0B'; // amber
      case 'DEADLINE':
        return '#EC4899'; // pink
      case 'TOPIC':
        return '#8B5CF6'; // purple
      default:
        return '#64748B'; // slate
    }
  };

  const handleNodeClick = (node: KnowledgeGraphNode) => {
    setSelectedNode(node);
    if (node.source === 'gmail' && node.sourceId) {
      openEmailById(node.sourceId);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node position arrangement
  const calculateNodePos = (index: number, total: number) => {
    if (index === 0) return { x: 450, y: 300 }; // Center
    const angle = (index / total) * 2 * Math.PI;
    const radius = 180 + (index % 3) * 60;
    return {
      x: 450 + radius * Math.cos(angle),
      y: 300 + radius * Math.sin(angle)
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            <span>Cross-System Relationship Mapping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Campus Knowledge Graph
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Real multi-system graph connecting Gmail notices, Classroom coursework, Google Calendar events, and student action items into one interconnected universe.
          </p>
        </div>

        {/* View Mode Toggle & Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'graph' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Graph</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table Fallback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'GMAIL', 'CLASSROOM', 'CALENDAR', 'ACTIONS', 'DEADLINES'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
        {data?.summary && (
          <span className="ml-auto text-xs font-semibold text-slate-400 hidden md:inline">
            {filteredNodes.length} nodes · {data.edges.length} cross-system edges
          </span>
        )}
      </div>

      {/* Main Graph Canvas or Fallback View */}
      {viewMode === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Interactive SVG Canvas */}
          <div className="lg:col-span-3 bg-slate-900 rounded-3xl border border-slate-800 shadow-lg h-[580px] relative overflow-hidden flex flex-col justify-between select-none">
            {/* Controls Bar */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 text-white">
              <button
                onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute top-4 left-4 z-20 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span>Drag to pan · Click any node to open details</span>
            </div>

            {/* SVG Renderer */}
            <div 
              className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <svg 
                className="w-full h-full"
                viewBox="0 0 900 600"
              >
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Edges */}
                  {data?.edges.map((edge, idx) => {
                    const srcIndex = filteredNodes.findIndex(n => n.id === edge.source);
                    const tgtIndex = filteredNodes.findIndex(n => n.id === edge.target);
                    if (srcIndex === -1 || tgtIndex === -1) return null;

                    const p1 = calculateNodePos(srcIndex, filteredNodes.length);
                    const p2 = calculateNodePos(tgtIndex, filteredNodes.length);

                    return (
                      <g key={edge.id || idx}>
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke="#334155"
                          strokeWidth="1.5"
                          strokeDasharray={edge.type === 'HAS_DEADLINE' ? '4 4' : undefined}
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {filteredNodes.map((node, idx) => {
                    const pos = calculateNodePos(idx, filteredNodes.length);
                    const isSelected = selectedNode?.id === node.id;
                    const color = getNodeColor(node.type);

                    return (
                      <g 
                        key={node.id} 
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeClick(node);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Glow halo on select */}
                        {isSelected && (
                          <circle r="26" fill={color} fillOpacity="0.25" className="animate-pulse" />
                        )}

                        <circle 
                          r={node.id === 'node-campuspulse' ? '22' : '16'}
                          fill={color}
                          stroke={isSelected ? '#FFFFFF' : '#1E293B'}
                          strokeWidth="2.5"
                          className="transition-transform group-hover:scale-125"
                        />

                        {/* Label text */}
                        <text
                          y={node.id === 'node-campuspulse' ? '32' : '26'}
                          textAnchor="middle"
                          fill="#E2E8F0"
                          fontSize="10"
                          fontWeight="600"
                          className="pointer-events-none select-none"
                        >
                          {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Node Detail Side Inspector */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span 
                    className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white"
                    style={{ backgroundColor: getNodeColor(selectedNode.type) }}
                  >
                    {selectedNode.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium capitalize">
                    Source: {selectedNode.source}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedNode.label}
                  </h3>
                  {selectedNode.timestamp && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedNode.timestamp}</span>
                    </p>
                  )}
                </div>

                {/* Details Breakdown */}
                {selectedNode.details && (
                  <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {Object.entries(selectedNode.details).map(([key, val]) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="text-slate-500 capitalize">{key}:</span>
                        <span className="font-semibold text-slate-800 text-right truncate max-w-[140px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cross-Link Actions */}
                <div className="pt-2 space-y-2">
                  {selectedNode.source === 'gmail' && selectedNode.sourceId && (
                    <button
                      onClick={() => openEmailById(selectedNode.sourceId!)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open Original Gmail</span>
                    </button>
                  )}
                  {selectedNode.source === 'classroom' && (
                    <button
                      onClick={() => setCurrentTab('classroom')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Classroom View</span>
                    </button>
                  )}
                  {selectedNode.source === 'calendar' && (
                    <button
                      onClick={() => setCurrentTab('calendar')}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Open Calendar Schedule</span>
                    </button>
                  )}
                  {selectedNode.source === 'action' && (
                    <button
                      onClick={() => setCurrentTab('actions')}
                      className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>View in My Actions</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a node to inspect its cross-system relationships.
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-700 block mb-1">Node Legend</span>
              <div className="grid grid-cols-2 gap-1 text-slate-600">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Course</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Gmail</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Classroom</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Calendar</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Action</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Deadline</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Entity Title</th>
                <th className="p-4">System Source</th>
                <th className="p-4">Date / Cutoff</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNodes.map(node => (
                <tr key={node.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span 
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: getNodeColor(node.type) }}
                    >
                      {node.type}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">{node.label}</td>
                  <td className="p-4 text-slate-500 capitalize">{node.source}</td>
                  <td className="p-4 text-slate-500">{node.timestamp || '—'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleNodeClick(node)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
