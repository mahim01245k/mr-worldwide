"use client";
import { type ReactNode, useMemo, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership, PLAYER_COLOR_HEX } from "@/types/game";

// ── Board constants ──────────────────────────────────────────────────────────
const BS = 900;   // board size
const CS = 104;   // corner tile size
// 11 tiles per non-corner side (from the image: bottom has 11 non-corner tiles)
const TW = (BS - CS * 2) / 11;  // ~62.9px non-corner tile width
const TH = CS;                   // tile height = corner size

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

// Replace your entire getTileLayout function with this:

function getTileLayout(tile: BoardTile): {
  x: number; y: number; w: number; h: number;
  side: "bottom" | "right" | "top" | "left" | "corner";
  textRot: number; bandEdge: "top" | "bottom" | "left" | "right";
} {
  const { position, index, id } = tile;

  // ── Corners by id ──────────────────────────────────────────────────────
  if (id === 0) return { x: 0, y: 0, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "bottom" }; // top-left  START
  if (id === 12) return { x: BS - CS, y: 0, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "bottom" }; // top-right PRISON
  if (id === 24) return { x: BS - CS, y: BS - CS, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "top" }; // bot-right VACATION
  if (id === 36) return { x: 0, y: BS - CS, w: CS, h: CS, side: "corner", textRot: 0, bandEdge: "top" }; // bot-left  GO-TO-PRISON

  // ── Top row: ids 1–11, left→right ──────────────────────────────────────
  if (position === "top") {
    return { x: CS + index * TW, y: 0, w: TW, h: CS, side: "top", textRot: 180, bandEdge: "bottom" };
  }

  // ── Right col: ids 13–23, top→bottom ───────────────────────────────────
  if (position === "right") {
    return { x: BS - CS, y: CS + index * TW, w: CS, h: TW, side: "right", textRot: -90, bandEdge: "left" };
  }

  // ── Bottom row: ids 25–35, right→left ──────────────────────────────────
  if (position === "bottom") {
    return { x: BS - CS - (index + 1) * TW, y: BS - CS, w: TW, h: CS, side: "bottom", textRot: 0, bandEdge: "top" };
  }

  // ── Left col: ids 37–47, bottom→top ────────────────────────────────────
  if (position === "left") {
    return { x: 0, y: BS - CS - (index + 1) * TW, w: CS, h: TW, side: "left", textRot: 90, bandEdge: "right" };
  }

  return { x: 0, y: 0, w: TW, h: CS, side: "top", textRot: 0, bandEdge: "bottom" };
}

function getTokenCenter(tileId: number): [number, number] {
  const tile = BOARD_TILES.find(t => t.id === tileId);
  if (!tile) return [BS / 2, BS / 2];
  const { x, y, w, h } = getTileLayout(tile);
  return [x + w / 2, y + h / 2];
}
function getFlagCenter(tile: BoardTile): [number, number] | null {
  if (!tile.flagCode) return null;
  const { x, y, w, h, side } = getTileLayout(tile);
  if (side === "top") return [x + w / 2, y + h];
  if (side === "right") return [x, y + h / 2];
  if (side === "bottom") return [x + w / 2, y];
  if (side === "left") return [x + w, y + h / 2];
  return null;
}
// ── Tile renderer ────────────────────────────────────────────────────────────
const TileCard = memo(({ tile, ownership, ownerColor, isSelected, onSelect }: {
  tile: BoardTile;
  ownership?: PropertyOwnership;
  ownerColor: string | null;
  isSelected: boolean;
  onSelect: (id: number) => void;
}) => {
  const layout = getTileLayout(tile);
  const { x, y, w, h, side, textRot, bandEdge } = layout;

  const isProperty = ["property", "airport", "utility"].includes(tile.type);

  // Color for the band
  const bandColor = (() => {
    if (tile.color && tile.color !== "none") return COLOR_HEX[tile.color];
    switch (tile.type) {
      case "start": return "#00e701"; // Kick Green
      case "vacation": return "#00ccff"; // Light Blue
      case "go-to-prison": return "#ff4d4d"; // Red
      case "prison": return "#9966ff"; // Purple
      case "treasure": return "#ffcc00"; // Yellow
      case "surprise": return "#9966ff"; // Purple
      case "airport": return "#00ccff"; // Light Blue
      case "tax": return "#ff9900"; // Orange
      case "utility": return "#00ccff"; // Light Blue
      default: return "#3a3a3a"; // Dark Grey
    }
  })();

  const BAND = 14; // band thickness in px

  // Band rect based on which edge
  const bandRect = (() => {
    switch (bandEdge) {
      case "top": return { bx: 0, by: 0, bw: w, bh: BAND };
      case "bottom": return { bx: 0, by: h - BAND, bw: w, bh: BAND };
      case "left": return { bx: 0, by: 0, bw: BAND, bh: h };
      case "right": return { bx: w - BAND, by: 0, bw: BAND, bh: h };
    }
  })();

  // For rotated tiles, the "top" in the tile's local frame (after textRot) 
  // is where the flag should go. We place content relative to tile center.
  // The textRot rotates around the tile center.
  const cx = useMemo(() => w / 2, [w]);
  const cy = useMemo(() => h / 2, [h]);

  // In the tile's local (pre-rotation) frame, figure out content dims
  // For rotated tiles (left/right), the visual "height" is actually w, "width" is h
  const isRotated = textRot === 90 || textRot === -90;
  const vW = isRotated ? h : w;  // visual width after rotation
  const vH = isRotated ? w : h;  // visual height after rotation

  // Special icon for non-property non-corner tiles
  const specialEmoji = (() => {
    switch (tile.type) {
      case "treasure": return "💰";
      case "surprise": return "❓";
      case "airport": return "✈️"; // Keep as emoji
      case "utility": return tile.name.includes("Water") ? "💧" : "⛽"; // Keep as emoji
      case "tax": return "💸";
      case "start": return "▶▶"; // Keep as text
      case "vacation": return "🏖️"; // Keep as emoji
      case "go-to-prison": return "☠️";
      case "prison": return "🔒";
      default: return null;
    }
  })();

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={(e) => {
        e.stopPropagation(); // Prevents bubbling issues
        onSelect(tile.id);
      }}
      style={{ cursor: "pointer", pointerEvents: "all" }} // Ensure it catches all clicks
    >
      <defs>
        <clipPath id={`tile-clip-${tile.id}`}>
          <rect x={0} y={0} width={w} height={h} rx={10} />
        </clipPath>
      </defs>

      {/* Base background */}
      <rect x={0} y={0} width={w} height={h}
        fill={isSelected ? "#1e1a3a" : "#13112a"}
        stroke={isSelected ? "#00e701" : ownerColor ? ownerColor + "55" : "#3a3a3a"}
        strokeWidth={isSelected ? 2 : 1}
        rx={10}
        style={{ shapeRendering: "crispEdges" }} // Performance boost for rects
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
      {ownership?.isMortgaged && ( // Keep as is, dark overlay is good
        <rect x={0} y={0} width={w} height={h} fill="#000" fillOpacity={0.5} rx={10} />
      )}

      {/* All content rotated around center */}
      <g clipPath={`url(#tile-clip-${tile.id})`}>
        <g transform={`rotate(${textRot}, ${cx}, ${cy})`}>

          {side === "corner" ? (
            // ── Corner tiles ──────────────────────────────────────────────────
            <g>
              <text x={cx} y={cy - 14} textAnchor="middle" dominantBaseline="middle"
                fontSize={26} style={{ userSelect: "none" }}>
                {specialEmoji} {/* Keep emojis */}
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill="#ffffff" fontWeight="700"
                style={{ userSelect: "none", fontFamily: "var(--font-yanone), sans-serif" }}>
                {tile.name.toUpperCase()}
              </text>
              {tile.type === "start" && (
                <text x={cx} y={cy + 24} textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fill="#00e701"
                  style={{ userSelect: "none" }}>
                  Collect $200
                </text>
              )}
            </g>
          ) : isProperty && tile.flagCode ? (
            // ── Property tiles with flag ──────────────────────────────────────
            <g>
              <image
                href={`https://flagcdn.com/w80/${tile.flagCode.toLowerCase()}.png`}
                x={cx - (vW * 1.2) / 2}
                y={cy - (vH * 1.2) / 2}
                width={vW * 1.2}
                height={vH * 1.2}
                preserveAspectRatio="xMidYMid slice"
                style={{ filter: "blur(4px)", opacity: 0.18, pointerEvents: "none" }}
              />

              {/* City name */}
              <text
                x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
                fontSize={13.5} fill="#ffffff" fontWeight="400"
                style={{ userSelect: "none", fontFamily: "var(--font-yanone), Yanone Kaffeesatz, sans-serif", filter: "url(#richup-text-shadow)" }}
              >
                {tile.name}
              </text>

              {/* Price badge */}
              {tile.price && (
                <g>
                  <rect x={cx - 20} y={cy + 22} width={40} height={16}
                    fill="rgba(0,0,0,0.4)" rx={4} />
                  <text x={cx} y={cy + 30} textAnchor="middle" dominantBaseline="middle"
                    fontSize={10} fill="#ffffff" fontWeight="700"
                    style={{ userSelect: "none" }}>
                    {tile.price}$
                  </text>
                </g>
              )}
            </g>
          ) : (
            // ── Special tiles (treasure, surprise, tax, airport, utility) ─────
            <g>
              {specialEmoji && (
                <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
                  fontSize={tile.type === "tax" ? 14 : 18}
                  style={{ userSelect: "none" }}>
                  {specialEmoji} {/* Keep emojis */}
                </text>
              )}
              <text x={cx} y={cy + (specialEmoji ? 10 : 0)} textAnchor="middle" dominantBaseline="middle"
                fontSize={7.5} fill="#cccccc" fontWeight="700"
                style={{ userSelect: "none", fontFamily: "var(--font-yanone), sans-serif" }}>
                {tile.name}
              </text>
              {tile.type === "tax" && tile.taxAmount && (
                <text x={cx} y={cy + 21} textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fill="#ff4d4d"
                  style={{ userSelect: "none" }}>
                  {tile.taxAmount < 1 ? `${tile.taxAmount * 100}%` : `$${tile.taxAmount}`}
                </text>
              )}
              {tile.price && (
                <g>
                  <rect x={cx - 16} y={cy + 22} width={32} height={13}
                    fill="rgba(0,0,0,0.4)" rx={3} />
                  <text x={cx} y={cy + 29} textAnchor="middle" dominantBaseline="middle"
                    fontSize={8} fill="#ffffff" fontWeight="700"
                    style={{ userSelect: "none" }}>
                    ${tile.price}
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
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
          stroke="#00e701" strokeWidth={2} rx={10} strokeOpacity={0.85} />
      )}
    </g>
  );
});
function FlagLayer({ tiles }: { tiles: BoardTile[] }) {
  return (
    <>
      <defs>
        {tiles.filter(t => t.flagCode).map(tile => (
          <clipPath key={`fc-${tile.id}`} id={`fc-${tile.id}`}>
            <circle cx={0} cy={0} r={15} />
          </clipPath>
        ))}
      </defs>
      {tiles.filter(t => t.flagCode).map(tile => {
        const center = getFlagCenter(tile);
        if (!center) return null;
        const [fx, fy] = center;
        return (
          <g key={`flag-${tile.id}`} transform={`translate(${fx},${fy})`} style={{ pointerEvents: "none", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.6))" }}>
            <image
              href={`https://flagcdn.com/w80/${tile.flagCode!.toLowerCase()}.png`}
              x={-15} y={-15} width={30} height={30}
              clipPath={`url(#fc-${tile.id})`}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        );
      })}
    </>
  );
}
// ── Player token ─────────────────────────────────────────────────────────────
function PlayerToken({ player, cx, cy, ox, rotation }: {
  player: Player; cx: number; cy: number; ox: number; rotation: number;
}) {
  const color = PLAYER_COLOR_HEX[player.color];
  return (
    <motion.g
      animate={{ x: cx + ox, y: cy, rotate: rotation }}
      initial={false}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
    >
      <g transform="scale(0.4) translate(-32, -32)">
        <path d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z" fill={color} />
        <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M32 31.855c17.673 0 32-17.673 32 0a32 32 0 1 1-64 0c0-17.673 14.327 0 32 0Z" fill="#000" />
        <path d="M35.173 45.855a8.827 8.827 0 1 0 17.654 0 8.827 8.827 0 0 0-17.654 0ZM11.609 45.855c0 4.875 3.932 8.827 8.782 8.827s8.782-3.952 8.782-8.828c0-4.875-3.932-8.827-8.782-8.827s-8.782 3.952-8.782 8.828Z" fill="#fff" />
        <path d="M40.828 49.493A3.18 3.18 0 0 0 44 52.681a3.18 3.18 0 0 0 3.173-3.188A3.18 3.18 0 0 0 44 46.305a3.18 3.18 0 0 0-3.173 3.188ZM17.204 49.493a3.188 3.188 0 1 0 6.376 0 3.188 3.188 0 0 0-6.376 0Z" fill="#000" />
      </g>
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
  const dy = mid - dS / 2 - 28;
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
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))" }} />
        {(DOTS[values[0]] || DOTS[1]).map(([px, py], i) => (
          <circle key={i}
            cx={d1x + (px / 100) * dS}
            cy={dy + (py / 100) * dS}
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
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))" }} />
        {(DOTS[values[1]] || DOTS[1]).map(([px, py], i) => (
          <circle key={i}
            cx={d2x + (px / 100) * dS}
            cy={dy + (py / 100) * dS}
            r={6} fill="#1e1b4b" />
        ))}
      </motion.g>

      {/* Labels */}
      <text x={mid} y={dy + dS + 20} textAnchor="middle"
        fontSize={12} fill={isDouble ? "#ffcc00" : "#00e701"}
        fontWeight="700" style={{ userSelect: "none", fontFamily: "var(--font-yanone), sans-serif" }}>
        {phase === "waiting" ? "" : isDouble ? `Double! (${total})` : `Total: ${total}`}
      </text>

      {/* Roll button */}
      <g
        onClick={active ? onRoll : undefined}
        style={{ cursor: active ? "pointer" : "not-allowed", fontFamily: "var(--font-yanone), sans-serif" }}
      >
        <rect x={mid - 72} y={mid + 20} width={144} height={40} rx={10}
          fill={active ? "#00e701" : "#282828"}
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
  const { gameState, selectedTileId, selectTile, toggleTileDetail } = useGameStore();
  const tiles = useMemo(() => BOARD_TILES, []);

  if (!gameState) return null;

  const { players, properties, currentPlayerIndex, diceValues } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  const byPos = players.reduce<Record<number, Player[]>>((acc, p) => {
    if (!p.isBankrupt) { acc[p.position] = [...(acc[p.position] || []), p]; }
    return acc;
  }, {});

  const handleTileSelect = useCallback((id: number) => {
    selectTile(id);
    toggleTileDetail(true);
  }, [selectTile, toggleTileDetail]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${BS} ${BS}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        style={{
          display: "block", // <--- THIS IS THE KEY FIX
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          overflow: "visible",
          filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.9))"
        }}
      >
        <defs>
          {/* Flag clip paths are defined inline per tile */}
          <filter id="richup-text-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feFlood floodColor="#1a1a1a" floodOpacity="1" result="floodColor"></feFlood>
            <feComposite in="floodColor" in2="SourceAlpha" operator="in" result="coloredShadow"></feComposite>
            <feGaussianBlur in="coloredShadow" stdDeviation="1.2" result="blurredShadow"></feGaussianBlur>
            <feOffset dx="0" dy="0" in="blurredShadow" result="offsetShadow"></feOffset>
            <feMerge>
              <feMergeNode in="offsetShadow"></feMergeNode>
              <feMergeNode in="SourceGraphic"></feMergeNode>
            </feMerge>
          </filter>
        </defs>

        {/* Board background */}
        <rect x={0} y={0} width={BS} height={BS} fill="#1a1a1a" rx={12} />

        {/* Inner center */}
        <rect x={CS} y={CS} width={BS - CS * 2} height={BS - CS * 2} fill="#282828" rx={4} />

        {/* All tiles */}
        {tiles.map(tile => {
          const ownership = properties.find(p => p.tileId === tile.id);
          const owner = ownership ? players.find(p => p.id === ownership.ownerId) : null;
          const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : null;

          return (
            <TileCard
              key={tile.id}
              tile={tile}
              ownership={ownership}
              ownerColor={ownerColor}
              isSelected={selectedTileId === tile.id}
              onSelect={handleTileSelect}
            />
          );
        })}
        <FlagLayer tiles={tiles} />
        {/* Player tokens */}
        {Object.entries(byPos).map(([posStr, posPlayers]) => {
          const pos = parseInt(posStr);
          const [cx, cy] = getTokenCenter(pos);

          const tile = BOARD_TILES.find(t => t.id === pos);
          let baseRot = 0;
          if (tile) {
            if (tile.position === "top" || pos === 0) baseRot = 90;
            else if (tile.position === "right" || pos === 12) baseRot = 180;
            else if (tile.position === "bottom" || pos === 24) baseRot = 270;
            else if (tile.position === "left" || pos === 36) baseRot = 0;
          }
          // Natural SVG orientation of the token (eyes at bottom) faces Down.
          // We add 180 so that "baseRot = 0" (Left side) results in facing Up.
          const rotation = (baseRot + 180) % 360;

          return posPlayers.map((player, idx) => {
            const total = posPlayers.length;
            const ox = total > 1 ? (idx - (total - 1) / 2) * 14 : 0;
            return <PlayerToken key={player.id} player={player} cx={cx} cy={cy} ox={ox} rotation={rotation} />;
          });
        })}

        {/* Current player pulse ring */}
        {currentPlayer && !currentPlayer.isBankrupt && (() => {
          const [cx, cy] = getTokenCenter(currentPlayer.position);
          return (
            <motion.circle cx={cx} cy={cy} r={15} fill="none" // Keep player color distinct
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
          <foreignObject x={CS + 20} y={BS / 2 + 80} width={BS - CS * 2 - 40} height={120}>
            <div>{buyPanel}</div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
}