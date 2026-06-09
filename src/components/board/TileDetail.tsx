"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { BOARD_TILES, COLOR_HEX } from "@/lib/game/boardData";
import { PLAYER_COLOR_HEX } from "@/types/game";
import { X } from "lucide-react";

export function TileDetail() {
  const { gameState, selectedTileId, showTileDetail, toggleTileDetail } = useGameStore();

  if (!gameState) return null;

  const tile = selectedTileId !== null ? BOARD_TILES.find(t => t.id === selectedTileId) : null;
  const ownership = selectedTileId !== null ? gameState.properties.find(p => p.tileId === selectedTileId) : null;
  const owner = ownership ? gameState.players.find(p => p.id === ownership.ownerId) : null;
  const tileColor = tile?.color && tile.color !== "none" ? COLOR_HEX[tile.color] : "#7c3aed";

  return (
    <AnimatePresence>
      {showTileDetail && tile && (
        <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-80 max-w-[90vw]"
        style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.8))" }}
      >
        <div className="rounded-2xl border overflow-hidden backdrop-blur-md"
          style={{ background: `linear-gradient(135deg, ${tileColor}20, #0a0f1e)`, borderColor: `${tileColor}50` }}>
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${tileColor}, ${tileColor}88)` }} />
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {tile.flagCode ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://flagcdn.com/w40/${tile.flagCode.toLowerCase()}.png`}
                      alt={tile.subname || tile.name}
                      className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-4xl">
                    {tile.type === "treasure" ? "💰" : tile.type === "surprise" ? "❓" :
                     tile.type === "airport" ? "✈️" : tile.type === "tax" ? "💸" :
                     tile.type === "start" ? "▶️" : tile.type === "vacation" ? "🏖️" :
                     tile.type === "go-to-prison" ? "☠️" : "🏙️"}
                  </span>
                )}
                <div>
                  <h3 className="text-white font-black text-lg">{tile.name}</h3>
                  <p className="text-slate-400 text-sm">{tile.subname || tile.type.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => toggleTileDetail(false)} className="text-slate-500 hover:text-white transition-colors mt-1">
                <X size={16} />
              </button>
            </div>

            {owner && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 border"
                style={{ background: `${PLAYER_COLOR_HEX[owner.color]}15`, borderColor: `${PLAYER_COLOR_HEX[owner.color]}40` }}>
                <span className="text-lg">{owner.avatar}</span>
                <div className="flex-1">
                  <p className="text-white text-xs font-bold">Owned by {owner.name}</p>
                  <p className="text-slate-400 text-xs">
                    {ownership!.hasHotel ? "🏨 Hotel" : ownership!.houses > 0 ? `${"🏠".repeat(ownership!.houses)}` : "No buildings"}
                    {ownership!.isMortgaged && " • Mortgaged"}
                  </p>
                </div>
              </div>
            )}
            {!owner && tile.price && (
              <div className="bg-slate-900/60 rounded-lg px-3 py-2 mb-3">
                <p className="text-slate-400 text-xs">Status</p>
                <p className="text-green-400 text-sm font-bold">Available for purchase</p>
              </div>
            )}
            {tile.price && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Price</p>
                  <p className="text-white font-bold">${tile.price}</p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2">
                  <p className="text-slate-500 text-xs">Mortgage</p>
                  <p className="text-white font-bold">${tile.mortgageValue || Math.floor(tile.price / 2)}</p>
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
            {tile.rentLevels && (
              <div>
                <p className="text-slate-400 text-xs mb-2">Rent Schedule:</p>
                <div className="space-y-1">
                  {["Base", "1 House", "2 Houses", "3 Houses", "4 Houses", "Hotel"].map((label, i) => {
                    const isCurrent = ownership ? (ownership.hasHotel ? i === 5 : ownership.houses === i) : i === 0;
                    return (
                      <div key={i} className={`flex justify-between items-center text-xs px-2 py-1 rounded ${isCurrent ? "bg-violet-900/40 border border-violet-700/40" : ""}`}>
                        <span className="text-slate-400">{label}</span>
                        <span className={isCurrent ? "text-violet-300 font-bold" : "text-white"}>${tile.rentLevels![i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
