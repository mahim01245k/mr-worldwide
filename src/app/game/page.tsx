"use client";
// src/app/game/page.tsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/lib/store/gameStore";
import { useSocket } from "@/hooks/useSocket";
import { GameBoard } from "@/components/board/GameBoard";
import { TileDetail } from "@/components/board/TileDetail";
import { TopBar } from "@/components/game/TopBar";
import { PlayerSidebar } from "@/components/game/PlayerSidebar";
import { GameChat } from "@/components/game/GameChat";
import { ActivityLog } from "@/components/game/ActivityLog";
import { ActionPanel } from "@/components/game/ActionPanel";
import { PropertyManager } from "@/components/game/PropertyManager";
import { DiceRoller } from "@/components/game/DiceRoller";
import { Notifications } from "@/components/ui/Notifications";
import { Trophy, RotateCcw } from "lucide-react";

function GameOverModal() {
  const { gameState, myPlayerId } = useGameStore();
  const router = useRouter();

  if (!gameState || gameState.phase !== "finished") return null;

  const winner = gameState.players.find((p) => p.id === gameState.winner);
  const isWinner = winner?.id === myPlayerId;

  const ranked = [...gameState.players]
    .filter((p) => !p.isBankrupt || p.id === winner?.id)
    .sort((a, b) => b.netWorth - a.netWorth);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">{isWinner ? "🏆" : "🎮"}</div>
        <h2 className="text-3xl font-black text-white mb-2">
          {isWinner ? "You Won!" : "Game Over!"}
        </h2>
        <p className="text-slate-400 mb-6">
          {winner ? `${winner.name} wins with $${winner.netWorth.toLocaleString()} net worth!` : ""}
        </p>

        {/* Final rankings */}
        <div className="space-y-2 mb-6">
          {ranked.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                i === 0 ? "bg-yellow-900/30 border border-yellow-700/40" : "bg-slate-800/60"
              }`}
            >
              <span className="text-xl">{["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣"][i]}</span>
              <span className="text-lg">{player.avatar}</span>
              <span className="text-white font-bold flex-1 text-left">{player.name}</span>
              <span className="text-yellow-400 font-bold">${player.netWorth.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <motion.button
          onClick={() => router.push("/lobby")}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl transition-all"
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw size={16} /> Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function GamePage() {
  const { gameState, myPlayerId, isMyTurn } = useGameStore();
  const { rollDice } = useSocket();
  const router = useRouter();
  const socketInitRef = useRef(false);

  // Redirect to lobby if no game
  useEffect(() => {
    if (!gameState && !socketInitRef.current) {
      router.push("/lobby");
    }
  }, [gameState, router]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4 animate-spin">🌍</div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const canRoll = isMyTurn() && gameState.phase === "rolling";

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      <Notifications />
      <GameOverModal />

      {/* Top Bar */}
      <TopBar />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left Sidebar: Chat + Activity Log */}
        <div className="w-72 flex flex-col border-r border-slate-800/60 overflow-hidden">
          {/* Chat - top 55% */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            <GameChat />
          </div>

          {/* Activity Log - bottom 45% */}
          <div
            className="h-[45%] p-4 overflow-hidden flex flex-col min-h-0 border-t border-slate-800/60"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            <ActivityLog />
          </div>
        </div>

        {/* Center: Board + Actions */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Board area */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative">
            <GameBoard />
            <TileDetail />
          </div>

          {/* Bottom action area */}
          <div className="border-t border-slate-800/60 bg-slate-950/80 p-4">
            <div className="flex gap-4 items-start max-w-2xl mx-auto">
              {/* Dice section */}
              <div className="flex-shrink-0">
                <DiceRoller
                  onRoll={rollDice}
                  diceValues={gameState.diceValues}
                  canRoll={canRoll}
                  isMyTurn={isMyTurn()}
                  phase={gameState.phase}
                />
              </div>

              {/* Action panel */}
              <div className="flex-1 min-w-0">
                <ActionPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Players + Properties */}
        <div className="w-72 flex flex-col border-l border-slate-800/60 overflow-hidden">
          {/* Players ranking - top 45% */}
          <div className="h-[45%] p-4 overflow-hidden flex flex-col min-h-0 border-b border-slate-800/60">
            <PlayerSidebar />
          </div>

          {/* Property manager - bottom 55% */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
            <PropertyManager />
          </div>
        </div>
      </div>
    </div>
  );
}
