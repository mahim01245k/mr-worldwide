"use client";
import { type ReactNode, useMemo, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { Player, PropertyOwnership, PLAYER_COLOR_HEX } from "@/types/game";

// ── Board constants ──────────────────────────────────────────────────────────
const BS = 900;   // board size
const CS = 100;   // corner tile size
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
    return { x: CS + index * TW, y: 0, w: TW, h: CS, side: "top", textRot: 0, bandEdge: "bottom" };
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

  const isPurchasable = ["property", "airport", "utility"].includes(tile.type);
  const isOwned = !!ownerColor && !!ownership && !ownership.isMortgaged;

  const cx = w / 2;
  const cy = h / 2;
  const isRotated = textRot === 90 || textRot === -90;
  const vW = isRotated ? h : w;

  const specialEmoji = (() => {
    switch (tile.type) {
      case "treasure": return "💰";
      case "surprise": return "❓";
      case "airport": return null;
      case "utility": return tile.name.includes("Water") ? "💧" : "⛽";
      case "tax": return "💸";
      case "start": return "▶▶";
      case "vacation": return "🏖️";
      case "go-to-prison": return "☠️";
      case "prison": return "🔒";
      default: return null;
    }
  })();

  // --- Determine outward edge (away from board centre) ---
  // bandEdge is the inward edge; we take the opposite.
  let outwardEdge = "";
  if (bandEdge === "bottom") outwardEdge = "top";
  else if (bandEdge === "top") outwardEdge = "bottom";
  else if (bandEdge === "left") outwardEdge = "right";
  else if (bandEdge === "right") outwardEdge = "left";
  else outwardEdge = "bottom";

  // --- Owner bar dimensions ---
  const barThickness = 24;
  const radius = 8;
  let barX = 0, barY = 0, barW = w, barH = barThickness;
  let isVertical = false;

  switch (outwardEdge) {
    case "bottom":
      barY = h - barThickness;
      barW = w;
      barH = barThickness;
      isVertical = false;
      break;
    case "top":
      barY = 0;
      barW = w;
      barH = barThickness;
      isVertical = false;
      break;
    case "left":
      barX = 0;
      barY = 0;
      barW = barThickness;
      barH = h;
      isVertical = true;
      break;
    case "right":
      barX = w - barThickness;
      barY = 0;
      barW = barThickness;
      barH = h;
      isVertical = true;
      break;
    default:
      barY = h - barThickness;
  }

  // --- Build path for rounded outer edge ---
  const getBarPath = () => {
    const r = radius;
    if (isVertical) {
      if (outwardEdge === "left") {
        // Left edge: rounded on left side
        return `M ${barX + barThickness} ${barY}
                L ${barX + barThickness} ${barY + barH - r}
                A ${r} ${r} 0 0 1 ${barX + barThickness - r} ${barY + barH}
                L ${barX} ${barY + barH}
                L ${barX} ${barY}
                L ${barX + barThickness - r} ${barY}
                A ${r} ${r} 0 0 1 ${barX + barThickness} ${barY + r} Z`;
      } else if (outwardEdge === "right") {
        // Right edge: rounded on right side
        return `M ${barX} ${barY}
                L ${barX} ${barY + barH}
                L ${barX + barThickness - r} ${barY + barH}
                A ${r} ${r} 0 0 1 ${barX + barThickness} ${barY + barH - r}
                L ${barX + barThickness} ${barY + r}
                A ${r} ${r} 0 0 1 ${barX + barThickness - r} ${barY}
                L ${barX} ${barY} Z`;
      }
    } else {
      if (outwardEdge === "top") {
        // Top edge: rounded on top side
        return `M ${barX} ${barY + barThickness}
                L ${barX + barW - r} ${barY + barThickness}
                A ${r} ${r} 0 0 0 ${barX + barW} ${barY + barThickness - r}
                L ${barX + barW} ${barY}
                L ${barX} ${barY}
                L ${barX} ${barY + barThickness - r}
                A ${r} ${r} 0 0 0 ${barX + r} ${barY + barThickness}
                L ${barX} ${barY + barThickness} Z`;
      } else if (outwardEdge === "bottom") {
        // Bottom edge: rounded on bottom side
        return `M ${barX} ${barY}
                L ${barX + barW} ${barY}
                L ${barX + barW} ${barY + barThickness - r}
                A ${r} ${r} 0 0 1 ${barX + barW - r} ${barY + barThickness}
                L ${barX + r} ${barY + barThickness}
                A ${r} ${r} 0 0 1 ${barX} ${barY + barThickness - r}
                L ${barX} ${barY} Z`;
      }
    }
    return "";
  };

  const barFill = isOwned ? ownerColor : "#3a3a3a";
  const price = tile.price;

  // --- Price pill position (only on outward edge, when not owned) ---
  let pillX = cx, pillY = cy;
  let pillW = 46, pillH = 20;
  let isPillHorizontal = true;

  switch (outwardEdge) {
    case "bottom":
      pillY = h - 14;
      break;
    case "top":
      pillY = 14;
      break;
    case "left":
      pillX = 14;
      pillY = cy;
      pillW = 20;
      pillH = 46;
      isPillHorizontal = false;
      break;
    case "right":
      pillX = w - 14;
      pillY = cy;
      pillW = 20;
      pillH = 46;
      isPillHorizontal = false;
      break;
    default:
      pillY = h - 14;
  }

  // --- Airplane SVG for airports ---
  const airplaneBodyPath = "M15 2 L15 6 L22 10 L24 10 L22 8 L20 8 L22 6 L24 6 L22 4 L20 4 L17 2 Z";
  const airplaneWingPath = "M15 8 L15 14 L22 16 L24 16 L22 14 L20 14 L22 12 L24 12 L22 10 L20 10 L17 8 Z";

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={(e) => { e.stopPropagation(); onSelect(tile.id); }}
      style={{ cursor: "pointer", pointerEvents: "all" }}
    >
      <defs>
        <clipPath id={`tile-clip-${tile.id}`}>
          <rect x={0} y={0} width={w} height={h} rx={10} />
        </clipPath>
        <clipPath id={`bg-flag-circle-${tile.id}`}>
          <circle cx={cx} cy={cy} r={Math.max(1, vW * 0.9)} />
        </clipPath>
      </defs>

      {/* Base background */}
      <rect x={0} y={0} width={w} height={h}
        fill={isSelected ? "#1e1a3a" : "#13112a"}
        stroke={ownerColor ? ownerColor + "55" : "#3a3a3a"}
        strokeWidth={isSelected ? 2 : 1}
        rx={10}
      />

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <rect x={0} y={0} width={w} height={h} fill="#000" fillOpacity={0.5} rx={10} />
      )}
      {/* White gradient overlay for airports */}
      {tile.type === "airport" && (
        <rect x={0} y={0} width={w} height={h}
          fill="url(#airport-grad)"
          rx={10}
          style={{ pointerEvents: "none" }}
        />
      )}
      {/* Utility color gradients */}
      {tile.type === "utility" && (
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={
            tile.name.includes("Water")
              ? "url(#water-grad)"
              : tile.name.includes("Electric")
                ? "url(#electric-grad)"
                : tile.name.includes("Gas")
                  ? "url(#gas-grad)"
                  : "url(#water-grad)" // fallback
          }
          rx={10}
          style={{ pointerEvents: "none" }}
        />
      )}


      {/* Rotated content (flag, city name, etc.) */}
      <g clipPath={`url(#tile-clip-${tile.id})`}>
        <g transform={`rotate(${textRot}, ${cx}, ${cy})`}>
          {side === "corner" ? (
            <g>
              <text x={cx} y={cy - 14} textAnchor="middle" dominantBaseline="middle"
                fontSize={26} style={{ userSelect: "none" }}>
                {specialEmoji}
              </text>
              <text x={cx} y={cy + 12} textAnchor="middle"
                fontSize={9} fill="#ffffff" fontWeight="700"
                style={{ userSelect: "none", fontFamily: "var(--font-yanone), sans-serif" }}>
                {tile.name.toUpperCase().split(" ").map((word, i, arr) => (
                  <tspan key={i} x={cx} dy={i === 0 ? (arr.length > 1 ? "-0.2em" : "0.35em") : "1.1em"}>
                    {word}
                  </tspan>
                ))}
              </text>
              {tile.type === "start" && (
                <text x={cx} y={cy + 24} textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fill="#00e701" style={{ userSelect: "none" }}>
                  Collect $200
                </text>
              )}
            </g>
          ) : isPurchasable && tile.flagCode ? (
            <g>
              {tile.type === "airport" ? (
                <g
                  transform={
                    side === "top"
                      ? `translate(${cx - 19}, ${cy + 5}) scale(1.1)`   // near top edge
                      : side === "bottom"
                        ? `translate(${cx - 19}, ${cy + 20}) scale(1.1)`   // near bottom edge
                        : side === "left"
                          ? `translate(${cx + 15}, ${cy - 20}) scale(1.1)`   // adjusted for left column (rotated)
                          : side === "right"
                            ? `translate(${cx - 50}, ${cy - 20}) scale(1.1)`   // adjusted for right column (rotated)
                            : `translate(${cx - 19}, ${cy - 40}) scale(1.1)`
                  }
                >
                  <path
                    d="m21.352 13.742 2.973-12.863a.7.7 0 0 0-.684-.879h-3.412a.712.712 0 0 0-.6.334l-1.848 3.416h-2.9a.707.707 0 0 0-.708.7v2.35a.707.707 0 0 0 .708.7h.88l-3.286 6.219m0 2.562 3.286 6.219h-.88a.707.707 0 0 0-.708.7v2.344a.707.707 0 0 0 .708.7h2.9l1.848 3.416a.72.72 0 0 0 .6.334h3.412a.7.7 0 0 0 .684-.879l-2.973-12.863"
                    fill="#c1c3cd"
                    stroke="none"
                  />
                  <path
                    d="M22.36 11.742a45.033 45.033 0 0 1 5.306.457l2.35-3.89a.714.714 0 0 1 .608-.34h2.514a.7.7 0 0 1 .691.844l-.974 4.851a1.352 1.352 0 0 1 0 2.672l.98 4.851a.705.705 0 0 1-.7.844h-2.514a.714.714 0 0 1-.608-.34l-2.35-3.89a45.033 45.033 0 0 1-5.306.457l-8.884.023h-7.337c-3.388 0-6.139-1.47-6.139-3.281s2.751-3.281 6.139-3.281h7.337Z"
                    fill="#dde7ea"
                    stroke="none"
                  />
                </g>
              ) : tile.type === "property" && (
                <FlagIcon
                  code={tile.flagCode}
                  size={vW * 1.8}
                  isBackground={true}
                  x={cx - (vW * 1.8) / 2}
                  y={cy - (vW * 1.8) / 2}
                  clipPathId={`bg-flag-circle-${tile.id}`}
                  style={{ filter: "blur(6px)", opacity: 0.25, pointerEvents: "none" }}
                />
              )}

              {/* City / Company name */}
              <text
                x={cx}
                y={side === "top" ? cy + 10 : (tile.type === "airport" ? cy + 8 : cy - 2)}
                textAnchor="middle"
                fontSize={18}
                fill="#ffffff"
                fontWeight="400"
                style={{ userSelect: "none", fontFamily: "var(--font-yanone), Yanone Kaffeesatz, sans-serif" }}
              >
                {tile.type === "utility" ? (
                  tile.name.split(" ").map((word, i, arr) => (
                    <tspan key={i} x={cx} dy={i === 0 ? (arr.length > 1 ? "-0.5em" : "0.35em") : "1.1em"}>
                      {word}
                    </tspan>
                  ))
                ) : (
                  tile.name
                )}
              </text>
            </g>
          ) : (
            <g>
              {specialEmoji && (
                <text x={cx} y={side === "top" ? cy + 18 : cy - 10} textAnchor="middle" dominantBaseline="middle"
                  fontSize={tile.type === "tax" ? 14 : 18} style={{ userSelect: "none" }}>
                  {specialEmoji}
                </text>
              )}
              <text x={cx} y={side === "top" ? cy + (specialEmoji ? -6 : 0) : cy + (specialEmoji ? 10 : 0)} textAnchor="middle"
                fontSize={7.5} fill="#cccccc" fontWeight="700"
                style={{ userSelect: "none", fontFamily: "var(--font-yanone), sans-serif" }}>
                {tile.name.split(" ").map((word, i, arr) => (
                  <tspan key={i} x={cx} dy={i === 0 ? (arr.length > 1 ? "-0.2em" : "0.35em") : "1.1em"}>
                    {word}
                  </tspan>
                ))}
              </text>
              {tile.type === "tax" && tile.taxAmount && (
                <text x={cx} y={cy + 21} textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fill="#ff4d4d" style={{ userSelect: "none" }}>
                  {tile.taxAmount < 1 ? `${tile.taxAmount * 100}%` : `$${tile.taxAmount}`}
                </text>
              )}
            </g>
          )}
        </g>
      </g>

      {/* Owner bar – drawn AFTER flag/text, only if owned (and not mortgaged) */}
      {isPurchasable && !(side === "corner") && isOwned && (
        <rect
          x={barX}
          y={barY}
          width={barW}
          height={barH}
          rx={6}
          fill={barFill}
        />
      )}

      {/* Price pill – only shown if tile is NOT owned and NOT mortgaged */}
      {!isOwned && !ownership?.isMortgaged && price && (
        <g>
          <rect
            x={pillX - pillW / 2}
            y={pillY - pillH / 2}
            width={pillW}
            height={pillH}
            fill="rgba(0,0,0,0.6)"
            rx={6}
          />
          <text
            x={pillX}
            y={pillY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={isPillHorizontal ? 12 : 11}
            fill="#ffffff"
            fontWeight="bold"
            transform={side === "left" ? `rotate(90, ${pillX}, ${pillY})` : side === "right" ? `rotate(-90, ${pillX}, ${pillY})` : ""}
            style={{ userSelect: "none" }}
          >
            ${price}
          </text>
        </g>
      )}

      {/* Buildings (houses/hotel) */}
      {ownership && !ownership.isMortgaged && (
        ownership.hasHotel
          ? <rect x={4} y={h - 10} width={9} height={7} fill="#ef4444" rx={1} />
          : Array.from({ length: ownership.houses }).map((_, i) =>
            <rect key={i} x={3 + i * 7} y={h - 9} width={5} height={6} fill="#22c55e" rx={1} />
          )
      )}


    </g>
  );
});



function FlagLayer({ tiles }: { tiles: BoardTile[] }) {
  return (
    <>
      <defs>
        {tiles.filter(t => t.flagCode && t.type !== "airport" && t.type !== "utility").map(tile => (
          <clipPath key={`fc-${tile.id}`} id={`fc-${tile.id}`}>
            <circle cx={0} cy={0} r={15} />
          </clipPath>
        ))}
      </defs>
      {tiles.filter(t => t.flagCode && t.type !== "airport" && t.type !== "utility").map(tile => {
        const center = getFlagCenter(tile);
        if (!center) return null;
        const [fx, fy] = center;
        const { side } = getTileLayout(tile);
        let rot = 0;
        if (side === "left") rot = 90;
        else if (side === "right") rot = -90;
        return (
          <g key={`flag-${tile.id}`} transform={`translate(${fx},${fy}) rotate(${rot})`} style={{ pointerEvents: "none", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.6))" }}>
            <FlagIcon
              code={tile.flagCode!}
              size={30}
              x={-15} y={-15}
              clipPathId={`fc-${tile.id}`}
            />
          </g>
        );
      })}
    </>
  );
}


// ── Player token ─────────────────────────────────────────────────────────────
const PlayerToken = memo(({ player, cx, cy, ox, rotation }: {
  player: Player; cx: number; cy: number; ox: number; rotation: number;
}) => {
  const color = PLAYER_COLOR_HEX[player.color];
  return (
    <motion.g
      animate={{ x: cx + ox, y: cy, rotate: rotation }}
      initial={false}
      style={{ willChange: "transform", pointerEvents: "none" }}
      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
    >
      <g transform="scale(0.4) translate(-32, -32)">
        <path d="M32 64c17.673 0 32-14.327 32-32C64 14.327 49.673 0 32 0 14.327 0 0 14.327 0 32c0 17.673 14.327 32 32 32Z" fill={color} />
        <path opacity="0.1" fillRule="evenodd" clipRule="evenodd" d="M32 31.855c17.673 0 32-17.673 32 0a32 32 0 1 1-64 0c0-17.673 14.327 0 32 0Z" fill="#000" />
        <path d="M35.173 45.855a8.827 8.827 0 1 0 17.654 0 8.827 8.827 0 0 0-17.654 0ZM11.609 45.855c0 4.875 3.932 8.827 8.782 8.827s8.782-3.952 8.782-8.828c0-4.875-3.932-8.827-8.782-8.827s-8.782 3.952-8.782 8.828Z" fill="#fff" />
        <path d="M40.828 49.493A3.18 3.18 0 0 0 44 52.681a3.18 3.18 0 0 0 3.173-3.188A3.18 3.18 0 0 0 44 46.305a3.18 3.18 0 0 0-3.173 3.188ZM17.204 49.493a3.188 3.188 0 1 0 6.376 0 3.188 3.188 0 0 0-6.376 0Z" fill="#000" />
      </g>
    </motion.g>
  );
});

// ── Dice in center ────────────────────────────────────────────────────────────
function CenterActions({ values, rolling, canRoll, isMyTurn, phase, onRoll, onEndTurn, actionPanel }: {
  values: [number, number]; rolling: boolean;
  canRoll: boolean; isMyTurn: boolean; phase: string;
  onRoll?: () => void;
  onEndTurn?: () => void;
  actionPanel?: ReactNode;
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
  const showRollButton = canRoll && isMyTurn && !rolling && phase === "rolling";
  const showEndTurnButton = isMyTurn && !rolling && phase !== "rolling" && onEndTurn; // Only show if onEndTurn is provided

  return (
    <g>
      {/* Action Panel (Buy/Auction/Card/Trade) */}
      {actionPanel && (
        <foreignObject x={mid - 100} y={dy - 110} width={200} height={100}>
          <div className="flex items-center justify-center h-full w-full">
            {actionPanel}
          </div>
        </foreignObject>
      )}

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

      {/* Action buttons */}
      <g>
        {showRollButton && (
          <g
            onClick={onRoll}
            style={{ cursor: "pointer", fontFamily: "var(--font-yanone), sans-serif" }}
          >
            <rect x={mid - 72} y={mid + 20} width={144} height={40} rx={10}
              fill="#00e701"
              style={{ transition: "fill 0.2s" }}
            />
            <text x={mid} y={mid + 45} textAnchor="middle"
              fontSize={14} fill="#fff" fontWeight="800" style={{ userSelect: "none" }}>
              🎲  Roll Dice
            </text>
          </g>
        )}

        {showEndTurnButton && (
          <g
            onClick={onEndTurn}
            style={{ cursor: "pointer", fontFamily: "var(--font-yanone), sans-serif" }}
          >
            <rect x={mid - 72} y={mid + 20} width={144} height={40} rx={10}
              fill="#ff9900" // Orange for End Turn
              style={{ transition: "fill 0.2s" }}
            />
            <text x={mid} y={mid + 45} textAnchor="middle"
              fontSize={14} fill="#fff" fontWeight="800" style={{ userSelect: "none" }}>
              End Turn
            </text>
          </g>
        )}

        {!showRollButton && !showEndTurnButton && (
          <text x={mid} y={mid + 45} textAnchor="middle"
            fontSize={14} fill="#6b7280" fontWeight="800" style={{ userSelect: "none", fontFamily: "var(--font-yanone), sans-serif" }}>
            Waiting...
          </text>
        )}
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
  phase = "waiting", // Default phase
  onEndTurn, // New prop for ending turn
  actionPanel,
}: {
  onRoll?: () => void;
  canRoll?: boolean;
  rolling?: boolean;
  isMyTurn?: boolean;
  phase?: string;
  onEndTurn?: () => void;
  actionPanel?: ReactNode;
} = {}) {
  const { gameState, selectedTileId, selectTile, toggleTileDetail } = useGameStore();
  const tiles = useMemo(() => BOARD_TILES, []);

  if (!gameState) return null;

  const { players, properties, currentPlayerIndex, diceValues } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  const handleTileSelect = useCallback((id: number) => {
    selectTile(id);
    toggleTileDetail(true);
  }, [selectTile, toggleTileDetail]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`0 0 ${BS} ${BS}`}
        shapeRendering="geometricPrecision"

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
          {/* <!-- Water Company – Cyan --> */}
          <radialGradient id="water-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#00bcd4" stopOpacity="0" />
            <stop offset="100%" stopColor="#00bcd4" stopOpacity="0.7" />
          </radialGradient>

          {/* <!-- Electric Company – Yellow --> */}
          <radialGradient id="electric-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#ffcc00" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffcc00" stopOpacity="0.7" />
          </radialGradient>

          {/* <!-- Gas Company – Orange --> */}
          <radialGradient id="gas-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#ff6600" stopOpacity="0" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0.7" />
          </radialGradient>

          {/* <!-- Airport – White glow --> */}
          <radialGradient id="airport-grad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </radialGradient>
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

        {/* Player tokens - Flattened to preserve identity for animation */}
        {players.map((player) => {
          if (player.isBankrupt) return null;

          const pos = player.position;
          const [cx, cy] = getTokenCenter(pos);

          // Calculate offset relative to others on this tile
          const othersOnTile = players.filter(p => p.position === pos && !p.isBankrupt);
          const idx = othersOnTile.findIndex(p => p.id === player.id);
          const total = othersOnTile.length;
          const ox = total > 1 ? (idx - (total - 1) / 2) * 14 : 0;

          // Rotation logic based on board side
          const tile = BOARD_TILES.find(t => t.id === pos);
          let baseRot = 0;
          if (tile) {
            if (tile.position === "top" || pos === 0) baseRot = 90;
            else if (tile.position === "right" || pos === 12) baseRot = 180;
            else if (tile.position === "bottom" || pos === 24) baseRot = 270;
            else if (tile.position === "left" || pos === 36) baseRot = 0;
          }
          const rotation = (baseRot + 180) % 360;

          return (
            <PlayerToken
              key={player.id}
              player={player}
              cx={cx}
              cy={cy}
              ox={ox}
              rotation={rotation}
            />
          );
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
        {(onRoll || onEndTurn) && ( // Show CenterActions if either action is possible
          <CenterActions
            values={diceValues}
            rolling={rolling}
            canRoll={canRoll}
            isMyTurn={isMyTurn}
            phase={phase}
            onRoll={onRoll}
            onEndTurn={onEndTurn}
            actionPanel={actionPanel}
          />
        )}
      </svg>
    </div>
  );
}