"use client";
// src/components/game/TopBar.tsx
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { Wifi, WifiOff, Crown } from "lucide-react";

export function TopBar() {
  const { gameState, myPlayerId, roomCode, isConnected } = useGameStore();

  if (!gameState) return null;

  const { players, currentPlayerIndex, phase, round } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const myPlayer = players.find((p) => p.id === myPlayerId);
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const color = currentPlayer ? PLAYER_COLOR_HEX[currentPlayer.color] : "#7c3aed";

  const phaseLabel: Record<string, string> = {
    waiting: "Waiting",
    rolling: "Roll Dice",
    moving: "Moving...",
    action: "Processing...",
    buying: "Buy Property",
    auction: "Auction!",
    trading: "Trading",
    card: "Card Drawn!",
    paying: "Paying...",
    upgrading: "Building",
    finished: "Game Over!",
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/60 backdrop-blur-sm">
      {/* Left: Room + Connection */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="text-white font-black text-sm tracking-tight">MR. WORLDWIDE</p>
            <p className="text-slate-500 text-xs">Room: <span className="text-violet-400 font-mono font-bold">{roomCode}</span></p>
          </div>
        </div>

        <div className={`flex items-center gap-1 text-xs ${isConnected ? "text-green-400" : "text-red-400"}`}>
          {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isConnected ? "Online" : "Offline"}</span>
        </div>
      </div>

      {/* Center: Current turn indicator */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
          style={{
            background: `${color}15`,
            borderColor: `${color}40`,
          }}
        >
          <span className="text-sm">{currentPlayer?.avatar}</span>
          <span className="text-white text-sm font-bold">
            {isMyTurn ? "Your Turn!" : `${currentPlayer?.name}'s Turn`}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${color}30`, color }}
          >
            {phaseLabel[phase] || phase}
          </span>
        </div>
        <span className="text-slate-500 text-xs">Round {round}/{gameState.maxRounds}</span>
      </div>

      {/* Right: My stats */}
      {myPlayer && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-slate-400 text-xs">Cash</p>
            <p className="text-green-400 font-bold text-sm">${myPlayer.cash.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Net Worth</p>
            <p className="text-yellow-400 font-bold text-sm">${myPlayer.netWorth.toLocaleString()}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2"
            style={{
              borderColor: PLAYER_COLOR_HEX[myPlayer.color],
              background: `${PLAYER_COLOR_HEX[myPlayer.color]}25`,
            }}
          >
            {myPlayer.avatar}
          </div>
        </div>
      )}
    </div>
  );
}
