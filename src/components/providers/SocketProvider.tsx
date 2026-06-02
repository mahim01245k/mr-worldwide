"use client";
// src/components/providers/SocketProvider.tsx
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Initialize socket connection on mount
  useSocket();
  return <>{children}</>;
}
