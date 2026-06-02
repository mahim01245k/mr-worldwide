"use client";
// src/components/game/ActivityLog.tsx
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { GameLog } from "@/types/game";
import { PLAYER_COLOR_HEX } from "@/types/game";

const LOG_ICONS: Record<GameLog["type"], string> = {
  move: "🚀",
  purchase: "🏙️",
  rent: "💸",
  tax: "🏛️",
  card: "🎴",
  trade: "🤝",
  upgrade: "🏗️",
  jail: "🔒",
  bankrupt: "💀",
  system: "⚙️",
};

const LOG_COLORS: Record<GameLog["type"], string> = {
  move: "#60a5fa",
  purchase: "#34d399",
  rent: "#f87171",
  tax: "#fb923c",
  card: "#a78bfa",
  trade: "#22d3ee",
  upgrade: "#fbbf24",
  jail: "#94a3b8",
  bankrupt: "#f43f5e",
  system: "#64748b",
};

export function ActivityLog() {
  const { gameState } = useGameStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const logs = gameState?.log || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-white font-bold text-sm tracking-wider uppercase opacity-70 mb-3">
        Activity Log
      </h2>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        <AnimatePresence initial={false}>
          {logs.slice(-50).map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-xs py-1 border-b border-slate-800/50"
            >
              <span className="flex-shrink-0 mt-0.5">{LOG_ICONS[log.type]}</span>
              <p
                className="leading-relaxed"
                style={{ color: LOG_COLORS[log.type] }}
              >
                {log.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <p className="text-slate-600 text-xs text-center mt-4">Game not started yet...</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
