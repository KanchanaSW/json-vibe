"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

export default function JsonTreeViewer({
  json,
  selectedPath,
  onNodeSelect,
  onGenerateModel,
  onFormatConvert,
}: any) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));

  const data = useMemo(() => {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

  const toggle = (path: string) => {
    const next = new Set(expanded);
    next.has(path) ? next.delete(path) : next.add(path);
    setExpanded(next);
  };

  const render = (key: string, val: any, path: string) => {
    const isObj = val !== null && typeof val === "object";
    const isOpen = expanded.has(path);
    const isSel = selectedPath === path;

    if (!isObj) {
      return (
        <div
          key={path}
          onClick={() => onNodeSelect?.(path)}
          className={`flex items-center gap-2 py-0.5 px-2 cursor-pointer rounded ${
            isSel ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          <span className="w-4" />
          <span className="text-zinc-400 font-mono text-xs">{key}:</span>
          <span className="text-emerald-400 font-mono text-xs truncate">
            {typeof val === "string" ? `"${val}"` : String(val)}
          </span>
        </div>
      );
    }

    return (
      <div key={path} className="flex flex-col">
        <div
          onClick={() => {
            toggle(path);
            onNodeSelect?.(path);
          }}
          className={`flex items-center gap-2 py-0.5 px-2 cursor-pointer rounded ${
            isSel ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          {isOpen ? (
            <ChevronDown size={14} className="text-zinc-500" />
          ) : (
            <ChevronRight size={14} className="text-zinc-500" />
          )}
          <span className="text-purple-400 font-mono text-xs font-semibold">
            {key}
          </span>
          <span className="text-zinc-600 text-[9px] uppercase">
            {Array.isArray(val)
              ? `[${val.length}]`
              : `{${Object.keys(val).length}}`}
          </span>
        </div>
        {isOpen && (
          <div className="ml-3 border-l border-white/10 pl-2">
            {Object.entries(val).map(([k, v]) => render(k, v, `${path}.${k}`))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-2 bg-zinc-900/50 border-b border-white/5 shrink-0">
        <button
          onClick={onGenerateModel}
          className="flex w-full justify-center items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded border border-white/10 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M16 13H8"></path>
            <path d="M16 17H8"></path>
            <path d="M10 9H8"></path>
          </svg>
          Generate Data Model
        </button>

        <button
          onClick={onFormatConvert}
          className="flex w-full justify-center items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded border border-white/10 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Format Converters
        </button>
      </div>
      <div className="h-10 border-b border-white/10 flex items-center px-3 shrink-0 bg-zinc-950">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Inspector
        </span>
      </div>
      <div className="flex-1 overflow-auto p-3 custom-scrollbar">
        {data &&
          Object.entries(data).map(([k, v]) => render(k, v, `root.${k}`))}
      </div>
      <div className="h-8 border-t border-white/10 bg-black flex items-center px-4 text-[10px] font-mono text-cyan-700 truncate shrink-0">
        {selectedPath}
      </div>
    </div>
  );
}
