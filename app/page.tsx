"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import JsonEditor from "@/components/JsonEditor";
import JsonTreeViewer from "@/components/JsonTreeViewer";
import { useUrlState } from "@/hooks/useUrlState";
import DataModelModal from "@/components/DataModelModal";

export default function Home() {
  const [jsonValue, setJsonValue, initialJson, isModified] = useUrlState();
  const [isValid, setIsValid] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>("root");
  const [isClient, setIsClient] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (jsonValue?.startsWith("ENC:")) {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [jsonValue]);

  const handleEncrypt = async () => {
    if (sharePassword.length < 5) return;
    try {
      const encrypted = await encryptData(jsonValue || "{}", sharePassword);
      setJsonValue(encrypted);
      setShowShareModal(false);
      setSharePassword("");
    } catch (error) {
      console.error("Encryption failed", error);
    }
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      const decrypted = await decryptData(jsonValue || "", unlockPassword);
      setJsonValue(decrypted);
      setUnlockPassword("");
    } catch (error) {
      alert("Invalid Password");
    }
  };

  if (!isClient) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-zinc-500">
        Loading Editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-black text-white selection:bg-purple-500/30 relative">
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-lg shadow-2xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Password Protect & Share
            </h3>
            <p className="text-zinc-400 text-sm mb-4">
              Set a password (min 5 chars) to encrypt your JSON. The URL will be updated with the encrypted data.
            </p>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white mb-4 focus:outline-none focus:border-purple-500"
              value={sharePassword}
              onChange={(e) => setSharePassword(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-3 py-2 text-sm text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEncrypt}
                disabled={sharePassword.length < 5}
                className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
              >
                Encrypt & Share
              </button>
            </div>
          </div>
        </div>
      )}

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
        onShareSecurely={() => setShowShareModal(true)}
        isLocked={isLocked}
      />

      {!isLocked && (
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border-b border-white/5 shrink-0">
          <button
            onClick={() => setShowModelModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded border border-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
              <path d="M10 9H8"></path>
            </svg>
            Generate Data Model
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-row min-h-0 overflow-hidden bg-black relative">
        {isLocked ? (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm text-center">
              <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-500"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Protected Content
              </h2>
              <p className="text-zinc-500 mb-6">
                This JSON is password protected. Enter the password to view it.
              </p>
              <form onSubmit={handleUnlock} className="flex gap-2">
                <input
                  type="password"
                  placeholder="Password"
                  className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium"
                >
                  Unlock
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      <DataModelModal
        json={jsonValue || "{}"}
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
      />
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

async function encryptData(plaintext: string, password: string) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    enc.encode(plaintext)
  );

  const saltB64 = btoa(String.fromCharCode(...Array.from(salt)));
  const ivB64 = btoa(String.fromCharCode(...Array.from(iv)));
  const dataB64 = btoa(
    String.fromCharCode(...Array.from(new Uint8Array(encrypted)))
  );

  return `ENC:${saltB64}:${ivB64}:${dataB64}`;
}

async function decryptData(ciphertext: string, password: string) {
  if (!ciphertext.startsWith("ENC:")) throw new Error("Not encrypted");
  const parts = ciphertext.split(":");
  if (parts.length !== 4) throw new Error("Invalid format");

  const salt = new Uint8Array(
    atob(parts[1])
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const iv = new Uint8Array(
    atob(parts[2])
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const data = new Uint8Array(
    atob(parts[3])
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  const key = await deriveKey(password, salt, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  usage: KeyUsage[]
) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    usage
  );
}
