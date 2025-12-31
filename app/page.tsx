"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeViewer from "@/components/JsonTreeViewer";
import { useUrlState } from "@/hooks/useUrlState";

export default function Home() {
  const [jsonValue, setJsonValue, initialJson, isModified] = useUrlState();
  const [isValid, setIsValid] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>("root");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-zinc-500">
        Loading Editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-black text-white selection:bg-purple-500/30">
      <Header
        isValid={isValid}
        onFormat={() => {
          try {
            const parsed = JSON.parse(jsonValue || "{}");
            setJsonValue(JSON.stringify(parsed, null, 2));
          } catch {
            setJsonValue(forceFormatJSON(jsonValue || ""));
          }
        }}
        onMinify={() => {
          try {
            setJsonValue(JSON.stringify(JSON.parse(jsonValue || "{}")));
          } catch {}
        }}
        isModified={isModified}
      />

      <main className="flex-1 flex flex-row min-h-0 overflow-hidden bg-black">
        {/* Left Side: Editor */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-black relative">
          <JsonEditor
            value={jsonValue || "{\n  \n}"}
            onChange={setJsonValue}
            onValidationChange={setIsValid}
          />
        </div>

        {/* Right Side: Tree Viewer */}
        <aside className="hidden lg:flex flex-col w-[400px] border-l border-white/10 h-full bg-black shrink-0 overflow-hidden">
          <JsonTreeViewer
            json={jsonValue || "{}"}
            selectedPath={selectedPath}
            onNodeSelect={setSelectedPath}
          />
        </aside>
      </main>
    </div>
  );
}

/**
 * SMART FORMATTER V7: "Deep Scrub & Un-Trap"
 * * 1. UN-TRAP: Extracts numbers/nulls/booleans that got stuck inside string quotes.
 * 2. REPAIR: Adds missing colons before arrays/objects.
 * 3. DEEP SCRUB: If structure depth is 0, it deletes ALL characters (email headers)
 * except for the start of a new JSON block.
 */
function forceFormatJSON(input: string): string {
  if (!input) return "";

  // --- PHASE 1: REGEX REPAIR (The "Healer") ---
  let cleanInput = input
    // 1. Fix Broken URLs
    .replace(/https:\s+\/\//g, "https://")
    .replace(/https:\s+\\\/\\\//g, "https://")

    // 2. Fix Missing Colons: "key"{ -> "key": {
    .replace(/"\s*([{\[])/g, '": $1')

    // 3. Fix Corrupted Keys: "key:"value -> "key": "value"
    .replace(/":([a-zA-Z0-9])/g, '": "$1')

    // 4. Fix "Trapped" Primitives: "30," -> 30, (Unwraps numbers/nulls from quotes)
    // Matches "digits," or "null," inside quotes
    .replace(/"(\d+|null|true|false),\s*"/g, '$1, "')

    // 5. Fix "Trapped" Values at end of input: "30, -> 30,
    .replace(/"(\d+|null|true|false),\s*$/gm, "$1,")

    // 6. Fix "Stuck" Strings: "val""key" -> "val", "key"
    .replace(/"\s*"/g, '", "')

    // 7. Fix Missing Comma after brackets: }"key" -> }, "key"
    .replace(/([}\]])\s*"/g, '$1, "');

  // --- PHASE 2: STRUCTURAL TOKENIZER & GARBAGE COLLECTOR ---
  let depth = 0;
  let out = "";
  let inStr = false;
  let esc = false;

  // Normalize whitespace
  cleanInput = cleanInput
    .replace(/[\r\n]/g, "")
    .replace(/\t/g, " ")
    .trim();

  for (let i = 0; i < cleanInput.length; i++) {
    const c = cleanInput[i];

    // --- A. String Handling ---
    if (!esc && c === '"') inStr = !inStr;
    if (!esc && c === "\\") esc = true;
    else esc = false;

    if (inStr) {
      out += c;
      continue;
    }

    // --- B. Garbage Collection (The Email Header Fix) ---
    // If we are at Depth 0 (Root), ONLY accept '{' or '['.
    // Everything else (email text, dates, random words) is deleted.
    if (depth === 0) {
      if (c === "{" || c === "[") {
        // Start of a JSON block
      } else {
        // Skip garbage
        continue;
      }
    }

    // --- C. Formatting Logic ---
    if (c === "{" || c === "[") {
      depth++;
      out += c + "\n" + "  ".repeat(depth);
    } else if (c === "}" || c === "]") {
      depth = Math.max(0, depth - 1);
      out += "\n" + "  ".repeat(depth) + c;

      // If we just closed a root object, force a double newline to separate
      // the next JSON object (if multiple exist in the log)
      if (depth === 0) {
        out += "\n\n";
      }
    } else if (c === ",") {
      out += ",\n" + "  ".repeat(depth);
    } else if (c === ":") {
      out += ": ";
    } else if (/\s/.test(c)) {
      // Skip raw whitespace outside strings
    } else {
      // Standard character (numbers, true, false, null)
      out += c;
    }
  }

  return out.trim();
}
