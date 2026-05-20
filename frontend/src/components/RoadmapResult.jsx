import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MermaidSetup from "./MermaidSetup";

// ─── Custom React Flow Node Component ──────────────────────────────────────────
const RoadmapNode = ({ data, selected }) => {
  return (
    <div
      className={`w-[290px] bg-white border-2 rounded-xl p-4 shadow-[0_8px_20px_rgba(0,0,0,0.04)] font-sans text-left transition-all ${
        selected
          ? "border-teal-600 ring-4 ring-teal-500/20"
          : "border-gray-200 hover:border-teal-400"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-teal-600" />
      
      <div className="flex justify-between items-center mb-2">
        <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-200">
          Phase {data.phaseNumber} / {data.totalPhases}
        </span>
        <span className="text-[10px] text-gray-500 font-semibold">🕒 {data.duration}</span>
      </div>
      
      <h4 className="font-bold text-gray-800 text-sm leading-snug mb-2">{data.title}</h4>
      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3">{data.description}</p>
      
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Key topics:</span>
        <div className="flex flex-wrap gap-1">
          {data.topics.slice(0, 3).map((t, idx) => (
            <span
              key={idx}
              className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                t.importance === "critical"
                  ? "bg-red-50 text-red-700 border border-red-100"
                  : t.importance === "high"
                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                  : "bg-gray-50 text-gray-600 border border-gray-100"
              }`}
            >
              {t.name}
            </span>
          ))}
          {data.topics.length > 3 && (
            <span className="text-[9px] text-gray-400 font-medium self-center pl-1">
              +{data.topics.length - 3} more
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-teal-600 font-bold">
        <span>🔍 Click to expand details</span>
        <span>⚡</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-teal-600" />
    </div>
  );
};

// ─── Main Roadmap Visualizer Component ─────────────────────────────────────────
const RoadmapResult = ({ result }) => {
  const [viewMode, setViewMode] = useState("canvas"); // 'canvas' | 'mermaid' | 'list'
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const roadmap = result?.roadmapData;
  const flowData = result?.reactFlowData;

  const nodeTypes = useMemo(() => ({ roadmapNode: RoadmapNode }), []);

  // Set default selected node
  React.useEffect(() => {
    if (roadmap?.milestones?.length > 0) {
      setSelectedMilestone(roadmap.milestones[0]);
    }
  }, [roadmap]);

  const onNodeClick = useCallback(
    (event, node) => {
      const milestone = roadmap?.milestones?.find((m) => m.id === node.id);
      if (milestone) {
        setSelectedMilestone(milestone);
      }
    },
    [roadmap]
  );

  if (!result || !roadmap) return null;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-gradient-to-br from-black/90 to-black/80 text-white p-6 rounded-2xl shadow-xl border border-white/10">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block mb-1">
              AI Generated Learning Roadmap
            </span>
            <h2 className="text-2xl font-extrabold">{roadmap.title}</h2>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl">{roadmap.description}</p>
          </div>
          <div className="bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Duration</span>
            <span className="text-base font-extrabold text-teal-300">{roadmap.estimatedTime || "N/A"}</span>
          </div>
        </div>

        {/* Future Career / Job paths tags */}
        {roadmap.careerOpportunities?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400">Target Roles:</span>
            {roadmap.careerOpportunities.map((role, idx) => (
              <span key={idx} className="bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs px-2.5 py-1 rounded-full font-medium">
                💼 {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* View Switcher Tabs */}
      <div className="flex bg-gray-200/60 p-1.5 rounded-xl gap-1.5 max-w-md">
        <button
          onClick={() => setViewMode("canvas")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all ${
            viewMode === "canvas"
              ? "bg-white text-black shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          🗺️ Interactive Canvas
        </button>
        <button
          onClick={() => setViewMode("mermaid")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all ${
            viewMode === "mermaid"
              ? "bg-white text-black shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          📊 Flowchart Diagram
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all ${
            viewMode === "list"
              ? "bg-white text-black shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          📚 Detailed Timeline
        </button>
      </div>

      {/* Visual Render Container */}
      <div className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl overflow-hidden shadow-md">
        {viewMode === "canvas" && flowData && (
          <div className="h-[480px] w-full relative">
            <ReactFlow
              nodes={flowData.nodes}
              edges={flowData.edges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-right"
              fitViewOptions={{ padding: 0.3 }}
            >
              <Background color="#ccc" gap={16} size={1} />
              <Controls showInteractive={false} />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
          </div>
        )}

        {viewMode === "mermaid" && (
          <div className="p-4">
            <MermaidSetup diagram={roadmap.mermaid} />
          </div>
        )}

        {viewMode === "list" && (
          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
            {roadmap.milestones.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => setSelectedMilestone(m)}
                className={`p-4 border rounded-xl transition-all cursor-pointer ${
                  selectedMilestone?.id === m.id
                    ? "border-teal-500 bg-teal-50/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-teal-600 uppercase">
                    Phase {idx + 1}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">{m.duration}</span>
                </div>
                <h4 className="font-bold text-gray-800 text-sm">{m.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{m.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Milestone Detail Panel */}
      <AnimatePresence mode="wait">
        {selectedMilestone && (
          <motion.div
            key={selectedMilestone.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Left Col: Description & Topics */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-1">
                  Active Milestone Details
                </span>
                <h3 className="text-lg font-bold text-gray-800">{selectedMilestone.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Timeline: {selectedMilestone.duration}</p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {selectedMilestone.description}
                </p>
              </div>

              {/* Topics Grid */}
              {selectedMilestone.topics?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Skills to Acquire:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMilestone.topics.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-700 font-medium"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            t.importance === "critical"
                              ? "bg-red-500 animate-pulse"
                              : t.importance === "high"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="truncate">{t.name}</span>
                        <span className="text-[9px] text-gray-400 ml-auto uppercase font-bold">
                          {t.importance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Resources & Projects */}
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
              {/* Resources */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  📚 Recommended Study Material:
                </h4>
                {selectedMilestone.resources?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMilestone.resources.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-teal-50/30 hover:border-teal-200 transition text-xs flex items-center justify-between"
                      >
                        <div className="truncate pr-4">
                          <span className="font-semibold text-gray-800 block truncate">
                            {res.title}
                          </span>
                          <span className="text-[10px] text-teal-600 block truncate">{res.url}</span>
                        </div>
                        <span className="text-lg">🔗</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No resources suggested for this phase.</p>
                )}
              </div>

              {/* Projects */}
              {selectedMilestone.projects?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    🛠️ Practical Action Project:
                  </h4>
                  <div className="space-y-2">
                    {selectedMilestone.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-teal-100 bg-teal-50/20 text-xs"
                      >
                        <span className="font-bold text-teal-800 block">✨ {proj.title}</span>
                        {proj.description && (
                          <p className="text-gray-600 mt-1 leading-snug">{proj.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapResult;
