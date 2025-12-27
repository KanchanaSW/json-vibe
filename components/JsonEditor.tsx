"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";

export default function JsonEditor({
  value,
  onChange,
  onValidationChange,
}: any) {
  const [cursor, setCursor] = useState({ line: 1, col: 1 });

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

  return (
    <section className="flex-1 flex flex-col min-h-0 h-full w-full bg-black relative overflow-hidden">
      <div className="flex-1 min-h-0 relative h-full bg-black">
        <CodeMirror
          value={value}
          height="100%"
          className="h-full absolute inset-0 editor-instance"
          onChange={(val) => {
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
        <div>{value.length} CHARS</div>
      </div>
    </section>
  );
}
