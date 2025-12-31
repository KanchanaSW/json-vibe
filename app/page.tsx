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


function forceFormatJSON(input: string): string {
  if (!input) return "";

  // --- PHASE 1: PRE-CLEANING (Global Garbage Removal) ---
  let cleanInput = input;

  // 1. Remove Email Headers/Logs (e.g. "On Tue, Dec 30... wrote:")
  cleanInput = cleanInput.replace(
    /\n?On\s+[A-Za-z]{3},.*?\d{4}.*?>\s*wrote:/g,
    ""
  );

  // 2. Find the first real JSON start ({ or [) and discard prefix garbage
  const firstBrace = cleanInput.search(/[{\[]/);
  if (firstBrace === -1) return "";
  cleanInput = cleanInput.substring(firstBrace);

  // --- PHASE 2: REGEX SURGERY (The "Healer") ---
  cleanInput = cleanInput
    // 1. Fix Broken URLs
    .replace(/https?:\s+\/\//g, "https://")
    .replace(/\\\/\\\//g, "//") // Fix escaped slash madness
    .replace(/ht{2,5}ps?:/g, "https:") // Fix 'htttps' typos

    // 2. Fix "Fake String" Structure (The ": { corruption)
    // Turns "data": ": {" into "data": {
    .replace(/":\s*([{\[])/g, ": $1")

    // 3. Fix Missing Quotes on Keys (e.g. data: { -> "data": {)
    .replace(/([a-zA-Z0-9_]+):\s*([{\[])/g, '"$1": $2')

    // 4. Fix Malformed Separators (e.g. "key : "value -> "key": "value")
    .replace(/"\s*:\s*"?/g, '": "')

    // 5. Fix "Trapped" Values near Closers (Crucial for "null },")
    // Turns "weight": "null }," into "weight": null },
    // Matches quote + value + optional space + brace/bracket + quote
    .replace(/"\s*(null|true|false|[\d\.]+)\s*([}\]])\s*"/g, "$1$2")
    // Fallback: matches quote + value + space + brace (without trailing quote)
    .replace(/"\s*(null|true|false|[\d\.]+)\s*([}\]])/g, "$1$2")

    // 6. Fix "Trapped" Primitives with Commas (e.g. "1.5," -> 1.5,)
    .replace(/"([\d\.]+|null|true|false)\s*,\s*"/g, '$1, "')

    // 7. Fix Missing Comma between objects
    .replace(/([}\]])\s*"/g, '$1, "')
    .replace(/"\s*"/g, '", "') // "val""key" -> "val", "key"

    // 8. Fix Missing Colon (e.g. "key"{ -> "key": {)
    .replace(/"\s*([{\[])/g, '": $1')

    // 9. Cleanup Stray Quotes after closers (e.g. }" -> })
    .replace(/([}\]])"/g, "$1");

  // --- PHASE 3: STATE MACHINE FORMATTER (The "Architect") ---
  let out = "";
  let depth = 0;
  let inStr = false;
  let esc = false;
  const stack: string[] = [];

  // Normalize whitespace to single line for parsing safety
  cleanInput = cleanInput.replace(/\s+/g, " ");

  for (let i = 0; i < cleanInput.length; i++) {
    const c = cleanInput[i];

    // --- A. String Handling ---
    if (!esc && c === '"') {
      inStr = !inStr;
    }
    if (!esc && c === "\\") {
      esc = true;
    } else {
      esc = false;
    }

    if (inStr) {
      out += c;
      continue;
    }

    // --- B. Structure Handling ---
    switch (c) {
      case "{":
      case "[":
        depth++;
        stack.push(c);
        out += c + "\n" + "  ".repeat(depth);
        break;

      case "}":
      case "]":
        // STRICT CHECK: Only process close bracket if stack matches
        // This prevents "over-closing" if the input has garbage tail brackets
        if (stack.length > 0) {
          const lastOpen = stack[stack.length - 1];
          const isMatching =
            (lastOpen === "{" && c === "}") || (lastOpen === "[" && c === "]");

          if (isMatching) {
            stack.pop();
            depth = Math.max(0, depth - 1);
            out += "\n" + "  ".repeat(depth) + c;

            // If root reached, force double newline for readability
            if (stack.length === 0) out += "\n\n";
          }
        }
        break;

      case ",":
        // Only add comma if we are inside a structure
        if (stack.length > 0) out += ",\n" + "  ".repeat(depth);
        break;

      case ":":
        out += ": ";
        break;

      case " ":
      case "\t":
      case "\r":
      case "\n":
        // Ignore whitespace outside strings
        break;

      default:
        // Only print valid values if we are inside a structure
        if (stack.length > 0) out += c;
        break;
    }
  }

  // --- PHASE 4: AUTO-BALANCING (The "Closer") ---

  // 1. SAFETY: If string was left open, close it first
  if (inStr) {
    out += '"';
  }

  // 2. Close remaining brackets in the stack
  while (stack.length > 0) {
    const open = stack.pop();
    const close = open === "{" ? "}" : "]";
    depth = Math.max(0, depth - 1);
    out += "\n" + "  ".repeat(depth) + close;
  }

  return out.trim();
}

