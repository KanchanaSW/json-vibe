"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Share2,
  Link2,
  CheckCircle2,
  Check,
  QrCode,
  X,
  Copy,
  GitCompare,
  Lock,
  ArrowDownAZ,
  ArrowUpAZ,
  RotateCcw,
  ImageIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface HeaderProps {
  isValid?: boolean;
  onFormat?: () => void;
  onMinify?: () => void;
  onSort?: () => void;
  sortOrder?: "asc" | "desc" | null;
  isModified?: boolean;
  showDiff?: boolean;
  onToggleDiff?: () => void;
  onShareSecurely?: () => void;
  isLocked?: boolean;
}

const MAX_QR_LENGTH = 2500;

const SimpleTooltip = ({ text, children, className = "" }: { text: string; children: React.ReactNode; className?: string }) => (
  <div className={`group relative flex items-center ${className}`}>
    {children}
    <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[70] shadow-xl font-normal">
      {text}
    </div>
  </div>
);

export default function Header({
  isValid = true,
  onFormat,
  onMinify,
  onSort,
  sortOrder = null,
  isModified = false,
  showDiff = false,
  onToggleDiff,
  onShareSecurely,
  isLocked = false,
}: HeaderProps) {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const qrButtonRef = useRef<HTMLButtonElement>(null);
  const qrPopupRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const getCurrentUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";
  const isUrlTooLong = currentUrl.length > MAX_QR_LENGTH;

  // Auto-hide toast notification

  // Auto-hide toast notification
  useEffect(() => {
    if (showCopiedPopup) {
      const timer = setTimeout(() => setShowCopiedPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopiedPopup]);

  // Handle outside clicks for QR popup
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
    try {
      navigator.clipboard.writeText(getCurrentUrl());
      setShowCopiedPopup(true);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  /**
   * Triggers the Native Share menu.
   * Falls back to Copy Link if Native Share is unavailable or denied.
   */
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "JSON Vibe",
          text: "Check out this JSON data",
          url: getCurrentUrl(),
        });
      } catch (err) {
        // If the user cancelled, do nothing.
        // For any other error (like the Permission Denied error), fallback to copy.
        if ((err as Error).name !== "AbortError") {
          console.warn("Native share failed, falling back to copy link.");
          handleCopyLink();
        }
      }
    } else {
      // Browsers that don't support Web Share (mostly Desktop Chrome/Firefox)
      handleCopyLink();
    }
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

  const getSortButtonContent = () => {
    if (sortOrder === "asc") {
      return {
        icon: ArrowUpAZ,
        text: "Sort Z-A",
        tooltip: "Sort Descending",
      };
    }
    if (sortOrder === "desc") {
      return { icon: RotateCcw, text: "Reset", tooltip: "Restore Default Order" };
    }
    return { icon: ArrowDownAZ, text: "Sort", tooltip: "Sort Keys Alphabetically" };
  };

  const sortContent = getSortButtonContent();
  const SortIcon = sortContent.icon;

  return (
    <>
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 z-[60] shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white">
            <div className="text-[#9213ec] text-2xl">{"{}"}</div>
            <h1 className="font-mono text-lg font-bold tracking-tight">
              JSON Vibe
            </h1>
          </div>

          {/* Action Group */}
          {!isLocked && (
            <div className="hidden md:flex items-center h-8 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <SimpleTooltip text="Format JSON" className="h-full">
                <button
                  onClick={onFormat}
                  className="px-3 h-full rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Format
                </button>
              </SimpleTooltip>
              <div className="w-px h-3 bg-zinc-800 mx-1"></div>
              <SimpleTooltip text="Minify JSON" className="h-full">
                <button
                  onClick={onMinify}
                  className="px-3 h-full rounded text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Minify
                </button>
              </SimpleTooltip>
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
                  <SimpleTooltip text="Toggle Diff View" className="h-full">
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
                  </SimpleTooltip>
                </>
              )}
              <div className="w-px h-3 bg-zinc-800 mx-1"></div>
              <SimpleTooltip text={sortContent.tooltip} className="h-full">
                <button
                  onClick={onSort}
                  className={`px-3 h-full rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    sortOrder
                      ? "text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <SortIcon size={14} /> {sortContent.text}
                </button>
              </SimpleTooltip>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <SimpleTooltip text="Screenshot → JSON">
            <Link
              href="/tools/screenshot-json"
              className="flex items-center gap-2 h-9 px-3 sm:px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg border border-zinc-800 transition-all"
            >
              <ImageIcon size={16} />
              <span className="hidden sm:inline">Screenshot → JSON</span>
            </Link>
          </SimpleTooltip>

          {/* QR Code */}
          <div className="relative">
            <SimpleTooltip text="Show QR Code">
              <button
                ref={qrButtonRef}
                onClick={() => setShowQrPopup(!showQrPopup)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all"
              >
                <QrCode size={20} />
              </button>
            </SimpleTooltip>

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
                          title="Copy QR Image"
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setShowQrPopup(false)}
                        title="Close"
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
                        level="L"
                        includeMargin={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share Securely Button */}
          {!isLocked && (
            <SimpleTooltip text="Create Secure Link">
              <button
                onClick={onShareSecurely}
                className="hidden sm:flex items-center gap-2 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg border border-zinc-800 transition-all"
              >
                <Lock size={16} /> Secure
              </button>
            </SimpleTooltip>
          )}

          {/* Copy Link Button (Desktop only) */}
          <SimpleTooltip text="Copy Link">
            <button
              onClick={handleCopyLink}
              className="hidden sm:flex items-center gap-2 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg border border-zinc-800 transition-all"
            >
              <Link2 size={16} /> Copy Link
            </button>
          </SimpleTooltip>

          {/* Primary Share Button (Native Share) */}
          <SimpleTooltip text="Share">
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-2 h-9 px-4 bg-[#9213ec] hover:bg-[#8110d1] text-white text-sm font-semibold rounded-lg shadow-lg shadow-[#9213ec]/20 transition-all"
            >
              <Share2 size={16} /> Share
            </button>
          </SimpleTooltip>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {showCopiedPopup && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4">
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