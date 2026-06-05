"use client";
import { useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { useGameStore } from "@/lib/store/gameStore";
import { Player, PropertyOwnership, PLAYER_COLOR_HEX } from "@/types/game";

// ─────────────────────────────────────────────────────────────────────────────
// FLAG SVG DATA  — inline SVGs keyed by ISO code so no external requests needed
// for the blurred background. Circular clip is applied per tile with unique IDs.
// For the actual flag image we use flagcdn.com
// ─────────────────────────────────────────────────────────────────────────────

// Color group gradients matching board.txt style
const GROUP_GRADIENT: Record<string, string> = {
  brown:        "linear-gradient(180deg,#5c2d0e 0%,#3b1a08 50%,#2a1205 100%)",
  lightblue:    "linear-gradient(180deg,#0e4d6e 0%,#093a5a 50%,#052840 100%)",
  pink:         "linear-gradient(180deg,#6e0e4d 0%,#5a0938 50%,#400528 100%)",
  orange:       "linear-gradient(180deg,#6e2e0e 0%,#5a1f08 50%,#401205 100%)",
  red:          "linear-gradient(180deg,#6e0e0e 0%,#5a0808 50%,#400505 100%)",
  yellow:       "linear-gradient(180deg,#5a4d0e 0%,#3d3208 50%,#2a2005 100%)",
  green:        "linear-gradient(180deg,#0e4d1e 0%,#083a14 50%,#05280c 100%)",
  darkblue:     "linear-gradient(180deg,#0e1d6e 0%,#091458 50%,#050e40 100%)",
  none:         "linear-gradient(180deg,#21386f 0%,#243564 35%,#2b244c 70%,#46385e 100%)",
};

function getTileGradient(tile: BoardTile): string {
  if (tile.color && tile.color !== "none") return GROUP_GRADIENT[tile.color] || GROUP_GRADIENT.none;
  return GROUP_GRADIENT.none;
}

// ─────────────────────────────────────────────────────────────────────────────
// Board layout — 47 tiles arranged around a square
// Layout matches boardData.ts position/index fields:
//   bottom: index 0(corner)..11..12(corner)   → left→right
//   right:  index 0..10                        → bottom→top
//   top:    index 0..10                        → right→left
//   left:   index 0..11(corner)               → top→bottom
// ─────────────────────────────────────────────────────────────────────────────
const BOTTOM_TILES = BOARD_TILES.filter(t => t.position === "bottom").sort((a,b) => a.index - b.index);
const RIGHT_TILES  = BOARD_TILES.filter(t => t.position === "right").sort((a,b)  => a.index - b.index);
const TOP_TILES    = BOARD_TILES.filter(t => t.position === "top").sort((a,b)    => a.index - b.index);
const LEFT_TILES   = BOARD_TILES.filter(t => t.position === "left").sort((a,b)   => a.index - b.index);

// ─────────────────────────────────────────────────────────────────────────────
// Single tile component — HTML div version matching board.txt exactly
// ─────────────────────────────────────────────────────────────────────────────
function Tile({
  tile,
  ownership,
  players,
  isSelected,
  isCorner = false,
  onSelect,
}: {
  tile: BoardTile;
  ownership?: PropertyOwnership;
  players: Player[];
  isSelected: boolean;
  isCorner?: boolean;
  onSelect: (id: number) => void;
}) {
  const owner = ownership ? players.find(p => p.id === ownership.ownerId) : null;
  const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : null;
  const hasFlag = !!tile.flagCode;
  const isProperty = ["property","airport","utility"].includes(tile.type);

  const gradient = getTileGradient(tile);
  const colorBand = tile.color && tile.color !== "none" ? COLOR_HEX[tile.color] : null;

  const specialContent = () => {
    switch (tile.type) {
      case "start":        return { emoji: "▶▶", label: "START", sub: "Collect $200" };
      case "vacation":     return { emoji: "🏖️", label: "Vacation", sub: "Free Parking" };
      case "go-to-prison": return { emoji: "☠️", label: "Go to Prison", sub: "" };
      case "prison":       return { emoji: "🔒", label: "In Prison", sub: "Just Visiting" };
      case "treasure":     return { emoji: "💰", label: "Treasure", sub: "" };
      case "surprise":     return { emoji: "❓", label: "Surprise", sub: "" };
      case "airport":      return { emoji: "✈️", label: tile.name, sub: tile.subname || "" };
      case "utility":      return { emoji: tile.name.includes("Water") ? "💧" : "⛽", label: tile.name, sub: tile.subname || "" };
      case "tax":          return { emoji: "💸", label: tile.name, sub: tile.taxAmount ? (tile.taxAmount < 1 ? `Pay ${tile.taxAmount*100}%` : `Pay $${tile.taxAmount}`) : "" };
      default: return null;
    }
  };

  const special = specialContent();

  return (
    <div
      onClick={() => onSelect(tile.id)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: gradient,
        boxShadow: isSelected
          ? "inset 0 0 0 2px #a78bfa, inset 0 1px 0 rgba(255,255,255,.15)"
          : ownerColor
          ? `inset 0 0 0 1.5px ${ownerColor}80, inset 0 1px 0 rgba(255,255,255,.15)`
          : "inset 0 1px 0 rgba(255,255,255,.15)",
        cursor: "pointer",
        overflow: "hidden",
        flexShrink: 0,
        transition: "filter 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.25)")}
      onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
    >
      {/* Color band at top (inner edge for non-corner property tiles) */}
      {colorBand && !isCorner && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: colorBand,
          zIndex: 2,
        }} />
      )}

      {/* Mortgage overlay */}
      {ownership?.isMortgaged && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#f87171", fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>MORTGAGED</span>
        </div>
      )}

      {/* Owner dot */}
      {ownerColor && !ownership?.isMortgaged && (
        <div style={{
          position: "absolute", top: 8, right: 6,
          width: 10, height: 10, borderRadius: "50%",
          background: ownerColor,
          border: "1.5px solid white",
          zIndex: 5,
        }} />
      )}

      {/* Buildings */}
      {ownership && !ownership.isMortgaged && (ownership.houses > 0 || ownership.hasHotel) && (
        <div style={{
          position: "absolute", bottom: 20,
          display: "flex", gap: 2,
          zIndex: 5,
        }}>
          {ownership.hasHotel ? (
            <div style={{ width: 10, height: 8, background: "#ef4444", borderRadius: 2 }} />
          ) : (
            Array.from({ length: ownership.houses }).map((_, i) => (
              <div key={i} style={{ width: 6, height: 7, background: "#22c55e", borderRadius: 1 }} />
            ))
          )}
        </div>
      )}

      {isCorner ? (
        // ── Corner tile ──────────────────────────────────────────────────────
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 4,
          padding: 6,
        }}>
          <div style={{ fontSize: 28, lineHeight: 1 }}>{special?.emoji}</div>
          <div style={{
            color: "white",
            fontSize: 9,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.2,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            {special?.label}
          </div>
          {special?.sub && (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 7, textAlign: "center" }}>
              {special.sub}
            </div>
          )}
        </div>
      ) : hasFlag && isProperty ? (
        // ── Property tile with flag (board.txt style) ────────────────────────
        <>
          {/* Blurred flag background — contained within tile */}
          <div style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: "140%",
            height: "120%",
            opacity: 0.18,
            filter: "blur(8px)",
            zIndex: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w80/${tile.flagCode!.toLowerCase()}.png`}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Circular flag — overflows top */}
          <div style={{
            position: "absolute",
            top: -22,
            left: "50%",
            transform: "translateX(-50%)",
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.3)",
            zIndex: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w80/${tile.flagCode!.toLowerCase()}.png`}
              alt={tile.subname}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* City name */}
          <div style={{
            position: "relative",
            zIndex: 2,
            marginTop: 18,
            color: "white",
            fontSize: 11,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            padding: "0 3px",
            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          }}>
            {tile.name}
          </div>

          {/* Price badge */}
          {tile.price && (
            <div style={{
              position: "absolute",
              bottom: 7,
              zIndex: 2,
              background: "rgba(255,255,255,0.18)",
              color: "white",
              fontSize: 11,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 4,
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {tile.price}$
            </div>
          )}
        </>
      ) : (
        // ── Special non-corner tile (tax, treasure, surprise, airport, utility) ──
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          gap: 3,
          padding: "4px 2px",
        }}>
          <div style={{ fontSize: 18, lineHeight: 1 }}>{special?.emoji}</div>
          <div style={{
            color: "white",
            fontSize: 8,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            padding: "0 2px",
          }}>
            {tile.name}
          </div>
          {special?.sub && (
            <div style={{
              background: "rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.9)",
              fontSize: 7,
              fontWeight: 700,
              padding: "2px 5px",
              borderRadius: 3,
              textAlign: "center",
            }}>
              {special.sub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Player token — absolute positioned over the board
// ─────────────────────────────────────────────────────────────────────────────
function PlayerTokens({
  players,
  boardRef,
}: {
  players: Player[];
  boardRef: React.RefObject<HTMLDivElement | null>;
}) {
  // We position tokens using the tile DOM elements
  // Rendered outside the grid, absolutely positioned
  return null; // tokens are rendered inline inside tiles below
}

// ─────────────────────────────────────────────────────────────────────────────
// Dice in the board center
// ─────────────────────────────────────────────────────────────────────────────
function CenterDice({
  values, rolling, canRoll, isMyTurn, phase, onRoll,
}: {
  values: [number, number]; rolling: boolean;
  canRoll: boolean; isMyTurn: boolean; phase: string;
  onRoll: () => void;
}) {
  const DOTS: Record<number, [number, number][]> = {
    1: [[50,50]],
    2: [[28,28],[72,72]],
    3: [[28,28],[50,50],[72,72]],
    4: [[28,28],[72,28],[28,72],[72,72]],
    5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
    6: [[25,22],[75,22],[25,50],[75,50],[25,78],[75,78]],
  };

  const active = canRoll && isMyTurn && !rolling && phase === "rolling";
  const isDouble = values[0] === values[1];
  const total = values[0] + values[1];

  const Die = ({ val }: { val: number }) => (
    <motion.div
      style={{
        width: 72, height: 72,
        background: "linear-gradient(135deg,#f8fafc,#e2e8f0)",
        borderRadius: 14,
        boxShadow: "0 6px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.6)",
        position: "relative",
        flexShrink: 0,
      }}
      animate={rolling ? { rotate: [-15,15,-10,10,0], scale: [1,1.12,0.94,1.06,1] } : {}}
      transition={{ duration: 0.55 }}
    >
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
        {(DOTS[val] || DOTS[1]).map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={9} fill="#1e1b4b" />
        ))}
      </svg>
    </motion.div>
  );

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
    }}>
      {/* Dice pair */}
      <div style={{ display: "flex", gap: 16 }}>
        <Die val={values[0]} />
        <Die val={values[1]} />
      </div>

      {/* Total */}
      {phase !== "waiting" && (
        <div style={{ color: isDouble ? "#fbbf24" : "#a78bfa", fontSize: 13, fontWeight: 700 }}>
          {isDouble ? `🎲 DOUBLE! (${total})` : `Total: ${total}`}
        </div>
      )}

      {/* Roll button */}
      <motion.button
        onClick={active ? onRoll : undefined}
        style={{
          background: active
            ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
            : "#2a2550",
          color: active ? "#fff" : "#6b7280",
          border: "none",
          borderRadius: 12,
          padding: "12px 36px",
          fontSize: 15,
          fontWeight: 800,
          cursor: active ? "pointer" : "not-allowed",
          letterSpacing: 0.5,
          boxShadow: active ? "0 4px 20px rgba(124,58,237,0.5)" : "none",
          transition: "all 0.2s",
        }}
        whileHover={active ? { scale: 1.05 } : {}}
        whileTap={active ? { scale: 0.95 } : {}}
      >
        {rolling ? "Rolling..." : isMyTurn && phase === "rolling" ? "🎲  Roll Dice" : "Waiting..."}
      </motion.button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main GameBoard — CSS grid layout, fills available space
// ─────────────────────────────────────────────────────────────────────────────
export function GameBoard({
  onRoll,
  canRoll = false,
  rolling = false,
  isMyTurn = false,
  phase = "waiting",
}: {
  onRoll?: () => void;
  canRoll?: boolean;
  rolling?: boolean;
  isMyTurn?: boolean;
  phase?: string;
  buyPanel?: ReactNode;
} = {}) {
  const { gameState, selectedTileId, selectTile, myPlayerId } = useGameStore();
  const boardRef = useRef<HTMLDivElement>(null);

  if (!gameState) return null;

  const { players, properties, currentPlayerIndex, diceValues } = gameState;
  const currentPlayer = players[currentPlayerIndex];

  // Group players by position
  const byPos = players.reduce<Record<number, Player[]>>((acc, p) => {
    if (!p.isBankrupt) { acc[p.position] = [...(acc[p.position] || []), p]; }
    return acc;
  }, {});

  // Player tokens overlaid on a tile
  const TokensOnTile = ({ tileId }: { tileId: number }) => {
    const here = byPos[tileId] || [];
    if (!here.length) return null;
    return (
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        zIndex: 20,
        pointerEvents: "none",
      }}>
        {here.map((p, i) => {
          const isCurrent = p.id === currentPlayer?.id;
          return (
            <motion.div
              key={p.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: PLAYER_COLOR_HEX[p.color],
                border: isCurrent ? "2px solid #fbbf24" : "2px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                boxShadow: isCurrent
                  ? `0 0 10px ${PLAYER_COLOR_HEX[p.color]}, 0 0 20px ${PLAYER_COLOR_HEX[p.color]}80`
                  : "0 2px 6px rgba(0,0,0,0.5)",
              }}
            >
              {p.avatar}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Renders a tile with tokens overlay
  const renderTile = (tile: BoardTile, isCorner = false) => (
    <div key={tile.id} style={{ position: "relative", width: "100%", height: "100%" }}>
      <Tile
        tile={tile}
        ownership={properties.find(p => p.tileId === tile.id)}
        players={players}
        isSelected={selectedTileId === tile.id}
        isCorner={isCorner}
        onSelect={selectTile}
      />
      <TokensOnTile tileId={tile.id} />
    </div>
  );

  // Tile count for sizing
  const nBottom = BOTTOM_TILES.filter(t => t.index > 0 && t.index < 12).length; // 11
  const nRight  = RIGHT_TILES.length;   // 11
  const nTop    = TOP_TILES.length;     // 11
  const nLeft   = LEFT_TILES.filter(t => t.index < 11).length; // 11 non-corner

  // Corner tiles
  const cornerBL = BOTTOM_TILES.find(t => t.index === 0)!;   // START
  const cornerBR = BOTTOM_TILES.find(t => t.index === 12)!;  // VACATION
  const cornerTR = TOP_TILES.length > 0 ? null : null; // top row has no explicit corners in our data
  // Actually check boardData positions
  const cornerPrison = BOARD_TILES.find(t => t.type === "prison");
  const cornerGoPrison = BOARD_TILES.find(t => t.type === "go-to-prison");

  // Non-corner bottom tiles (index 1..11)
  const bottomMiddle = BOTTOM_TILES.filter(t => t.index > 0 && t.index < 12);
  // Non-corner left tiles
  const leftMiddle = LEFT_TILES.filter(t => t.index < 11);
  const cornerGoToPrison = LEFT_TILES.find(t => t.index === 11);

  // Layout variables
  // CORNER size is relative to tile width
  // We use CSS grid with fr units so it fills the container
  const COLS = 13; // 1 corner + 11 tiles + 1 corner
  const ROWS = 13;

  return (
    <div
      ref={boardRef}
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: `1fr repeat(${nBottom}, 1fr) 1fr`,
        gridTemplateRows:    `1fr repeat(${nLeft}, 1fr) 1fr`,
        background: "#0d0b1e",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0,0,0,0.9)",
        flexShrink: 0,
      }}
    >
      {/* ── TOP-LEFT CORNER: START ─────────────────────────────────────────── */}
      <div style={{ gridColumn: 1, gridRow: 1 }}>
        {cornerBL && renderTile(cornerBL, true)}
      </div>

      {/* ── TOP ROW (right→left) ───────────────────────────────────────────── */}
      {TOP_TILES.map((tile, i) => (
        <div key={tile.id} style={{ gridColumn: i + 2, gridRow: 1 }}>
          <div style={{ width: "100%", height: "100%", transform: "rotate(180deg)" }}>
            {renderTile(tile)}
          </div>
        </div>
      ))}

      {/* ── TOP-RIGHT CORNER: PRISON ──────────────────────────────────────── */}
      <div style={{ gridColumn: COLS, gridRow: 1 }}>
        {cornerPrison && renderTile(cornerPrison, true)}
      </div>

      {/* ── LEFT COLUMN (top→bottom) ──────────────────────────────────────── */}
      {leftMiddle.map((tile, i) => (
        <div key={tile.id} style={{ gridColumn: 1, gridRow: i + 2 }}>
          <div style={{
            width: "100%", height: "100%",
            transform: "rotate(90deg)",
            transformOrigin: "center center",
          }}>
            {renderTile(tile)}
          </div>
        </div>
      ))}

      {/* ── CENTER AREA ───────────────────────────────────────────────────── */}
      <div style={{
        gridColumn: `2 / ${COLS}`,
        gridRow: `2 / ${ROWS}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#080616",
        gap: 12,
        position: "relative",
      }}>
        {/* Board label */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ color: "#2d2a4a", fontSize: 11, letterSpacing: 5, fontWeight: 700, marginBottom: 4 }}>
            BOARD PREVIEW
          </div>
          <div style={{ color: "#4c3a8a", fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>
            Mr. Worldwide
          </div>
          <div style={{ fontSize: 40, marginTop: 4 }}>🌍</div>
        </div>

        {/* Dice */}
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
      </div>

      {/* ── RIGHT COLUMN (bottom→top, so reverse) ────────────────────────── */}
      {RIGHT_TILES.slice().reverse().map((tile, i) => (
        <div key={tile.id} style={{ gridColumn: COLS, gridRow: i + 2 }}>
          <div style={{
            width: "100%", height: "100%",
            transform: "rotate(-90deg)",
            transformOrigin: "center center",
          }}>
            {renderTile(tile)}
          </div>
        </div>
      ))}

      {/* ── BOTTOM-LEFT CORNER: GO TO PRISON ─────────────────────────────── */}
      <div style={{ gridColumn: 1, gridRow: ROWS }}>
        {cornerGoToPrison && renderTile(cornerGoToPrison, true)}
      </div>

      {/* ── BOTTOM ROW (left→right) ───────────────────────────────────────── */}
      {bottomMiddle.map((tile, i) => (
        <div key={tile.id} style={{ gridColumn: i + 2, gridRow: ROWS }}>
          {renderTile(tile)}
        </div>
      ))}

      {/* ── BOTTOM-RIGHT CORNER: VACATION ────────────────────────────────── */}
      <div style={{ gridColumn: COLS, gridRow: ROWS }}>
        {cornerBR && renderTile(cornerBR, true)}
      </div>
    </div>
  );
}
