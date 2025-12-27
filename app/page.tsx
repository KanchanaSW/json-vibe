"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeViewer from "@/components/JsonTreeViewer";
import { useUrlState } from "@/hooks/useUrlState";

export default function Home() {
  // Ensure initialJson has a fallback to avoid "black screen" on empty state
  const [jsonValue, setJsonValue, initialJson, isModified] = useUrlState();
  const [isValid, setIsValid] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>("root");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show a simple loader during hydration to avoid layout shifts
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
            setJsonValue(
              JSON.stringify(JSON.parse(jsonValue || "{}"), null, 2)
            );
          } catch {}
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
            value={jsonValue || "{\n  \n}"} // Fallback to empty object string
            onChange={setJsonValue}
            onValidationChange={setIsValid}
          />
        </div>

        {/* Right Side: Tree Viewer locked to right */}
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
