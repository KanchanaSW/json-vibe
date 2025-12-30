"use client";

import { useState, useEffect, useRef } from "react";
import {
  Share2,
  Link2,
  CheckCircle2,
  Check,
  QrCode,
  X,
  Copy,
  GitCompare,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface HeaderProps {
  isValid?: boolean;
  onFormat?: () => void;
  onMinify?: () => void;
  isModified?: boolean;
  showDiff?: boolean;
  onToggleDiff?: () => void;
}

// Level 'L' allows up to 2,953 characters.
// We set the limit to 2,500 to ensure compatibility with most mobile scanners.
const MAX_QR_LENGTH = 2500;

export default function Header({
  isValid = true,
  onFormat,
  onMinify,
  isModified = false,
  showDiff = false,
  onToggleDiff,
}: HeaderProps) {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const qrButtonRef = useRef<HTMLButtonElement>(null);
  const qrPopupRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const isUrlTooLong = currentUrl.length > MAX_QR_LENGTH;

  // Auto-hide copy notification
  useEffect(() => {
    if (showCopiedPopup) {
      const timer = setTimeout(() => setShowCopiedPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopiedPopup]);

  // Close QR popup on click outside or Escape
  useEffect(() => {
    if (showQrPopup) {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          qrPopupRef.current &&
          !qrPopupRef.current.contains(e.target as Node) &&
          qrButtonRef.current &&
          !qrButtonRef.current.contains(e.target as Node)
        ) {
          setShowQrPopup(false);
        }
      };
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setShowQrPopup(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [showQrPopup]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setShowCopiedPopup(true);
  };

  const handleCopyQrImage = async () => {
    if (!qrCodeRef.current || isUrlTooLong) return;
    try {
      const svg = qrCodeRef.current.querySelector("svg");
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      canvas.width = 400;
      canvas.height = 400;

      await new Promise((resolve) => {
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, 400, 400);
          resolve(null);
        };
        img.src =
          "data:image/svg+xml;base64," +
          btoa(unescape(encodeURIComponent(svgData)));
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setShowCopiedPopup(true);
        }
      });
    } catch (err) {
      console.error("Failed to copy QR:", err);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white">
            <div className="text-blue-500 text-2xl font-bold">{"{}"}</div>
            <h1 className="font-mono text-lg font-bold tracking-tight">
              JSON Vibe
            </h1>
          </div>

          {/* Editor Actions */}
          <div className="hidden md:flex items-center h-8 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={onFormat}
              className="px-3 h-full rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Format
            </button>
            <div className="w-px h-3 bg-zinc-800 mx-1"></div>
            <button
              onClick={onMinify}
              className="px-3 h-full rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Minify
            </button>
            <div className="w-px h-3 bg-zinc-800 mx-1"></div>
            <div
              className={`px-3 flex items-center gap-1 text-xs font-medium ${
                isValid ? "text-green-400" : "text-red-400"
              }`}
            >
              <CheckCircle2 size={14} /> {isValid ? "Valid" : "Invalid"}
            </div>

            {isModified && (
              <>
                <div className="w-px h-3 bg-zinc-800 mx-1"></div>
                <button
                  onClick={onToggleDiff}
                  className={`px-3 h-full rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    showDiff
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-yellow-500 hover:bg-zinc-800"
                  }`}
                >
                  <GitCompare size={14} /> Diff
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* QR Code Section */}
          <div className="relative">
            <button
              ref={qrButtonRef}
              onClick={() => setShowQrPopup(!showQrPopup)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
            >
              <QrCode size={20} />
            </button>

            {showQrPopup && (
              <div
                ref={qrPopupRef}
                className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 w-64">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">
                      Scan to Share
                    </span>
                    <div className="flex gap-1">
                      {!isUrlTooLong && (
                        <button
                          onClick={handleCopyQrImage}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowQrPopup(false)}
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {isUrlTooLong ? (
                    <div className="bg-zinc-800 p-4 rounded-lg text-center">
                      <p className="text-xs text-red-400 font-medium">
                        Data too large for QR
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Use the "Copy Link" button instead.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white p-2 rounded-lg" ref={qrCodeRef}>
                      <QRCodeSVG
                        value={currentUrl}
                        size={205}
                        level="L" // 'L' is necessary for large URLs like yours
                        includeMargin={false}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 mt-3 text-center">
                    Your URL is {currentUrl.length} characters.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyLink}
            className="hidden sm:flex items-center gap-2 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg border border-zinc-800 transition-all"
          >
            <Link2 size={16} /> Copy Link
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "JSON Vibe", url: currentUrl });
              } else {
                handleCopyLink();
              }
            }}
            className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-900/20 transition-all"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </header>

      {/* Floating Toast */}
      {showCopiedPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full shadow-xl">
            <Check size={16} className="text-green-400" />
            <span className="text-sm font-medium text-white">
              Copied to clipboard
            </span>
          </div>
        </div>
      )}
    </>
  );
}
