"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership, PLAYER_COLOR_HEX } from "@/types/game";

// Board dimensions matching richup.io's layout
const B = 660;       // total board size
const C = 80;        // corner tile size
const TW = (B - C * 2) / 9; // ~55px tile width for non-corner tiles
const TH = C;        // tile height = corner size

// Returns SVG [x, y, w, h, rotation] for each tile id
function getTileLayout(id: number): [number, number, number, number, number] {
  // Bottom row left→right: IDs 0(corner)..12(corner)
  if (id === 0)  return [0, B-C, C, C, 0];                                      // START corner (bottom-left)
  if (id >= 1  && id <= 11) return [C + (id-1)*TW, B-TH, TW, TH, 0];           // bottom tiles
  if (id === 12) return [B-C, B-C, C, C, 0];                                    // VACATION corner (bottom-right)

  // Right column bottom→top: IDs 13..22, then 23(corner)
  if (id >= 13 && id <= 22) return [B-TH, B-C-TH-(id-13)*TW, TH, TW, 90];
  if (id === 23) return [B-C, 0, C, C, 0];                                      // PRISON corner (top-right)

  // Top row right→left: IDs 24..34
  if (id >= 24 && id <= 34) return [B-C-TH-(id-24)*TW, 0, TW, TH, 180];

  // Left column top→bottom: IDs 35..45, then 46(corner), 47..48
  if (id >= 35 && id <= 45) return [0, C+(id-35)*TW, TH, TW, 270];
  if (id === 46) return [0, B-C, C, C, 0];                                      // GO-TO-PRISON corner (bottom-left) — overlaps start visually handled
  if (id >= 47 && id <= 48) return [0, C+(11+(id-47))*TW, TH, TW, 270];

  return [0, 0, TW, TH, 0];
}

function getTokenCenter(id: number): [number, number] {
  const [x, y, w, h] = getTileLayout(id);
  return [x + w/2, y + h/2];
}

// ── Single Tile ─────────────────────────────────────────────────────────────
function Tile({ tile, ownership, players, isSelected, onSelect }: {
  tile: BoardTile;
  ownership?: PropertyOwnership;
  players: Player[];
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  const [x, y, w, h, rot] = getTileLayout(tile.id);
  const owner = ownership ? players.find(p => p.id === ownership.ownerId) : null;
  const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : null;

  // Color band color
  const bandColor = (() => {
    if (tile.color && tile.color !== "none") return COLOR_HEX[tile.color];
    switch (tile.type) {
      case "start": return "#22c55e";
      case "go-to-prison": return "#dc2626";
      case "prison": return "#6366f1";
      case "vacation": return "#f59e0b";
      case "treasure": return "#d97706";
      case "surprise": return "#7c3aed";
      case "airport": return "#0ea5e9";
      case "tax": return "#ef4444";
      case "utility": return "#06b6d4";
      default: return "#1e1a3a";
    }
  })();

  // Background color
  const bgColor = isSelected ? "#1e1a3a" : "#13112a";
  const borderColor = isSelected ? "#7c3aed" : ownerColor ? ownerColor + "60" : "#2a2550";

  return (
    <g
      transform={`translate(${x},${y}) rotate(${rot},${w/2},${h/2})`}
      onClick={() => onSelect(tile.id)}
      style={{ cursor: "pointer" }}
    >
      {/* Base */}
      <rect x={0} y={0} width={w} height={h} fill={bgColor} stroke={borderColor} strokeWidth={isSelected ? 1.5 : 0.8} rx={2} />

      {/* Color band at top */}
      {(tile.type === "property" || tile.type === "airport" || tile.type === "utility") ? (
        <rect x={0} y={0} width={w} height={12} fill={bandColor} rx={2} />
      ) : (
        // Special tiles get a subtle color background
        <rect x={0} y={0} width={w} height={h} fill={bandColor} fillOpacity={0.12} rx={2} />
      )}

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <rect x={0} y={0} width={w} height={h} fill="#000" fillOpacity={0.5} rx={2} />
      )}

      {/* Content — centered in the tile */}
      <g transform={`translate(${w/2},${h/2})`}>
        {/* Corner tiles: bigger emoji */}
        {(tile.type === "start" || tile.type === "vacation" || tile.type === "go-to-prison" || tile.type === "prison") && (
          <>
            <text textAnchor="middle" dominantBaseline="middle" y={-6} fontSize={20} style={{ userSelect: "none" }}>
              {tile.type === "start" ? "▶▶" : tile.type === "vacation" ? "🏖️" : tile.type === "go-to-prison" ? "💀" : "🔒"}
            </text>
            <text textAnchor="middle" dominantBaseline="middle" y={12} fontSize={7} fill="#e2e8f0" fontWeight="700" style={{ userSelect: "none" }}>
              {tile.type === "start" ? "START" : tile.type === "vacation" ? "Vacation" : tile.type === "go-to-prison" ? "Go to Prison" : "In Prison"}
            </text>
          </>
        )}

        {/* Property tiles */}
        {(tile.type === "property" || tile.type === "airport" || tile.type === "utility") && (
          <>
            {tile.flag && (
              <text textAnchor="middle" dominantBaseline="middle" y={-6} fontSize={13} style={{ userSelect: "none" }}>
                {tile.flag}
              </text>
            )}
            <text textAnchor="middle" dominantBaseline="middle" y={8} fontSize={tile.name.length > 9 ? 6.5 : 7.5} fill="#e2e8f0" fontWeight="600" style={{ userSelect: "none" }}>
              {tile.name.length > 10 ? tile.name.slice(0,9)+"…" : tile.name}
            </text>
            {tile.price && (
              <text textAnchor="middle" dominantBaseline="middle" y={19} fontSize={6.5} fill="#94a3b8" style={{ userSelect: "none" }}>
                ${tile.price}
              </text>
            )}
          </>
        )}

        {/* Special tiles */}
        {tile.type === "treasure" && (
          <>
            <text textAnchor="middle" dominantBaseline="middle" y={-4} fontSize={16} style={{ userSelect: "none" }}>💰</text>
            <text textAnchor="middle" dominantBaseline="middle" y={12} fontSize={7} fill="#fbbf24" fontWeight="700" style={{ userSelect: "none" }}>Treasure</text>
          </>
        )}
        {tile.type === "surprise" && (
          <>
            <text textAnchor="middle" dominantBaseline="middle" y={-4} fontSize={16} style={{ userSelect: "none" }}>❓</text>
            <text textAnchor="middle" dominantBaseline="middle" y={12} fontSize={7} fill="#a78bfa" fontWeight="700" style={{ userSelect: "none" }}>Surprise</text>
          </>
        )}
        {tile.type === "tax" && (
          <>
            <text textAnchor="middle" dominantBaseline="middle" y={-4} fontSize={13} style={{ userSelect: "none" }}>💸</text>
            <text textAnchor="middle" dominantBaseline="middle" y={8} fontSize={6.5} fill="#fca5a5" fontWeight="600" style={{ userSelect: "none" }}>
              {tile.name.length > 10 ? tile.name.slice(0,9)+"…" : tile.name}
            </text>
            {tile.taxAmount && (
              <text textAnchor="middle" dominantBaseline="middle" y={19} fontSize={6} fill="#fca5a5" style={{ userSelect: "none" }}>
                {tile.taxAmount < 1 ? `${tile.taxAmount*100}%` : `$${tile.taxAmount}`}
              </text>
            )}
          </>
        )}
      </g>

      {/* Owner dot */}
      {ownerColor && (
        <circle cx={w-7} cy={h-7} r={5} fill={ownerColor} stroke="#fff" strokeWidth={1} />
      )}

      {/* Buildings */}
      {ownership && !ownership.isMortgaged && (
        ownership.hasHotel
          ? <rect x={w-15} y={14} width={9} height={6} fill="#ef4444" rx={1} />
          : Array.from({ length: ownership.houses }).map((_, i) =>
              <rect key={i} x={2+i*7} y={14} width={5} height={5} fill="#22c55e" rx={1} />
            )
      )}

      {/* Selected glow border */}
      {isSelected && (
        <rect x={0} y={0} width={w} height={h} fill="none" stroke="#7c3aed" strokeWidth={1.5} rx={2} strokeOpacity={0.9} />
      )}
    </g>
  );
}

// ── Player Token ─────────────────────────────────────────────────────────────
function PlayerToken({ player, cx, cy, offsetX }: { player: Player; cx: number; cy: number; offsetX: number }) {
  return (
    <motion.g
      animate={{ x: cx + offsetX, y: cy }}
      initial={false}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <circle r={10} fill={PLAYER_COLOR_HEX[player.color]} stroke="#fff" strokeWidth={1.5} />
      <text textAnchor="middle" dominantBaseline="middle" fontSize={11} style={{ userSelect: "none" }}>
        {player.avatar}
      </text>
    </motion.g>
  );
}

// ── Board ────────────────────────────────────────────────────────────────────
export function GameBoard() {
  const { gameState, selectedTileId, selectTile } = useGameStore();
  if (!gameState) return null;

  const { players, properties, currentPlayerIndex } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Group players by position
  const byPos = players.reduce<Record<number, Player[]>>((acc, p) => {
    if (!p.isBankrupt) { acc[p.position] = [...(acc[p.position] || []), p]; }
    return acc;
  }, {});

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${B} ${B}`}
        className="w-full h-full"
        style={{ maxWidth: 660, maxHeight: 660, filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.9))" }}
      >
        {/* Board background */}
        <rect x={0} y={0} width={B} height={B} fill="#0d0b1e" rx={10} />

        {/* Inner center area */}
        <rect x={C} y={C} width={B-C*2} height={B-C*2} fill="#090718" rx={3} />

        {/* Center logo */}
        <text x={B/2} y={B/2-28} textAnchor="middle" fontSize={42} style={{ userSelect: "none" }}>🌍</text>
        <text x={B/2} y={B/2+14} textAnchor="middle" fontSize={18} fontWeight="900" fill="#4c3a8a" letterSpacing={3} style={{ userSelect: "none" }}>
          MR. WORLDWIDE
        </text>
        <text x={B/2} y={B/2+32} textAnchor="middle" fontSize={9} fill="#2d235a" letterSpacing={5} style={{ userSelect: "none" }}>
          GLOBAL MONOPOLY
        </text>

        {/* All tiles */}
        {BOARD_TILES.map(tile => (
          <Tile
            key={tile.id}
            tile={tile}
            ownership={properties.find(p => p.tileId === tile.id)}
            players={players}
            isSelected={selectedTileId === tile.id}
            onSelect={selectTile}
          />
        ))}

        {/* Player tokens */}
        {Object.entries(byPos).map(([posStr, posPlayers]) => {
          const pos = parseInt(posStr);
          const [cx, cy] = getTokenCenter(pos);
          return posPlayers.map((player, idx) => {
            const total = posPlayers.length;
            const offset = total > 1 ? (idx - (total-1)/2) * 13 : 0;
            return <PlayerToken key={player.id} player={player} cx={cx} cy={cy} offsetX={offset} />;
          });
        })}

        {/* Current player pulse ring */}
        {currentPlayer && !currentPlayer.isBankrupt && (() => {
          const [cx, cy] = getTokenCenter(currentPlayer.position);
          return (
            <motion.circle cx={cx} cy={cy} r={15} fill="none"
              stroke={PLAYER_COLOR_HEX[currentPlayer.color]} strokeWidth={2}
              animate={{ r: [13, 18, 13], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
          );
        })()}
      </svg>
    </div>
  );
}
