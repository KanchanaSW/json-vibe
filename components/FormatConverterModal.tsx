import { useState, useEffect, useMemo } from "react";

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

const renderCSVTable = useMemo(() => {
  if (activeFormat !== "CSV" || !output || output.startsWith("Error"))
    return null;

  const lines = output.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length < 1) return null;

  const rows = lines.map((row) =>
    row
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((cell) => cell.replace(/^"|"$/g, "").replace(/""/g, '"'))
  );

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const renderDataUI = (data: any): JSX.Element => {
    if (Array.isArray(data)) {
      if (data.length === 0)
        return <span className="text-zinc-600 italic">empty array</span>;
      return (
        <div className="flex flex-col gap-3 mt-1 min-w-0 w-full overflow-hidden">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/[0.03] border border-white/5 rounded p-2 relative min-w-0"
            >
              <span className="absolute -top-2 -left-1 px-1.5 bg-purple-600 text-[8px] font-bold rounded z-10">
                {idx}
              </span>
              <div className="overflow-hidden">
                {typeof item === "object" ? (
                  renderDataUI(item)
                ) : (
                  <span className="text-zinc-300 break-words whitespace-pre-wrap">
                    {String(item)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (typeof data === "object" && data !== null) {
      return (
        <div className="flex flex-col gap-y-3 py-1 w-full min-w-0 overflow-hidden">
          {Object.entries(data).map(([key, val], idx) => {
            const isStatus = ["level", "status", "verified"].includes(
              key.toLowerCase()
            );
            return (
              <div
                key={idx}
                className="flex flex-col border-l-2 border-purple-500/20 pl-3 min-w-0 overflow-hidden"
              >
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-1">
                  {key.replace(/_/g, " ")}
                </span>
                <div className="text-[11px] text-zinc-300 min-w-0">
                  {isStatus ? (
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase ${
                        String(val).match(/INFO|operational|true/i)
                          ? "bg-emerald-500/20 text-emerald-400"
                          : String(val).match(/WARN|DEBUG/i)
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {String(val)}
                    </span>
                  ) : (
                    <div className="break-words whitespace-pre-wrap leading-relaxed">
                      {typeof val === "object"
                        ? renderDataUI(val)
                        : String(val)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <span className="text-zinc-300 break-words whitespace-pre-wrap">
        {String(data)}
      </span>
    );
  };

  const renderCellContent = (value: string) => {
    if (!value.trim())
      return <span className="text-zinc-700 italic opacity-50">empty</span>;
    try {
      if (value.startsWith("{") || value.startsWith("[")) {
        const parsed = JSON.parse(value);
        return renderDataUI(parsed);
      }
    } catch (e) {}
    return (
      <span className="break-words whitespace-pre-wrap text-zinc-400 block">
        {value}
      </span>
    );
  };

  return (
    <div className="h-full w-full overflow-auto border border-white/10 rounded-lg bg-[#050505] custom-scrollbar">
      {/* Remove table-fixed to allow min-width to expand the layout */}
      <table className="min-w-full border-separate border-spacing-0 text-left text-xs">
        <thead className="sticky top-0 z-20">
          <tr>
            <th className="w-12 px-3 py-4 bg-zinc-900 border-b border-r border-white/10 text-zinc-500 font-mono text-center">
              #
            </th>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-5 py-4 bg-zinc-900 border-b border-r border-white/10 font-bold text-purple-400 uppercase tracking-widest min-w-[300px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {dataRows.map((row, i) => (
            <tr key={i} className="group hover:bg-white/[0.01]">
              <td className="px-3 py-5 border-r border-white/10 bg-zinc-900/10 text-zinc-600 font-mono text-center align-top">
                {i + 1}
              </td>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-5 py-5 border-r border-white/5 last:border-r-0 align-top overflow-hidden max-w-[500px]"
                >
                  <div className="w-full">{renderCellContent(cell)}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}, [output, activeFormat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      {showCopiedPopup && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full shadow-lg">
            <span className="text-sm font-bold">Copied!</span>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 flex flex-col rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-purple-400"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              Converter
            </h3>
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
              {(["YAML", "XML", "CSV"] as Format[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setActiveFormat(format)}
                  className={`px-4 py-1.5 text-xs rounded-md font-bold transition-all ${
                    activeFormat === format
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#080808]">
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {activeFormat === "CSV" ? (
              renderCSVTable
            ) : (
              <div className="relative flex">
                {/* Line Numbers */}
                <div className="pr-4 text-right select-none border-r border-white/5 mr-4 text-zinc-700 font-mono text-sm leading-6">
                  {output.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="text-sm font-mono leading-6 whitespace-pre text-zinc-300">
                  {output.split("\n").map((line, i) => {
                    // Very basic highlight logic for visual appeal
                    const isKey = line.includes(":");
                    const isTag = line.startsWith("<") || line.endsWith(">");
                    return (
                      <div
                        key={i}
                        className={
                          isKey
                            ? "text-purple-300"
                            : isTag
                            ? "text-emerald-400"
                            : "text-zinc-400"
                        }
                      >
                        {line || " "}
                      </div>
                    );
                  })}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-900 flex justify-between items-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            Previewing {activeFormat} Output
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(output);
                setShowCopiedPopup(true);
                setTimeout(() => setShowCopiedPopup(false), 2000);
              }}
              className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Raw {activeFormat}
            </button>
          </div>
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
      return obj
        .map((item) => {
          if (typeof item !== "object" || item === null)
            return `- ${dump(item, 0)}`;
          const itemStr = dump(item, indent + 1);
          const lines = itemStr.split("\n");
          return `- ${lines[0].trimStart()}\n${lines.slice(1).join("\n")}`;
        })
        .join("\n");
    }
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";
    return keys
      .map((key) => {
        const val = obj[key];
        if (
          typeof val === "object" &&
          val !== null &&
          Object.keys(val).length > 0
        ) {
          return `:\n${dump(val, indent + 1)}`;
        }
        return `: ${dump(val, 0)}`;
      })
      .join("\n");
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
