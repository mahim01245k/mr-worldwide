"use client";
// src/components/board/GameBoard.tsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership } from "@/types/game";
import { PLAYER_COLOR_HEX } from "@/types/game";

const BOARD_SIZE = 760;
const CORNER_SIZE = 92;
const TILE_WIDTH = (BOARD_SIZE - CORNER_SIZE * 2) / 9; // ~64px per non-corner tile
const TILE_HEIGHT = CORNER_SIZE; // same height as corner

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

  const getColorForType = () => {
    if (tile.color && tile.color !== "none") return COLOR_HEX[tile.color];
    switch (tile.type) {
      case "start": return "#22c55e";
      case "go-to-prison": return "#dc2626";
      case "prison": return "#6b7280";
      case "vacation": return "#f59e0b";
      case "treasure": return "#d97706";
      case "surprise": return "#7c3aed";
      case "airport": return "#0ea5e9";
      case "tax": return "#dc2626";
      case "utility": return "#0891b2";
      default: return "#1e293b";
    }
  };

  const tileColor = getColorForType();
  const hasBuildings = ownership && (ownership.houses > 0 || ownership.hasHotel);

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
        strokeWidth={isSelected ? 2 : 1}
        rx={3}
      />

      {/* Color band (top for bottom row, left for right column, etc) */}
      {tile.type === "property" || tile.type === "airport" || tile.type === "utility" ? (
        <rect
          x={0} y={0}
          width={width} height={14}
          fill={tileColor}
          rx={3}
        />
      ) : null}

      {/* Special tile colors */}
      {(tile.type === "start" || tile.type === "treasure" || tile.type === "surprise" ||
        tile.type === "go-to-prison" || tile.type === "vacation" || tile.type === "prison" ||
        tile.type === "tax" || tile.type === "airport") && (
        <rect
          x={0} y={0}
          width={width} height={height}
          fill={tileColor}
          fillOpacity={0.15}
          rx={3}
        />
      )}

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <rect x={0} y={0} width={width} height={height} fill="#000" fillOpacity={0.5} rx={3} />
      )}

      {/* Tile content */}
      <g transform={`translate(${width / 2}, ${height / 2 + (tile.type === "property" ? 7 : 0)})`}>
        {/* Flag/emoji */}
        {tile.flag && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            y={-8}
            fontSize={tile.type === "start" || tile.type === "vacation" ? 22 : 14}
            style={{ userSelect: "none" }}
          >
            {tile.flag}
          </text>
        )}

        {/* Name */}
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={tile.flag ? 8 : 0}
          fontSize={8}
          fill="#e2e8f0"
          fontWeight="600"
          fontFamily="system-ui"
          style={{ userSelect: "none" }}
        >
          {tile.name.length > 10 ? tile.name.substring(0, 9) + "…" : tile.name}
        </text>

        {/* Price */}
        {tile.price && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            y={18}
            fontSize={7}
            fill="#94a3b8"
            fontFamily="system-ui"
            style={{ userSelect: "none" }}
          >
            ${tile.price}
          </text>
        )}
      </g>

      {/* Owner dot */}
      {ownerColor && (
        <circle
          cx={width - 8}
          cy={height - 8}
          r={5}
          fill={ownerColor}
          stroke="#fff"
          strokeWidth={1}
        />
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
        <rect
          x={0} y={0}
          width={width} height={height}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
          rx={3}
          opacity={0.8}
        />
      )}
    </g>
  );
}

// Player token component
function PlayerToken({ player, position, index, totalAtPosition }: {
  player: Player;
  position: [number, number];
  index: number;
  totalAtPosition: number;
}) {
  const offset = totalAtPosition > 1 ? (index - (totalAtPosition - 1) / 2) * 12 : 0;

  return (
    <motion.g
      animate={{ x: position[0] + offset, y: position[1] }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      initial={false}
    >
      <circle
        r={10}
        fill={PLAYER_COLOR_HEX[player.color]}
        stroke="#fff"
        strokeWidth={2}
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        style={{ userSelect: "none" }}
      >
        {player.avatar}
      </text>
    </motion.g>
  );
}

function getTilePosition(tileId: number): [number, number, number, number, number] {
  // Returns [x, y, width, height, rotation]
  const cs = CORNER_SIZE;
  const tw = TILE_WIDTH;
  const th = TILE_HEIGHT;

  // Bottom row: 0 (corner) → 12 (corner)
  if (tileId === 0) return [0, BOARD_SIZE - cs, cs, cs, 0]; // START (bottom-left)
  if (tileId >= 1 && tileId <= 11) {
    const idx = tileId;
    return [cs + (idx - 1) * tw, BOARD_SIZE - th, tw, th, 0];
  }
  if (tileId === 12) return [BOARD_SIZE - cs, BOARD_SIZE - cs, cs, cs, 0]; // VACATION (bottom-right)

  // Right column: 13→22
  if (tileId >= 13 && tileId <= 22) {
    const idx = tileId - 13;
    return [BOARD_SIZE - th, BOARD_SIZE - cs - th - idx * tw, th, tw, 90];
  }
  if (tileId === 23) return [BOARD_SIZE - cs, 0, cs, cs, 0]; // PRISON (top-right)

  // Top row: 24→34 (right to left)
  if (tileId >= 24 && tileId <= 34) {
    const idx = tileId - 24;
    return [BOARD_SIZE - cs - th - idx * tw, 0, tw, th, 180];
  }

  // Start is top-left corner (id: 0 but used as reference)
  // Left column: 35→48 (top to bottom)
  if (tileId >= 35 && tileId <= 45) {
    const idx = tileId - 35;
    return [0, cs + idx * tw, th, tw, 270];
  }
  if (tileId === 46) return [0, BOARD_SIZE - cs, cs, cs, 0]; // GO TO PRISON (bottom-left same as start? overlap)
  if (tileId >= 47 && tileId <= 48) {
    const idx = tileId - 45; // 47→2, 48→3
    return [0, cs + (10 + idx) * tw, th, tw, 270];
  }

  return [0, 0, tw, th, 0];
}

function getTokenCenter(tileId: number): [number, number] {
  const [x, y, w, h] = getTilePosition(tileId);
  return [x + w / 2, y + h / 2];
}

export function GameBoard() {
  const { gameState, selectedTileId, selectTile } = useGameStore();

  const tiles = useMemo(() => BOARD_TILES, []);

  if (!gameState) return null;

  const { players, properties, currentPlayerIndex } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    if (!player.isBankrupt) {
      const pos = player.position;
      acc[pos] = acc[pos] || [];
      acc[pos].push(player);
    }
    return acc;
  }, {} as Record<number, Player[]>);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        className="w-full h-full max-w-[760px] max-h-[760px]"
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.8))" }}
      >
        {/* Background */}
        <rect x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} fill="#0a0f1e" rx={12} />

        {/* Center area */}
        <rect
          x={CORNER_SIZE}
          y={CORNER_SIZE}
          width={BOARD_SIZE - CORNER_SIZE * 2}
          height={BOARD_SIZE - CORNER_SIZE * 2}
          fill="#070c19"
          rx={4}
        />

        {/* Center logo */}
        <text
          x={BOARD_SIZE / 2}
          y={BOARD_SIZE / 2 - 30}
          textAnchor="middle"
          fontSize={28}
          fontWeight="900"
          fontFamily="system-ui"
          fill="#7c3aed"
          opacity={0.6}
        >
          🌍
        </text>
        <text
          x={BOARD_SIZE / 2}
          y={BOARD_SIZE / 2 + 10}
          textAnchor="middle"
          fontSize={22}
          fontWeight="900"
          fontFamily="system-ui"
          fill="#a78bfa"
          opacity={0.5}
          letterSpacing={2}
        >
          MR. WORLDWIDE
        </text>
        <text
          x={BOARD_SIZE / 2}
          y={BOARD_SIZE / 2 + 35}
          textAnchor="middle"
          fontSize={10}
          fill="#475569"
          fontFamily="system-ui"
          letterSpacing={4}
        >
          GLOBAL MONOPOLY
        </text>

        {/* Render all tiles */}
        {tiles.map((tile) => {
          const [x, y, w, h, rot] = getTilePosition(tile.id);
          const ownership = properties.find((p) => p.tileId === tile.id);
          const playersOnTile = (playersByPosition[tile.id] || []);

          return (
            <TileCard
              key={tile.id}
              tile={tile}
              x={x}
              y={y}
              width={w}
              height={h}
              rotation={rot}
              ownership={ownership}
              players={players}
              isSelected={selectedTileId === tile.id}
              onSelect={selectTile}
              isCurrentPosition={playersOnTile.length > 0}
            />
          );
        })}

        {/* Render player tokens */}
        {Object.entries(playersByPosition).map(([posStr, posPlayers]) => {
          const pos = parseInt(posStr);
          const center = getTokenCenter(pos);
          return posPlayers.map((player, idx) => (
            <PlayerToken
              key={player.id}
              player={player}
              position={center}
              index={idx}
              totalAtPosition={posPlayers.length}
            />
          ));
        })}

        {/* Current player highlight ring */}
        {currentPlayer && !currentPlayer.isBankrupt && (() => {
          const center = getTokenCenter(currentPlayer.position);
          return (
            <motion.circle
              cx={center[0]}
              cy={center[1]}
              r={16}
              fill="none"
              stroke={PLAYER_COLOR_HEX[currentPlayer.color]}
              strokeWidth={2}
              opacity={0.6}
              animate={{ r: [14, 18, 14], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          );
        })()}
      </svg>
    </div>
  );
}
