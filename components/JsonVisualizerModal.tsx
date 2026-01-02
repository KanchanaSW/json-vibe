"use client";

import { useState, useEffect, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  Background,
  Controls,
  Position,
  ReactFlowInstance,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";

interface JsonVisualizerModalProps {
  json: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JsonVisualizerModal({
  json,
  isOpen,
  onClose,
}: JsonVisualizerModalProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    try {
      const parsed = JSON.parse(json);
      const { nodes: newNodes, edges: newEdges } = generateGraph(parsed);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (e) {
      console.error("Failed to parse JSON for visualization", e);
    }
  }, [json, isOpen, setNodes, setEdges]);

  useEffect(() => {
    if (rfInstance && nodes.length > 0) {
      window.requestAnimationFrame(() => rfInstance.fitView());
    }
  }, [rfInstance, nodes]);

  const downloadImage = async () => {
    if (!flowWrapperRef.current || !rfInstance) return;

    try {
      const nodesBounds = getRectOfNodes(rfInstance.getNodes());
      const imageWidth = nodesBounds.width + 100;
      const imageHeight = nodesBounds.height + 100;
      const transform = getTransformForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5,
        2
      );

      const viewport = flowWrapperRef.current.querySelector(".react-flow__viewport") as HTMLElement;

      const dataUrl = await toPng(viewport, {
        backgroundColor: "#000",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.setAttribute("download", "schema-visualizer.png");
      a.setAttribute("href", dataUrl);
      a.click();
    } catch (e) {
      console.error("Failed to download image", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-lg shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900 z-10">
          <h3 className="text-lg font-semibold text-white">Schema Visualization</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={downloadImage}
              className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
              title="Download Image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 w-full h-full bg-black" ref={flowWrapperRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setRfInstance}
            fitView
            minZoom={0.1}
          >
            <Background color="#333" gap={16} />
            <Controls className="bg-zinc-800 border-white/10 fill-white text-white" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function generateGraph(data: any) {
  let idCounter = 0;
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nextY = 0; // Global Y cursor for leaf placement

  function traverse(obj: any, depth = 0, parentId: string | null = null, key = "root") {
    const id = String(idCounter++);
    const isObj = obj !== null && typeof obj === "object";
    
    let label = key;
    const fields: string[] = [];
    const childNodes: { key: string; value: any }[] = [];

    if (isObj) {
      if (Array.isArray(obj)) {
        label += ` [${obj.length}]`;
        obj.forEach((item, index) => {
          if (item !== null && typeof item === "object") {
            childNodes.push({ key: `${index}`, value: item });
          } else {
            fields.push(`${index}: ${String(item)}`);
          }
        });
      } else {
        label += " {}";
        Object.entries(obj).forEach(([k, v]) => {
          if (v !== null && typeof v === "object") {
            childNodes.push({ key: k, value: v });
          } else {
            fields.push(`${k}: ${String(v)}`);
          }
        });
      }
    } else {
      fields.push(String(obj));
    }

    // Limit fields display
    const displayFields = fields.slice(0, 15);
    if (fields.length > 15) displayFields.push(`... ${fields.length - 15} more`);

    const nodeHeight = 40 + displayFields.length * 20;
    
    // Calculate Y position (Tree Layout)
    let myY = 0;
    if (childNodes.length > 0) {
      const childYs: number[] = [];
      childNodes.forEach((child) => {
        childYs.push(traverse(child.value, depth + 1, id, child.key));
      });
      // Center parent relative to children
      myY = (Math.min(...childYs) + Math.max(...childYs)) / 2;
    } else {
      // Leaf node placement
      myY = nextY;
      nextY += nodeHeight + 40; // Add gap
    }

    nodes.push({
      id,
      position: { x: depth * 350, y: myY },
      data: {
        label: (
          <div className="text-xs font-mono text-left">
            <div className="font-bold border-b border-gray-500 pb-1 mb-1 text-purple-400">{label}</div>
            {displayFields.map((f, i) => (
              <div key={i} className="truncate text-gray-300">{f}</div>
            ))}
          </div>
        ),
      },
      style: { background: "#18181b", color: "#fff", border: "1px solid #3f3f46", borderRadius: "8px", padding: "10px", minWidth: "200px" },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    if (parentId) {
      edges.push({ id: `e-${parentId}-${id}`, source: parentId, target: id, animated: true, style: { stroke: "#a855f7" }, markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" } });
    }

    return myY;
  }

  traverse(data);
  return { nodes, edges };
}