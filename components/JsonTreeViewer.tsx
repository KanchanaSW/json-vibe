"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

export default function JsonTreeViewer({
  json,
  selectedPath,
  onNodeSelect,
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
