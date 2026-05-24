"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, AlertTriangle, XCircle } from "lucide-react";

export interface ToastProps {
  type: "success" | "warning" | "error";
  message: string;
  action?: { label: string; href: string };
  onDismiss: () => void;
}

export default function Toast({ type, message, action, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon =
    type === "success" ? Check : type === "warning" ? AlertTriangle : XCircle;
  const colorClass =
    type === "success"
      ? "text-green-400"
      : type === "warning"
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]">
      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full shadow-xl">
        <Icon size={16} className={colorClass} />
        <span className="text-sm font-medium text-white">{message}</span>
        {action && (
          <Link
            href={action.href}
            className="text-sm font-medium text-primary hover:text-purple-400 underline underline-offset-2"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}
