"use client";
import { type ReactNode, useMemo } from "react";
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
  const isTopSide = side === "top";

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

          {isCorner ? (
            // ── Corner tiles ──────────────────────────────────────────────────
            <g>
              {tile.id === 0 ? (
                <g transform={`translate(${cx}, ${cy})`}>
                  {/* Arrow at top */}
                  <g transform="translate(-24, -40)">
                    <path d="M4.875 35.344A2.968 2.968 0 0 1 0 33V3.094A2.968 2.968 0 0 1 4.875.75L21 14.156v7.782L4.875 35.344Zm24 0c-1.969 1.594-4.875.281-4.969-2.156v-30c0-2.532 3-3.844 4.969-2.25l18 14.906a3.028 3.028 0 0 1 0 4.594l-18 14.906Z" fill="#B0DE2D" />
                    <path d="M4.875 35.344A2.968 2.968 0 0 1 0 33V3.094A2.968 2.968 0 0 1 4.875.75L21 14.156v7.782L4.875 35.344Zm24 0c-1.969 1.594-4.875.281-4.969-2.156v-30c0-2.532 3-3.844 4.969-2.25l18 14.906a3.028 3.028 0 0 1 0 4.594l-18 14.906Z" fill="url(#start-arrow_grad)" style={{ mixBlendMode: 'overlay' }} />
                  </g>
                  {/* START text at bottom */}
                  <g transform="translate(-38.75, 5) scale(0.5)">
                    {/* Letters base */}
                    <path d="M14.84 35.576c-1.216 0-2.512-.096-3.888-.288a38.288 38.288 0 0 1-3.984-.672 29.961 29.961 0 0 1-3.36-1.056c-1.024-.416-1.744-1.008-2.16-1.776a4.386 4.386 0 0 1-.48-2.544c.096-.896.4-1.696.912-2.4s1.2-1.184 2.064-1.44c.864-.288 1.84-.208 2.928.24 1.12.448 2.432.816 3.936 1.104 1.536.288 2.88.432 4.032.432 1.856 0 3.12-.208 3.792-.624.672-.416 1.008-.896 1.008-1.44 0-.512-.24-.928-.72-1.248-.448-.352-1.296-.656-2.544-.912l-5.76-1.248c-3.104-.672-5.408-1.824-6.912-3.456C2.2 16.616 1.448 14.52 1.448 11.96c0-1.728.352-3.28 1.056-4.656a10.674 10.674 0 0 1 3.072-3.6c1.312-.992 2.88-1.76 4.704-2.304 1.824-.544 3.856-.816 6.096-.816 1.504 0 3.104.16 4.8.48 1.696.32 3.152.784 4.368 1.392.864.416 1.488 1.008 1.872 1.776.416.768.592 1.568.528 2.4a4.389 4.389 0 0 1-.816 2.256c-.448.64-1.088 1.088-1.92 1.344-.832.224-1.84.128-3.024-.288-.8-.288-1.76-.512-2.88-.672-1.12-.192-2.144-.288-3.072-.288-1.024 0-1.888.112-2.592.336-.704.192-1.232.48-1.584.864a1.706 1.706 0 0 0-.528 1.248c0 .416.224.8.672 1.152.448.32 1.312.608 2.592.864l5.76 1.248c3.072.672 5.36 1.808 6.864 3.408 1.536 1.6 2.304 3.648 2.304 6.144 0 1.728-.352 3.296-1.056 4.704-.704 1.376-1.712 2.56-3.024 3.552-1.28.992-2.832 1.76-4.656 2.304-1.824.512-3.872.768-6.144.768Z" fill="#B0DE2D" />
                    <path d="M45.9 35.48c-1.664 0-2.944-.448-3.84-1.344-.896-.928-1.344-2.224-1.344-3.888V9.512h-6.528c-1.376 0-2.432-.352-3.168-1.056-.704-.736-1.056-1.776-1.056-3.12s.352-2.368 1.056-3.072c.736-.736 1.792-1.104 3.168-1.104h23.376c1.376 0 2.416.368 3.12 1.104.736.704 1.104 1.728 1.104 3.072s-.368 2.384-1.104 3.12c-.704.704-1.744 1.056-3.12 1.056h-6.528v20.736c0 1.664-.432 2.96-1.296 3.888-.864.896-2.144 1.344-3.84 1.344Z" fill="#B0DE2D" />
                    <path d="M58.295 35.48c-1.152 0-2.128-.272-2.928-.816a3.675 3.675 0 0 1-1.488-2.208c-.192-.96-.016-2.032.528-3.216L65.975 4.856c.672-1.44 1.488-2.496 2.448-3.168.992-.672 2.128-1.008 3.408-1.008 1.28 0 2.4.336 3.36 1.008.96.672 1.776 1.728 2.448 3.168L89.207 29.24c.576 1.216.768 2.304.576 3.264a3.293 3.293 0 0 1-1.392 2.208c-.736.512-1.664.768-2.784.768-1.472 0-2.608-.336-3.408-1.008-.8-.672-1.52-1.76-2.16-3.264l-2.304-5.376 3.84 2.88H62.039l3.84-2.88-2.304 5.376c-.64 1.504-1.312 2.592-2.016 3.264-.704.672-1.792 1.008-3.264 1.008Zm13.44-23.664-4.896 11.76-1.44-2.736h12.816l-1.44 2.736-4.944-11.76h-.096Z" fill="#B0DE2D" />
                    <path d="M96.86 35.48c-1.664 0-2.944-.448-3.84-1.344-.896-.928-1.344-2.224-1.344-3.888V6.392c0-1.696.448-2.992 1.344-3.888.928-.896 2.224-1.344 3.888-1.344h11.952c3.904 0 6.912.976 9.024 2.928 2.144 1.92 3.216 4.56 3.216 7.92 0 2.208-.48 4.128-1.44 5.76-.96 1.6-2.352 2.848-4.176 3.744-1.792.864-4 1.296-6.624 1.296l.336-.912h2.736c1.408 0 2.656.336 3.744 1.008 1.088.64 1.984 1.616 2.688 2.928l1.68 3.024c.608 1.088.88 2.144.816 3.168-.032.992-.432 1.824-1.2 2.496-.736.64-1.856.96-3.36.96-1.44 0-2.624-.288-3.552-.864-.928-.608-1.744-1.552-2.448-2.832l-4.128-7.536a2.116 2.116 0 0 0-1.104-1.008 3.481 3.481 0 0 0-1.488-.336h-1.584v7.344c0 1.664-.432 2.96-1.296 3.888-.864.896-2.144 1.344-3.84 1.344Zm5.136-19.776h4.944c1.408 0 2.48-.272 3.216-.816.768-.544 1.152-1.392 1.152-2.544 0-1.12-.384-1.952-1.152-2.496-.736-.544-1.808-.816-3.216-.816h-4.944v6.672Z" fill="#B0DE2D" />
                    <path d="M138.248 35.48c-1.664 0-2.944-.448-3.84-1.344-.896-.928-1.344-2.224-1.344-3.888V9.512h-6.528c-1.376 0-2.432-.352-3.168-1.056-.704-.736-1.056-1.776-1.056-3.12s.352-2.368 1.056-3.072c.736-.736 1.792-1.104 3.168-1.104h23.376c1.376 0 2.416.368 3.12 1.104.736.704 1.104 1.728 1.104 3.072s-.368 2.384-1.104 3.12c-.704.704-1.744 1.056-3.12 1.056h-6.528v20.736c0 1.664-.432 2.96-1.296 3.888-.864.896-2.144 1.344-3.84 1.344Z" fill="#B0DE2D" />
                    {/* Letters overlay */}
                    <g style={{ mixBlendMode: 'overlay' }}>
                      <path d="M14.84 35.576c-1.216 0-2.512-.096-3.888-.288a38.288 38.288 0 0 1-3.984-.672 29.961 29.961 0 0 1-3.36-1.056c-1.024-.416-1.744-1.008-2.16-1.776a4.386 4.386 0 0 1-.48-2.544c.096-.896.4-1.696.912-2.4s1.2-1.184 2.064-1.44c.864-.288 1.84-.208 2.928.24 1.12.448 2.432.816 3.936 1.104 1.536.288 2.88.432 4.032.432 1.856 0 3.12-.208 3.792-.624.672-.416 1.008-.896 1.008-1.44 0-.512-.24-.928-.72-1.248-.448-.352-1.296-.656-2.544-.912l-5.76-1.248c-3.104-.672-5.408-1.824-6.912-3.456C2.2 16.616 1.448 14.52 1.448 11.96c0-1.728.352-3.28 1.056-4.656a10.674 10.674 0 0 1 3.072-3.6c1.312-.992 2.88-1.76 4.704-2.304 1.824-.544 3.856-.816 6.096-.816 1.504 0 3.104.16 4.8.48 1.696.32 3.152.784 4.368 1.392.864.416 1.488 1.008 1.872 1.776.416.768.592 1.568.528 2.4a4.389 4.389 0 0 1-.816 2.256c-.448.64-1.088 1.088-1.92 1.344-.832.224-1.84.128-3.024-.288-.8-.288-1.76-.512-2.88-.672-1.12-.192-2.144-.288-3.072-.288-1.024 0-1.888.112-2.592.336-.704.192-1.232.48-1.584.864a1.706 1.706 0 0 0-.528 1.248c0 .416.224.8.672 1.152.448.32 1.312.608 2.592.864l5.76 1.248c3.072.672 5.36 1.808 6.864 3.408 1.536 1.6 2.304 3.648 2.304 6.144 0 1.728-.352 3.296-1.056 4.704-.704 1.376-1.712 2.56-3.024 3.552-1.28.992-2.832 1.76-4.656 2.304-1.824.512-3.872.768-6.144.768Z" fill="url(#start-label_grad)" />
                      <path d="M45.9 35.48c-1.664 0-2.944-.448-3.84-1.344-.896-.928-1.344-2.224-1.344-3.888V9.512h-6.528c-1.376 0-2.432-.352-3.168-1.056-.704-.736-1.056-1.776-1.056-3.12s.352-2.368 1.056-3.072c.736-.736 1.792-1.104 3.168-1.104h23.376c1.376 0 2.416.368 3.12 1.104.736.704 1.104 1.728 1.104 3.072s-.368 2.384-1.104 3.12c-.704.704-1.744 1.056-3.12 1.056h-6.528v20.736c0 1.664-.432 2.96-1.296 3.888-.864.896-2.144 1.344-3.84 1.344Z" fill="url(#start-label_grad)" />
                      <path d="M58.295 35.48c-1.152 0-2.128-.272-2.928-.816a3.675 3.675 0 0 1-1.488-2.208c-.192-.96-.016-2.032.528-3.216L65.975 4.856c.672-1.44 1.488-2.496 2.448-3.168.992-.672 2.128-1.008 3.408-1.008 1.28 0 2.4.336 3.36 1.008.96.672 1.776 1.728 2.448 3.168L89.207 29.24c.576 1.216.768 2.304.576 3.264a3.293 3.293 0 0 1-1.392 2.208c-.736.512-1.664.768-2.784.768-1.472 0-2.608-.336-3.408-1.008-.8-.672-1.52-1.76-2.16-3.264l-2.304-5.376 3.84 2.88H62.039l3.84-2.88-2.304 5.376c-.64 1.504-1.312 2.592-2.016 3.264-.704.672-1.792 1.008-3.264 1.008Zm13.44-23.664-4.896 11.76-1.44-2.736h12.816l-1.44 2.736-4.944-11.76h-.096Z" fill="url(#start-label_grad)" />
                      <path d="M96.86 35.48c-1.664 0-2.944-.448-3.84-1.344-.896-.928-1.344-2.224-1.344-3.888V6.392c0-1.696.448-2.992 1.344-3.888.928-.896 2.224-1.344 3.888-1.344h11.952c3.904 0 6.912.976 9.024 2.928 2.144 1.92 3.216 4.56 3.216 7.92 0 2.208-.48 4.128-1.44 5.76-.96 1.6-2.352 2.848-4.176 3.744-1.792.864-4 1.296-6.624 1.296l.336-.912h2.736c1.408 0 2.656.336 3.744 1.008 1.088.64 1.984 1.616 2.688 2.928l1.68 3.024c.608 1.088.88 2.144.816 3.168-.032.992-.432 1.824-1.2 2.496-.736.64-1.856.96-3.36.96-1.44 0-2.624-.288-3.552-.864-.928-.608-1.744-1.552-2.448-2.832l-4.128-7.536a2.116 2.116 0 0 0-1.104-1.008 3.481 3.481 0 0 0-1.488-.336h-1.584v7.344c0 1.664-.432 2.96-1.296 3.888-.864.896-2.144 1.344-3.84 1.344Zm5.136-19.776h4.944c1.408 0 2.48-.272 3.216-.816.768-.544 1.152-1.392 1.152-2.544 0-1.12-.384-1.952-1.152-2.496-.736-.544-1.808-.816-3.216-.816h-4.944v6.672Z" fill="url(#start-label_grad)" />
                      <path d="M138.248 35.48c-1.664 0-2.944-.448-3.84-1.344-.896-.928-1.344-2.224-1.344-3.888V9.512h-6.528c-1.376 0-2.432-.352-3.168-1.056-.704-.736-1.056-1.776-1.056-3.12s.352-2.368 1.056-3.072c.736-.736 1.792-1.104 3.168-1.104h23.376c1.376 0 2.416.368 3.12 1.104.736.704 1.104 1.728 1.104 3.072s-.368 2.384-1.104 3.12c-.704.704-1.744 1.056-3.12 1.056h-6.528v20.736c0 1.664-.432 2.96-1.296 3.888-.864.896-2.144 1.344-3.84 1.344Z" fill="url(#start-label_grad)" />
                    </g>
                  </g>
                </g>
              ) : (
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
                </g>
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
                fontSize={15} fill="#ffffff" fontWeight="400"
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
}
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
        {player.avatar} {/* Keep emojis */}
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
          <linearGradient id="start-label_grad" x1="77" y1="-13" x2="77" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <linearGradient id="start-arrow_grad" x1="24" y1="-6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
        </defs>

        {/* Board background */}
        <rect x={0} y={0} width={BS} height={BS} fill="#1a1a1a" rx={12} />

        {/* Inner center */}
        <rect x={CS} y={CS} width={BS - CS * 2} height={BS - CS * 2} fill="#000000" rx={4} />

        {/* All tiles */}
        {tiles.map(tile => (
          <TileCard
            key={tile.id}
            tile={tile}
            ownership={properties.find(p => p.tileId === tile.id)}
            players={players}
            isSelected={selectedTileId === tile.id}
            onSelect={(id) => { selectTile(id); toggleTileDetail(true); }}
          />

        ))}
        <FlagLayer tiles={tiles} />
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