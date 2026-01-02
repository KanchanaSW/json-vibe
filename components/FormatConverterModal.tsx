import { useState, useEffect, useMemo } from "react";

interface FormatConverterModalProps {
  json: string;
  isOpen: boolean;
  onClose: () => void;
}

// 1. Added "TOON" to the Format type
type Format = "YAML" | "XML" | "CSV" | "TOON";

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
          case "TOON": // 2. Added case for TOON
            result = toTOON(data);
            break;
        }
        setOutput(result);
      } catch (err) {
        setOutput("// Error: Invalid JSON provided");
      }
    }
  }, [json, isOpen, activeFormat]);

  // ... (renderCSVTable logic remains the same)
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
              {(["YAML", "XML", "CSV", "TOON"] as Format[]).map((format) => (
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
                <div className="pr-4 text-right select-none border-r border-white/5 mr-4 text-zinc-700 font-mono text-sm leading-6">
                  {output.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                <pre className="text-sm font-mono leading-6 whitespace-pre">
                  {output.split("\n").map((line, i) => {
                    // 1. XML Logic
                    if (activeFormat === "XML") {
                      const xmlMatch = line.match(
                        /^(\s*)(<[^>]+>)([^<]*)(<[^>]+>)$/
                      );
                      if (xmlMatch) {
                        const [_, indent, openTag, content, closeTag] =
                          xmlMatch;
                        const isSpecial =
                          /true|false|operational|INFO|verified/i.test(content);
                        const dataColor = isSpecial
                          ? "text-emerald-400 font-bold"
                          : "text-zinc-300";
                        return (
                          <div key={i}>
                            <span className="text-zinc-800">{indent}</span>
                            <span className="text-purple-400">{openTag}</span>
                            <span className={dataColor}>{content}</span>
                            <span className="text-purple-400">{closeTag}</span>
                          </div>
                        );
                      }
                      const isTag = line.trim().startsWith("<");
                      return (
                        <div
                          key={i}
                          className={
                            isTag ? "text-purple-500/80" : "text-zinc-400"
                          }
                        >
                          {line || " "}
                        </div>
                      );
                    }

                    // 2. YAML Logic
                    if (activeFormat === "YAML") {
                      const parts = line.split(/:(.*)/);
                      if (parts.length > 1) {
                        const keyPart = parts[0];
                        const valuePart = parts[1];
                        const isSpecial =
                          /true|false|operational|INFO|WARN|ERROR|verified/i.test(
                            valuePart
                          );
                        const dataColor = isSpecial
                          ? "text-emerald-400 font-bold"
                          : "text-zinc-300";

                        return (
                          <div key={i}>
                            <span className="text-purple-400">{keyPart}:</span>
                            <span className={dataColor}>{valuePart}</span>
                          </div>
                        );
                      }
                      const isListItem = line.trim().startsWith("-");
                      return (
                        <div
                          key={i}
                          className={
                            isListItem
                              ? "text-purple-500/60"
                              : "text-purple-400"
                          }
                        >
                          {line || " "}
                        </div>
                      );
                    }

                    // 3. Added TOON (TOML) Logic
                    if (activeFormat === "TOON") {
                      // Handle Sections like [header] or [[array]]
                      if (line.trim().startsWith("[")) {
                        return (
                          <div key={i} className="text-purple-400 font-bold">
                            {line}
                          </div>
                        );
                      }
                      // Handle key = value
                      const parts = line.split(/=(.*)/);
                      if (parts.length > 1) {
                        const keyPart = parts[0];
                        const valuePart = parts[1];
                        const isSpecial =
                          /true|false|operational|INFO|WARN|ERROR|verified/i.test(
                            valuePart
                          );
                        const dataColor = isSpecial
                          ? "text-emerald-400 font-bold"
                          : "text-zinc-300";

                        return (
                          <div key={i}>
                            <span className="text-purple-500/80">
                              {keyPart}=
                            </span>
                            <span className={dataColor}>{valuePart}</span>
                          </div>
                        );
                      }
                    }

                    return <div key={i}>{line}</div>;
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

// ... (Existing toYAML, toXML, toCSV functions)

// 4. Added toTOON (TOML-style) conversion function
function toTOON(data: any): string {
  const formatValue = (val: any): string => {
    if (typeof val === "string") return `"${val.replace(/"/g, '\\"')}"`;
    if (typeof val === "boolean" || typeof val === "number") return String(val);
    if (val === null) return '""';
    if (Array.isArray(val)) return `[ ${val.map(formatValue).join(", ")} ]`;
    return '""';
  };

  const dump = (obj: any, prefix = ""): string => {
    let result = "";
    const complexKeys: string[] = [];
    const simpleKeys: string[] = [];

    if (typeof obj !== "object" || obj === null) return String(obj);

    // Separate simple values from nested objects/arrays of objects
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (
        typeof val === "object" &&
        val !== null &&
        (!Array.isArray(val) || (val.length > 0 && typeof val[0] === "object"))
      ) {
        complexKeys.push(key);
      } else {
        simpleKeys.push(key);
      }
    });

    // 1. Process Simple Keys first (TOML requirement)
    simpleKeys.forEach((key) => {
      result += `${key} = ${formatValue(obj[key])}\n`;
    });

    // 2. Process Complex Keys
    complexKeys.forEach((key) => {
      const val = obj[key];
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(val)) {
        // Array of tables [[table]]
        val.forEach((item) => {
          result += `\n[[${fullKey}]]\n${dump(item, fullKey)}`;
        });
      } else {
        // Single table [table]
        result += `\n[${fullKey}]\n${dump(val, fullKey)}`;
      }
    });

    return result;
  };

  return dump(data).trim();
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
            return `${sp}- ${dump(item, 0)}`;
          const itemStr = dump(item, indent + 1);
          const lines = itemStr.split("\n");
          return `${sp}- ${lines[0].trimStart()}\n${lines.slice(1).join("\n")}`;
        })
        .join("\n");
    }

    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}";

    return keys
      .map((key) => {
        const val = obj[key];
        // Corrected: Include the 'key' before the colon
        if (
          typeof val === "object" &&
          val !== null &&
          Object.keys(val).length > 0
        ) {
          return `${sp}${key}:\n${dump(val, indent + 1)}`;
        }
        return `${sp}${key}: ${dump(val, 0)}`;
      })
      .join("\n");
  };
  return dump(data);
}

function toXML(data: any): string {
  const indentSize = 2;

  const toXmlRec = (obj: any, name: string, level: number): string => {
    const spacing = " ".repeat(level * indentSize);

    if (obj === null) return `${spacing}<${name}>null</${name}>\n`;

    if (Array.isArray(obj)) {
      return obj.map((item) => toXmlRec(item, name, level)).join("");
    }

    if (typeof obj === "object") {
      let children = "";
      for (const key in obj) {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
        children += toXmlRec(obj[key], sanitizedKey, level + 1);
      }
      return `${spacing}<${name}>\n${children}${spacing}</${name}>\n`;
    }

    const escapedValue = String(obj)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return `${spacing}<${name}>${escapedValue}</${name}>\n`;
  };

  const xmlBody = toXmlRec(data, "item", 1);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${xmlBody}</root>`;
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
