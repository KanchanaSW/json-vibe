"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function AuthUserMenu() {
  return (
    <>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-9 w-9" } }}
        />
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className="flex items-center h-9 px-3 sm:px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg border border-zinc-800 transition-all whitespace-nowrap"
        >
          Sign in with Google
        </Link>
      </SignedOut>
    </>
  );
}
