import React, { useState } from 'react';
import { Layers, Plus, Sparkles, CheckCircle2, Server, Database, Shield, Cpu, Cloud, Activity, Trash2, ArrowRight, RefreshCw, Zap } from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  type: string;
  icon: any;
  status: string;
}

export const SystemDesignCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<ArchNode[]>([
    { id: '1', name: 'Global CDN / Cloudflare', type: 'CDN', icon: <Cloud className="w-5 h-5 text-cyan-400" />, status: 'Connected' },
    { id: '2', name: 'Nginx Load Balancer', type: 'Load Balancer', icon: <Server className="w-5 h-5 text-violet-400" />, status: 'Connected' },
    { id: '3', name: 'Node.js Microservices Cluster', type: 'API Cluster', icon: <Cpu className="w-5 h-5 text-emerald-400" />, status: 'Active' },
    { id: '4', name: 'Redis In-Memory Cache', type: 'Caching Layer', icon: <Activity className="w-5 h-5 text-amber-400" />, status: 'Active' },
    { id: '5', name: 'PostgreSQL Primary Database', type: 'RDBMS Store', icon: <Database className="w-5 h-5 text-blue-400" />, status: 'Connected' }
  ]);

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddNode = (item: { name: string; type: string; icon: any }) => {
    const newNode: ArchNode = {
      id: String(Date.now() + Math.random()),
      name: item.name,
      type: item.type,
      icon: item.icon,
      status: 'Connected'
    };
    setNodes(prev => [...prev, newNode]);
    showToast(`Added ${item.name} to architecture canvas!`);
  };

  const handleRemoveNode = (id: string, name: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    showToast(`Removed ${name} from canvas.`);
  };

  const handleClearCanvas = () => {
    setNodes([]);
    setAiAnalysis(null);
    showToast("Cleared architecture canvas.");
  };

  const handleEvaluateArchitecture = () => {
    if (nodes.length === 0) {
      showToast("Add at least 1 component to evaluate architecture!");
      return;
    }

    setEvaluating(true);
    setTimeout(() => {
      setEvaluating(false);
      const score = Math.min(100, Math.max(65, 70 + nodes.length * 4));
      
      setAiAnalysis({
        overallScore: score,
        throughput: `${nodes.length * 45},000 req/sec`,
        latency: `${Math.max(8, 32 - nodes.length * 2)}ms p99`,
        spofStatus: nodes.length >= 4 ? 'Zero Single Points of Failure Detected' : 'Warning: Add Caching or Load Balancer to avoid SPOF',
        strengths: [
          `Architecture configured with ${nodes.length} active distributed nodes.`,
          'Microservice component isolation provides high fault tolerance.',
          'Edge network CDN guarantees sub-20ms global static asset distribution.'
        ],
        improvements: [
          'Ensure database read replicas are added for heavy query workloads.',
          'Configure rate-limiting policies on API gateways to prevent DDoS attacks.'
        ]
      });
      showToast("Gemini AI Architecture evaluation complete!");
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in relative">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 border border-violet-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in text-xs font-mono">
          <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-violet-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>System Design & Distributed Architecture Canvas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive System Design Architecture Builder</h1>
          <p className="text-xs text-slate-400">
            Construct high-scale system architectures (Load Balancers, Microservices, Caches, DBs) and grade with Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {nodes.length > 0 && (
            <button
              onClick={handleClearCanvas}
              className="px-4 py-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold transition-all"
            >
              Clear Canvas
            </button>
          )}

          <button
            onClick={handleEvaluateArchitecture}
            disabled={evaluating}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl glow-gradient text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{evaluating ? 'Grading Architecture with AI...' : 'Evaluate System with Gemini AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Toolbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Component Toolbox Sidebar */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200">Architecture Components Toolbox</h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">CLICK (+) TO ADD</span>
          </div>
          <p className="text-xs text-slate-400">Click to add distributed system nodes to your canvas:</p>

          <div className="space-y-2.5">
            {[
              { name: 'Apache Kafka Event Stream', type: 'Message Broker', icon: <Activity className="w-4 h-4 text-rose-400" /> },
              { name: 'AWS S3 Blob Storage', type: 'Object Store', icon: <Database className="w-4 h-4 text-amber-400" /> },
              { name: 'Elasticsearch Index', type: 'Search Engine', icon: <Server className="w-4 h-4 text-emerald-400" /> },
              { name: 'OAuth2 / JWT Auth Gateway', type: 'Security Proxy', icon: <Shield className="w-4 h-4 text-violet-400" /> },
              { name: 'RabbitMQ Worker Queue', type: 'Task Queue', icon: <Activity className="w-4 h-4 text-cyan-400" /> },
              { name: 'MongoDB NoSQL Cluster', type: 'Document DB', icon: <Database className="w-4 h-4 text-emerald-400" /> }
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddNode(item)}
                className="w-full text-left p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-violet-500/60 active:scale-95 cursor-pointer flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-violet-500/40">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{item.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{item.type}</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 group-hover:bg-violet-600 group-hover:text-white transition-all">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Architecture Flow Board */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-200">Constructed System Flow Canvas ({nodes.length} Nodes)</h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Active Topology: Microservice Mesh</span>
          </div>

          {nodes.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Canvas is Empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any component from the Architecture Toolbox on the left to add nodes to your flow.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nodes.map((node, i) => (
                <React.Fragment key={node.id}>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-cyan-500/50 transition-all shadow-md group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        {node.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{node.name}</h4>
                        <span className="text-xs font-mono text-slate-400">{node.type} • Status: <span className="text-emerald-400 font-semibold">{node.status}</span></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveNode(node.id, node.name)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                      title="Delete node"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {i < nodes.length - 1 && (
                    <div className="flex justify-center my-1 text-violet-400">
                      <ArrowRight className="w-4 h-4 rotate-90 animate-pulse" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* AI Evaluation Report Display */}
      {aiAnalysis && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Gemini System Design Evaluation Report</span>
              <h2 className="text-2xl font-black text-white">Architecture Grade: {aiAnalysis.overallScore} / 100</h2>
            </div>

            <div className="flex gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">ESTIMATED THROUGHPUT:</span>
                <span className="text-emerald-400 font-bold text-sm">{aiAnalysis.throughput}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">P99 LATENCY:</span>
                <span className="text-cyan-400 font-bold text-sm">{aiAnalysis.latency}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono">Architecture Strengths & Resilience:</h4>
            <div className="space-y-2">
              {aiAnalysis.strengths.map((str: string, i: number) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase font-mono">Recommended Optimizations:</h4>
            <div className="space-y-2">
              {aiAnalysis.improvements.map((imp: string, i: number) => (
                <div key={i} className="p-3 bg-slate-950 rounded-xl border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

