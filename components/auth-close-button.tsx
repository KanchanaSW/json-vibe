"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthCloseButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      aria-label="Close"
      title="Close"
      className="fixed top-4 right-4 z-10 p-2 text-zinc-400 hover:text-white transition-colors"
    >
      <X size={20} />
    </button>
  );
}
