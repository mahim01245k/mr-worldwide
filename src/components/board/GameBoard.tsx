"use client";

// src/components/board/GameBoard.tsx

import { type ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership } from "@/types/game";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { FlagIcon } from "@/components/ui/FlagIcon";

const BOARD_SIZE = 900;
const CORNER_SIZE = 104;
const TILE_WIDTH = (BOARD_SIZE - CORNER_SIZE * 2) / 11;
const TILE_HEIGHT = CORNER_SIZE;

interface TileProps {
  tile: BoardTile;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  ownership?: PropertyOwnership;
  players: Player[];
  isSelected: boolean;
  onSelect: (id: number) => void;
  isCurrentPosition: boolean;
}

function TileCard({
  tile, x, y, width, height, rotation,
  ownership, players, isSelected, onSelect, isCurrentPosition
}: TileProps) {
  const owner = ownership ? players.find((p) => p.id === ownership.ownerId) : null;
  const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : null;

  const isProperty = tile.type === "property" || tile.type === "airport" || tile.type === "utility";
  const isSpecial = ["start", "treasure", "surprise", "go-to-prison", "vacation", "prison", "tax"].includes(tile.type);
  const tileColor = tile.color && tile.color !== "none" ? COLOR_HEX[tile.color] : null;
  const hasBuildings = ownership && (ownership.houses > 0 || ownership.hasHotel);

  // Get the icon/text for special tiles
  const getSpecialIcon = () => {
    if (tile.type === "treasure") return "?";
    if (tile.type === "surprise") return "?";
    if (tile.type === "airport") return "✈";
    if (tile.type === "utility") return "⚡";
    if (tile.type === "tax" && tile.taxAmount && tile.taxAmount < 1) return "10%";
    if (tile.type === "tax") return `$${tile.taxAmount}`;
    return "?";
  };

  const isCorner = tile.type === "start" || tile.type === "vacation" || tile.type === "prison" || tile.type === "go-to-prison";

  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}, ${width / 2}, ${height / 2})`}
      onClick={() => onSelect(tile.id)}
      style={{ cursor: "pointer" }}
    >
      {/* Base tile */}
      <rect
        x={0} y={0}
        width={width} height={height}
        fill={isSelected ? "#334155" : "#0f172a"}
        stroke={isSelected ? "#a78bfa" : ownerColor || "#1e3a5f"}
        strokeWidth={isSelected ? 2.5 : 1}
        rx={3}
      />

      {/* Color gradient overlay (top fade for property tiles) */}
      {isProperty && tileColor && (
        <rect
          x={0} y={0}
          width={width} height={height * 0.55}
          fill={`url(#grad-${tile.id})`}
          rx={3}
        />
      )}

      {/* Special tile tint */}
      {isSpecial && !isProperty && !isCorner && tileColor && (
        <rect
          x={0} y={0}
          width={width} height={height}
          fill={tileColor}
          fillOpacity={0.12}
          rx={3}
        />
      )}

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <rect x={0} y={0} width={width} height={height} fill="#000" fillOpacity={0.5} rx={3} />
      )}

      {/* Tile content */}
      <g transform={`translate(${width / 2}, ${height / 2})`}>
        {/* Circular Flag */}
        {tile.flagCode && (
          <foreignObject x={-14} y={-height / 2 + 14} width={28} height={28}>
            <FlagIcon code={tile.flagCode} size={28} />
          </foreignObject>
        )}

        {/* Special tile icon */}
        {isSpecial && !tile.flagCode && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            y={-height / 2 + 20}
            fontSize={tile.type === "tax" ? 14 : 20}
            fill={tileColor || "#a78bfa"}
            fontWeight="700"
            style={{ userSelect: "none" }}
          >
            {getSpecialIcon()}
          </text>
        )}

        {/* City / Tile Name */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={tile.flagCode ? -6 : (isSpecial ? -4 : -height / 2 + 18)}
          fontSize={isCorner ? 11 : 9}
          fill="#fff"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          style={{ userSelect: "none", textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
        >
          {tile.name.length > (isCorner ? 12 : 9) ? tile.name.substring(0, (isCorner ? 11 : 8)) + "…" : tile.name}
        </text>

        {/* Price */}
        {tile.price && (
          <rect
            x={-18}
            y={height / 2 - 20}
            width={36}
            height={14}
            fill="rgba(0,0,0,0.4)"
            rx={4}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
        )}
        {tile.price && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            y={height / 2 - 13}
            fontSize={9}
            fill="#fff"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
            style={{ userSelect: "none" }}
          >
            ${tile.price}
          </text>
        )}

        {/* Tax subtitle */}
        {tile.type === "tax" && tile.subname && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            y={height / 2 - 13}
            fontSize={6.5}
            fill="#94a3b8"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
            style={{ userSelect: "none" }}
          >
            {tile.subname}
          </text>
        )}
      </g>

      {/* Owner dot */}
      {ownerColor && (
        <circle cx={width - 8} cy={height - 8} r={5} fill={ownerColor} stroke="#fff" strokeWidth={1} />
      )}

      {/* Buildings */}
      {hasBuildings && (
        <g>
          {ownership!.hasHotel ? (
            <rect x={width - 16} y={16} width={10} height={7} fill="#ef4444" rx={1} />
          ) : (
            Array.from({ length: ownership!.houses }).map((_, i) => (
              <rect key={i} x={2 + i * 7} y={16} width={5} height={5} fill="#22c55e" rx={1} />
            ))
          )}
        </g>
      )}

      {/* Highlight for current position */}
      {isCurrentPosition && (
        <rect x={0} y={0} width={width} height={height} fill="none" stroke="#fbbf24" strokeWidth={2} rx={3} opacity={0.8} />
      )}
    </g>
  );
}

// Dice renderer
function DiceRenderer({ value, rolling }: { value: number; rolling: boolean }) {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[20, 20], [80, 80]],
    3: [[20, 20], [50, 50], [80, 80]],
    4: [[20, 20], [80, 20], [20, 80], [80, 80]],
    5: [[20, 20], [80, 20], [50, 50], [20, 80], [80, 80]],
    6: [[15, 15], [85, 15], [15, 50], [85, 50], [15, 85], [85, 85]],
  };
  return (
    <motion.div className="w-12 h-12 rounded-lg bg-white shadow-lg flex items-center justify-center" animate={rolling ? { rotate: [-15, 15, -10, 10, 0], scale: [1, 1.1, 0.95, 1.05, 1] } : {}} transition={{ duration: 0.5 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {(dots[value] || dots[1]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={6} fill="#1e293b" />
        ))}
      </svg>
    </motion.div>
  );
}

// Player token
function PlayerToken({ player, position, index, totalAtPosition }: {
  player: Player;
  position: [number, number];
  index: number;
  totalAtPosition: number;
}) {
  const offset = totalAtPosition > 1 ? (index - (totalAtPosition - 1) / 2) * 12 : 0;
  return (
    <motion.g animate={{ x: position[0] + offset, y: position[1] }} transition={{ type: "spring", stiffness: 200, damping: 20 }} initial={false}>
      <circle r={10} fill={PLAYER_COLOR_HEX[player.color]} stroke="#fff" strokeWidth={2} />
      <text textAnchor="middle" dominantBaseline="middle" fontSize={10} style={{ userSelect: "none" }}>{player.avatar}</text>
    </motion.g>
  );
}

function getTilePosition(tile: BoardTile): [number, number, number, number, number] {
  const cs = CORNER_SIZE;
  const tw = TILE_WIDTH;
  const th = TILE_HEIGHT;
  const rightCount = BOARD_TILES.filter((t) => t.position === "right").length;
  const leftCount = BOARD_TILES.filter((t) => t.position === "left").length;

  let x = 0, y = 0, w = tw, h = th, rot = 0;

  if (tile.position === "bottom") {
    if (tile.index === 0) { x = 0; y = BOARD_SIZE - th; w = cs; h = th; }
    else if (tile.index >= 1 && tile.index <= 11) { x = cs + (tile.index - 1) * tw; y = BOARD_SIZE - th; }
    else if (tile.index === 12) { x = BOARD_SIZE - cs; y = BOARD_SIZE - th; w = cs; }
  }

  if (tile.position === "right") {
    const step = (BOARD_SIZE - cs * 2) / rightCount;
    const idx = rightCount - 1 - tile.index;
    x = BOARD_SIZE - th; y = cs + idx * step; w = th; h = step; rot = 90;
  }

  if (tile.position === "top") {
    const step = (BOARD_SIZE - cs * 2) / 11;
    x = cs + (11 - tile.index) * step; y = 0; w = step; h = th; rot = 180;
  }

  if (tile.position === "left") {
    const step = (BOARD_SIZE - cs * 2) / leftCount;
    x = 0; y = cs + tile.index * step; w = th; h = step; rot = 270;
  }

  y = BOARD_SIZE - y - h;
  if (tile.position === "bottom") rot = 180;
  if (tile.position === "top") rot = 0;

  return [x, y, w, h, rot];
}

function getTokenCenter(tileId: number): [number, number] {
  const tile = BOARD_TILES.find((t) => t.id === tileId);
  if (!tile) return [0, 0];
  const [x, y, w, h] = getTilePosition(tile);
  return [x + w / 2, y + h / 2];
}

interface GameBoardProps {
  onRoll?: () => void;
  canRoll?: boolean;
  rolling?: boolean;
  isMyTurn?: boolean;
  phase?: string;
  buyPanel?: ReactNode;
}

export function GameBoard({ onRoll, canRoll = false, rolling = false, isMyTurn = false, phase, buyPanel }: GameBoardProps = {}) {
  const { gameState, selectedTileId, selectTile } = useGameStore();
  const tiles = useMemo(() => BOARD_TILES, []);

  if (!gameState) return null;

  const { players, properties, currentPlayerIndex } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  const playersByPosition = players.reduce((acc, player) => {
    if (!player.isBankrupt) {
      const pos = player.position;
      acc[pos] = acc[pos] || [];
      acc[pos].push(player);
    }
    return acc;
  }, {} as Record<number, Player[]>);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`} className="w-full h-full max-w-[900px] max-h-[900px]" style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.8))" }}>
        <defs>
          {/* Gradients per color */}
          {Object.entries(COLOR_HEX).filter(([key]) => key !== "none").map(([key, color]) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          ))}
          {/* Per-tile gradient overrides */}
          {tiles.filter(t => t.color && t.color !== "none").map(tile => (
            <linearGradient key={`tile-grad-${tile.id}`} id={`grad-${tile.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR_HEX[tile.color!]} stopOpacity="0.35" />
              <stop offset="100%" stopColor={COLOR_HEX[tile.color!]} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        <rect x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} fill="#0a0f1e" rx={12} />

        <rect x={CORNER_SIZE} y={CORNER_SIZE} width={BOARD_SIZE - CORNER_SIZE * 2} height={BOARD_SIZE - CORNER_SIZE * 2} fill="#070c19" rx={4} />

        {!(canRoll && gameState?.phase === "rolling") && (
          <>
            <text x={BOARD_SIZE / 2} y={BOARD_SIZE / 2 - 30} textAnchor="middle" fontSize={28} fontWeight="900" fontFamily="system-ui" fill="#7c3aed" opacity={0.6}>🌍</text>
            <text x={BOARD_SIZE / 2} y={BOARD_SIZE / 2 + 10} textAnchor="middle" fontSize={22} fontWeight="900" fontFamily="system-ui" fill="#a78bfa" opacity={0.5} letterSpacing={2}>MR. WORLDWIDE</text>
            <text x={BOARD_SIZE / 2} y={BOARD_SIZE / 2 + 35} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="system-ui" letterSpacing={4}>GLOBAL MONOPOLY</text>
          </>
        )}

        {tiles.map((tile) => {
          const [x, y, w, h, rot] = getTilePosition(tile);
          const ownership = properties.find((p) => p.tileId === tile.id);
          const playersOnTile = (playersByPosition[tile.id] || []);
          return (
            <TileCard key={tile.id} tile={tile} x={x} y={y} width={w} height={h} rotation={rot} ownership={ownership} players={players} isSelected={selectedTileId === tile.id} onSelect={selectTile} isCurrentPosition={playersOnTile.length > 0} />
          );
        })}

        {Object.entries(playersByPosition).map(([posStr, posPlayers]) => {
          const pos = parseInt(posStr);
          const center = getTokenCenter(pos);
          return posPlayers.map((player, idx) => (
            <PlayerToken key={player.id} player={player} position={center} index={idx} totalAtPosition={posPlayers.length} />
          ));
        })}

        {currentPlayer && !currentPlayer.isBankrupt && (() => {
          const center = getTokenCenter(currentPlayer.position);
          return (
            <motion.circle cx={center[0]} cy={center[1]} r={16} fill="none" stroke={PLAYER_COLOR_HEX[currentPlayer.color]} strokeWidth={2} opacity={0.6} animate={{ r: [14, 18, 14], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
          );
        })()}
      </svg>

      {gameState && (phase === "rolling" || phase === "buying") && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-violet-500/40 flex flex-col items-center gap-3 pointer-events-auto">
            <div className="flex gap-3">
              <DiceRenderer value={gameState.diceValues[0]} rolling={rolling} />
              <DiceRenderer value={gameState.diceValues[1]} rolling={rolling} />
            </div>
            {gameState.diceValues[0] === gameState.diceValues[1] && <p className="text-yellow-400 font-bold text-xs">Double!</p>}
            {onRoll && (
              <motion.button onClick={onRoll} disabled={rolling} className="px-6 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-all" whileTap={{ scale: 0.95 }}>
                {rolling ? "Rolling..." : "Roll"}
              </motion.button>
            )}
            {buyPanel && <div className="w-full mt-3">{buyPanel}</div>}
          </div>
        </motion.div>
      )}
    </div>
  );
}