"use client";
import { type ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership, PLAYER_COLOR_HEX } from "@/types/game";

// ── Board constants ──────────────────────────────────────────────────────────
const BS  = 900;   // board size
const CS  = 104;   // corner tile size
// 11 tiles per non-corner side (from the image: bottom has 11 non-corner tiles)
const TW  = (BS - CS * 2) / 11;  // ~62.9px non-corner tile width
const TH  = CS;                   // tile height = corner size

// ── Tile layout: returns [x, y, w, h, rotation] ─────────────────────────────
// Rotation is applied around tile center for text/content orientation ONLY.
// Rect positions are always in absolute board coordinates.
//
// Visual orientation from the image:
//   bottom row  → text reads upward (rotated 180° from default SVG, so we rotate content 180°... 
//                 actually bottom row reads normally: flag on top, name in middle, price at bottom)
//   right col   → text reads from bottom-to-top (rotate content -90°)
//   top row     → text reads downward/upside-down (rotate content 180°)  
//   left col    → text reads from top-to-bottom (rotate content 90°)
//
// The color band is always on the OUTER edge of each tile.

function getTileLayout(tile: BoardTile): {
  x: number; y: number; w: number; h: number;
  side: "bottom" | "right" | "top" | "left" | "corner";
  textRot: number; bandEdge: "top" | "bottom" | "left" | "right";
} {
  const i = tile.id;

  // 1. Top-Left Corner (START)
  if (i === 0) return { x: 0, y: 0, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "bottom" };

  // 2. Top Edge (Left to Right)
  if (i > 0 && i < 12) {
    const x = CS + (i - 1) * TW;
    return { x, y: 0, w: TW, h: CS, side: "top", textRot: 180, bandEdge: "bottom" };
  }

  // 3. Top-Right Corner
  if (i === 12) return { x: BS - CS, y: 0, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "bottom" };

  // 4. Right Edge (Top to Bottom)
  if (i > 12 && i < 24) {
    const y = CS + (i - 13) * TW;
    return { x: BS - CS, y, w: CS, h: TW, side: "right", textRot: -90, bandEdge: "left" };
  }

  // 5. Bottom-Right Corner
  if (i === 24) return { x: BS - CS, y: BS - CS, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "top" };

  // 6. Bottom Edge (Right to Left)
  if (i > 24 && i < 36) {
    const x = BS - CS - (i - 24) * TW;
    return { x, y: BS - CS, w: TW, h: CS, side: "bottom", textRot: 0, bandEdge: "top" };
  }

  // 7. Bottom-Left Corner (Prison)
  if (i === 36) return { x: 0, y: BS - CS, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "top" };

  // 8. Left Edge (Bottom to Top)
  if (i > 36) {
    const leftTW = (BS - CS * 2) / 10;
    const y = BS - CS - (i - 36) * leftTW;
    return { x: 0, y, w: CS, h: leftTW, side: "left", textRot: 90, bandEdge: "right" };
  }

  return { x: 0, y: 0, w: TW, h: CS, side: "bottom", textRot: 0, bandEdge: "top" };
}

function getTokenCenter(tileId: number): [number, number] {
  const tile = BOARD_TILES.find(t => t.id === tileId);
  if (!tile) return [BS / 2, BS / 2];
  const { x, y, w, h } = getTileLayout(tile);
  return [x + w / 2, y + h / 2];
}

// ── Tile renderer ────────────────────────────────────────────────────────────
function TileCard({ tile, ownership, players, isSelected, onSelect }: {
  tile: BoardTile;
  ownership?: PropertyOwnership;
  players: Player[];
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  const layout = getTileLayout(tile);
  const { x, y, w, h, side, textRot, bandEdge } = layout;

  const owner = ownership ? players.find(p => p.id === ownership.ownerId) : null;
  const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : null;
  const isCorner = side === "corner";
  const isProperty = ["property", "airport", "utility"].includes(tile.type);

  // Color for the band
  const bandColor = (() => {
    if (tile.color && tile.color !== "none") return COLOR_HEX[tile.color];
    switch (tile.type) {
      case "start":        return "#16a34a";
      case "vacation":     return "#0891b2";
      case "go-to-prison": return "#dc2626";
      case "prison":       return "#7c3aed";
      case "treasure":     return "#d97706";
      case "surprise":     return "#7c3aed";
      case "airport":      return "#0369a1";
      case "tax":          return "#b91c1c";
      case "utility":      return "#0891b2";
      default:             return "#1e1b4b";
    }
  })();

  const BAND = 14; // band thickness in px

  // Band rect based on which edge
  const bandRect = (() => {
    switch (bandEdge) {
      case "top":    return { bx: 0,      by: 0,      bw: w, bh: BAND };
      case "bottom": return { bx: 0,      by: h-BAND, bw: w, bh: BAND };
      case "left":   return { bx: 0,      by: 0,      bw: BAND, bh: h };
      case "right":  return { bx: w-BAND, by: 0,      bw: BAND, bh: h };
    }
  })();

  // For rotated tiles, the "top" in the tile's local frame (after textRot) 
  // is where the flag should go. We place content relative to tile center.
  // The textRot rotates around the tile center.
  const cx = w / 2;
  const cy = h / 2;

  // In the tile's local (pre-rotation) frame, figure out content dims
  // For rotated tiles (left/right), the visual "height" is actually w, "width" is h
  const isRotated = textRot === 90 || textRot === -90;
  const vW = isRotated ? h : w;  // visual width after rotation
  const vH = isRotated ? w : h;  // visual height after rotation

  // Special icon for non-property non-corner tiles
  const specialEmoji = (() => {
    switch (tile.type) {
      case "treasure":     return "💰";
      case "surprise":     return "❓";
      case "airport":      return "✈️";
      case "utility":      return tile.name.includes("Water") ? "💧" : "⛽";
      case "tax":          return "💸";
      case "start":        return "▶▶";
      case "vacation":     return "🏖️";
      case "go-to-prison": return "☠️";
      case "prison":       return "🔒";
      default:             return null;
    }
  })();

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={() => onSelect(tile.id)}
      style={{ cursor: "pointer" }}
    >
      {/* Base background */}
      <rect x={0} y={0} width={w} height={h}
        fill={isSelected ? "#1e1a3a" : "#13112a"}
        stroke={isSelected ? "#a78bfa" : ownerColor ? ownerColor + "55" : "#1e1b4b"}
        strokeWidth={isSelected ? 2 : 0.8}
        rx={2}
      />

      {/* Color band */}
      {/* {!isCorner && bandRect && (
        <rect x={bandRect.bx} y={bandRect.by} width={bandRect.bw} height={bandRect.bh}
          fill={bandColor} rx={1} />
      )} */}

      {/* Corner colored background tint */}
      {/* {isCorner && (
        <rect x={0} y={0} width={w} height={h}
          fill={bandColor} fillOpacity={0.15} rx={2} />
      )} */}

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <rect x={0} y={0} width={w} height={h} fill="#000" fillOpacity={0.5} rx={2} />
      )}

      {/* All content rotated around center */}
      <g transform={`rotate(${textRot}, ${cx}, ${cy})`}>

        {isCorner ? (
          // ── Corner tiles ──────────────────────────────────────────────────
          <g>
            <text x={cx} y={cy - 14} textAnchor="middle" dominantBaseline="middle"
              fontSize={26} style={{ userSelect: "none" }}>
              {specialEmoji}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
              fontSize={9} fill="#e2e8f0" fontWeight="700"
              style={{ userSelect: "none" }}>
              {tile.name.toUpperCase()}
            </text>
            {tile.type === "start" && (
              <text x={cx} y={cy + 24} textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fill="#22c55e"
                style={{ userSelect: "none" }}>
                Collect $200
              </text>
            )}
          </g>
        ) : isProperty && tile.flagCode ? (
          // ── Property tiles with flag ──────────────────────────────────────
          // In local rotated frame: vH = visual height, vW = visual width
          // Top area (after band): flag
          // Middle: city name
          // Bottom: price badge
          <g>
            {/* Flag image via foreignObject — but foreignObject + SVG transforms is buggy.
                Instead use a clipped circle with image */}
            <clipPath id={`flag-clip-${tile.id}`}>
              <circle cx={cx} cy={cy - vH * 0.15} r={12} />
            </clipPath>
            <image
              href={`https://flagcdn.com/w40/${tile.flagCode.toLowerCase()}.png`}
              x={cx - 12} y={cy - vH * 0.15 - 12}
              width={24} height={24}
              clipPath={`url(#flag-clip-${tile.id})`}
              preserveAspectRatio="xMidYMid slice"
            />
            <circle cx={cx} cy={cy - vH * 0.15} r={12}
              fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

            {/* City name */}
            <text x={cx} y={cy + vH * 0.1} textAnchor="middle" dominantBaseline="middle"
              fontSize={vW > 60 ? 8.5 : 7.5} fill="#e8e4ff" fontWeight="700"
              style={{ userSelect: "none" }}>
              {tile.name.length > 9 ? tile.name.slice(0, 8) + "…" : tile.name}
            </text>

            {/* Price badge */}
            {tile.price && (
              <g>
                <rect x={cx - 16} y={cy + vH * 0.28} width={32} height={13}
                  fill="rgba(0,0,0,0.45)" rx={3}
                  stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
                <text x={cx} y={cy + vH * 0.28 + 7} textAnchor="middle" dominantBaseline="middle"
                  fontSize={8} fill="#fff" fontWeight="700"
                  style={{ userSelect: "none" }}>
                  ${tile.price}
                </text>
              </g>
            )}
          </g>
        ) : (
          // ── Special tiles (treasure, surprise, tax, airport, utility) ─────
          <g>
            {specialEmoji && (
              <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
                fontSize={tile.type === "tax" ? 14 : 18}
                style={{ userSelect: "none" }}>
                {specialEmoji}
              </text>
            )}
            <text x={cx} y={cy + (specialEmoji ? 10 : 0)} textAnchor="middle" dominantBaseline="middle"
              fontSize={7.5} fill="#ddd8ff" fontWeight="700"
              style={{ userSelect: "none" }}>
              {tile.name.length > 9 ? tile.name.slice(0, 8) + "…" : tile.name}
            </text>
            {tile.type === "tax" && tile.taxAmount && (
              <text x={cx} y={cy + 21} textAnchor="middle" dominantBaseline="middle"
                fontSize={7} fill="#fca5a5"
                style={{ userSelect: "none" }}>
                {tile.taxAmount < 1 ? `${tile.taxAmount * 100}%` : `$${tile.taxAmount}`}
              </text>
            )}
            {tile.price && (
              <g>
                <rect x={cx - 16} y={cy + 22} width={32} height={13}
                  fill="rgba(0,0,0,0.45)" rx={3} />
                <text x={cx} y={cy + 29} textAnchor="middle" dominantBaseline="middle"
                  fontSize={8} fill="#fff" fontWeight="700"
                  style={{ userSelect: "none" }}>
                  ${tile.price}
                </text>
              </g>
            )}
          </g>
        )}
      </g>

      {/* Owner dot (always in tile corner, not rotated) */}
      {ownerColor && (
        <circle cx={w - 7} cy={7} r={5} fill={ownerColor} stroke="#fff" strokeWidth={1} />
      )}

      {/* Buildings */}
      {ownership && !ownership.isMortgaged && (
        ownership.hasHotel
          ? <rect x={4} y={h - 10} width={9} height={7} fill="#ef4444" rx={1} />
          : Array.from({ length: ownership.houses }).map((_, i) =>
              <rect key={i} x={3 + i * 7} y={h - 9} width={5} height={6} fill="#22c55e" rx={1} />
            )
      )}

      {/* Selected glow */}
      {isSelected && (
        <rect x={0} y={0} width={w} height={h} fill="none"
          stroke="#a78bfa" strokeWidth={2} rx={2} strokeOpacity={0.85} />
      )}
    </g>
  );
}

// ── Player token ─────────────────────────────────────────────────────────────
function PlayerToken({ player, cx, cy, ox }: {
  player: Player; cx: number; cy: number; ox: number;
}) {
  return (
    <motion.g
      animate={{ x: cx + ox, y: cy }}
      initial={false}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
    >
      <circle r={11} fill={PLAYER_COLOR_HEX[player.color]} stroke="#fff" strokeWidth={2} />
      <text textAnchor="middle" dominantBaseline="middle" fontSize={11}
        style={{ userSelect: "none" }}>
        {player.avatar}
      </text>
    </motion.g>
  );
}

// ── Dice in center ────────────────────────────────────────────────────────────
function CenterDice({ values, rolling, canRoll, isMyTurn, phase, onRoll }: {
  values: [number, number]; rolling: boolean;
  canRoll: boolean; isMyTurn: boolean; phase: string;
  onRoll: () => void;
}) {
  const DOTS: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[22, 22], [78, 22], [22, 50], [78, 50], [22, 78], [78, 78]],
  };

  const mid = BS / 2;
  const dS = 68; // dice size
  const gap = 14;
  const d1x = mid - dS - gap / 2;
  const d2x = mid + gap / 2;
  const dy  = mid - dS / 2 - 28;
  const isDouble = values[0] === values[1];
  const total = values[0] + values[1];
  const active = canRoll && isMyTurn && !rolling && phase === "rolling";

  return (
    <g>
      {/* Dice 1 */}
      <motion.g
        animate={rolling ? { rotate: [-15, 15, -10, 10, 0] } : { rotate: 0 }}
        style={{ transformOrigin: `${d1x + dS / 2}px ${dy + dS / 2}px` }}
        transition={{ duration: 0.55 }}
      >
        <rect x={d1x} y={dy} width={dS} height={dS} rx={12}
          fill="white"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))" }} />
        {(DOTS[values[0]] || DOTS[1]).map(([px, py], i) => (
          <circle key={i}
            cx={d1x + (px / 100) * dS}
            cy={dy  + (py / 100) * dS}
            r={6} fill="#1e1b4b" />
        ))}
      </motion.g>

      {/* Dice 2 */}
      <motion.g
        animate={rolling ? { rotate: [15, -15, 10, -10, 0] } : { rotate: 0 }}
        style={{ transformOrigin: `${d2x + dS / 2}px ${dy + dS / 2}px` }}
        transition={{ duration: 0.55 }}
      >
        <rect x={d2x} y={dy} width={dS} height={dS} rx={12}
          fill="white"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.8))" }} />
        {(DOTS[values[1]] || DOTS[1]).map(([px, py], i) => (
          <circle key={i}
            cx={d2x + (px / 100) * dS}
            cy={dy  + (py / 100) * dS}
            r={6} fill="#1e1b4b" />
        ))}
      </motion.g>

      {/* Labels */}
      <text x={mid} y={dy + dS + 20} textAnchor="middle"
        fontSize={12} fill={isDouble ? "#fbbf24" : "#8b7cf6"}
        fontWeight="700" style={{ userSelect: "none" }}>
        {phase === "waiting" ? "" : isDouble ? `Double! (${total})` : `Total: ${total}`}
      </text>

      {/* Roll button */}
      <g
        onClick={active ? onRoll : undefined}
        style={{ cursor: active ? "pointer" : "not-allowed" }}
      >
        <rect x={mid - 72} y={mid + 20} width={144} height={40} rx={10}
          fill={active ? "#7c3aed" : "#2a2550"}
          style={{ transition: "fill 0.2s" }}
        />
        <text x={mid} y={mid + 45} textAnchor="middle"
          fontSize={14} fill={active ? "#fff" : "#6b7280"}
          fontWeight="800" style={{ userSelect: "none" }}>
          {rolling ? "Rolling..." : isMyTurn && phase === "rolling" ? "🎲  Roll Dice" : "Waiting..."}
        </text>
      </g>
    </g>
  );
}

// ── Main GameBoard export ────────────────────────────────────────────────────
export function GameBoard({
  onRoll,
  canRoll = false,
  rolling = false,
  isMyTurn = false,
  phase = "waiting",
  buyPanel,
}: {
  onRoll?: () => void;
  canRoll?: boolean;
  rolling?: boolean;
  isMyTurn?: boolean;
  phase?: string;
  buyPanel?: ReactNode;
} = {}) {
  const { gameState, selectedTileId, selectTile } = useGameStore();
  const tiles = useMemo(() => BOARD_TILES, []);

  if (!gameState) return null;

  const { players, properties, currentPlayerIndex, diceValues } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  const byPos = players.reduce<Record<number, Player[]>>((acc, p) => {
    if (!p.isBankrupt) { acc[p.position] = [...(acc[p.position] || []), p]; }
    return acc;
  }, {});

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${BS} ${BS}`}
        className="w-full h-full"
        style={{ maxWidth: 900, maxHeight: 900,
          filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.9))" }}
      >
        <defs>
          {/* Flag clip paths are defined inline per tile */}
        </defs>

        {/* Board background */}
        <rect x={0} y={0} width={BS} height={BS} fill="#0d0b1e" rx={12} />

        {/* Inner center */}
        <rect x={CS} y={CS} width={BS - CS*2} height={BS - CS*2} fill="#080616" rx={4} />

        {/* Center label */}
        <text x={BS/2} y={BS/2 - 85} textAnchor="middle" fontSize={12}
          fill="#2d2a4a" letterSpacing={5} fontWeight="700"
          style={{ userSelect: "none" }}>
          BOARD PREVIEW
        </text>
        <text x={BS/2} y={BS/2 - 60} textAnchor="middle" fontSize={26}
          fill="#4c3a8a" fontWeight="900" letterSpacing={2}
          style={{ userSelect: "none" }}>
          Mr. Worldwide
        </text>
        <text x={BS/2} y={BS/2 - 32} textAnchor="middle" fontSize={48}
          style={{ userSelect: "none" }}>
          🌍
        </text>

        {/* All tiles */}
        {tiles.map(tile => (
          <TileCard
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
            const ox = total > 1 ? (idx - (total - 1) / 2) * 14 : 0;
            return <PlayerToken key={player.id} player={player} cx={cx} cy={cy} ox={ox} />;
          });
        })}

        {/* Current player pulse ring */}
        {currentPlayer && !currentPlayer.isBankrupt && (() => {
          const [cx, cy] = getTokenCenter(currentPlayer.position);
          return (
            <motion.circle cx={cx} cy={cy} r={15} fill="none"
              stroke={PLAYER_COLOR_HEX[currentPlayer.color]} strokeWidth={2.5}
              animate={{ r: [13, 19, 13], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
          );
        })()}

        {/* Dice + roll button in center */}
        {onRoll && (
          <CenterDice
            values={diceValues}
            rolling={rolling}
            canRoll={canRoll}
            isMyTurn={isMyTurn}
            phase={phase}
            onRoll={onRoll}
          />
        )}

        {/* Buy panel overlay */}
        {buyPanel && (
          <foreignObject x={CS + 20} y={BS/2 + 80} width={BS - CS*2 - 40} height={120}>
            <div>{buyPanel}</div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
}
