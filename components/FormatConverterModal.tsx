import { useState, useEffect } from "react";

interface FormatConverterModalProps {
  json: string;
  isOpen: boolean;
  onClose: () => void;
}

type Format = "YAML" | "XML" | "CSV";

export default function FormatConverterModal({
  json,
  isOpen,
  onClose,
}: FormatConverterModalProps) {
  const [activeFormat, setActiveFormat] = useState<Format>("YAML");
  const [output, setOutput] = useState("");
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const data = JSON.parse(json);
        let result = "";
        switch (activeFormat) {
          case "YAML":
            result = toYAML(data);
            break;
          case "XML":
            result = toXML(data);
            break;
          case "CSV":
            result = toCSV(data);
            break;
        }
        setOutput(result);
      } catch (err) {
        setOutput("// Error: Invalid JSON provided");
      }
    }
  }, [json, isOpen, activeFormat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {showCopiedPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-400"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span className="text-sm font-medium text-white">
              Copied to clipboard
            </span>
          </div>
        </div>
      )}
      <div className="bg-zinc-900 border border-white/10 flex flex-col rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
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
                className="text-purple-500"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Format Converters
            </h3>
            <div className="flex bg-zinc-800 rounded p-1 border border-white/10">
              {(["YAML", "XML", "CSV"] as Format[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setActiveFormat(format)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                    activeFormat === format
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
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
        </div>

        <div className="flex-1 overflow-auto p-6 bg-[#0d0d0d]">
          <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap selection:bg-emerald-500/30">
            {output}
          </pre>
        </div>

        <div className="p-4 border-t border-white/10 bg-zinc-900 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(output);
              setShowCopiedPopup(true);
              setTimeout(() => setShowCopiedPopup(false), 2000);
            }}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center gap-2"
          >
            Copy {activeFormat}
          </button>
        </div>
      </div>
    </div>
  );
}

function toYAML(data: any): string {
  const dump = (obj: any, indent = 0): string => {
    const sp = "  ".repeat(indent);
    if (obj === null) return "null";
    if (typeof obj !== "object") return JSON.stringify(obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      return obj.map(item => {
        if (typeof item !== "object" || item === null) return `- ${dump(item, 0)}`;
        const itemStr = dump(item, indent + 1);
        const lines = itemStr.split('\n');
        return `- ${lines[0].trimStart()}\n${lines.slice(1).join('\n')}`;
      }).join('\n');
    }
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    return keys.map(key => {
      const val = obj[key];
      if (typeof val === "object" && val !== null && Object.keys(val).length > 0) {
        return `:\n${dump(val, indent + 1)}`;
      }
      return `: ${dump(val, 0)}`;
    }).join('\n');
  };
  return dump(data);
}

function toXML(data: any): string {
  const toXmlRec = (obj: any, name: string): string => {
    // 1. Handle Nulls
    if (obj === null) {
      return `<${name}>null</${name}>`;
    }

    // 2. Handle Arrays: Repeat the parent tag for each item
    if (Array.isArray(obj)) {
      return obj.map((item) => toXmlRec(item, name)).join("");
    }

    // 3. Handle Objects: Recursively process keys
    if (typeof obj === "object") {
      let children = "";
      for (const key in obj) {
        // Sanitize key names to be valid XML tags
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
        children += toXmlRec(obj[key], sanitizedKey);
      }
      return `<${name}>${children}</${name}>`;
    }

    // 4. Handle Primitive Values (string, number, boolean)
    // We escape special characters to prevent broken XML
    const escapedValue = String(obj)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `<${name}>${escapedValue}</${name}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${toXmlRec(
    data,
    "item"
  )}</root>`;
}

function toCSV(data: any): string {
  // If it's a single object, wrap it in an array so it can be processed as one row
  const normalizedData = Array.isArray(data) ? data : [data];

  // Validation: ensure the input isn't null or a primitive at the top level
  if (data === null || typeof data !== "object") {
    return "Error: Invalid JSON input for CSV conversion.";
  }

  if (normalizedData.length === 0) return "";

  // 1. Extract Headers
  const allKeys = new Set<string>();
  normalizedData.forEach((item) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach((k) => allKeys.add(k));
    } else {
      allKeys.add("Value");
    }
  });

  const headers = Array.from(allKeys);

  // 2. Helper to escape values for CSV (RFC 4180)
  const formatValue = (val: any) => {
    if (val === undefined || val === null) return "";
    let str = typeof val === "object" ? JSON.stringify(val) : String(val);
    // Double-up quotes and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  // 3. Create Rows
  const csvRows = [headers.map((h) => formatValue(h)).join(",")];

  normalizedData.forEach((item) => {
    const row = headers.map((header) => {
      let val;
      if (typeof item === "object" && item !== null) {
        // Use type assertion to access key safely
        val = (item as any)[header];
      } else if (header === "Value") {
        val = item;
      }
      return formatValue(val);
    });
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
}
