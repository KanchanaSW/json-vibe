"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { AuthUserMenu } from "@/components/auth-user-menu";

export default function FeatureHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const isGenerate = pathname === "/tools/screenshot-json";
  const isHistory = pathname === "/tools/screenshot-json/history";

  return (
    <header className="h-14 border-b border-white/10 bg-zinc-950 flex items-center px-4 shrink-0">
      <div className="flex items-center gap-3 flex-1">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Editor
        </Link>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-primary" />
          <span className="text-sm font-semibold text-white">
            Screenshot → JSON
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <nav className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
          <Link
            href="/tools/screenshot-json"
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
              isGenerate
                ? "bg-primary text-white shadow-neon"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Generate
          </Link>
          {isSignedIn && (
            <Link
              href="/tools/screenshot-json/history"
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                isHistory
                  ? "bg-primary text-white shadow-neon"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              History
            </Link>
          )}
        </nav>
        <AuthUserMenu />
      </div>
    </header>
  );
}
