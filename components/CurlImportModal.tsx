"use client";

import { useState } from "react";

interface CurlImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (json: string) => void;
}

export default function CurlImportModal({
  isOpen,
  onClose,
  onImport,
}: CurlImportModalProps) {
  const [curlCommand, setCurlCommand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { url, options } = parseCurlCommand(curlCommand);
      
      if (!url) {
        throw new Error("Could not find a valid URL in the cURL command.");
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const text = await response.text();
      onImport(text);
      onClose();
      setCurlCommand("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 p-6 rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h3 className="text-lg font-semibold mb-4 text-white">
          Import from cURL
        </h3>
        <p className="text-zinc-400 text-sm mb-4">
          Paste a cURL command to fetch JSON data.
          <br />
          <span className="text-yellow-500/80 text-xs">
            Note: This executes client-side. Ensure the target server supports CORS.
          </span>
        </p>
        
        <textarea
          className="flex-1 w-full bg-black border border-white/10 rounded px-3 py-2 text-white font-mono text-xs mb-4 focus:outline-none focus:border-purple-500 min-h-[200px]"
          placeholder="curl 'https://api.example.com/data' -H 'Authorization: Bearer ...'"
          value={curlCommand}
          onChange={(e) => setCurlCommand(e.target.value)}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !curlCommand.trim()}
            className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? "Fetching..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

function parseCurlCommand(curl: string) {
  let cmd = curl.trim();
  if (cmd.startsWith("curl ")) cmd = cmd.substring(5);

  let url = "";
  let method = "GET";
  const headers: Record<string, string> = {};
  let body: string | undefined = undefined;

  const urlMatch = cmd.match(/['"](https?:\/\/[^'"]+)['"]/) || cmd.match(/(https?:\/\/[^\s]+)/);
  if (urlMatch) url = urlMatch[1];

  const methodMatch = cmd.match(/-X\s*([A-Z]+)/) || cmd.match(/--request\s+([A-Z]+)/);
  if (methodMatch) method = methodMatch[1];

  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(cmd)) !== null) {
    const [key, value] = hMatch[1].split(/:\s*/);
    if (key && value) headers[key] = value;
  }

  const dataMatch = cmd.match(/(?:-d|--data|--data-raw|--data-binary)\s+(['"])([\s\S]*?)\1/);
  if (dataMatch) {
    body = dataMatch[2];
    if (method === "GET") method = "POST";
  }

  return { url, options: { method, headers, body } };
}