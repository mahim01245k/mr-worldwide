"use client";
import { motion, AnimatePresence } from "framer-motion";
import { BOARD_TILES, COLOR_HEX, BoardTile } from "@/lib/game/boardData";
import { PLAYER_COLOR_HEX, Player, PropertyOwnership } from "@/types/game";
import { X } from "lucide-react";

interface TileDetailProps {
  tileId: number | null;
  players: Player[];
  properties: PropertyOwnership[];
  onClose: () => void;
}

export function TileDetail({ tileId, players, properties, onClose }: TileDetailProps) {
  if (tileId === null) return null;
  const tile = BOARD_TILES.find(t => t.id === tileId);
  if (!tile) return null;

  const ownership = properties.find(p => p.tileId === tileId);
  const owner = ownership ? players.find(p => p.id === ownership.ownerId) : null;
  const tileColor = tile.color && tile.color !== "none" ? COLOR_HEX[tile.color] : "#7c3aed";

  const rentLabels = tile.type === "airport"
    ? ["1 Airport", "2 Airports", "3 Airports", "4 Airports"]
    : ["Base", "1 House", "2 Houses", "3 Houses", "4 Houses", "Hotel"];

  return (
    <AnimatePresence>
      <motion.div
        key={tileId}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-72"
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.8))" }}
      >
        <div
          className="rounded-2xl border overflow-hidden backdrop-blur-md"
          style={{
            background: `linear-gradient(135deg, ${tileColor}20, #0a0f1e)`,
            borderColor: `${tileColor}50`,
          }}
        >
          {/* Color bar */}
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${tileColor}, ${tileColor}88)` }} />

          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {tile.flagCode ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://flagcdn.com/w40/${tile.flagCode.toLowerCase()}.png`}
                      alt={tile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-4xl">
                    {tile.type === "treasure" ? "💰"
                      : tile.type === "surprise" ? "❓"
                      : tile.type === "airport" ? "✈️"
                      : tile.type === "utility" ? "⚡"
                      : tile.type === "tax" ? "💸"
                      : tile.type === "start" ? "▶️"
                      : tile.type === "vacation" ? "🏖️"
                      : tile.type === "go-to-prison" ? "☠️"
                      : tile.type === "prison" ? "🔒"
                      : "🏙️"}
                  </span>
                )}
                <div>
                  <h3 className="text-white font-black text-lg leading-tight">{tile.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {tile.subname || tile.type.replace(/-/g, " ").toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-white transition-colors mt-1 ml-2 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Owner */}
            {owner && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 border"
                style={{
                  background: `${PLAYER_COLOR_HEX[owner.color]}15`,
                  borderColor: `${PLAYER_COLOR_HEX[owner.color]}40`,
                }}
              >
                <span className="text-lg">{owner.avatar}</span>
                <div className="flex-1">
                  <p className="text-white text-xs font-bold">Owned by {owner.name}</p>
                  <p className="text-slate-400 text-xs">
                    {ownership!.hasHotel
                      ? "🏨 Hotel"
                      : ownership!.houses > 0
                      ? "🏠".repeat(ownership!.houses)
                      : "No buildings"}
                    {ownership!.isMortgaged && " • Mortgaged"}
                  </p>
                </div>
              </div>
            )}

            {/* Available badge */}
            {!owner && tile.price && (
              <div className="bg-slate-900/60 rounded-lg px-3 py-2 mb-3">
                <p className="text-slate-400 text-xs">Status</p>
                <p className="text-green-400 text-sm font-bold">Available for purchase</p>
              </div>
            )}

            {/* Price grid */}
            {tile.price && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Price</p>
                  <p className="text-white font-bold">${tile.price}</p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Mortgage</p>
                  <p className="text-white font-bold">
                    ${tile.mortgageValue ?? Math.floor(tile.price / 2)}
                  </p>
                </div>
                {tile.houseCost && (
                  <div className="bg-slate-900/60 rounded-lg p-2">
                    <p className="text-slate-500 text-xs">House</p>
                    <p className="text-white font-bold">${tile.houseCost}</p>
                  </div>
                )}
                {tile.hotelCost && (
                  <div className="bg-slate-900/60 rounded-lg p-2">
                    <p className="text-slate-500 text-xs">Hotel</p>
                    <p className="text-white font-bold">${tile.hotelCost}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rent schedule */}
            {tile.rentLevels && tile.rentLevels.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs mb-2">Rent Schedule</p>
                <div className="space-y-1">
                  {rentLabels.map((label, i) => {
                    if (tile.rentLevels![i] === undefined) return null;
                    const isCurrent = ownership
                      ? ownership.hasHotel
                        ? i === rentLabels.length - 1
                        : ownership.houses === i
                      : i === 0;
                    return (
                      <div
                        key={i}
                        className={`flex justify-between items-center text-xs px-2 py-1 rounded ${
                          isCurrent ? "bg-violet-900/40 border border-violet-700/40" : ""
                        }`}
                      >
                        <span className="text-slate-400">{label}</span>
                        <span className={isCurrent ? "text-violet-300 font-bold" : "text-white"}>
                          ${tile.rentLevels![i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-purchasable tile info */}
            {!tile.price && !tile.rentLevels && (
              <p className="text-slate-500 text-xs text-center py-2">
                {tile.type === "start" && "Collect $200 when passing or landing here."}
                {tile.type === "prison" && "Just visiting — no penalty."}
                {tile.type === "go-to-prison" && "Go directly to Prison!"}
                {tile.type === "vacation" && "Take a break — miss one turn."}
                {tile.type === "treasure" && "Draw a Treasure card!"}
                {tile.type === "surprise" && "Draw a Surprise card!"}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}