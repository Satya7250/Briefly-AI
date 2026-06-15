// "use client" ensures this component runs only on the client side
"use client";

import { UnreadCountProvider } from "@/components/unread-context";
import React from "react";

// Thin wrapper that can be used inside server components without breaking SSR
export function UnreadCountWrapper({ children }: { children: React.ReactNode }) {
  return <UnreadCountProvider>{children}</UnreadCountProvider>;
}
