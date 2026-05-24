"use client";

import type { ComponentProps } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ConvexUseAuth = ComponentProps<typeof ConvexProviderWithClerk>["useAuth"];

function useConvexAuth(): ReturnType<ConvexUseAuth> {
  const auth = useAuth();
  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    getToken: auth.getToken,
    orgId: auth.orgId ?? null,
    orgRole: auth.orgRole ?? null,
    sessionClaims: null,
  };
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useConvexAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
