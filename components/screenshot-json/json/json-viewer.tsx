"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Copy, Download } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

type Tab = "raw" | "tree";

function JsonTreeNode({
  keyName,
  value,
  path,
  depth = 0,
}: {
  keyName: string;
  value: unknown;
  path: string;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isObj = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const entries = isObj
    ? isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>)
    : [];

  if (!isObj) {
    return (
      <div
        className="flex items-center gap-2 py-0.5 px-2 hover:bg-white/5 rounded font-mono text-xs"
        style={{ paddingLeft: depth * 12 + 8 }}
      >
        <span className="text-zinc-400">{keyName}:</span>
        <span className="text-emerald-400 truncate">
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 px-2 cursor-pointer hover:bg-white/5 rounded font-mono text-xs"
        style={{ paddingLeft: depth * 12 + 8 }}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown size={12} className="text-zinc-500 shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-zinc-500 shrink-0" />
        )}
        <span className="text-zinc-400">{keyName}</span>
        <span className="text-zinc-600">
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </div>
      {open &&
        entries.map(([k, v]) => (
          <JsonTreeNode
            key={`${path}.${k}`}
            keyName={k}
            value={v}
            path={`${path}.${k}`}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

function TreeView({ data }: { data: unknown }) {
  return (
    <div className="overflow-auto p-2 custom-scrollbar h-full">
      {typeof data === "object" && data !== null ? (
        Object.entries(data).map(([k, v]) => (
          <JsonTreeNode key={k} keyName={k} value={v} path={k} />
        ))
      ) : (
        <span className="text-zinc-500 text-sm">No data</span>
      )}
    </div>
  );
}

export default function JsonViewer({
  data,
  onCopy,
}: {
  data: unknown;
  onCopy?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("raw");

  const jsonString = useMemo(
    () => JSON.stringify(data, null, 2),
    [data]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    onCopy?.();
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ui-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-white/10 bg-bg-panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          {(["raw", "tree"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs rounded-md font-bold transition-all capitalize ${
                tab === t
                  ? "bg-primary text-white shadow-neon"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded border border-white/10"
          >
            <Copy size={12} />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded border border-white/10"
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-[300px] overflow-hidden">
        {tab === "raw" ? (
          <CodeMirror
            value={jsonString}
            height="400px"
            extensions={[json(), EditorView.editable.of(false)]}
            theme={oneDark}
            basicSetup={{ lineNumbers: true, foldGutter: true }}
          />
        ) : (
          <TreeView data={data} />
        )}
      </div>
    </div>
  );
}
