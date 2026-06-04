"use client";
// src/components/game/PlayerSidebar.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { Player } from "@/types/game";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { BOARD_TILES } from "@/lib/game/boardData";

function PlayerCard({ player, isCurrentTurn, isMe, rank }: {
  player: Player;
  isCurrentTurn: boolean;
  isMe: boolean;
  rank: number;
}) {
  const color = PLAYER_COLOR_HEX[player.color];

  return (
    <motion.div
      className={`
        relative rounded-xl overflow-hidden border transition-all
        ${isCurrentTurn ? "border-yellow-500/70 shadow-lg shadow-yellow-900/30" : "border-slate-700/50"}
        ${player.isBankrupt ? "opacity-40" : ""}
        ${isMe ? "ring-1 ring-violet-500/40" : ""}
      `}
      style={{ background: `linear-gradient(135deg, ${color}10, #0f172a)` }}
      layout
      animate={isCurrentTurn ? { scale: 1.02 } : { scale: 1 }}
    >
      {/* Rank badge */}
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">
        #{rank}
      </div>

      {/* Current turn indicator */}
      {isCurrentTurn && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2"
            style={{ borderColor: color, background: `${color}25` }}
          >
            {player.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-white font-bold text-sm truncate">{player.name}</p>
              {isMe && <span className="text-xs text-violet-400">(you)</span>}
            </div>
            <p className="text-slate-400 text-xs">
              {player.isBankrupt ? "💀 Bankrupt" : player.inJail ? "🔒 In Jail" : `Pos: ${player.position}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-slate-900/60 rounded-lg px-2 py-1.5">
            <p className="text-slate-500 text-xs">Cash</p>
            <p className="text-green-400 font-bold text-sm">${player.cash.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900/60 rounded-lg px-2 py-1.5">
            <p className="text-slate-500 text-xs">Net Worth</p>
            <p className="text-yellow-400 font-bold text-sm">${player.netWorth.toLocaleString()}</p>
          </div>
        </div>

        {/* Properties count */}
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {player.properties.slice(0, 6).map((propId) => {
            const tile = BOARD_TILES.find((t) => t.id === propId);
            if (!tile) return null;
            return (
              <span key={propId} title={tile.name} className="text-sm">{tile.flagCode || "🏙️"}</span>
            );
          })}
          {player.properties.length > 6 && (
            <span className="text-xs text-slate-500">+{player.properties.length - 6}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function PlayerSidebar() {
  const { gameState, myPlayerId } = useGameStore();

  if (!gameState) return null;

  const { players, currentPlayerIndex } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Sort by net worth for rankings
  const ranked = [...players].sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-sm tracking-wider uppercase opacity-70">Players</h2>
        <span className="text-slate-500 text-xs">Round {gameState.round}</span>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        <AnimatePresence>
          {ranked.map((player, rankIdx) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentTurn={player.id === currentPlayer?.id}
              isMe={player.id === myPlayerId}
              rank={rankIdx + 1}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
