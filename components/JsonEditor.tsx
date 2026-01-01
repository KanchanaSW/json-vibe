"use client";

import { useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import jp from "jsonpath";

export default function JsonEditor({
  value,
  onChange,
  onValidationChange,
}: any) {
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [filter, setFilter] = useState("");

  const customTheme = EditorView.theme(
    {
      "&": { height: "100%", backgroundColor: "#000000 !important" },
      ".cm-scroller": {
        overflow: "auto !important",
        position: "absolute !important",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "#000000 !important",
      },
      ".cm-gutters": {
        backgroundColor: "#000000 !important",
        border: "none",
        color: "#52525b",
        minWidth: "40px",
      },
      ".cm-activeLine": { backgroundColor: "#ffffff08" },
      ".cm-cursor": { borderLeftColor: "#ffffff", borderLeftWidth: "2px" },
      ".cm-content": { paddingBottom: "100px", caretColor: "white" },
    },
    { dark: true }
  );

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.selectionSet) {
      const line = update.state.doc.lineAt(update.state.selection.main.head);
      setCursor({
        line: line.number,
        col: update.state.selection.main.head - line.from + 1,
      });
    }
  });

  const { displayValue, isReadOnly, error } = useMemo(() => {
    if (!filter) return { displayValue: value, isReadOnly: false, error: null };
    try {
      const jsonDoc = JSON.parse(value);
      try {
        const results = jp.query(jsonDoc, filter);
        return {
          displayValue: JSON.stringify(results, null, 2),
          isReadOnly: true,
          error: results.length === 0 ? "No matches" : null,
        };
      } catch (e) {
        return {
          displayValue: value,
          isReadOnly: true,
          error: "Invalid JSONPath",
        };
      }
    } catch (e) {
      return {
        displayValue: value,
        isReadOnly: false, // Allow editing to fix invalid JSON
        error: "Invalid JSON",
      };
    }
  }, [value, filter]);

  return (
    <section className="flex-1 flex flex-col min-h-0 h-full w-full bg-black relative overflow-hidden">
      <div className="h-10 border-b border-white/10 bg-black flex items-center px-4 gap-2 shrink-0">
        <span className="text-[10px] font-mono text-zinc-500 uppercase">
          JSONPath
        </span>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="$.store.book[*]"
          className="flex-1 bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30 font-mono placeholder:text-zinc-700"
        />
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
      <div className="flex-1 min-h-0 relative h-full bg-black">
        <CodeMirror
          value={displayValue}
          height="100%"
          className="h-full absolute inset-0 editor-instance"
          readOnly={isReadOnly}
          onChange={(val) => {
            if (isReadOnly) return;
            onChange(val);
            try {
              JSON.parse(val);
              onValidationChange?.(true);
            } catch {
              onValidationChange?.(false);
            }
          }}
          extensions={[
            json(),
            customTheme,
            updateListener,
            EditorView.lineWrapping,
          ]}
          basicSetup={{ lineNumbers: true, foldGutter: true }}
        />
      </div>
      <div className="h-8 border-t border-white/10 bg-black flex items-center justify-between px-4 text-[10px] font-mono text-zinc-500 shrink-0 z-20">
        <div>
          LN {cursor.line}, COL {cursor.col}
        </div>
        <div>{displayValue.length} CHARS</div>
      </div>
    </section>
  );
}
