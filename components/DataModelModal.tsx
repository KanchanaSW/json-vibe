"use client";

import { useState, useEffect } from "react";

interface DataModelModalProps {
  json: string;
  isOpen: boolean;
  onClose: () => void;
}

type Language = "TypeScript" | "Kotlin" | "Java";

export default function DataModelModal({
  json,
  isOpen,
  onClose,
}: DataModelModalProps) {
  const [model, setModel] = useState("");
  const [language, setLanguage] = useState<Language>("TypeScript");
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      try {
        const parsed = JSON.parse(json);
        let generated = "";
        switch (language) {
          case "TypeScript":
            generated = generateTypeScriptInterfaces(parsed);
            break;
          case "Kotlin":
            generated = generateKotlinDataClasses(parsed);
            break;
          case "Java":
            generated = generateJavaClasses(parsed);
            break;
        }
        setModel(generated);
      } catch (e) {
        setModel("// Error: Invalid JSON provided");
      }
    }
  }, [json, isOpen, language]);

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
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
              Data Model
            </h3>
            <div className="flex bg-zinc-800 rounded p-1 border border-white/10">
              {(["TypeScript", "Kotlin", "Java"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                    language === lang
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {lang}
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
          <pre className="text-sm text-purple-400 font-mono whitespace-pre-wrap selection:bg-emerald-500/30">
            {model}
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
              navigator.clipboard.writeText(model);
              setShowCopiedPopup(true);
              setTimeout(() => setShowCopiedPopup(false), 2000);
            }}
            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center gap-2"
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  );
}

function generateTypeScriptInterfaces(data: any, rootInterfaceName = "Root"): string {
  const interfaces: Map<string, string> = new Map();

  function getType(value: any): string {
    if (value === null) return "any";
    switch (typeof value) {
      case "string": return "string";
      case "number": return "number";
      case "boolean": return "boolean";
      case "undefined": return "undefined";
      case "object":
        if (Array.isArray(value)) {
          if (value.length === 0) return "any[]";
          return `${getType(value[0])}[]`;
        }
        return "object";
    }
    return "any";
  }

  function walk(obj: any, name: string) {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return;
    const lines = [`export interface ${name} {`];
    for (const [key, value] of Object.entries(obj)) {
      let type = getType(value);
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        const subName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
        walk(value[0], subName);
        type = `${subName}[]`;
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const subName = key.charAt(0).toUpperCase() + key.slice(1);
        walk(value, subName);
        type = subName;
      }
      lines.push(`  ${/^[a-zA-Z_$][\w$]*$/.test(key) ? key : `"${key}"`}: ${type};`);
    }
    lines.push("}");
    if (!interfaces.has(name)) interfaces.set(name, lines.join("\n"));
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object") {
      walk(data[0], rootInterfaceName + "Item");
      return `export type ${rootInterfaceName} = ${rootInterfaceName}Item[];\n\n` + Array.from(interfaces.values()).reverse().join("\n\n");
    }
    return `export type ${rootInterfaceName} = any[];`;
  }

  walk(data, rootInterfaceName);
  return Array.from(interfaces.values()).reverse().join("\n\n");
}

function generateKotlinDataClasses(data: any, rootName = "Root"): string {
  const classes = new Map<string, string>();

  function getType(value: any): string {
    if (value === null) return "Any?";
    switch (typeof value) {
      case "string": return "String";
      case "number": return Number.isInteger(value) ? "Int" : "Double";
      case "boolean": return "Boolean";
      case "undefined": return "Any?";
      case "object":
        if (Array.isArray(value)) {
          if (value.length === 0) return "List<Any>";
          return `List<${getType(value[0])}>`;
        }
        return "Any";
    }
    return "Any";
  }

  function walk(obj: any, name: string) {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return;
    const lines = [`data class ${name}(`];
    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
      let type = getType(value);
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        const subName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
        walk(value[0], subName);
        type = `List<${subName}>`;
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const subName = key.charAt(0).toUpperCase() + key.slice(1);
        walk(value, subName);
        type = subName;
      }
      const isLast = index === entries.length - 1;
      lines.push(`    val ${key}: ${type}${isLast ? "" : ","}`);
    });
    lines.push(")");
    if (!classes.has(name)) classes.set(name, lines.join("\n"));
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object") {
      walk(data[0], rootName + "Item");
      return Array.from(classes.values()).reverse().join("\n\n");
    }
    return `// Array of primitives or empty`;
  }

  walk(data, rootName);
  return Array.from(classes.values()).reverse().join("\n\n");
}

function generateJavaClasses(data: any, rootName = "Root"): string {
  const classes = new Map<string, string>();

  function getType(value: any): string {
    if (value === null) return "Object";
    switch (typeof value) {
      case "string": return "String";
      case "number": return Number.isInteger(value) ? "Integer" : "Double";
      case "boolean": return "Boolean";
      case "undefined": return "Object";
      case "object":
        if (Array.isArray(value)) {
          if (value.length === 0) return "List<Object>";
          return `List<${getType(value[0])}>`;
        }
        return "Object";
    }
    return "Object";
  }

  function walk(obj: any, name: string) {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return;
    const lines = [`public class ${name} {`];
    for (const [key, value] of Object.entries(obj)) {
      let type = getType(value);
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        const subName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
        walk(value[0], subName);
        type = `List<${subName}>`;
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const subName = key.charAt(0).toUpperCase() + key.slice(1);
        walk(value, subName);
        type = subName;
      }
      lines.push(`    public ${type} ${key};`);
    }
    lines.push("}");
    if (!classes.has(name)) classes.set(name, lines.join("\n"));
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === "object") {
      walk(data[0], rootName + "Item");
      return Array.from(classes.values()).reverse().join("\n\n");
    }
    return `// Array of primitives or empty`;
  }

  walk(data, rootName);
  return Array.from(classes.values()).reverse().join("\n\n");
}
