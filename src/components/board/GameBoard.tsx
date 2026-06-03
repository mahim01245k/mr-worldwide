"use client";
import { motion } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership, PLAYER_COLOR_HEX } from "@/types/game";

/**
 * Board layout — fixed pixel positions, no rotation tricks.
 * 
 * The board is 660×660. Each side has:
 *   - 2 corner tiles: 80×80px
 *   - 9 regular tiles along each edge
 * 
 * Regular tile dimensions:
 *   - Bottom/Top row: width=(660-160)/9 ≈ 55.5px, height=80px
 *   - Left/Right col: width=80px, height=(660-160)/9 ≈ 55.5px
 * 
 * Tile text is always written bottom-to-top on left/right columns,
 * upside-down on the top row — we achieve this with SVG transforms
 * on the TEXT content only, keeping the rect in the correct place.
 */

const B  = 660;                    // board size
const CS = 80;                     // corner size
const TW = (B - CS * 2) / 9;      // ~55.56px — non-corner tile short dimension
// TW for bottom/top = width, for left/right = height

// ─────────────────────────────────────────────────────────────────────────────
// Absolute tile positions: each entry is { x, y, w, h, side }
// side: "bottom" | "right" | "top" | "left" | "corner"
// ─────────────────────────────────────────────────────────────────────────────
function getTile(id: number): { x: number; y: number; w: number; h: number; side: string } {
  const c = CS, tw = TW;

  // ── BOTTOM ROW (y = B-c..B, left→right, ids 0..12) ──────────────────────
  // 0 = START corner (bottom-left)
  if (id === 0) return { x: 0, y: B-c, w: c, h: c, side: "corner-bl" };
  // 1–11 = regular bottom tiles
  if (id >= 1 && id <= 11) {
    const i = id - 1; // 0-based index
    return { x: c + i * tw, y: B - c, w: tw, h: c, side: "bottom" };
  }
  // 12 = VACATION corner (bottom-right)
  if (id === 12) return { x: B-c, y: B-c, w: c, h: c, side: "corner-br" };

  // ── RIGHT COLUMN (x = B-c..B, bottom→top, ids 13..23) ───────────────────
  // 13–22 = regular right tiles (bottom to top)
  if (id >= 13 && id <= 22) {
    const i = id - 13; // 0-based, 0=bottom
    return { x: B-c, y: B - c - c - i * tw, w: c, h: tw, side: "right" };
  }
  // 23 = PRISON corner (top-right)
  if (id === 23) return { x: B-c, y: 0, w: c, h: c, side: "corner-tr" };

  // ── TOP ROW (y = 0..c, right→left, ids 24..34) ──────────────────────────
  // 24–34 = regular top tiles (right to left, 24 is rightmost)
  if (id >= 24 && id <= 34) {
    const i = id - 24; // 0-based, 0=rightmost
    return { x: B - c - c - i * tw, y: 0, w: tw, h: c, side: "top" };
  }
  // Note: top-left corner IS tile 0 (START), no separate id needed

  // ── LEFT COLUMN (x = 0..c, top→bottom, ids 35..48) ──────────────────────
  // 35–45 = regular left tiles
  if (id >= 35 && id <= 45) {
    const i = id - 35;
    return { x: 0, y: c + i * tw, w: c, h: tw, side: "left" };
  }
  // 46 = GO-TO-PRISON corner (bottom-left) — same x,y as id=0, but different content
  // We place it at bottom-left but since id=0 is also there, 
  // id=46 is actually on the LEFT column, last position
  if (id === 46) return { x: 0, y: c + 11 * tw, w: c, h: tw, side: "left" };
  // 47–48 = extra left tiles after the corner
  if (id >= 47 && id <= 48) {
    const i = id - 45; // 47→2, 48→3 from bottom-left area
    return { x: 0, y: c + (11 + i) * tw, w: c, h: tw, side: "left" };
  }

  return { x: 0, y: 0, w: tw, h: c, side: "bottom" };
}

function getTokenCenter(id: number): [number, number] {
  const t = getTile(id);
  return [t.x + t.w / 2, t.y + t.h / 2];
}

// ─────────────────────────────────────────────────────────────────────────────
// Tile renderer — draws rect + content with correct text orientation
// ─────────────────────────────────────────────────────────────────────────────
function Tile({
  tile, ownership, players, isSelected, onSelect
}: {
  tile: BoardTile;
  ownership?: PropertyOwnership;
  players: Player[];
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  const t = getTile(tile.id);
  const owner = ownership ? players.find(p => p.id === ownership.ownerId) : null;
  const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : null;

  const bandColor = (() => {
    if (tile.color && tile.color !== "none") return COLOR_HEX[tile.color];
    switch (tile.type) {
      case "start":        return "#16a34a";
      case "go-to-prison": return "#dc2626";
      case "prison":       return "#6366f1";
      case "vacation":     return "#d97706";
      case "treasure":     return "#b45309";
      case "surprise":     return "#7c3aed";
      case "airport":      return "#0369a1";
      case "tax":          return "#b91c1c";
      case "utility":      return "#0891b2";
      default:             return "#1e1b4b";
    }
  })();

  const bg = isSelected ? "#1a1745" : "#0e0c1f";
  const border = isSelected ? "#7c3aed" : ownerColor ? ownerColor + "55" : "#1e1b4b";

  const { x, y, w, h, side } = t;
  const isCorner = side.startsWith("corner");

  // Color band position depends on which side this tile faces inward
  // The band is always on the OUTER edge
  const bandSize = 12;
  let bandX = 0, bandY = 0, bandW = w, bandH = bandSize;
  if (side === "bottom")       { bandX = 0; bandY = h - bandSize; bandW = w; bandH = bandSize; }
  else if (side === "right")   { bandX = 0; bandY = 0; bandW = bandSize; bandH = h; }
  else if (side === "top")     { bandX = 0; bandY = 0; bandW = w; bandH = bandSize; }
  else if (side === "left")    { bandX = w - bandSize; bandY = 0; bandW = bandSize; bandH = h; }

  // Content center (avoid the band area)
  let cx = w / 2;
  let cy = h / 2;
  if (side === "bottom" && !isCorner) cy = (h - bandSize) / 2;
  if (side === "top"    && !isCorner) cy = bandSize + (h - bandSize) / 2;
  if (side === "right"  && !isCorner) cx = bandSize + (w - bandSize) / 2;
  if (side === "left"   && !isCorner) cx = (w - bandSize) / 2;

  // For left/right tiles, text is rotated 90° so it reads vertically
  // For top tiles, text is upside down (180°)
  const textRotate = side === "right" ? -90 : side === "left" ? 90 : side === "top" ? 180 : 0;
  // Swap w/h for rotated text bounding box
  const textW = (side === "left" || side === "right") ? h : w;

  const emoji = (() => {
    if (tile.flag) return tile.flag;
    switch (tile.type) {
      case "start": return "▶▶";
      case "vacation": return "🏖️";
      case "go-to-prison": return "☠️";
      case "prison": return "🔒";
      case "treasure": return "💰";
      case "surprise": return "❓";
      case "tax": return "💸";
      default: return "";
    }
  })();

  return (
    <g transform={`translate(${x},${y})`} onClick={() => onSelect(tile.id)} style={{ cursor: "pointer" }}>
      {/* Base rect */}
      <rect x={0} y={0} width={w} height={h}
        fill={bg} stroke={border} strokeWidth={isSelected ? 1.5 : 0.7} rx={1.5} />

      {/* Color band */}
      {!isCorner && (
        <rect x={bandX} y={bandY} width={bandW} height={bandH} fill={bandColor} />
      )}

      {/* Corner tile colored background */}
      {isCorner && (
        <rect x={0} y={0} width={w} height={h} fill={bandColor} fillOpacity={0.18} />
      )}

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <rect x={0} y={0} width={w} height={h} fill="#000" fillOpacity={0.55} rx={1.5} />
      )}

      {/* Text content group — rotated for side tiles */}
      <g transform={`translate(${cx},${cy}) rotate(${textRotate})`}>
        {isCorner ? (
          // Corners: big emoji + label
          <>
            <text textAnchor="middle" dominantBaseline="middle" y={-10} fontSize={22} style={{ userSelect: "none" }}>
              {emoji}
            </text>
            <text textAnchor="middle" dominantBaseline="middle" y={12} fontSize={7}
              fill="#e2e8f0" fontWeight="700" style={{ userSelect: "none" }}>
              {tile.name.toUpperCase()}
            </text>
          </>
        ) : (
          // Regular tiles
          <>
            {emoji && (
              <text textAnchor="middle" dominantBaseline="middle" y={-8} fontSize={11}
                style={{ userSelect: "none" }}>
                {emoji}
              </text>
            )}
            <text textAnchor="middle" dominantBaseline="middle"
              y={emoji ? 5 : 0}
              fontSize={emoji ? 6.5 : 7}
              fill="#ddd8ff" fontWeight="600"
              style={{ userSelect: "none" }}>
              {tile.name.length > 9 ? tile.name.slice(0, 8) + "…" : tile.name}
            </text>
            {tile.price && (
              <text textAnchor="middle" dominantBaseline="middle" y={emoji ? 16 : 11}
                fontSize={6} fill="#8b7cf6" style={{ userSelect: "none" }}>
                ${tile.price}
              </text>
            )}
          </>
        )}
      </g>

      {/* Owner dot */}
      {ownerColor && (
        <circle cx={w - 7} cy={7} r={4.5} fill={ownerColor} stroke="#fff" strokeWidth={0.8} />
      )}

      {/* Buildings */}
      {ownership && !ownership.isMortgaged && (
        ownership.hasHotel
          ? <rect x={3} y={h - 9} width={8} height={6} fill="#ef4444" rx={1} />
          : Array.from({ length: ownership.houses }).map((_, i) =>
              <rect key={i} x={3 + i * 6} y={h - 8} width={4} height={5} fill="#22c55e" rx={1} />
            )
      )}

      {/* Selected highlight */}
      {isSelected && (
        <rect x={0} y={0} width={w} height={h} fill="none"
          stroke="#a78bfa" strokeWidth={1.5} rx={1.5} strokeOpacity={0.9} />
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player Token
// ─────────────────────────────────────────────────────────────────────────────
function PlayerToken({ player, cx, cy, offsetX, offsetY }: {
  player: Player; cx: number; cy: number; offsetX: number; offsetY: number;
}) {
  return (
    <motion.g
      animate={{ x: cx + offsetX, y: cy + offsetY }}
      initial={false}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      <circle r={9} fill={PLAYER_COLOR_HEX[player.color]} stroke="#fff" strokeWidth={1.5} />
      <text textAnchor="middle" dominantBaseline="middle" fontSize={10} style={{ userSelect: "none" }}>
        {player.avatar}
      </text>
    </motion.g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dice (shown in board center)
// ─────────────────────────────────────────────────────────────────────────────
function CenterDice({ values, rolling, canRoll, isMyTurn, phase, onRoll }: {
  values: [number, number]; rolling: boolean; canRoll: boolean;
  isMyTurn: boolean; phase: string; onRoll: () => void;
}) {
  const DOT_POS: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[27, 27], [73, 73]],
    3: [[27, 27], [50, 50], [73, 73]],
    4: [[27, 27], [73, 27], [27, 73], [73, 73]],
    5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]],
    6: [[27, 22], [73, 22], [27, 50], [73, 50], [27, 78], [73, 78]],
  };

  // Center of board inner area
  const cx = B / 2;
  const cy = B / 2;
  const diceSize = 52;
  const gap = 10;

  const d1x = cx - diceSize - gap / 2;
  const d2x = cx + gap / 2;
  const dy  = cy - diceSize / 2 - 20;

  const isDouble = values[0] === values[1];
  const total = values[0] + values[1];
  const active = canRoll && isMyTurn && !rolling;

  return (
    <g>
      {/* Dice 1 */}
      <motion.g
        animate={rolling ? { rotate: [-12, 12, -8, 8, 0] } : { rotate: 0 }}
        style={{ transformOrigin: `${d1x + diceSize / 2}px ${dy + diceSize / 2}px` }}
        transition={{ duration: 0.5 }}
      >
        <rect x={d1x} y={dy} width={diceSize} height={diceSize} rx={10}
          fill="white" style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.7))" }} />
        {(DOT_POS[values[0]] || DOT_POS[1]).map(([px, py], i) => (
          <circle key={i}
            cx={d1x + (px / 100) * diceSize}
            cy={dy + (py / 100) * diceSize}
            r={5} fill="#1e1b4b" />
        ))}
      </motion.g>

      {/* Dice 2 */}
      <motion.g
        animate={rolling ? { rotate: [12, -12, 8, -8, 0] } : { rotate: 0 }}
        style={{ transformOrigin: `${d2x + diceSize / 2}px ${dy + diceSize / 2}px` }}
        transition={{ duration: 0.5 }}
      >
        <rect x={d2x} y={dy} width={diceSize} height={diceSize} rx={10}
          fill="white" style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.7))" }} />
        {(DOT_POS[values[1]] || DOT_POS[1]).map(([px, py], i) => (
          <circle key={i}
            cx={d2x + (px / 100) * diceSize}
            cy={dy + (py / 100) * diceSize}
            r={5} fill="#1e1b4b" />
        ))}
      </motion.g>

      {/* Total + double label */}
      {phase !== "waiting" && (
        <>
          <text x={cx} y={dy + diceSize + 18} textAnchor="middle"
            fontSize={11} fill="#a78bfa" fontWeight="600" style={{ userSelect: "none" }}>
            {isDouble ? `${total} — DOUBLE! 🎲` : `Total: ${total}`}
          </text>
        </>
      )}

      {/* Roll button */}
      <g onClick={active ? onRoll : undefined}
        style={{ cursor: active ? "pointer" : "default" }}>
        <rect
          x={cx - 60} y={cy + 12}
          width={120} height={34}
          rx={8}
          fill={active ? "#7c3aed" : "#2d2a4a"}
          style={{ transition: "fill 0.2s" }}
        />
        <text x={cx} y={cy + 34} textAnchor="middle"
          fontSize={12} fill={active ? "#fff" : "#6b7280"}
          fontWeight="700" style={{ userSelect: "none" }}>
          {rolling ? "Rolling..." : isMyTurn && phase === "rolling" ? "Roll Dice 🎲" : "Waiting..."}
        </text>
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main GameBoard export
// ─────────────────────────────────────────────────────────────────────────────
export function GameBoard({ onRoll, rolling }: { onRoll: () => void; rolling: boolean }) {
  const { gameState, myPlayerId, selectedTileId, selectTile } = useGameStore();
  if (!gameState) return null;

  const { players, properties, currentPlayerIndex, diceValues, phase } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const canRoll = isMyTurn && phase === "rolling";

  // Group players by position for stacking
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
        <rect x={CS} y={CS} width={B - CS*2} height={B - CS*2} fill="#080616" rx={3} />

        {/* Center logo text */}
        <text x={B/2} y={B/2 - 70} textAnchor="middle" fontSize={11}
          fill="#2d2a4a" letterSpacing={5} fontWeight="700" style={{ userSelect: "none" }}>
          BOARD PREVIEW
        </text>
        <text x={B/2} y={B/2 - 50} textAnchor="middle" fontSize={22}
          fill="#4c3a8a" fontWeight="900" letterSpacing={2} style={{ userSelect: "none" }}>
          Mr. Worldwide
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
            const offsetX = total > 1 ? (idx - (total - 1) / 2) * 12 : 0;
            const offsetY = 0;
            return (
              <PlayerToken
                key={player.id}
                player={player}
                cx={cx} cy={cy}
                offsetX={offsetX} offsetY={offsetY}
              />
            );
          });
        })}

        {/* Current player pulse */}
        {currentPlayer && !currentPlayer.isBankrupt && (() => {
          const [cx, cy] = getTokenCenter(currentPlayer.position);
          return (
            <motion.circle cx={cx} cy={cy} r={14} fill="none"
              stroke={PLAYER_COLOR_HEX[currentPlayer.color]} strokeWidth={2}
              animate={{ r: [12, 17, 12], opacity: [0.2, 0.65, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
          );
        })()}

        {/* Dice in center */}
        <CenterDice
          values={diceValues}
          rolling={rolling}
          canRoll={canRoll}
          isMyTurn={isMyTurn}
          phase={phase}
          onRoll={onRoll}
        />
      </svg>
    </div>
  );
}